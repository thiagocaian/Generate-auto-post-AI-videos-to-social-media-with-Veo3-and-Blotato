'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Check,
  Building2,
  Briefcase,
  MapPin,
  ChevronDown,
  Sparkles,
  FileText,
  Calendar,
  Receipt,
  Megaphone,
  ClipboardList,
} from 'lucide-react'

const TRADES = [
  'Electrician',
  'Plumber',
  'Flooring Installer',
  'HVAC',
  'Builder',
  'Painter',
  'Carpenter',
  'Landscaper',
  'Cleaner',
  'Other',
]

const FEATURES = [
  { icon: ClipboardList, label: 'Jobs', desc: 'Track every job from enquiry to payment' },
  { icon: FileText, label: 'Quotes', desc: 'Send professional quotes in seconds' },
  { icon: Receipt, label: 'Invoices', desc: 'Get paid faster with online invoices' },
  { icon: Calendar, label: 'Calendar', desc: 'Schedule your team with ease' },
  { icon: Megaphone, label: 'Marketing AI', desc: 'Auto-generate content from job photos' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Form state
  const [businessName, setBusinessName] = useState('')
  const [trade, setTrade] = useState('')
  const [location, setLocation] = useState('')

  // Check auth on mount
  useEffect(() => {
    async function checkUser() {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login?tab=signup')
          return
        }
      } catch {
        router.push('/login?tab=signup')
        return
      }
      setCheckingAuth(false)
    }
    checkUser()
  }, [router])

  async function handleSubmit() {
    if (!businessName.trim()) {
      setError('Please enter your business name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          trade,
          location: location.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          // Already onboarded, redirect to dashboard
          router.push('/dashboard')
          return
        }
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      // Success - move to step 2
      setStep(2)
      setLoading(false)
    } catch {
      setError('Unable to connect. Please check your internet and try again.')
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#886cff] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-white relative overflow-hidden"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[800px] h-[800px] opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle at center, #886cff 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-[0.02]"
          style={{
            background: 'radial-gradient(circle at center, #886cff 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Top bar */}
      <header className="relative z-10 h-16 flex items-center justify-between px-6 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#886cff] flex items-center justify-center">
            <span className="text-white font-bold text-xs">C</span>
          </div>
          <span className="text-[15px] font-semibold tracking-[0.02em] text-[#1A1A1A]">Cytron</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Step indicators */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-1 rounded-full transition-all duration-500"
              style={{ background: '#886cff' }}
            />
            <div
              className="w-8 h-1 rounded-full transition-all duration-500"
              style={{ background: step >= 2 ? '#886cff' : '#e5e5e5' }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        {step === 1 && (
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#886cff]/5 border border-[#886cff]/10 mb-4">
                <Sparkles size={14} className="text-[#886cff]" />
                <span className="text-xs font-medium text-[#886cff]">Step 1 of 2</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-[#1A1A1A]">
                Tell us about your business
              </h1>
              <p className="mt-3 text-neutral-500 text-sm sm:text-base">
                We&apos;ll set up your workspace so everything fits perfectly.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Business Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-400 pl-1">
                  <Building2 size={14} />
                  Business Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Smith Electrical Services"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full py-3.5 px-4 rounded-xl text-sm text-[#1A1A1A] placeholder:text-neutral-300 bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-[#886cff] focus:ring-2 focus:ring-[#886cff]/10 transition-all"
                  autoFocus
                  required
                />
              </div>

              {/* Trade */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-400 pl-1">
                  <Briefcase size={14} />
                  Your Trade
                </label>
                <div className="relative">
                  <select
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    className="w-full py-3.5 px-4 pr-10 rounded-xl text-sm text-[#1A1A1A] bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-[#886cff] focus:ring-2 focus:ring-[#886cff]/10 transition-all appearance-none"
                  >
                    <option value="">Select your trade</option>
                    {TRADES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-400 pl-1">
                  <MapPin size={14} />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gold Coast, QLD"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full py-3.5 px-4 rounded-xl text-sm text-[#1A1A1A] placeholder:text-neutral-300 bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-[#886cff] focus:ring-2 focus:ring-[#886cff]/10 transition-all"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl px-4 py-2.5 text-sm text-center bg-red-50 text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !businessName.trim()}
                className="w-full rounded-xl font-semibold py-3.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm bg-[#886cff] text-white hover:bg-[#7b5ff0] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Setting up your workspace...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-neutral-400">
                Free for 30 days, no credit card required
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Success animation */}
            <div className="text-center mb-10">
              <div className="relative inline-flex items-center justify-center mb-6">
                {/* Animated rings */}
                <div className="absolute w-24 h-24 rounded-full border-2 border-[#886cff]/10 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute w-20 h-20 rounded-full border border-[#886cff]/20" />
                <div className="w-16 h-16 rounded-full bg-[#886cff] flex items-center justify-center shadow-lg shadow-[#886cff]/20">
                  <Check size={28} className="text-white" strokeWidth={3} />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-[#1A1A1A]">
                You&apos;re all set!
              </h1>
              <p className="mt-3 text-neutral-500 text-sm sm:text-base max-w-sm mx-auto">
                <span className="font-medium text-[#1A1A1A]">{businessName}</span> is ready to go.
                Here&apos;s what&apos;s waiting for you:
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.label}
                    className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#886cff]/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-[#886cff]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{feature.label}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{feature.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Trial info badge */}
            <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-100 mx-auto max-w-xs">
              <Check size={14} className="text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">30-day free trial activated</span>
            </div>

            {/* Go to Dashboard */}
            <button
              onClick={() => {
                router.push('/dashboard')
                router.refresh()
              }}
              className="w-full rounded-xl font-semibold py-3.5 transition-all flex items-center justify-center gap-2 text-sm bg-[#1A1A1A] text-white hover:bg-[#333] active:scale-[0.98]"
            >
              Go to Dashboard
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
