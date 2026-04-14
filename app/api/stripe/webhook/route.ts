import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// ─── Stripe init ────────────────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

// ─── Supabase admin (service role) ──────────────────────────────────────────
function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Webhook handler ────────────────────────────────────────────────────────

/*
  SQL: Run these once in Supabase SQL editor
  ────────────────────────────────────────────
  ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_customer_id text;
  ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
  ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
*/

export async function POST(request: Request) {
  try {
    // 1. Read raw body for signature verification
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')

    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    // 2. Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const admin = getAdmin()

    // 3. Handle events
    switch (event.type) {
      // ── Checkout completed ──────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const companyId = session.metadata?.company_id
        const plan = session.metadata?.plan

        if (!companyId || !plan) {
          console.error('Missing metadata in checkout session:', session.id)
          break
        }

        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id ?? null

        // Retrieve the subscription to check if it's in trial
        let planStatus = 'active'
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          if (subscription.status === 'trialing') {
            planStatus = 'trial'
          }
        }

        await admin
          .from('companies')
          .update({
            plan: plan,
            plan_status: planStatus,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
          })
          .eq('id', companyId)

        console.log(`Checkout completed: company=${companyId}, plan=${plan}, status=${planStatus}`)
        break
      }

      // ── Subscription updated (upgrade, downgrade, trial end) ────────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const companyId = subscription.metadata?.company_id

        if (!companyId) {
          // Try finding by stripe_customer_id
          const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id

          if (customerId) {
            const { data: company } = await admin
              .from('companies')
              .select('id')
              .eq('stripe_customer_id', customerId)
              .single()

            if (company) {
              await updateCompanyFromSubscription(admin, company.id, subscription)
            }
          }
          break
        }

        await updateCompanyFromSubscription(admin, companyId, subscription)
        break
      }

      // ── Subscription deleted (cancelled) ────────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const companyId = subscription.metadata?.company_id

        let targetCompanyId = companyId

        if (!targetCompanyId) {
          const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id

          if (customerId) {
            const { data: company } = await admin
              .from('companies')
              .select('id')
              .eq('stripe_customer_id', customerId)
              .single()

            targetCompanyId = company?.id
          }
        }

        if (targetCompanyId) {
          await admin
            .from('companies')
            .update({
              plan_status: 'suspended',
              stripe_subscription_id: null,
            })
            .eq('id', targetCompanyId)

          console.log(`Subscription deleted: company=${targetCompanyId}`)
        }
        break
      }

      // ── Invoice payment failed ──────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id ?? null

        if (customerId) {
          const { data: company } = await admin
            .from('companies')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (company) {
            await admin
              .from('companies')
              .update({ plan_status: 'suspended' })
              .eq('id', company.id)

            console.log(`Payment failed: company=${company.id}`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// ─── Helper: update company from subscription state ─────────────────────────
async function updateCompanyFromSubscription(
  admin: any,
  companyId: string,
  subscription: Stripe.Subscription
) {
  const plan = subscription.metadata?.plan
  const updates: Record<string, unknown> = {
    stripe_subscription_id: subscription.id,
  }

  // Map Stripe subscription status to our plan_status
  switch (subscription.status) {
    case 'active':
      updates.plan_status = 'active'
      break
    case 'trialing':
      updates.plan_status = 'trial'
      break
    case 'past_due':
    case 'unpaid':
    case 'canceled':
    case 'incomplete_expired':
      updates.plan_status = 'suspended'
      break
    case 'incomplete':
      // Payment still processing, don't change status
      break
  }

  if (plan) {
    updates.plan = plan
  }

  await admin
    .from('companies')
    .update(updates)
    .eq('id', companyId)

  console.log(`Subscription updated: company=${companyId}, status=${subscription.status}`)
}
