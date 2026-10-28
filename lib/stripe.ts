import Stripe from 'stripe'

const STRIPE_API_VERSION = '2026-03-25.dahlia'

/** Stripe client for the current request. Null when STRIPE_SECRET_KEY is unset. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION })
}
