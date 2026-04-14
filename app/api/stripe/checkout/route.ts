import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// ─── Stripe init ────────────────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

// ─── Plan → price mapping (AUD) ─────────────────────────────────────────────
// Prices in cents
const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
  starter:    { amount: 1900,  name: 'CYTRON Starter'    },
  pro:        { amount: 4900,  name: 'CYTRON Pro'        },
  enterprise: { amount: 9900,  name: 'CYTRON Enterprise' },
}

/**
 * Finds or creates a Stripe Price for a given plan.
 * Uses metadata lookup so we don't duplicate products on every call.
 */
async function getOrCreatePrice(plan: string): Promise<string> {
  const config = PLAN_PRICES[plan]
  if (!config) throw new Error(`Unknown plan: ${plan}`)

  // Search for existing price by metadata
  const existingPrices = await stripe.prices.search({
    query: `metadata["cytron_plan"]:"${plan}" active:"true"`,
  })

  if (existingPrices.data.length > 0) {
    return existingPrices.data[0].id
  }

  // Create product + price
  const product = await stripe.products.create({
    name: config.name,
    metadata: { cytron_plan: plan },
  })

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: config.amount,
    currency: 'aud',
    recurring: { interval: 'month' },
    metadata: { cytron_plan: plan },
  })

  return price.id
}

// ─── POST /api/stripe/checkout ──────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // 1. Auth
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get company for this user
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: member } = await adminClient
      .from('company_members')
      .select('company_id, companies(id, name, plan, plan_status, trial_ends_at, stripe_customer_id)')
      .eq('user_id', user.id)
      .single()

    if (!member?.companies) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    const company = member.companies as unknown as {
      id: string
      name: string
      plan: string
      plan_status: string
      trial_ends_at: string | null
      stripe_customer_id: string | null
    }

    // 3. Parse plan from body
    const { plan } = await request.json()
    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // 4. Get or create Stripe price
    const priceId = await getOrCreatePrice(plan)

    // 5. Get or create Stripe customer
    let customerId = company.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: company.name,
        metadata: {
          company_id: company.id,
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Store customer ID
      await adminClient
        .from('companies')
        .update({ stripe_customer_id: customerId })
        .eq('id', company.id)
    }

    // 6. Determine trial days remaining
    let trialDays = 0
    if (company.plan_status === 'trial' && company.trial_ends_at) {
      const trialEnd = new Date(company.trial_ends_at)
      const now = new Date()
      const remaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      trialDays = Math.max(0, remaining)
    }

    // 7. Build checkout session
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?billing=success`,
      cancel_url: `${siteUrl}/billing`,
      metadata: {
        company_id: company.id,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          company_id: company.id,
          plan: plan,
        },
      },
    }

    // Add trial period if user is still in trial
    if (trialDays > 0) {
      sessionParams.subscription_data!.trial_period_days = trialDays
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
