'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Job, JobStatus } from '@/lib/supabase'
import SignaturePad from '@/components/SignaturePad'

const statusConfig: Record<JobStatus, { label: string; color: string; bg: string }> = {
  enquiry:     { label: 'Enquiry',     color: '#D97706', bg: '#FFFBEB' },
  quoted:      { label: 'Quoted',      color: '#7C3AED', bg: '#F5F3FF' },
  scheduled:   { label: 'Scheduled',   color: '#1D4ED8', bg: '#EFF6FF' },
  in_progress: { label: 'In Progress', color: '#000000', bg: '#F0F0F0' },
  completed:   { label: 'Completed',   color: '#059669', bg: '#ECFDF5' },
  invoiced:    { label: 'Invoiced',    color: '#0369A1', bg: '#E0F2FE' },
  paid:        { label: 'Paid',        color: '#059669', bg: '#D1FAE5' },
}

const actionableStatuses: JobStatus[] = ['scheduled', 'in_progress']

export default function OperatorPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [activeJob, setActiveJob] = useState<Job | null>(null)
  const [uploading, setUploading] = useState(false)
  const [hoursInput, setHoursInput] = useState('')
  const [tab, setTab] = useState<'today' | 'all'>('today')
  const [signatureOpen, setSignatureOpen] = useState<{ jobId: string; type: 'approval' | 'completion'; title: string } | null>(null)

  const fetchJobs = () => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then(d => {
        const myJobs = (d.jobs || []).filter((j: Job) =>
          ['scheduled', 'in_progress', 'completed'].includes(j.status)
        )
        setJobs(myJobs)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchJobs() }, [])

  const todayStr = new Date().toISOString().split('T')[0]
  const todayJobs = jobs.filter(j => j.scheduled_date === todayStr)
  const displayJobs = tab === 'today' ? todayJobs : jobs

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', id: jobId, status: newStatus })
    })
    fetchJobs()
    if (activeJob?.id === jobId) {
      setActiveJob(prev => prev ? { ...prev, status: newStatus } : null)
    }
  }

  const handleLogHours = async (jobId: string) => {
    if (!hoursInput) return
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id: jobId, actual_hours: Number(hoursInput) })
    })
    setHoursInput('')
    fetchJobs()
  }

  const handlePhotoUpload = async (jobId: string, type: 'before' | 'after', files: FileList) => {
    setUploading(true)
    try {
      const job = jobs.find(j => j.id === jobId) || activeJob
      if (!job) return

      const existing = type === 'before' ? (job.photos_before || []) : (job.photos_after || [])
      const newUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()
        const path = `${jobId}/${type}/${Date.now()}-${i}.${ext}`
        const { error } = await supabase.storage.from('job-photos').upload(path, file, { upsert: true })
        if (!error) {
          const { data } = supabase.storage.from('job-photos').getPublicUrl(path)
          newUrls.push(data.publicUrl)
        }
      }

      const allPhotos = [...existing, ...newUrls]
      const field = type === 'before' ? 'photos_before' : 'photos_after'
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: jobId, [field]: allPhotos })
      })
      fetchJobs()
    } finally { setUploading(false) }
  }

  const handleSignatureSave = async (dataUrl: string, signerName: string) => {
    if (!signatureOpen) return
    const { jobId, type } = signatureOpen

    // Convert data URL to blob and upload to Supabase Storage
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    const path = `${jobId}/signature-${type}-${Date.now()}.png`

    const { error } = await supabase.storage.from('job-photos').upload(path, blob, { upsert: true })
    if (error) { console.error(error); return }

    const { data: urlData } = supabase.storage.from('job-photos').getPublicUrl(path)

    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        id: jobId,
        client_signature_url: urlData.publicUrl,
        signature_type: type,
        signed_at: new Date().toISOString(),
        signer_name: signerName,
      })
    })

    setSignatureOpen(null)
    fetchJobs()
  }

  // Active job count
  const inProgress = jobs.filter(j => j.status === 'in_progress').length
  const scheduled = jobs.filter(j => j.status === 'scheduled').length

  return (
    <div className="min-h-screen" style={{ background: '#F8F8F8' }}>
      {/* Mobile header */}
      <div className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{ background: '#000', color: '#FFF' }}>
        <div>
          <h1 className="text-base font-bold">Cytron Field</h1>
          <p className="text-[10px] text-white/50">Operator View</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-medium">{inProgress} active</p>
            <p className="text-[10px] text-white/40">{scheduled} scheduled</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
            T
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-3 gap-2">
        {(['today', 'all'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 text-xs font-medium rounded-lg transition-colors"
            style={{
              background: tab === t ? '#000' : '#FFF',
              color: tab === t ? '#FFF' : '#666',
              border: tab === t ? 'none' : '1px solid #E5E5E5',
            }}
          >
            {t === 'today' ? `Today (${todayJobs.length})` : `All Jobs (${jobs.length})`}
          </button>
        ))}
      </div>

      {/* Jobs list */}
      <div className="px-4 py-3 space-y-3">
        {loading ? (
          <div className="text-center py-16 text-sm" style={{ color: '#999' }}>Loading...</div>
        ) : displayJobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-sm font-medium" style={{ color: '#666' }}>
              {tab === 'today' ? 'No jobs scheduled for today' : 'No active jobs'}
            </p>
          </div>
        ) : (
          displayJobs.map(job => (
            <div
              key={job.id}
              onClick={() => setActiveJob(activeJob?.id === job.id ? null : job)}
              className="rounded-xl overflow-hidden"
              style={{
                background: '#FFF',
                border: activeJob?.id === job.id ? '2px solid #000' : '1px solid #E5E5E5',
                boxShadow: activeJob?.id === job.id ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {/* Card header */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: '#F0F0F0', color: '#666' }}>
                    {job.job_number}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: statusConfig[job.status].bg, color: statusConfig[job.status].color }}>
                    {statusConfig[job.status].label}
                  </span>
                </div>
                <h3 className="text-sm font-semibold mb-1">{job.title}</h3>
                <div className="space-y-0.5 text-xs" style={{ color: '#999' }}>
                  {job.client_name && <p>👤 {job.client_name}</p>}
                  {job.site_address && <p>📍 {job.site_address}</p>}
                  {job.scheduled_date && <p>📅 {job.scheduled_date} {job.scheduled_time_start && `• ${job.scheduled_time_start}`}</p>}
                  {job.estimated_hours && <p>⏱ {job.estimated_hours}h estimated {job.actual_hours ? `• ${job.actual_hours}h logged` : ''}</p>}
                </div>
              </div>

              {/* Expanded actions */}
              {activeJob?.id === job.id && (
                <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid #F0F0F0' }}>
                  {/* Quick action buttons */}
                  <div className="pt-3 grid grid-cols-2 gap-2">
                    {job.status === 'scheduled' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleStatusChange(job.id, 'in_progress') }}
                        className="py-3 text-sm font-medium text-white rounded-xl col-span-2"
                        style={{ background: '#000' }}
                      >
                        ▶ Start Job
                      </button>
                    )}
                    {job.status === 'in_progress' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleStatusChange(job.id, 'completed') }}
                        className="py-3 text-sm font-medium text-white rounded-xl col-span-2"
                        style={{ background: '#059669' }}
                      >
                        ✓ Complete Job
                      </button>
                    )}
                  </div>

                  {/* Log hours */}
                  {job.status === 'in_progress' && (
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#999' }}>Log Hours</p>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={hoursInput}
                          onChange={e => setHoursInput(e.target.value)}
                          placeholder="Hours worked"
                          className="flex-1 px-3 py-2 text-sm rounded-lg"
                          style={{ border: '1px solid #E5E5E5', outline: 'none' }}
                          onClick={e => e.stopPropagation()}
                        />
                        <button
                          onClick={e => { e.stopPropagation(); handleLogHours(job.id) }}
                          className="px-4 py-2 text-xs font-medium rounded-lg"
                          style={{ background: '#F0F0F0' }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Photo upload */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Before */}
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#999' }}>📷 Antes</p>
                      <label className="flex flex-col items-center justify-center py-4 rounded-xl cursor-pointer"
                        style={{ border: '2px dashed #E5E5E5', background: '#FAFAFA' }}>
                        <span className="text-lg mb-1">📸</span>
                        <span className="text-[10px]" style={{ color: '#999' }}>
                          {uploading ? 'Uploading...' : 'Tirar foto'}
                        </span>
                        <input type="file" accept="image/*" capture="environment" className="hidden"
                          onClick={e => e.stopPropagation()}
                          onChange={e => e.target.files && handlePhotoUpload(job.id, 'before', e.target.files)} />
                      </label>
                      {(job.photos_before || []).length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {(job.photos_before || []).map((url, i) => (
                            <img key={i} src={url} alt="" className="w-12 h-12 object-cover rounded-lg" style={{ border: '1px solid #E5E5E5' }} />
                          ))}
                        </div>
                      )}
                    </div>
                    {/* After */}
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#059669' }}>✅ Depois</p>
                      <label className="flex flex-col items-center justify-center py-4 rounded-xl cursor-pointer"
                        style={{ border: '2px dashed #A7F3D0', background: '#F0FDF4' }}>
                        <span className="text-lg mb-1">📸</span>
                        <span className="text-[10px]" style={{ color: '#059669' }}>
                          {uploading ? 'Uploading...' : 'Tirar foto'}
                        </span>
                        <input type="file" accept="image/*" capture="environment" className="hidden"
                          onClick={e => e.stopPropagation()}
                          onChange={e => e.target.files && handlePhotoUpload(job.id, 'after', e.target.files)} />
                      </label>
                      {(job.photos_after || []).length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {(job.photos_after || []).map((url, i) => (
                            <img key={i} src={url} alt="" className="w-12 h-12 object-cover rounded-lg" style={{ border: '1px solid #A7F3D0' }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Client info card */}
                  {(job.client_phone || job.client_email) && (
                    <div className="p-3 rounded-xl" style={{ background: '#F8F8F8', border: '1px solid #E5E5E5' }}>
                      <p className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: '#999' }}>Client Contact</p>
                      {job.client_phone && (
                        <a href={`tel:${job.client_phone}`} className="flex items-center gap-2 text-sm font-medium mb-1" style={{ color: '#1D4ED8' }}
                          onClick={e => e.stopPropagation()}>
                          📞 {job.client_phone}
                        </a>
                      )}
                      {job.client_email && (
                        <a href={`mailto:${job.client_email}`} className="flex items-center gap-2 text-sm" style={{ color: '#666' }}
                          onClick={e => e.stopPropagation()}>
                          ✉ {job.client_email}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Signature */}
                  <div>
                    {(job as any).client_signature_url ? (
                      <div className="p-3 rounded-xl" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#059669' }}>
                            ✅ Signed by {(job as any).signer_name || 'Client'}
                          </p>
                          <p className="text-[9px]" style={{ color: '#999' }}>
                            {(job as any).signed_at ? new Date((job as any).signed_at).toLocaleDateString('en-AU') : ''}
                          </p>
                        </div>
                        <img src={(job as any).client_signature_url} alt="Signature" className="w-full h-16 object-contain rounded-lg bg-white" style={{ border: '1px solid #E5E5E5' }} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); setSignatureOpen({ jobId: job.id, type: 'approval', title: job.title }) }}
                          className="py-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1"
                          style={{ background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}
                        >
                          <span className="text-lg">✍️</span>
                          Approval Signature
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setSignatureOpen({ jobId: job.id, type: 'completion', title: job.title }) }}
                          className="py-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1"
                          style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}
                        >
                          <span className="text-lg">✅</span>
                          Completion Sign-off
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Navigate to site */}
                  {job.site_address && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.site_address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
                      style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
                      onClick={e => e.stopPropagation()}
                    >
                      🗺 Navigate to Site
                    </a>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Signature Modal */}
      {signatureOpen && (
        <SignaturePad
          type={signatureOpen.type}
          jobTitle={signatureOpen.title}
          onSave={handleSignatureSave}
          onCancel={() => setSignatureOpen(null)}
        />
      )}

      {/* Bottom nav bar (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 px-4"
        style={{ background: '#FFF', borderTop: '1px solid #E5E5E5', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <a href="/operator" className="flex flex-col items-center gap-0.5 text-[10px] font-medium" style={{ color: '#000' }}>
          <span className="text-lg">📋</span>
          Jobs
        </a>
        <a href="/calendar" className="flex flex-col items-center gap-0.5 text-[10px] font-medium" style={{ color: '#999' }}>
          <span className="text-lg">📅</span>
          Calendar
        </a>
        <a href="/dashboard" className="flex flex-col items-center gap-0.5 text-[10px] font-medium" style={{ color: '#999' }}>
          <span className="text-lg">📊</span>
          Dashboard
        </a>
      </div>
    </div>
  )
}
