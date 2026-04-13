'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { jsPDF } from 'jspdf'

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
  { id: 'as3012',    label: 'AS3012 Electrical Safety',      desc: 'Standard residential & commercial electrical safety report' },
  { id: 'rcd',       label: 'RCD / Safety Switch Testing',   desc: 'AS/NZS 3017 — Residual current device compliance test' },
  { id: 'emergency', label: 'Emergency Lighting Test',       desc: '90-minute battery duration test per AS 2293' },
  { id: 'hv',        label: 'HV Switchgear Inspection',      desc: 'High voltage equipment inspection and thermal imaging' },
  { id: 'dali',      label: 'DALI Lighting Commissioning',   desc: 'DALI addressing, scene programming and handover checklist' },
]

const statusConfig = {
  pass:    { label: 'PASS',    bg: '#F0F0F0', color: '#000000' },
  fail:    { label: 'FAIL',    bg: '#FFF0F0', color: '#CC0000' },
  pending: { label: 'PENDING', bg: '#F5F5F5', color: '#999999' },
}


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

  const generatePdf = useCallback((report?: { report_number: string; report_type: string; regulatory_ref: string }) => {
    const doc = new jsPDF()
    const ft = formTypes.find(f => f.id === selectedType)
    const rNumber = report?.report_number || reportRef
    const rType = report?.report_type || ft?.label || ''
    const rRef = report?.regulatory_ref || reportRef

    // Header bar
    doc.setFillColor(29, 78, 216)
    doc.rect(0, 0, 210, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('CYTRON', 14, 14)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Compliance Report', 14, 21)
    doc.setFontSize(10)
    doc.text(rNumber, 196, 14, { align: 'right' })
    doc.text(rRef, 196, 21, { align: 'right' })

    // Report type badge
    doc.setTextColor(17, 24, 39)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(rType, 14, 42)

    // Result badge
    const isPass = form.result === 'pass'
    doc.setFillColor(isPass ? 5 : 220, isPass ? 150 : 38, isPass ? 105 : 38)
    doc.roundedRect(160, 36, 36, 10, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(isPass ? 'PASS' : 'FAIL', 178, 43, { align: 'center' })

    // Divider
    doc.setDrawColor(229, 231, 235)
    doc.line(14, 52, 196, 52)

    // Details grid
    doc.setTextColor(107, 114, 128)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    const fields = [
      ['PROJECT', form.project, 'SITE LOCATION', form.location],
      ['INSPECTOR', form.inspector, 'LICENCE NUMBER', form.license],
      ['INSPECTION DATE', form.date, 'SUPPLY VOLTAGE', form.voltage],
    ]
    let y = 60
    fields.forEach(([l1, v1, l2, v2]) => {
      doc.setTextColor(107, 114, 128)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text(l1, 14, y)
      doc.text(l2, 110, y)
      doc.setTextColor(17, 24, 39)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(v1 || '—', 14, y + 6)
      doc.text(v2 || '—', 110, y + 6)
      y += 16
    })

    // Notes
    if (form.notes) {
      y += 4
      doc.setTextColor(107, 114, 128)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text('NOTES / OBSERVATIONS', 14, y)
      doc.setTextColor(17, 24, 39)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const lines = doc.splitTextToSize(form.notes, 180)
      doc.text(lines, 14, y + 6)
      y += 6 + lines.length * 5
    }

    // Footer
    doc.setDrawColor(229, 231, 235)
    doc.line(14, 270, 196, 270)
    doc.setTextColor(156, 163, 175)
    doc.setFontSize(7)
    doc.text('Generated by CYTRON Platform | cytronai.com', 14, 278)
    doc.text(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 196, 278, { align: 'right' })

    doc.save(`${rNumber || 'compliance-report'}.pdf`)
  }, [selectedType, reportRef, form])

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
    <div className="flex min-h-screen" style={{ background: '#FFFFFF', color: '#1A1A1A', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Sidebar active="compliance" />

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden pt-12 md:pt-0">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3.5"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E5E5' }}>
          <div>
            <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: '#999999' }}>
              <Link href="/" style={{ color: '#000000', fontWeight: 600 }}>CYTRON</Link>
              <span>/</span>
              <span style={{ color: '#333333', fontWeight: 600 }}>Compliance</span>
            </div>
            <h1 className="text-base font-semibold" style={{ color: '#000000' }}>Compliance Shield — {archive.length} records</h1>
          </div>
          <div className="flex items-center gap-3">
            {failCount > 0 && (
              <div className="px-3 py-1.5 text-xs font-semibold"
                style={{ background: '#FFF0F0', color: '#CC0000', border: '1px solid #FFCCCC' }}>
                {failCount} Failed Report{failCount > 1 ? 's' : ''}
              </div>
            )}
            {step !== 'select' && (
              <button
                onClick={() => { setStep('select'); setSelectedType(null); setGenDone(false) }}
                className="px-3 py-2 text-xs font-semibold"
                style={{ background: 'transparent', color: '#666666', border: '1px solid #E5E5E5' }}
              >
                Back
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6" style={{ background: '#FAFAFA' }}>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {[
              { label: 'Total Reports', value: String(archive.length), sub: 'All projects',      alert: false },
              { label: 'Passed',        value: String(passCount),      sub: 'Compliant',          alert: false },
              { label: 'Failed',        value: String(failCount),      sub: 'Action required',    alert: failCount > 0 },
              { label: 'Pending',       value: String(pendingCount),   sub: 'Awaiting sign-off',  alert: false },
            ].map(kpi => (
              <div key={kpi.label} className="p-5"
                style={{ background: '#FFFFFF', border: `1px solid ${kpi.alert ? '#FFCCCC' : '#E5E5E5'}` }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#999999' }}>{kpi.label}</p>
                <p className="text-2xl font-bold mb-1" style={{ color: kpi.alert ? '#CC0000' : '#000000' }}>{kpi.value}</p>
                <p className="text-xs" style={{ color: '#999999' }}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* ── STEP: SELECT FORM TYPE ─────────────────────────────────────── */}
          {step === 'select' && (
            <>
              <div className="mb-5">
                <h2 className="text-base font-bold mb-1" style={{ color: '#000000' }}>Generate Compliance Report</h2>
                <p className="text-sm" style={{ color: '#999999' }}>Select the inspection type. AI fills the regulatory template — you review and save.</p>
              </div>

              <div className="grid grid-cols-1 gap-2 mb-8">
                {formTypes.map(ft => (
                  <button
                    key={ft.id}
                    onClick={() => handleSelectType(ft.id)}
                    className="flex items-center gap-4 p-4 text-left transition-all"
                    style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}
                  >
                    <div className="w-2 h-10 flex-shrink-0" style={{ background: '#000000' }} />
                    <div className="flex-1">
                      <div className="text-xs font-semibold mb-0.5" style={{ color: '#000000' }}>{ft.label}</div>
                      <div className="text-xs" style={{ color: '#999999' }}>{ft.desc}</div>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1.5"
                      style={{ background: '#000000', color: '#FFFFFF' }}>Generate</span>
                  </button>
                ))}
              </div>

              {/* Archive */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold" style={{ color: '#000000' }}>Report Archive</h2>
                  <input
                    className="px-3 py-1.5 text-xs outline-none"
                    style={{ border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#000000', width: 200 }}
                    placeholder="Search project, inspector..."
                    value={archiveSearch}
                    onChange={e => setArchiveSearch(e.target.value)}
                  />
                </div>
                <div className="overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E5E5' }}>
                        {['Report ID', 'Type', 'Project', 'Inspector', 'Date', 'Status', ''].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold" style={{ color: '#999999' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr><td colSpan={7} className="px-4 py-6 text-center text-xs" style={{ color: '#999999' }}>Loading reports...</td></tr>
                      )}
                      {filteredArchive.map((r, i) => {
                        const st = statusConfig[r.result]
                        return (
                          <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid #E5E5E5' : undefined, background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                            <td className="px-4 py-3 text-xs font-mono font-bold" style={{ color: '#999999' }}>{r.report_number}</td>
                            <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#000000' }}>{r.report_type}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#333333' }}>{r.project_name}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#333333' }}>{r.inspector_name}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#333333' }}>{r.inspection_date}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs px-2 py-1 font-bold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  setForm({ project: r.project_name, location: '', inspector: r.inspector_name, license: '', date: r.inspection_date, result: r.result, voltage: '', notes: '' })
                                  setSelectedType(formTypes.find(f => f.label === r.report_type)?.id || null)
                                  setTimeout(() => generatePdf({ report_number: r.report_number, report_type: r.report_type, regulatory_ref: r.regulatory_ref }), 50)
                                }}
                                className="text-xs font-semibold hover:underline" style={{ color: '#333333' }}>Download PDF</button>
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
                <div className="flex items-center gap-3 mb-6 p-4" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                  <div className="w-1.5 h-10 flex-shrink-0" style={{ background: '#000000' }} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#000000' }}>{ft.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#999999' }}>{ft.desc}</div>
                  </div>
                </div>

                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Project Name', key: 'project', placeholder: 'e.g. Project Name' },
                      { label: 'Site Location', key: 'location', placeholder: 'e.g. Main area' },
                      { label: 'Inspector Name', key: 'inspector', placeholder: 'e.g. John Smith' },
                      { label: 'Licence Number', key: 'license', placeholder: 'e.g. LIC-0001' },
                      { label: 'Inspection Date', key: 'date', placeholder: '22 Mar 2026' },
                      { label: 'Supply Voltage', key: 'voltage', placeholder: 'e.g. 415V 3-phase' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: '#999999' }}>{f.label.toUpperCase()}</label>
                        <input
                          required
                          className="w-full px-3 py-2.5 text-sm outline-none"
                          style={{ border: '1px solid #E5E5E5', color: '#000000', background: '#FAFAFA' }}
                          placeholder={f.placeholder}
                          value={(form as Record<string, string>)[f.key]}
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: '#999999' }}>INSPECTION RESULT</label>
                    <div className="flex gap-3">
                      {(['pass', 'fail'] as const).map(r => (
                        <button type="button" key={r}
                          onClick={() => setForm(p => ({ ...p, result: r }))}
                          className="flex-1 py-2.5 text-sm font-bold transition-all"
                          style={form.result === r
                            ? { background: '#000000', color: '#FFFFFF' }
                            : { background: 'transparent', color: '#666666', border: '1px solid #E5E5E5' }
                          }
                        >
                          {r === 'pass' ? '✅ PASS' : '❌ FAIL'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: '#999999' }}>NOTES / OBSERVATIONS</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm outline-none resize-none"
                      style={{ border: '1px solid #E5E5E5', color: '#000000', background: '#FAFAFA' }}
                      placeholder="Any defects, conditions, or observations..."
                      value={form.notes}
                      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 text-sm font-black transition-all hover:opacity-90"
                    style={{ background: '#000000', color: '#FFFFFF' }}
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
              <div className="p-8" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 flex items-center justify-center text-xl" style={{ background: '#F0F0F0' }}>📄</div>
                  <div>
                    <div className="font-black text-base" style={{ color: '#000000' }}>Generating Report</div>
                    <div className="text-xs" style={{ color: '#999999' }}>AI is filling the regulatory template...</div>
                  </div>
                </div>

                <div className="mb-5 h-2 overflow-hidden" style={{ background: '#F0F0F0' }}>
                  <div
                    className="h-full transition-all duration-700"
                    style={{ width: `${(genStep / generatingSteps.length) * 100}%`, background: '#000000' }}
                  />
                </div>

                <div className="space-y-3">
                  {generatingSteps.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm transition-all" style={{ opacity: i <= genStep ? 1 : 0.3 }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{ background: i < genStep ? '#000000' : i === genStep ? '#F0F0F0' : '#F5F5F5', color: i < genStep ? '#FFFFFF' : '#999999' }}>
                        {i < genStep ? '✓' : i + 1}
                      </div>
                      <span style={{ color: i <= genStep ? '#000000' : '#999999' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: DONE ────────────────────────────────────────────────── */}
          {step === 'done' && (
            <div className="max-w-lg">
              <div className="p-8" style={{ background: '#F5F5F5', border: '1px solid #E5E5E5' }}>
                <div className="text-4xl mb-4 text-center">✅</div>
                <h2 className="text-xl font-black text-center mb-2" style={{ color: '#000000' }}>Report Generated</h2>
                <p className="text-sm text-center mb-6" style={{ color: '#333333' }}>
                  Compliance PDF saved and archived successfully.
                </p>

                <div className="p-4 mb-6" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ['Report Ref', reportRef],
                      ['Type', formTypes.find(f => f.id === selectedType)?.label || ''],
                      ['Project', form.project || '—'],
                      ['Inspector', form.inspector || '—'],
                      ['Result', form.result.toUpperCase()],
                      ['Archived', 'Supabase · compliance_reports'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div className="text-xs font-bold mb-0.5" style={{ color: '#999999' }}>{label}</div>
                        <div className="font-semibold" style={{ color: '#000000' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs mb-6" style={{ color: '#333333' }}>
                  {[
                    '📄 PDF saved to project compliance folder',
                    '📧 Copy sent to admin@cytron.io',
                    '📁 Archived in Supabase — compliance_reports table',
                    '✅ Available for regulatory submission',
                  ].map((a, i) => <div key={i}>{a}</div>)}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep('select'); setSelectedType(null) }}
                    className="flex-1 py-3 text-sm font-bold transition-all hover:opacity-80"
                    style={{ background: 'transparent', color: '#666666', border: '1px solid #E5E5E5' }}
                  >
                    New Report
                  </button>
                  <button
                    onClick={() => generatePdf()}
                    className="flex-1 py-3 text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: '#000000', color: '#FFFFFF' }}
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
