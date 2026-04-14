import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// ─── Stripe init ────────────────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

// ─── POST /api/stripe/portal ────────────────────────────────────────────────
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

    // 2. Get company
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: member } = await adminClient
      .from('company_members')
      .select('company_id, companies(id, stripe_customer_id)')
      .eq('user_id', user.id)
      .single()

    if (!member?.companies) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    const company = member.companies as unknown as {
      id: string
      stripe_customer_id: string | null
    }

    if (!company.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription. Please choose a plan first.' },
        { status: 400 }
      )
    }

    // 3. Create Stripe Billing Portal session
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: company.stripe_customer_id,
      return_url: `${siteUrl}/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('Stripe portal error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
