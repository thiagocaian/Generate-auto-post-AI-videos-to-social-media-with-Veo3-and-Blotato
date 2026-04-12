'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const businessTypes = [
  'Electrician',
  'Plumber',
  'HVAC',
  'Cleaning',
  'Landscaping',
  'Construction',
  'Pool Service',
  'Pest Control',
  'Locksmith',
  'Painter',
  'Cafe / Restaurant',
  'Retail Shop',
  'Other',
]

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
]

export default function BookingPage() {
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    business_name: '',
    business_type: '',
    preferred_date: '',
    preferred_time: '',
    message: '',
  })

  const handleSubmit = async () => {
    if (!form.name || !form.email) return
    setStep('submitting')

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setStep('success')
      } else {
        setStep('form')
        alert('Error: ' + (data.error || 'Try again'))
      }
    } catch {
      setStep('form')
      alert('Network error. Please try again.')
    }
  }

  // Get next 14 days for date picker
  const today = new Date()
  const minDate = today.toISOString().split('T')[0]
  const maxDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#050505' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#886cff] flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-white font-semibold">Cytron</span>
        </Link>
        <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">
          ← Back to home
        </Link>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">

          {/* Success state */}
          {step === 'success' ? (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <div className="w-16 h-16 rounded-full bg-[#886cff]/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Demo Agendada!</h2>
              <p className="text-sm text-neutral-400 mb-2">
                Entraremos em contacto em breve para confirmar o horário.
              </p>
              <p className="text-xs text-neutral-600 mb-8">
                {form.preferred_date && `Data preferida: ${form.preferred_date}`}
                {form.preferred_time && ` às ${form.preferred_time}`}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#886cff] text-white text-sm font-medium"
              >
                Voltar ao site
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-3xl font-bold text-white mb-2">
                  Agende uma Demonstração
                </h1>
                <p className="text-sm text-neutral-400">
                  Veja como a Cytron pode automatizar o seu negócio. 30 minutos, sem compromisso.
                </p>
              </motion.div>

              {/* Form */}
              <motion.div
                className="rounded-2xl p-6"
                style={{ background: '#0f0f15', border: '1px solid rgba(136,108,255,0.15)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="space-y-4">
                  {/* Name + Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider mb-1.5 text-neutral-500">
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Seu nome"
                        required
                        className="w-full px-3 py-2.5 text-sm rounded-lg text-white placeholder:text-neutral-600 outline-none focus:border-[#886cff]/50 transition-colors"
                        style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider mb-1.5 text-neutral-500">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="email@business.com"
                        required
                        className="w-full px-3 py-2.5 text-sm rounded-lg text-white placeholder:text-neutral-600 outline-none focus:border-[#886cff]/50 transition-colors"
                        style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                    </div>
                  </div>

                  {/* Phone + Business name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider mb-1.5 text-neutral-500">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="04XX XXX XXX"
                        className="w-full px-3 py-2.5 text-sm rounded-lg text-white placeholder:text-neutral-600 outline-none focus:border-[#886cff]/50 transition-colors"
                        style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider mb-1.5 text-neutral-500">
                        Nome do Negócio
                      </label>
                      <input
                        type="text"
                        value={form.business_name}
                        onChange={e => setForm({ ...form, business_name: e.target.value })}
                        placeholder="Ex: Maco Electrics"
                        className="w-full px-3 py-2.5 text-sm rounded-lg text-white placeholder:text-neutral-600 outline-none focus:border-[#886cff]/50 transition-colors"
                        style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                    </div>
                  </div>

                  {/* Business type */}
                  <div>
                    <label className="block text-[10px] font-medium uppercase tracking-wider mb-1.5 text-neutral-500">
                      Tipo de Negócio
                    </label>
                    <select
                      value={form.business_type}
                      onChange={e => setForm({ ...form, business_type: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm rounded-lg text-white outline-none focus:border-[#886cff]/50 transition-colors"
                      style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <option value="">Selecione...</option>
                      {businessTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date + Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider mb-1.5 text-neutral-500">
                        Data Preferida
                      </label>
                      <input
                        type="date"
                        value={form.preferred_date}
                        onChange={e => setForm({ ...form, preferred_date: e.target.value })}
                        min={minDate}
                        max={maxDate}
                        className="w-full px-3 py-2.5 text-sm rounded-lg text-white outline-none focus:border-[#886cff]/50 transition-colors"
                        style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider mb-1.5 text-neutral-500">
                        Horário Preferido
                      </label>
                      <select
                        value={form.preferred_time}
                        onChange={e => setForm({ ...form, preferred_time: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm rounded-lg text-white outline-none focus:border-[#886cff]/50 transition-colors"
                        style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <option value="">Selecione...</option>
                        {timeSlots.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-[10px] font-medium uppercase tracking-wider mb-1.5 text-neutral-500">
                      Mensagem (opcional)
                    </label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Conte um pouco sobre seu negócio e o que gostaria de automatizar..."
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm rounded-lg text-white placeholder:text-neutral-600 outline-none focus:border-[#886cff]/50 transition-colors resize-none"
                      style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={!form.name || !form.email || step === 'submitting'}
                    className="w-full py-3 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-40 hover:shadow-lg hover:shadow-[#886cff]/25"
                    style={{ background: '#886cff' }}
                  >
                    {step === 'submitting' ? 'Agendando...' : 'Agendar Demonstração Gratuita'}
                  </button>

                  <p className="text-center text-[10px] text-neutral-600">
                    Sem compromisso • 30 minutos • 100% gratuito
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
