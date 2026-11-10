'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CalendarCheck, Check, ChevronRight, Clock, MapPin } from 'lucide-react'

const businessTypes = [
  'Electrician', 'Plumber', 'HVAC', 'Cleaning', 'Landscaping', 'Construction', 'Pool Service',
  'Pest Control', 'Locksmith', 'Painter', 'Cafe / Restaurant', 'Retail Shop', 'Other',
]

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
]

const input =
  'w-full rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-[#5b5cf6] focus:ring-2 focus:ring-[#5b5cf6]/15'
const label = 'mb-1.5 block text-xs font-semibold text-slate-700'

const POINTS = [
  { icon: Clock, t: '30 minutes, online or in person' },
  { icon: CalendarCheck, t: 'See your own workflows, not a generic demo' },
  { icon: MapPin, t: 'Gold Coast team, no obligation' },
]

export default function BookingPage() {
  const reduced = useReducedMotion() === true
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', business_name: '', business_type: '',
    preferred_date: '', preferred_time: '', message: '',
  })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) {
      setError('Please fill in your name and email.')
      return
    }
    setError('')
    setStep('submitting')
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        setStep('success')
      } else {
        setStep('form')
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStep('form')
      setError('Network error. Please try again.')
    }
  }

  const today = new Date()
  const minDate = today.toISOString().split('T')[0]
  const maxDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const rise = (d = 0) => (reduced ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.4, ease: 'easeOut' as const } })

  return (
    <section className="border-b border-[#e5e7eb] bg-gradient-to-b from-white to-[#f3f4f7]">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-14 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <motion.p {...rise()} className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#5b5cf6]">Book a demo</motion.p>
          <motion.h1 {...rise(0.03)} className="text-[clamp(2.1rem,6.5vw,3.4rem)] font-semibold leading-[1.06] tracking-tight text-slate-900">
            See Cytron run on <span className="text-[#5b5cf6]">your</span> business.
          </motion.h1>
          <motion.p {...rise(0.08)} className="mt-5 max-w-md text-[17px] leading-relaxed text-slate-600 sm:text-lg">
            Pick a time and tell us what you&apos;d like to automate. We&apos;ll be in touch shortly to confirm.
          </motion.p>
          <motion.ul {...rise(0.12)} className="mt-8 space-y-3">
            {POINTS.map(({ icon: Icon, t }) => (
              <li key={t} className="flex items-center gap-3 text-[15px] text-slate-700">
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-slate-700"><Icon size={16} /></span>
                {t}
              </li>
            ))}
          </motion.ul>
          <motion.p {...rise(0.15)} className="mt-8 text-sm text-slate-600">
            Prefer a full process review? <a href="/contact" className="font-semibold text-[#5b5cf6] hover:text-[#4f46e5]">Book the free automation audit</a>.
          </motion.p>
        </div>

        <motion.div {...rise(0.1)} className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-8">
          {step === 'success' ? (
            <div className="py-6 text-center" role="status">
              <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><Check size={22} strokeWidth={3} /></span>
              <h2 className="text-2xl font-semibold text-slate-900">Demo request received</h2>
              <p className="mt-2 text-[15px] text-slate-600">We&apos;ll be in touch shortly to confirm your time.</p>
              {(form.preferred_date || form.preferred_time) && (
                <p className="mt-2 text-sm text-slate-600">
                  Preferred: {form.preferred_date}{form.preferred_time && ` at ${form.preferred_time}`}
                </p>
              )}
              <a href="/" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#5b5cf6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4f46e5]">
                Back to the site <ChevronRight size={16} />
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bk-name" className={label}>Name *</label>
                  <input id="bk-name" type="text" autoComplete="name" required value={form.name} onChange={set('name')} placeholder="Your name" className={input} />
                </div>
                <div>
                  <label htmlFor="bk-email" className={label}>Email *</label>
                  <input id="bk-email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} placeholder="you@business.com.au" className={input} />
                </div>
                <div>
                  <label htmlFor="bk-phone" className={label}>Phone</label>
                  <input id="bk-phone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="04XX XXX XXX" className={input} />
                </div>
                <div>
                  <label htmlFor="bk-business" className={label}>Business name</label>
                  <input id="bk-business" type="text" autoComplete="organization" value={form.business_name} onChange={set('business_name')} placeholder="e.g. Maco Electrics" className={input} />
                </div>
              </div>
              <div>
                <label htmlFor="bk-type" className={label}>Business type</label>
                <select id="bk-type" value={form.business_type} onChange={set('business_type')} className={input}>
                  <option value="">Select…</option>
                  {businessTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bk-date" className={label}>Preferred date</label>
                  <input id="bk-date" type="date" value={form.preferred_date} onChange={set('preferred_date')} min={minDate} max={maxDate} className={input} />
                </div>
                <div>
                  <label htmlFor="bk-time" className={label}>Preferred time (AEST)</label>
                  <select id="bk-time" value={form.preferred_time} onChange={set('preferred_time')} className={input}>
                    <option value="">Select…</option>
                    {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="bk-msg" className={label}>Message (optional)</label>
                <textarea id="bk-msg" rows={3} value={form.message} onChange={set('message')} placeholder="Tell us about your business and what you'd like to automate…" className={`${input} resize-none`} />
              </div>
              <p aria-live="polite" className="min-h-[1.25rem] text-sm font-medium text-red-700">{error}</p>
              <button
                type="submit"
                disabled={step === 'submitting'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#5b5cf6] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5] disabled:opacity-50"
              >
                {step === 'submitting' ? 'Booking…' : 'Book a free demo'}
              </button>
              <p className="text-center text-xs text-slate-600">No obligation · 30 minutes · free</p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
