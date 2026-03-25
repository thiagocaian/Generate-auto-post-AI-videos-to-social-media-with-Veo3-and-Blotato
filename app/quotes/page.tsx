'use client'

import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

// ─── Types ───────────────────────────────────────────────────────────────────
interface QuoteLineItem {
  description: string
  category: string
  qty: number
  unit: string
  unitPrice: number
  total: number
}

interface GeneratedQuote {
  quoteNumber: string
  projectName: string
  clientName: string
  address: string
  validUntil: string
  items: QuoteLineItem[]
  subtotal: number
  gst: number
  total: number
  notes: string
  estimatedDays: number
}

// ─── AI Quote Simulation ──────────────────────────────────────────────────────
function generateQuote(form: Record<string, string>): GeneratedQuote {
  const projectType = form.projectType || 'commercial'
  const size = parseInt(form.size || '200')

  const baseItems: QuoteLineItem[] = [
    { description: 'Electrical Design & Engineering', category: 'Design', qty: 1, unit: 'lot', unitPrice: 2800, total: 2800 },
    { description: 'Main Switchboard (MSB) — 3-phase 400A', category: 'Switchgear', qty: 1, unit: 'unit', unitPrice: 4200, total: 4200 },
    { description: 'Sub-distribution Boards (SDB)', category: 'Switchgear', qty: Math.ceil(size / 80), unit: 'unit', unitPrice: 1850, total: Math.ceil(size / 80) * 1850 },
    { description: 'Cable — 2.5mm² TPS (power circuits)', category: 'Cabling', qty: size * 4, unit: 'm', unitPrice: 3.2, total: Math.round(size * 4 * 3.2) },
    { description: 'Cable — 6mm² TPS (sub-mains)', category: 'Cabling', qty: size * 1.5, unit: 'm', unitPrice: 6.8, total: Math.round(size * 1.5 * 6.8) },
    { description: 'LED Downlights — Dimmable 10W', category: 'Lighting', qty: Math.ceil(size / 6), unit: 'unit', unitPrice: 145, total: Math.ceil(size / 6) * 145 },
    { description: 'DALI Lighting Controller', category: 'Lighting', qty: Math.ceil(size / 100), unit: 'unit', unitPrice: 890, total: Math.ceil(size / 100) * 890 },
    { description: 'General Power Outlets (GPO) — double', category: 'Power', qty: Math.ceil(size / 10), unit: 'unit', unitPrice: 95, total: Math.ceil(size / 10) * 95 },
    { description: 'Safety Switches (RCD) 30mA', category: 'Safety', qty: Math.ceil(size / 50), unit: 'unit', unitPrice: 185, total: Math.ceil(size / 50) * 185 },
    { description: 'AS3012 Compliance Testing & Certification', category: 'Compliance', qty: 1, unit: 'lot', unitPrice: 1200, total: 1200 },
    { description: 'Labour — Licensed Electricians', category: 'Labour', qty: Math.ceil(size / 15), unit: 'hrs', unitPrice: 125, total: Math.ceil(size / 15) * 125 },
    { description: 'Labour — Apprentice Electricians', category: 'Labour', qty: Math.ceil(size / 20), unit: 'hrs', unitPrice: 68, total: Math.ceil(size / 20) * 68 },
    { description: 'Conduit & Cable Management (PVC)', category: 'Infrastructure', qty: size * 2, unit: 'm', unitPrice: 4.5, total: Math.round(size * 2 * 4.5) },
    { description: 'Project Management & Site Supervision', category: 'Management', qty: Math.ceil(size / 50), unit: 'days', unitPrice: 680, total: Math.ceil(size / 50) * 680 },
  ]

  const multiplier = projectType === 'residential' ? 0.65 : projectType === 'industrial' ? 1.35 : 1.0

  const items = baseItems.map(item => ({
    ...item,
    unitPrice: Math.round(item.unitPrice * multiplier * 100) / 100,
    total: Math.round(item.total * multiplier),
  }))

  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const gst = Math.round(subtotal * 0.1)
  const total = subtotal + gst
  const estimatedDays = Math.ceil(size / 30) + 5
  const today = new Date()
  const validDate = new Date(today)
  validDate.setDate(today.getDate() + 30)
  const qNum = 'MCE-' + today.getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000)

  return {
    quoteNumber: qNum,
    projectName: form.projectName || 'Unnamed Project',
    clientName: form.clientName || 'Client',
    address: form.address || 'Gold Coast QLD',
    validUntil: validDate.toLocaleDateString('en-AU'),
    items, subtotal, gst, total,
    notes: `This quote covers all works as specified. Payment terms: 30% deposit on acceptance, balance on completion.`,
    estimatedDays,
  }
}

// ─── Category Colours ─────────────────────────────────────────────────────────
const catColors: Record<string, string> = {
  Design: '#7C3AED', Switchgear: '#1D4ED8', Cabling: '#0369A1',
  Lighting: '#D97706', Power: '#059669', Safety: '#DC2626',
  Compliance: '#6D28D9', Labour: '#00B050', Infrastructure: '#475569', Management: '#92400E',
}
const catBg: Record<string, string> = {
  Design: '#F5F3FF', Switchgear: '#EFF6FF', Cabling: '#E0F2FE',
  Lighting: '#FFFBEB', Power: '#ECFDF5', Safety: '#FEF2F2',
  Compliance: '#F5F3FF', Labour: '#E8F5EE', Infrastructure: '#F8FAFC', Management: '#FEF3C7',
}


// ─── Main Component ───────────────────────────────────────────────────────────
export default function QuotesPage() {
  const [step, setStep] = useState<'form' | 'thinking' | 'quote'>('form')
  const [thinkingStep, setThinkingStep] = useState(0)
  const [quote, setQuote] = useState<GeneratedQuote | null>(null)
  const [approvalState, setApprovalState] = useState<'none' | 'signing' | 'approved'>('none')
  const [signatureName, setSignatureName] = useState('')
  const [form, setForm] = useState({
    clientName: '', projectName: '', address: '',
    projectType: 'commercial', size: '', scope: '', notes: '',
  })

  const thinkingSteps = [
    { icon: '🔍', text: 'Analysing project specifications...' },
    { icon: '📐', text: 'Calculating material quantities...' },
    { icon: '💡', text: 'Applying pricing matrix...' },
    { icon: '⚡', text: 'Cross-referencing warehouse stock...' },
    { icon: '📋', text: 'Generating AS3012 compliance items...' },
    { icon: '✅', text: 'Quote ready — reviewing for accuracy...' },
  ]

  const handleGenerate = () => {
    setStep('thinking')
    setThinkingStep(0)
    let i = 0
    const interval = setInterval(() => {
      i++
      setThinkingStep(i)
      if (i >= thinkingSteps.length) {
        clearInterval(interval)
        setTimeout(() => {
          setQuote(generateQuote(form))
          setStep('quote')
        }, 600)
      }
    }, 550)
  }

  const fmt = (n: number) => '$' + n.toLocaleString('en-AU')

  return (
    <div className="flex min-h-screen" style={{ background: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Sidebar active="quotes" />

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3.5"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          <div>
            <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: '#9CA3AF' }}>
              <Link href="/" style={{ color: '#1D4ED8', fontWeight: 600 }}>CYTRON</Link>
              <span>/</span>
              <span style={{ color: '#374151', fontWeight: 600 }}>Quoting</span>
            </div>
            <h1 className="text-base font-semibold" style={{ color: '#111827' }}>Quote Master — AI Quoting Engine</h1>
          </div>
          {step === 'quote' && quote && (
            <div className="flex gap-2">
              <button onClick={() => { setStep('form'); setApprovalState('none'); setSignatureName('') }}
                className="px-3 py-1.5 rounded text-xs font-semibold"
                style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>
                New Quote
              </button>
              <button onClick={() => window.print()}
                className="px-3 py-1.5 rounded text-xs font-semibold"
                style={{ background: '#1D4ED8', color: '#FFFFFF' }}>
                Print / PDF
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6">

        {/* ── STEP 1: FORM ── */}
        {step === 'form' && (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {/* AI Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #F5F3FF, #EFF6FF)', border: '1px solid #DDD6FE',
              borderRadius: 12, padding: '16px 20px', marginBottom: 28,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#4C1D95', marginBottom: 2 }}>CYTRON AI Quoting Engine</div>
                <div style={{ fontSize: 12, color: '#6D28D9', lineHeight: 1.4 }}>
                  Fill in the project details below — AI generates a full itemised quote with materials, labour, and AS3012 compliance costs in seconds.
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', padding: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 20 }}>PROJECT DETAILS</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[
                  { label: 'Client Name *', key: 'clientName', placeholder: 'e.g. Acme Corp' },
                  { label: 'Project Name *', key: 'projectName', placeholder: 'e.g. Project Alpha' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>{f.label}</label>
                    <input value={form[f.key as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Site Address</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="e.g. 12 Surfers Paradise Blvd, Gold Coast QLD 4217"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Project Type</label>
                  <select value={form.projectType} onChange={e => setForm(f => ({ ...f, projectType: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer' }}>
                    <option value="residential">🏠 Residential</option>
                    <option value="commercial">🏢 Commercial</option>
                    <option value="industrial">🏭 Industrial</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Floor Area (m²) *</label>
                  <input type="number" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                    placeholder="e.g. 350"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Scope of Works</label>
                <textarea value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))} rows={3}
                  placeholder="e.g. Full electrical fitout — MSB, sub-mains, lighting (DALI), power outlets, AS3012 compliance testing..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Additional Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  placeholder="e.g. Working hours 7am–4pm Mon–Fri, existing switchboard to be retained..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)', resize: 'vertical' }}
                />
              </div>

              <button onClick={handleGenerate} disabled={!form.clientName || !form.projectName || !form.size}
                style={{
                  width: '100%', padding: '14px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  background: (!form.clientName || !form.projectName || !form.size) ? '#E5E7EB' : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  color: (!form.clientName || !form.projectName || !form.size) ? '#9CA3AF' : '#fff',
                  letterSpacing: 0.5, transition: 'all 0.2s',
                }}>
                🤖 Generate Quote with AI
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: THINKING ── */}
        {step === 'thinking' && (
          <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
              boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
            }}>🤖</div>
            <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>AI analysing your project...</h2>
            <p style={{ margin: '0 0 32px', fontSize: 13, color: 'var(--text-muted)' }}>Generating itemised quote for <strong>{form.projectName}</strong></p>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, textAlign: 'left' }}>
              {thinkingSteps.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                  borderBottom: i < thinkingSteps.length - 1 ? '1px solid var(--border)' : 'none',
                  opacity: i < thinkingStep ? 1 : 0.28, transition: 'opacity 0.3s',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: i < thinkingStep ? '#E8F5EE' : '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>{i < thinkingStep ? '✅' : s.icon}</div>
                  <span style={{ fontSize: 13, color: i < thinkingStep ? 'var(--text)' : 'var(--text-light)', fontWeight: i < thinkingStep ? 600 : 400 }}>{s.text}</span>
                </div>
              ))}
            </div>

            <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, marginTop: 20, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'linear-gradient(90deg, #7C3AED, #4F46E5)',
                width: `${(thinkingStep / thinkingSteps.length) * 100}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        )}

        {/* ── STEP 3: GENERATED QUOTE ── */}
        {step === 'quote' && quote && (
          <div style={{ maxWidth: 900, margin: '0 auto' }}>

            {/* Quote Header */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: 'linear-gradient(135deg, #00B050, #00803A)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 900, fontSize: 20,
                    }}>M</div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)' }}>CYTRON</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI-Powered Quoting</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.9 }}>
                    <div>Gold Coast QLD, Australia</div>
                    <div>cytron.io</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 4 }}>QUOTATION</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', marginBottom: 10 }}>{quote.quoteNumber}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                    <div>Date: {new Date().toLocaleDateString('en-AU')}</div>
                    <div>Valid until: {quote.validUntil}</div>
                    <div>Est. duration: {quote.estimatedDays} working days</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 6 }}>PREPARED FOR</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{quote.clientName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{quote.address}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 6 }}>PROJECT</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{quote.projectName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {form.projectType.charAt(0).toUpperCase() + form.projectType.slice(1)} · {form.size} m²
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 72px 72px 100px 110px',
                padding: '11px 20px', background: '#F8F9FA', borderBottom: '1px solid var(--border)',
                fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1,
              }}>
                <div>DESCRIPTION</div>
                <div style={{ textAlign: 'center' }}>QTY</div>
                <div style={{ textAlign: 'center' }}>UNIT</div>
                <div style={{ textAlign: 'right' }}>UNIT PRICE</div>
                <div style={{ textAlign: 'right' }}>TOTAL</div>
              </div>

              {quote.items.map((item, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 72px 72px 100px 110px',
                  padding: '12px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{item.description}</div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                      color: catColors[item.category] || '#666', background: catBg[item.category] || '#F9FAFB',
                    }}>{item.category.toUpperCase()}</span>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>{item.qty}</div>
                  <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>{item.unit}</div>
                  <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>{fmt(item.unitPrice)}</div>
                  <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{fmt(item.total)}</div>
                </div>
              ))}

              {/* Totals block */}
              <div style={{ padding: '20px 20px', background: '#FAFBFC' }}>
                {[
                  { label: 'Subtotal (ex GST)', value: fmt(quote.subtotal) },
                  { label: 'GST (10%)', value: fmt(quote.gst) },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 60, fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span>{row.label}</span>
                    <span style={{ minWidth: 110, textAlign: 'right', fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 60,
                  fontSize: 18, fontWeight: 900, color: 'var(--text)',
                  paddingTop: 14, borderTop: '2px solid var(--border)', marginTop: 4,
                }}>
                  <span>TOTAL (incl. GST)</span>
                  <span style={{ minWidth: 110, textAlign: 'right', color: '#00B050' }}>{fmt(quote.total)}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 10 }}>TERMS & CONDITIONS</div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>{quote.notes}</p>
            </div>

            {/* Digital Approval */}
            {approvalState === 'none' && (
              <div style={{
                background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)',
                border: '1.5px solid #86EFAC', borderRadius: 12, padding: '20px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#15803D', marginBottom: 4 }}>✍️ Digital Approval</div>
                  <div style={{ fontSize: 12, color: '#16A34A' }}>
                    Client approves directly on this quote — no printing, no scanning, no delays.
                  </div>
                </div>
                <button onClick={() => setApprovalState('signing')} style={{
                  padding: '10px 22px', borderRadius: 8, border: 'none', whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg, #00B050, #00803A)',
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>Approve & Sign →</button>
              </div>
            )}

            {approvalState === 'signing' && (
              <div style={{ background: 'var(--surface)', border: '1.5px solid #7C3AED', borderRadius: 12, padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 16 }}>✍️ Digital Signature</div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Authorised Representative Full Name</label>
                  <input value={signatureName} onChange={e => setSignatureName(e.target.value)}
                    placeholder="Type your full name to sign..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #7C3AED', fontSize: 14, outline: 'none', background: 'var(--bg)', color: 'var(--text)', fontStyle: 'italic' }}
                  />
                </div>
                <p style={{ margin: '0 0 16px', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  By entering your name above you agree to accept quote <strong>{quote.quoteNumber}</strong> for <strong>{fmt(quote.total)} incl. GST</strong>. This constitutes a legally binding acceptance.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setApprovalState('none')} style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setApprovalState('approved')} disabled={!signatureName.trim()} style={{
                    padding: '10px 24px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    background: !signatureName.trim() ? '#E5E7EB' : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                    color: !signatureName.trim() ? '#9CA3AF' : '#fff',
                  }}>✅ Confirm & Approve Quote</button>
                </div>
              </div>
            )}

            {approvalState === 'approved' && (
              <div style={{
                background: 'linear-gradient(135deg, #00B050, #007A38)',
                borderRadius: 12, padding: 32, textAlign: 'center', color: '#fff',
              }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Quote Approved!</div>
                <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 4 }}>Signed by <strong>{signatureName}</strong></div>
                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 24 }}>
                  {new Date().toLocaleString('en-AU')} · {quote.quoteNumber} · {fmt(quote.total)}
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '14px 20px',
                  fontSize: 12, lineHeight: 1.8, textAlign: 'left',
                }}>
                  <div>📧 <strong>Confirmation email</strong> sent to client automatically</div>
                  <div>📋 <strong>Work order</strong> created in CYTRON</div>
                  <div>📦 <strong>Warehouse stock check</strong> initiated for this project</div>
                  <div>📊 <strong>Job tracked</strong> in dashboard under Active Projects</div>
                </div>
              </div>
            )}

          </div>
        )}
        </div>
      </main>
    </div>
  )
}
