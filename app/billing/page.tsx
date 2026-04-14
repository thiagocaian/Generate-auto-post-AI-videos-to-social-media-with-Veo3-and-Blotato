'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

// ─── Types ──────────────────────────────────────────────────────────────────
type CompanyBilling = {
  id: string
  name: string
  plan: 'starter' | 'pro' | 'enterprise'
  plan_status: 'active' | 'trial' | 'suspended'
  trial_ends_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

type PlanConfig = {
  key: string
  name: string
  price: number
  features: { label: string; value: string | boolean }[]
}

// ─── Plan definitions ───────────────────────────────────────────────────────
const PLANS: PlanConfig[] = [
  {
    key: 'starter',
    name: 'Starter',
    price: 19,
    features: [
      { label: 'Jobs', value: '50/month' },
      { label: 'AI Videos', value: '10/month' },
      { label: 'Social Posts', value: '30/month' },
      { label: 'Materials Agent', value: true },
      { label: 'Priority Support', value: false },
      { label: 'Custom Branding', value: false },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 49,
    features: [
      { label: 'Jobs', value: '200/month' },
      { label: 'AI Videos', value: '50/month' },
      { label: 'Social Posts', value: '150/month' },
      { label: 'Materials Agent', value: true },
      { label: 'Priority Support', value: true },
      { label: 'Custom Branding', value: false },
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 99,
    features: [
      { label: 'Jobs', value: 'Unlimited' },
      { label: 'AI Videos', value: 'Unlimited' },
      { label: 'Social Posts', value: 'Unlimited' },
      { label: 'Materials Agent', value: true },
      { label: 'Priority Support', value: true },
      { label: 'Custom Branding', value: true },
    ],
  },
]

const PLAN_ORDER = ['starter', 'pro', 'enterprise']

// ─── Page ───────────────────────────────────────────────────────────────────
export default function BillingPage() {
  const [company, setCompany] = useState<CompanyBilling | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCompany()
  }, [])

  async function loadCompany() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: member } = await supabase
        .from('company_members')
        .select('companies(id, name, plan, plan_status, trial_ends_at, stripe_customer_id, stripe_subscription_id)')
        .eq('user_id', user.id)
        .single()

      if (member?.companies) {
        setCompany(member.companies as unknown as CompanyBilling)
      }
    } catch (err) {
      console.error('Failed to load company:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckout(plan: string) {
    setCheckoutLoading(plan)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to start checkout')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  async function handlePortal() {
    setPortalLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to open billing portal')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  // Trial days remaining
  function getTrialDaysRemaining(): number {
    if (!company?.trial_ends_at) return 0
    const end = new Date(company.trial_ends_at)
    const now = new Date()
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const trialDays = company ? getTrialDaysRemaining() : 0
  const isOnTrial = company?.plan_status === 'trial'
  const isSuspended = company?.plan_status === 'suspended'
  const currentPlanIndex = company ? PLAN_ORDER.indexOf(company.plan) : -1

  function getButtonState(planKey: string) {
    if (!company) return { label: 'Loading...', disabled: true }
    const planIndex = PLAN_ORDER.indexOf(planKey)
    if (planKey === company.plan && company.plan_status === 'active') {
      return { label: 'Current Plan', disabled: true }
    }
    if (planIndex > currentPlanIndex) {
      return { label: 'Upgrade', disabled: false }
    }
    if (planIndex < currentPlanIndex) {
      return { label: 'Downgrade', disabled: false }
    }
    // Same plan but trial/suspended
    if (isOnTrial || isSuspended) {
      return { label: 'Subscribe', disabled: false }
    }
    return { label: 'Current Plan', disabled: true }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#F7F7F7', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar active="billing" />

      <main className="flex-1 flex flex-col overflow-hidden pt-12 md:pt-0">
        {/* Header */}
        <header className="flex items-center justify-between px-5 md:px-8 py-4"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #EBEBEB' }}>
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1A1A1A' }}>Billing</h1>
            <p className="text-sm mt-0.5" style={{ color: '#AAAAAA' }}>
              Manage your subscription and plan
            </p>
          </div>
          {company?.stripe_customer_id && (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
              style={{ background: '#1A1A1A', color: '#FFFFFF' }}
              onMouseEnter={e => e.currentTarget.style.background = '#333'}
              onMouseLeave={e => e.currentTarget.style.background = '#1A1A1A'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              {portalLoading ? 'Opening...' : 'Manage Subscription'}
            </button>
          )}
        </header>

        <div className="flex-1 overflow-auto p-5 md:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#886cff', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <>
              {/* Error banner */}
              {error && (
                <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium"
                  style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                  {error}
                </div>
              )}

              {/* Trial banner */}
              {isOnTrial && (
                <div className="mb-6 px-5 py-4 rounded-xl flex items-center justify-between"
                  style={{ background: 'linear-gradient(135deg, #886cff 0%, #6C4FE0 100%)', color: '#FFFFFF' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">You&apos;re on a free trial</div>
                      <div className="text-xs opacity-80">
                        {trialDays > 0
                          ? `${trialDays} day${trialDays === 1 ? '' : 's'} remaining. No credit card required.`
                          : 'Your trial has expired. Subscribe to continue.'
                        }
                      </div>
                    </div>
                  </div>
                  {trialDays <= 7 && (
                    <span className="hidden md:inline text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                      {trialDays === 0 ? 'Expired' : `${trialDays}d left`}
                    </span>
                  )}
                </div>
              )}

              {/* Suspended banner */}
              {isSuspended && (
                <div className="mb-6 px-5 py-4 rounded-xl flex items-center gap-3"
                  style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FEE2E2' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#DC2626' }}>Subscription suspended</div>
                    <div className="text-xs" style={{ color: '#991B1B' }}>
                      Your payment failed or subscription was cancelled. Please subscribe to restore access.
                    </div>
                  </div>
                </div>
              )}

              {/* Current plan summary */}
              <div className="mb-8 p-5 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #EBEBEB' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#AAAAAA' }}>Current Plan</div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold capitalize" style={{ color: '#1A1A1A' }}>
                        {company?.plan || 'Starter'}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{
                          background: isOnTrial ? '#F0ECFF' : isSuspended ? '#FEE2E2' : '#ECFDF5',
                          color: isOnTrial ? '#886cff' : isSuspended ? '#DC2626' : '#059669',
                        }}>
                        {company?.plan_status || 'trial'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                      ${PLANS.find(p => p.key === company?.plan)?.price || 19}
                      <span className="text-sm font-normal" style={{ color: '#AAAAAA' }}> AUD/mo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {PLANS.map((plan) => {
                  const isCurrent = company?.plan === plan.key
                  const isPro = plan.key === 'pro'
                  const { label, disabled } = getButtonState(plan.key)
                  const isLoading = checkoutLoading === plan.key

                  return (
                    <div key={plan.key}
                      className="rounded-xl p-6 transition-all relative"
                      style={{
                        background: '#FFFFFF',
                        border: isCurrent
                          ? '2px solid #886cff'
                          : isPro
                            ? '2px solid #1A1A1A'
                            : '1px solid #EBEBEB',
                        boxShadow: isCurrent ? '0 0 0 4px rgba(136, 108, 255, 0.1)' : undefined,
                      }}>

                      {/* Popular / Current badge */}
                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                          style={{ background: '#886cff', color: '#FFFFFF' }}>
                          CURRENT PLAN
                        </div>
                      )}
                      {isPro && !isCurrent && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                          style={{ background: '#1A1A1A', color: '#FFFFFF' }}>
                          MOST POPULAR
                        </div>
                      )}

                      {/* Plan header */}
                      <div className="mb-5 pt-2">
                        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#AAAAAA' }}>
                          {plan.name}
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold" style={{ color: '#1A1A1A' }}>${plan.price}</span>
                          <span className="text-sm" style={{ color: '#AAAAAA' }}>AUD/mo</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-6">
                        {plan.features.map((f) => (
                          <div key={f.label} className="flex items-center justify-between text-sm">
                            <span style={{ color: '#666' }}>{f.label}</span>
                            {typeof f.value === 'boolean' ? (
                              f.value ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              )
                            ) : (
                              <span className="font-semibold text-xs px-2 py-0.5 rounded" style={{ background: '#F5F5F5', color: '#1A1A1A' }}>
                                {f.value}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Action button */}
                      <button
                        onClick={() => !disabled && handleCheckout(plan.key)}
                        disabled={disabled || isLoading}
                        className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
                        style={{
                          background: disabled
                            ? '#F5F5F5'
                            : isCurrent
                              ? '#F5F5F5'
                              : '#1A1A1A',
                          color: disabled
                            ? '#AAAAAA'
                            : isCurrent
                              ? '#AAAAAA'
                              : '#FFFFFF',
                          cursor: disabled ? 'default' : 'pointer',
                        }}
                        onMouseEnter={e => {
                          if (!disabled) e.currentTarget.style.background = '#333'
                        }}
                        onMouseLeave={e => {
                          if (!disabled) e.currentTarget.style.background = disabled || isCurrent ? '#F5F5F5' : '#1A1A1A'
                        }}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FFFFFF', borderTopColor: 'transparent' }} />
                            Redirecting...
                          </span>
                        ) : label}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Manage subscription button (mobile) */}
              {company?.stripe_customer_id && (
                <div className="md:hidden mb-6">
                  <button
                    onClick={handlePortal}
                    disabled={portalLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all"
                    style={{ background: '#1A1A1A', color: '#FFFFFF' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    {portalLoading ? 'Opening...' : 'Manage Subscription'}
                  </button>
                </div>
              )}

              {/* Info footer */}
              <div className="text-center py-4">
                <p className="text-xs" style={{ color: '#BCBCBC' }}>
                  All prices in AUD. 30-day free trial on all plans. No credit card required to start.
                </p>
                <p className="text-xs mt-1" style={{ color: '#BCBCBC' }}>
                  Powered by Stripe. Cancel anytime from the Manage Subscription portal.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
