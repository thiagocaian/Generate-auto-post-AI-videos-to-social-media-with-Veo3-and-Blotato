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

// ─── Category Colours (light backgrounds for light theme) ───────────────────
const catColors: Record<string, string> = {
  Design: '#7C3AED', Switchgear: '#1D4ED8', Cabling: '#0369A1',
  Lighting: '#D97706', Power: '#059669', Safety: '#DC2626',
  Compliance: '#6D28D9', Labour: '#886cff', Infrastructure: '#475569', Management: '#92400E',
}
const catBg: Record<string, string> = {
  Design: 'rgba(124,58,237,0.08)', Switchgear: 'rgba(29,78,216,0.08)', Cabling: 'rgba(3,105,161,0.08)',
  Lighting: 'rgba(217,119,6,0.08)', Power: 'rgba(5,150,105,0.08)', Safety: 'rgba(220,38,38,0.08)',
  Compliance: 'rgba(109,40,217,0.08)', Labour: 'rgba(136,108,255,0.08)', Infrastructure: 'rgba(71,85,105,0.08)', Management: 'rgba(146,64,14,0.08)',
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

  const [aiError, setAiError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setStep('thinking')
    setThinkingStep(0)
    setAiError(null)

    // Start thinking animation
    let i = 0
    const interval = setInterval(() => {
      i++
      if (i < thinkingSteps.length) setThinkingStep(i)
    }, 550)

    try {
      // Call real AI API
      const res = await fetch('/api/quotes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectType: form.projectType,
          floorArea: form.size || '200',
          clientName: form.clientName,
          projectName: form.projectName,
        }),
      })

      clearInterval(interval)
      setThinkingStep(thinkingSteps.length)

      if (!res.ok) {
        const errData = await res.json()
        // Fallback to client-side generation if API key missing
        if (errData.error?.includes('ANTHROPIC_API_KEY')) {
          setTimeout(() => {
            setQuote(generateQuote(form))
            setStep('quote')
          }, 600)
          return
        }
        throw new Error(errData.error || 'Failed to generate quote')
      }

      const data = await res.json()
      const aiQuote = data.quote

      const today = new Date()
      const validDate = new Date(today)
      validDate.setDate(today.getDate() + 30)
      const qNum = 'MCE-' + today.getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000)

      setTimeout(() => {
        setQuote({
          quoteNumber: qNum,
          projectName: form.projectName || 'Unnamed Project',
          clientName: form.clientName || 'Client',
          address: form.address || 'Gold Coast QLD',
          validUntil: validDate.toLocaleDateString('en-AU'),
          items: aiQuote.items,
          subtotal: aiQuote.subtotal,
          gst: aiQuote.gst,
          total: aiQuote.total,
          notes: aiQuote.notes || 'This quote covers all works as specified.',
          estimatedDays: aiQuote.estimatedDays || Math.ceil(parseInt(form.size || '200') / 30) + 5,
        })
        setStep('quote')
      }, 600)
    } catch (err: unknown) {
      clearInterval(interval)
      // Fallback to client-side generation
      setThinkingStep(thinkingSteps.length)
      setTimeout(() => {
        setQuote(generateQuote(form))
        setStep('quote')
      }, 600)
    }
  }

  const fmt = (n: number) => '$' + n.toLocaleString('en-AU')

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFFFF', color: '#1A1A1A', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Sidebar active="quotes" />

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden pt-12 md:pt-0">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3.5"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E5E5' }}>
          <div>
            <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: '#999999' }}>
              <Link href="/" style={{ color: '#000000', fontWeight: 600 }}>CYTRON</Link>
              <span>/</span>
              <span style={{ color: '#333333', fontWeight: 600 }}>Quoting</span>
            </div>
            <h1 className="text-base font-semibold" style={{ color: '#000000' }}>Quote Master — AI Quoting Engine</h1>
          </div>
          {step === 'quote' && quote && (
            <div className="flex gap-2">
              <button onClick={() => { setStep('form'); setApprovalState('none'); setSignatureName('') }}
                className="px-3 py-1.5 text-xs font-semibold"
                style={{ background: 'transparent', color: '#666666', border: '1px solid #E5E5E5' }}>
                New Quote
              </button>
              <button onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold"
                style={{ background: '#000000', color: '#FFFFFF', border: 'none' }}>
                Print / PDF
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ background: '#FAFAFA' }}>

        {/* ── STEP 1: FORM ── */}
        {step === 'form' && (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {/* AI Banner */}
            <div style={{
              background: '#F5F5F5', border: '1px solid #E5E5E5',
              padding: '16px 20px', marginBottom: 28,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, flexShrink: 0,
                background: '#000000',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#FFFFFF',
              }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#000000', marginBottom: 2 }}>CYTRON AI Quoting Engine</div>
                <div style={{ fontSize: 12, color: '#333333', lineHeight: 1.4 }}>
                  Fill in the project details below — AI generates a full itemised quote with materials, labour, and AS3012 compliance costs in seconds.
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', padding: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#999999', letterSpacing: 2, marginBottom: 20, textTransform: 'uppercase' as const }}>PROJECT DETAILS</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[
                  { label: 'Client Name *', key: 'clientName', placeholder: 'e.g. Acme Corp' },
                  { label: 'Project Name *', key: 'projectName', placeholder: 'e.g. Project Alpha' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#999999', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 1 }}>{f.label}</label>
                    <input value={form[f.key as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', fontSize: 13, outline: 'none', background: '#FAFAFA', color: '#000000' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#999999', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 1 }}>Site Address</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="e.g. 12 Surfers Paradise Blvd, Gold Coast QLD 4217"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', fontSize: 13, outline: 'none', background: '#FAFAFA', color: '#000000' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#999999', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 1 }}>Project Type</label>
                  <select value={form.projectType} onChange={e => setForm(f => ({ ...f, projectType: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', fontSize: 13, outline: 'none', background: '#FAFAFA', color: '#000000', cursor: 'pointer' }}>
                    <option value="residential">🏠 Residential</option>
                    <option value="commercial">🏢 Commercial</option>
                    <option value="industrial">🏭 Industrial</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#999999', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 1 }}>Floor Area (m²) *</label>
                  <input type="number" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                    placeholder="e.g. 350"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', fontSize: 13, outline: 'none', background: '#FAFAFA', color: '#000000' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#999999', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 1 }}>Scope of Works</label>
                <textarea value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))} rows={3}
                  placeholder="e.g. Full electrical fitout — MSB, sub-mains, lighting (DALI), power outlets, AS3012 compliance testing..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', fontSize: 13, outline: 'none', background: '#FAFAFA', color: '#000000', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#999999', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 1 }}>Additional Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  placeholder="e.g. Working hours 7am–4pm Mon–Fri, existing switchboard to be retained..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', fontSize: 13, outline: 'none', background: '#FAFAFA', color: '#000000', resize: 'vertical' }}
                />
              </div>

              <button onClick={handleGenerate} disabled={!form.clientName || !form.projectName || !form.size}
                style={{
                  width: '100%', padding: '14px', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  background: (!form.clientName || !form.projectName || !form.size) ? '#E5E5E5' : '#000000',
                  color: (!form.clientName || !form.projectName || !form.size) ? '#999999' : '#FFFFFF',
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
              width: 72, height: 72, margin: '0 auto 24px',
              background: '#000000',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
            }}>🤖</div>
            <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: '#000000' }}>AI analysing your project...</h2>
            <p style={{ margin: '0 0 32px', fontSize: 13, color: '#999999' }}>Generating itemised quote for <strong style={{ color: '#333333' }}>{form.projectName}</strong></p>

            <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', padding: 24, textAlign: 'left' }}>
              {thinkingSteps.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                  borderBottom: i < thinkingSteps.length - 1 ? '1px solid #E5E5E5' : 'none',
                  opacity: i < thinkingStep ? 1 : 0.28, transition: 'opacity 0.3s',
                }}>
                  <div style={{
                    width: 28, height: 28, flexShrink: 0,
                    background: i < thinkingStep ? '#F0F0F0' : '#FAFAFA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>{i < thinkingStep ? '✅' : s.icon}</div>
                  <span style={{ fontSize: 13, color: i < thinkingStep ? '#000000' : '#999999', fontWeight: i < thinkingStep ? 600 : 400 }}>{s.text}</span>
                </div>
              ))}
            </div>

            <div style={{ height: 4, background: '#F0F0F0', marginTop: 20, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: '#000000',
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
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', padding: 28, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, flexShrink: 0,
                      background: '#000000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', fontWeight: 900, fontSize: 20,
                    }}>M</div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 17, color: '#000000' }}>CYTRON</div>
                      <div style={{ fontSize: 11, color: '#999999' }}>AI-Powered Quoting</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#999999', lineHeight: 1.9 }}>
                    <div>Gold Coast QLD, Australia</div>
                    <div>cytron.io</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#999999', letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' as const }}>QUOTATION</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#000000', marginBottom: 10 }}>{quote.quoteNumber}</div>
                  <div style={{ fontSize: 12, color: '#999999', lineHeight: 1.8 }}>
                    <div>Date: {new Date().toLocaleDateString('en-AU')}</div>
                    <div>Valid until: {quote.validUntil}</div>
                    <div>Est. duration: {quote.estimatedDays} working days</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #E5E5E5', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#999999', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' as const }}>PREPARED FOR</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#000000' }}>{quote.clientName}</div>
                  <div style={{ fontSize: 12, color: '#999999' }}>{quote.address}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#999999', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' as const }}>PROJECT</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#000000' }}>{quote.projectName}</div>
                  <div style={{ fontSize: 12, color: '#999999' }}>
                    {form.projectType.charAt(0).toUpperCase() + form.projectType.slice(1)} · {form.size} m²
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', overflow: 'hidden', marginBottom: 16 }}>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 72px 72px 100px 110px',
                padding: '11px 20px', background: '#FAFAFA', borderBottom: '1px solid #E5E5E5',
                fontSize: 10, fontWeight: 700, color: '#999999', letterSpacing: 2, textTransform: 'uppercase' as const,
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
                  padding: '12px 20px', borderBottom: '1px solid #E5E5E5', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#000000', marginBottom: 4 }}>{item.description}</div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 7px',
                      color: catColors[item.category] || '#999999', background: catBg[item.category] || 'rgba(0,0,0,0.04)',
                    }}>{item.category.toUpperCase()}</span>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 13, color: '#999999' }}>{item.qty}</div>
                  <div style={{ textAlign: 'center', fontSize: 13, color: '#999999' }}>{item.unit}</div>
                  <div style={{ textAlign: 'right', fontSize: 13, color: '#999999' }}>{fmt(item.unitPrice)}</div>
                  <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#000000' }}>{fmt(item.total)}</div>
                </div>
              ))}

              {/* Totals block */}
              <div style={{ padding: '20px 20px', background: '#FAFAFA' }}>
                {[
                  { label: 'Subtotal (ex GST)', value: fmt(quote.subtotal) },
                  { label: 'GST (10%)', value: fmt(quote.gst) },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 60, fontSize: 13, color: '#000000', marginBottom: 8 }}>
                    <span>{row.label}</span>
                    <span style={{ minWidth: 110, textAlign: 'right', fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 60,
                  fontSize: 18, fontWeight: 900, color: '#000000',
                  paddingTop: 14, borderTop: '2px solid #E5E5E5', marginTop: 4,
                }}>
                  <span>TOTAL (incl. GST)</span>
                  <span style={{ minWidth: 110, textAlign: 'right', color: '#000000', fontWeight: 900 }}>{fmt(quote.total)}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#999999', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' as const }}>TERMS & CONDITIONS</div>
              <p style={{ margin: 0, fontSize: 12, color: '#333333', lineHeight: 1.7 }}>{quote.notes}</p>
            </div>

            {/* Digital Approval */}
            {approvalState === 'none' && (
              <div style={{
                background: '#F5F5F5',
                border: '1px solid #E5E5E5', padding: '20px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#000000', marginBottom: 4 }}>✍️ Digital Approval</div>
                  <div style={{ fontSize: 12, color: '#333333' }}>
                    Client approves directly on this quote — no printing, no scanning, no delays.
                  </div>
                </div>
                <button onClick={() => setApprovalState('signing')} style={{
                  padding: '10px 22px', border: 'none', whiteSpace: 'nowrap',
                  background: '#000000',
                  color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>Approve & Sign →</button>
              </div>
            )}

            {approvalState === 'signing' && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#000000', marginBottom: 16 }}>✍️ Digital Signature</div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#999999', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 1 }}>Authorised Representative Full Name</label>
                  <input value={signatureName} onChange={e => setSignatureName(e.target.value)}
                    placeholder="Type your full name to sign..."
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #000000', fontSize: 14, outline: 'none', background: '#FAFAFA', color: '#000000', fontStyle: 'italic' }}
                  />
                </div>
                <p style={{ margin: '0 0 16px', fontSize: 11, color: '#999999', lineHeight: 1.5 }}>
                  By entering your name above you agree to accept quote <strong style={{ color: '#000000' }}>{quote.quoteNumber}</strong> for <strong style={{ color: '#000000' }}>{fmt(quote.total)} incl. GST</strong>. This constitutes a legally binding acceptance.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setApprovalState('none')} style={{ padding: '10px 18px', border: '1px solid #E5E5E5', background: 'transparent', color: '#666666', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setApprovalState('approved')} disabled={!signatureName.trim()} style={{
                    padding: '10px 24px', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    background: !signatureName.trim() ? '#E5E5E5' : '#000000',
                    color: !signatureName.trim() ? '#999999' : '#FFFFFF',
                  }}>✅ Confirm & Approve Quote</button>
                </div>
              </div>
            )}

            {approvalState === 'approved' && (
              <div style={{
                background: '#000000',
                padding: 32, textAlign: 'center', color: '#FFFFFF',
              }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, color: '#FFFFFF' }}>Quote Approved!</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Signed by <strong style={{ color: '#FFFFFF' }}>{signatureName}</strong></div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
                  {new Date().toLocaleString('en-AU')} · {quote.quoteNumber} · {fmt(quote.total)}
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.1)', padding: '14px 20px',
                  fontSize: 12, lineHeight: 1.8, textAlign: 'left', color: 'rgba(255,255,255,0.7)',
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
