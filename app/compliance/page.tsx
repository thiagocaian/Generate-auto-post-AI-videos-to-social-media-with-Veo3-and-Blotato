'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
type FormStep = 'select' | 'fill' | 'generating' | 'done'

interface ComplianceReport {
  id: string
  report_number: string
  report_type: string
  project_name: string
  inspector_name: string
  inspection_date: string
  result: 'pass' | 'fail' | 'pending'
  regulatory_ref: string
}

const formTypes = [
  { id: 'as3012', label: 'AS3012 Electrical Safety', icon: '⚡', desc: 'Standard residential & commercial electrical safety report', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'rcd', label: 'RCD / Safety Switch Testing', icon: '🔌', desc: 'AS/NZS 3017 — Residual current device compliance test', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'emergency', label: 'Emergency Lighting Test', icon: '🚨', desc: '90-minute battery duration test per AS 2293', color: '#D97706', bg: '#FFFBEB' },
  { id: 'hv', label: 'HV Switchgear Inspection', icon: '⚠️', desc: 'High voltage equipment inspection and thermal imaging report', color: '#DC2626', bg: '#FEF2F2' },
  { id: 'dali', label: 'DALI Lighting Commissioning', icon: '💡', desc: 'DALI addressing, scene programming and handover checklist', color: '#059669', bg: '#ECFDF5' },
]

const statusConfig = {
  pass:    { label: 'PASS',    color: '#059669', bg: '#ECFDF5' },
  fail:    { label: 'FAIL',    color: '#DC2626', bg: '#FEF2F2' },
  pending: { label: 'PENDING', color: '#D97706', bg: '#FFFBEB' },
}

const navItems = [
  { label: 'Dashboard',      href: '/',                icon: '⊞' },
  { label: 'Warehouse',      href: '/warehouse',       icon: '📦', badge: '2' },
  { label: 'Quoting',        href: '/quotes',          icon: '📋' },
  { label: 'Subcontractors', href: '/field-commander', icon: '👷' },
  { label: 'Compliance',     href: '/compliance',      icon: '📄', active: true },
  { label: 'Marketing AI',   href: '/marketing',       icon: '🎬' },
]

const generatingSteps = [
  'Validating form data against AS3012 clause 1.4...',
  'Cross-referencing licence number with QLD register...',
  'Applying project-specific electrical parameters...',
  'Generating regulatory PDF (AS/NZS 3000 format)...',
  'Archiving to project folder in Supabase...',
  'Report ready — compliance record saved ✅',
]

export default function CompliancePage() {
  const [step, setStep] = useState<FormStep>('select')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [genStep, setGenStep] = useState(0)
  const [genDone, setGenDone] = useState(false)
  const [reportRef, setReportRef] = useState('')
  const [archive, setArchive] = useState<ComplianceReport[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    project: '',
    location: '',
    inspector: '',
    license: '',
    date: '',
    result: 'pass',
    voltage: '',
    notes: '',
  })
  const [archiveSearch, setArchiveSearch] = useState('')

  useEffect(() => {
    fetch('/api/compliance')
      .then(r => r.json())
      .then(d => setArchive(d.reports || []))
      .finally(() => setLoading(false))
  }, [])

  const passCount = archive.filter(r => r.result === 'pass').length
  const failCount = archive.filter(r => r.result === 'fail').length
  const pendingCount = archive.filter(r => r.result === 'pending').length

  function handleSelectType(id: string) {
    setSelectedType(id)
    setStep('fill')
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setStep('generating')
    setGenStep(0)
    setGenDone(false)

    let i = 0
    const interval = setInterval(() => {
      i++
      setGenStep(i)
      if (i >= generatingSteps.length) clearInterval(interval)
    }, 700)

    const ft = formTypes.find(f => f.id === selectedType)
    const res = await fetch('/api/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportType: ft?.label,
        ...form,
      }),
    })
    const data = await res.json()
    setReportRef(data.ref || 'QLD-2026-XXXX')

    // Refresh archive
    fetch('/api/compliance').then(r => r.json()).then(d => setArchive(d.reports || []))
    setTimeout(() => { setGenDone(true); setStep('done') }, generatingSteps.length * 700 + 600)
  }

  const filteredArchive = archive.filter(r =>
    (r.project_name || '').toLowerCase().includes(archiveSearch.toLowerCase()) ||
    (r.report_type || '').toLowerCase().includes(archiveSearch.toLowerCase()) ||
    (r.inspector_name || '').toLowerCase().includes(archiveSearch.toLowerCase())
  )

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F4F6F8' }}>

      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E9EF' }}>
        <div className="px-5 py-5" style={{ borderBottom: '1px solid #E5E9EF' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white" style={{ background: 'linear-gradient(135deg, #00B050, #007A32)' }}>C</div>
            <div>
              <div className="font-black text-base tracking-widest" style={{ color: '#1A1A2E' }}>CYTRON</div>
              <div className="text-xs" style={{ color: '#9CA3AF' }}>Automation Platform</div>
            </div>
          </div>
        </div>

        <div className="mx-3 mt-4 px-3 py-2.5 rounded-lg" style={{ background: '#E8F5EE', border: '1px solid #C8E6D4' }}>
          <div className="text-xs font-semibold mb-0.5" style={{ color: '#9CA3AF' }}>ACTIVE CLIENT</div>
          <div className="font-bold text-sm" style={{ color: '#1A1A2E' }}>Maco Electrics</div>
          <div className="text-xs font-medium flex items-center gap-1 mt-0.5" style={{ color: '#00B050' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#00B050' }}></span>
            Gold Coast, QLD
          </div>
        </div>

        <nav className="flex-1 px-3 mt-5 space-y-0.5">
          {navItems.map(item => (
            <Link key={item.label} href={item.href}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={item.active ? { background: '#ECFDF5', color: '#059669' } : { color: '#6B7280' }}
            >
              <div className="flex items-center gap-2.5">
                <span>{item.icon}</span>{item.label}
              </div>
              {item.badge && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#FEF3C7', color: '#D97706' }}>{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4" style={{ borderTop: '1px solid #E5E9EF' }}>
          <div className="text-xs" style={{ color: '#D1D5DB' }}>v1.0.0 · Build 2026.03</div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E9EF' }}>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xl">📄</span>
              <h1 className="text-lg font-bold" style={{ color: '#1A1A2E' }}>COMPLIANCE SHIELD</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#ECFDF5', color: '#059669' }}>AS3012 Reporting</span>
            </div>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Sunday, 22 March 2026 · {archive.length} compliance records archived</p>
          </div>
          <div className="flex items-center gap-3">
            {failCount > 0 && (
              <div className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                ⚠️ {failCount} Failed Report{failCount > 1 ? 's' : ''}
              </div>
            )}
            {step !== 'select' && (
              <button
                onClick={() => { setStep('select'); setSelectedType(null); setGenDone(false) }}
                className="px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: '#F3F4F6', color: '#6B7280' }}
              >
                ← Back
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6">

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Reports', value: String(archive.length), sub: 'All projects', icon: '📋', color: '#059669', bg: '#ECFDF5' },
              { label: 'Passed', value: String(passCount), sub: 'Compliant', icon: '✅', color: '#059669', bg: '#ECFDF5' },
              { label: 'Failed', value: String(failCount), sub: 'Action required', icon: '❌', color: '#DC2626', bg: '#FEF2F2', alert: failCount > 0 },
              { label: 'Pending', value: String(pendingCount), sub: 'Awaiting sign-off', icon: '⏳', color: '#D97706', bg: '#FFFBEB' },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-xl p-5" style={{ background: '#FFFFFF', border: `1px solid ${(kpi as {alert?: boolean}).alert ? '#FECACA' : '#E5E9EF'}` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-4" style={{ background: kpi.bg }}>{kpi.icon}</div>
                <div className="text-2xl font-bold mb-0.5" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: '#1A1A2E' }}>{kpi.label}</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* ── STEP: SELECT FORM TYPE ─────────────────────────────────────── */}
          {step === 'select' && (
            <>
              <div className="mb-5">
                <h2 className="text-base font-bold mb-1" style={{ color: '#1A1A2E' }}>Generate Compliance Report</h2>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>Select the inspection type. AI fills the regulatory template — you review and save.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-8">
                {formTypes.map(ft => (
                  <button
                    key={ft.id}
                    onClick={() => handleSelectType(ft.id)}
                    className="flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:shadow-md"
                    style={{ background: '#FFFFFF', border: '1px solid #E5E9EF' }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: ft.bg }}>
                      {ft.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm mb-0.5" style={{ color: '#1A1A2E' }}>{ft.label}</div>
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>{ft.desc}</div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: ft.bg, color: ft.color }}>Generate →</span>
                  </button>
                ))}
              </div>

              {/* Archive */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold" style={{ color: '#1A1A2E' }}>Report Archive</h2>
                  <input
                    className="px-3 py-1.5 rounded-lg text-xs outline-none"
                    style={{ border: '1px solid #E5E9EF', background: '#FAFAFA', color: '#1A1A2E', width: 200 }}
                    placeholder="Search project, inspector..."
                    value={archiveSearch}
                    onChange={e => setArchiveSearch(e.target.value)}
                  />
                </div>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E9EF' }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E9EF' }}>
                        {['Report ID', 'Type', 'Project', 'Inspector', 'Date', 'Status', ''].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold" style={{ color: '#9CA3AF' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr><td colSpan={7} className="px-4 py-6 text-center text-xs" style={{ color: '#9CA3AF' }}>Loading reports...</td></tr>
                      )}
                      {filteredArchive.map((r, i) => {
                        const st = statusConfig[r.result]
                        return (
                          <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid #F3F4F6' : undefined, background: '#FFFFFF' }}>
                            <td className="px-4 py-3 text-xs font-mono font-bold" style={{ color: '#9CA3AF' }}>{r.report_number}</td>
                            <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#1A1A2E' }}>{r.report_type}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>{r.project_name}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>{r.inspector_name}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>{r.inspection_date}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                            </td>
                            <td className="px-4 py-3">
                              <button className="text-xs font-semibold hover:underline" style={{ color: '#2563EB' }}>Download PDF</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── STEP: FILL FORM ───────────────────────────────────────────── */}
          {step === 'fill' && selectedType && (() => {
            const ft = formTypes.find(f => f.id === selectedType)!
            return (
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6 p-4 rounded-xl" style={{ background: ft.bg }}>
                  <span className="text-3xl">{ft.icon}</span>
                  <div>
                    <div className="font-black text-base" style={{ color: ft.color }}>{ft.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{ft.desc}</div>
                  </div>
                </div>

                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Project Name', key: 'project', placeholder: 'e.g. Madeline Tower Stage 2' },
                      { label: 'Site Location', key: 'location', placeholder: 'e.g. Level 12, Switchroom A' },
                      { label: 'Inspector Name', key: 'inspector', placeholder: 'e.g. Mark Peters' },
                      { label: 'Licence Number', key: 'license', placeholder: 'e.g. QLD-82311' },
                      { label: 'Inspection Date', key: 'date', placeholder: '22 Mar 2026' },
                      { label: 'Supply Voltage', key: 'voltage', placeholder: 'e.g. 415V 3-phase' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>{f.label.toUpperCase()}</label>
                        <input
                          required
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={{ border: '1px solid #E5E9EF', color: '#1A1A2E', background: '#FAFAFA' }}
                          placeholder={f.placeholder}
                          value={(form as Record<string, string>)[f.key]}
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>INSPECTION RESULT</label>
                    <div className="flex gap-3">
                      {(['pass', 'fail'] as const).map(r => (
                        <button type="button" key={r}
                          onClick={() => setForm(p => ({ ...p, result: r }))}
                          className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                          style={form.result === r
                            ? r === 'pass'
                              ? { background: '#059669', color: 'white' }
                              : { background: '#DC2626', color: 'white' }
                            : { background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E9EF' }
                          }
                        >
                          {r === 'pass' ? '✅ PASS' : '❌ FAIL'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>NOTES / OBSERVATIONS</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                      style={{ border: '1px solid #E5E9EF', color: '#1A1A2E', background: '#FAFAFA' }}
                      placeholder="Any defects, conditions, or observations..."
                      value={form.notes}
                      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
                    style={{ background: '#059669' }}
                  >
                    Generate Compliance PDF with AI ⚡
                  </button>
                </form>
              </div>
            )
          })()}

          {/* ── STEP: GENERATING ─────────────────────────────────────────── */}
          {step === 'generating' && (
            <div className="max-w-lg">
              <div className="rounded-2xl p-8" style={{ background: '#FFFFFF', border: '1px solid #E5E9EF' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#ECFDF5' }}>📄</div>
                  <div>
                    <div className="font-black text-base" style={{ color: '#1A1A2E' }}>Generating Report</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>AI is filling the regulatory template...</div>
                  </div>
                </div>

                <div className="mb-5 h-2 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(genStep / generatingSteps.length) * 100}%`, background: 'linear-gradient(90deg,#059669,#10B981)' }}
                  />
                </div>

                <div className="space-y-3">
                  {generatingSteps.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm transition-all" style={{ opacity: i <= genStep ? 1 : 0.3 }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{ background: i < genStep ? '#059669' : i === genStep ? '#ECFDF5' : '#F3F4F6', color: i < genStep ? 'white' : '#9CA3AF' }}>
                        {i < genStep ? '✓' : i + 1}
                      </div>
                      <span style={{ color: i <= genStep ? '#1A1A2E' : '#9CA3AF' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: DONE ────────────────────────────────────────────────── */}
          {step === 'done' && (
            <div className="max-w-lg">
              <div className="rounded-2xl p-8" style={{ background: '#ECFDF5', border: '2px solid #6EE7B7' }}>
                <div className="text-4xl mb-4 text-center">✅</div>
                <h2 className="text-xl font-black text-center mb-2" style={{ color: '#059669' }}>Report Generated</h2>
                <p className="text-sm text-center mb-6" style={{ color: '#065F46' }}>
                  Compliance PDF saved and archived successfully.
                </p>

                <div className="rounded-xl p-4 mb-6" style={{ background: '#FFFFFF' }}>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ['Report Ref', reportRef],
                      ['Type', formTypes.find(f => f.id === selectedType)?.label || ''],
                      ['Project', form.project || 'Madeline Tower'],
                      ['Inspector', form.inspector || 'Mark Peters'],
                      ['Result', form.result.toUpperCase()],
                      ['Archived', 'Supabase · compliance_reports'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div className="text-xs font-bold mb-0.5" style={{ color: '#9CA3AF' }}>{label}</div>
                        <div className="font-semibold" style={{ color: '#1A1A2E' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs mb-6" style={{ color: '#065F46' }}>
                  {[
                    '📄 PDF saved to project compliance folder',
                    '📧 Copy sent to admin@macoelectrics.com',
                    '📁 Archived in Supabase — compliance_reports table',
                    '✅ Available for regulatory submission',
                  ].map((a, i) => <div key={i}>{a}</div>)}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep('select'); setSelectedType(null) }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                    style={{ background: '#FFFFFF', color: '#059669', border: '2px solid #6EE7B7' }}
                  >
                    New Report
                  </button>
                  <button
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: '#059669' }}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
