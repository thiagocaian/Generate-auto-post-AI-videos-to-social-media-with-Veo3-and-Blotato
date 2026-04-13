'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import type { Job, JobStatus } from '@/lib/supabase'

const statusConfig: Record<JobStatus, { label: string; color: string; bg: string }> = {
  enquiry:     { label: 'Enquiry',     color: '#D97706', bg: '#FFFBEB' },
  quoted:      { label: 'Quoted',      color: '#7C3AED', bg: '#F5F3FF' },
  scheduled:   { label: 'Scheduled',   color: '#1D4ED8', bg: '#EFF6FF' },
  in_progress: { label: 'In Progress', color: '#000000', bg: '#F0F0F0' },
  completed:   { label: 'Completed',   color: '#059669', bg: '#ECFDF5' },
  invoiced:    { label: 'Invoiced',    color: '#0369A1', bg: '#E0F2FE' },
  paid:        { label: 'Paid',        color: '#059669', bg: '#D1FAE5' },
}

const priorityConfig = {
  high:   { label: 'High',   color: '#CC0000', bg: '#FFF0F0' },
  medium: { label: 'Medium', color: '#999999', bg: '#F5F5F5' },
  low:    { label: 'Low',    color: '#666666', bg: '#F0F0F0' },
}

const statusFlow: JobStatus[] = ['enquiry', 'quoted', 'scheduled', 'in_progress', 'completed', 'invoiced', 'paid']

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [newJobOpen, setNewJobOpen] = useState(false)
  const [form, setForm] = useState({
    title: '', client_name: '', client_email: '', client_phone: '',
    site_address: '', assigned_to: '', priority: 'medium',
    scheduled_date: '', estimated_hours: '', description: '', instructions: '', admin_notes: '', checklist_text: ''
  })
  const [saving, setSaving] = useState(false)
  const [newJobPhotoBefore, setNewJobPhotoBefore] = useState<File[]>([])
  const [newJobPhotoAfter, setNewJobPhotoAfter] = useState<File[]>([])

  const fetchJobs = () => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then(d => setJobs(d.jobs || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchJobs() }, [])

  const filtered = jobs.filter(j => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      return (
        j.title?.toLowerCase().includes(s) ||
        j.client_name?.toLowerCase().includes(s) ||
        j.job_number?.toLowerCase().includes(s) ||
        j.site_address?.toLowerCase().includes(s)
      )
    }
    return true
  })

  const handleCreate = async () => {
    setSaving(true)
    try {
      // 1. Create the job
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...form,
          estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : null,
          instructions: form.instructions || null,
          admin_notes: form.admin_notes || null,
          checklist: form.checklist_text ? form.checklist_text.split('\n').filter(Boolean).map(t => ({ task: t.trim(), done: false })) : [],
        })
      })
      const { job } = await res.json()

      // 2. Upload photos if any
      if (job && (newJobPhotoBefore.length > 0 || newJobPhotoAfter.length > 0)) {
        const uploadFiles = async (files: File[], type: string) => {
          const urls: string[] = []
          for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const ext = file.name.split('.').pop()
            const path = `${job.id}/${type}/${Date.now()}-${i}.${ext}`
            const { error } = await supabase.storage.from('job-photos').upload(path, file, { upsert: true })
            if (!error) {
              const { data } = supabase.storage.from('job-photos').getPublicUrl(path)
              urls.push(data.publicUrl)
            }
          }
          return urls
        }

        const beforeUrls = newJobPhotoBefore.length > 0 ? await uploadFiles(newJobPhotoBefore, 'before') : []
        const afterUrls = newJobPhotoAfter.length > 0 ? await uploadFiles(newJobPhotoAfter, 'after') : []

        if (beforeUrls.length > 0 || afterUrls.length > 0) {
          await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update',
              id: job.id,
              ...(beforeUrls.length > 0 && { photos_before: beforeUrls }),
              ...(afterUrls.length > 0 && { photos_after: afterUrls }),
            })
          })
        }
      }

      setNewJobOpen(false)
      setForm({ title: '', client_name: '', client_email: '', client_phone: '', site_address: '', assigned_to: '', priority: 'medium', scheduled_date: '', estimated_hours: '', description: '', instructions: '', admin_notes: '', checklist_text: '' })
      setNewJobPhotoBefore([])
      setNewJobPhotoAfter([])
      fetchJobs()
    } finally { setSaving(false) }
  }

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', id: jobId, status: newStatus })
    })
    fetchJobs()
    setSelectedJob(null)
  }

  const handleCreateInvoice = async (jobId: string) => {
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_from_job', job_id: jobId })
    })
    fetchJobs()
    setSelectedJob(null)
  }

  const [uploading, setUploading] = useState(false)

  const handlePhotoUpload = async (jobId: string, type: 'before' | 'after', files: FileList) => {
    setUploading(true)
    try {
      const job = jobs.find(j => j.id === jobId)
      if (!job) return

      const existingPhotos = type === 'before' ? (job.photos_before || []) : (job.photos_after || [])
      const newUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()
        const path = `${jobId}/${type}/${Date.now()}-${i}.${ext}`

        const { error } = await supabase.storage
          .from('job-photos')
          .upload(path, file, { upsert: true })

        if (!error) {
          const { data: urlData } = supabase.storage
            .from('job-photos')
            .getPublicUrl(path)
          newUrls.push(urlData.publicUrl)
        }
      }

      const allPhotos = [...existingPhotos, ...newUrls]
      const field = type === 'before' ? 'photos_before' : 'photos_after'

      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: jobId, [field]: allPhotos })
      })
      fetchJobs()
    } finally { setUploading(false) }
  }

  const handleDeletePhoto = async (jobId: string, type: 'before' | 'after', photoUrl: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (!job) return

    const photos = type === 'before' ? (job.photos_before || []) : (job.photos_after || [])
    const filtered = photos.filter(p => p !== photoUrl)
    const field = type === 'before' ? 'photos_before' : 'photos_after'

    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id: jobId, [field]: filtered })
    })
    fetchJobs()
  }

  const handleDelete = async (jobId: string) => {
    await fetch(`/api/jobs?id=${jobId}`, { method: 'DELETE' })
    fetchJobs()
    setSelectedJob(null)
  }

  // KPI stats
  const totalJobs = jobs.length
  const activeJobs = jobs.filter(j => ['scheduled', 'in_progress'].includes(j.status)).length
  const completedJobs = jobs.filter(j => ['completed', 'invoiced', 'paid'].includes(j.status)).length
  const pipelineValue = jobs.reduce((s, j) => s + (j.total_value || 0), 0)

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFFFF' }}>
      <Sidebar active="jobs" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-widest mb-1" style={{ color: '#999' }}>CYTRON / JOBS</p>
            <h1 className="text-2xl font-bold" style={{ color: '#000' }}>Job Management</h1>
          </div>
          <button
            onClick={() => setNewJobOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg"
            style={{ background: '#000' }}
          >
            + New Job
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Jobs', value: totalJobs, sub: 'all time' },
            { label: 'Active', value: activeJobs, sub: 'in progress' },
            { label: 'Completed', value: completedJobs, sub: 'done' },
            { label: 'Pipeline', value: `$${pipelineValue.toLocaleString()}`, sub: 'total value' },
          ].map(kpi => (
            <div key={kpi.label} className="p-4 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#999' }}>{kpi.label}</p>
              <p className="text-2xl font-bold" style={{ color: '#000' }}>{kpi.value}</p>
              <p className="text-xs mt-1" style={{ color: '#BBB' }}>{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg flex-1 min-w-[200px]"
            style={{ border: '1px solid #E5E5E5', background: '#FAFAFA', outline: 'none' }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg"
            style={{ border: '1px solid #E5E5E5', background: '#FAFAFA' }}
          >
            <option value="all">All Status</option>
            {statusFlow.map(s => (
              <option key={s} value={s}>{statusConfig[s].label}</option>
            ))}
          </select>
        </div>

        {/* Jobs list */}
        {loading ? (
          <div className="text-center py-20" style={{ color: '#999' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium" style={{ color: '#999' }}>No jobs yet</p>
            <p className="text-sm mt-1" style={{ color: '#BBB' }}>Create your first job to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(job => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                className="p-4 rounded-xl cursor-pointer transition-all"
                style={{
                  border: selectedJob?.id === job.id ? '1px solid #000' : '1px solid #E5E5E5',
                  background: selectedJob?.id === job.id ? '#FAFAFA' : '#FFF',
                }}
              >
                {/* Card header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded" style={{ background: '#F0F0F0', color: '#666' }}>
                      {job.job_number}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: statusConfig[job.status].bg, color: statusConfig[job.status].color }}>
                      {statusConfig[job.status].label}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: priorityConfig[job.priority]?.bg, color: priorityConfig[job.priority]?.color }}>
                      {priorityConfig[job.priority]?.label}
                    </span>
                  </div>
                  {job.total_value ? (
                    <span className="text-sm font-bold" style={{ color: '#000' }}>
                      ${job.total_value.toLocaleString()}
                    </span>
                  ) : null}
                </div>

                {/* Title + client */}
                <h3 className="text-sm font-semibold mt-2" style={{ color: '#000' }}>{job.title}</h3>
                <div className="flex flex-wrap gap-4 mt-1 text-xs" style={{ color: '#999' }}>
                  {job.client_name && <span>👤 {job.client_name}</span>}
                  {job.site_address && <span>📍 {job.site_address}</span>}
                  {job.assigned_to && <span>🔧 {job.assigned_to}</span>}
                  {job.scheduled_date && <span>📅 {job.scheduled_date}</span>}
                </div>

                {/* Expanded detail */}
                {selectedJob?.id === job.id && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E5E5E5' }}>
                    {job.description && (
                      <p className="text-sm mb-3" style={{ color: '#666' }}>{job.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 mb-3 text-xs" style={{ color: '#666' }}>
                      {job.client_email && <span>✉ {job.client_email}</span>}
                      {job.client_phone && <span>📞 {job.client_phone}</span>}
                      {job.estimated_hours && <span>⏱ {job.estimated_hours}h estimated</span>}
                      {job.actual_hours && <span>✅ {job.actual_hours}h actual</span>}
                    </div>

                    {/* Status workflow buttons */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <p className="text-xs font-medium w-full mb-1" style={{ color: '#999' }}>Change Status:</p>
                      {statusFlow.map(s => (
                        <button
                          key={s}
                          onClick={e => { e.stopPropagation(); handleStatusChange(job.id, s) }}
                          disabled={job.status === s}
                          className="text-xs px-2 py-1 rounded font-medium disabled:opacity-30"
                          style={{
                            background: job.status === s ? statusConfig[s].bg : '#F5F5F5',
                            color: job.status === s ? statusConfig[s].color : '#999',
                            border: job.status === s ? `1px solid ${statusConfig[s].color}` : '1px solid #E5E5E5',
                          }}
                        >
                          {statusConfig[s].label}
                        </button>
                      ))}
                    </div>

                    {/* Photos — Before & After */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Before photos */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#999' }}>
                            📷 Fotos — Antes
                          </p>
                          <label className="text-xs font-medium px-2 py-1 rounded cursor-pointer" style={{ background: '#F5F5F5', color: '#666', border: '1px solid #E5E5E5' }}>
                            {uploading ? 'Uploading...' : '+ Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={e => e.target.files && handlePhotoUpload(job.id, 'before', e.target.files)}
                            />
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(job.photos_before || []).length === 0 ? (
                            <p className="text-xs" style={{ color: '#CCC' }}>Nenhuma foto ainda</p>
                          ) : (
                            (job.photos_before || []).map((url, idx) => (
                              <div key={idx} className="relative group">
                                <img
                                  src={url}
                                  alt={`Before ${idx + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg"
                                  style={{ border: '1px solid #E5E5E5' }}
                                />
                                <button
                                  onClick={e => { e.stopPropagation(); handleDeletePhoto(job.id, 'before', url) }}
                                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ background: '#CC0000' }}
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* After photos */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#999' }}>
                            ✅ Fotos — Depois
                          </p>
                          <label className="text-xs font-medium px-2 py-1 rounded cursor-pointer" style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                            {uploading ? 'Uploading...' : '+ Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={e => e.target.files && handlePhotoUpload(job.id, 'after', e.target.files)}
                            />
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(job.photos_after || []).length === 0 ? (
                            <p className="text-xs" style={{ color: '#CCC' }}>Nenhuma foto ainda</p>
                          ) : (
                            (job.photos_after || []).map((url, idx) => (
                              <div key={idx} className="relative group">
                                <img
                                  src={url}
                                  alt={`After ${idx + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg"
                                  style={{ border: '1px solid #A7F3D0' }}
                                />
                                <button
                                  onClick={e => { e.stopPropagation(); handleDeletePhoto(job.id, 'after', url) }}
                                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ background: '#CC0000' }}
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {job.status === 'completed' && (
                        <button
                          onClick={e => { e.stopPropagation(); handleCreateInvoice(job.id) }}
                          className="text-xs px-3 py-1.5 rounded font-medium text-white"
                          style={{ background: '#059669' }}
                        >
                          Generate Invoice
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(job.id) }}
                        className="text-xs px-3 py-1.5 rounded font-medium"
                        style={{ background: '#FFF0F0', color: '#CC0000', border: '1px solid #FFCCCC' }}
                      >
                        Delete Job
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── New Job Modal ── */}
        {newJobOpen && (
          <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', zIndex: 9999 }} onClick={() => setNewJobOpen(false)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)', position: 'relative', zIndex: 10000 }} onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">New Job</h2>

              <div className="space-y-3">
                {[
                  { key: 'title', label: 'Job Title *', placeholder: 'e.g. Switchboard upgrade' },
                  { key: 'client_name', label: 'Client Name', placeholder: 'e.g. John Smith' },
                  { key: 'client_email', label: 'Client Email', placeholder: 'john@email.com' },
                  { key: 'client_phone', label: 'Client Phone', placeholder: '0412 345 678' },
                  { key: 'site_address', label: 'Site Address', placeholder: '123 Main St, Southport QLD' },
                  { key: 'assigned_to', label: 'Assigned To', placeholder: 'Team member name' },
                  { key: 'scheduled_date', label: 'Scheduled Date', placeholder: '', type: 'date' },
                  { key: 'estimated_hours', label: 'Estimated Hours', placeholder: 'e.g. 4', type: 'number' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#999' }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type || 'text'}
                      value={(form as any)[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 text-sm rounded-lg"
                      style={{ border: '1px solid #E5E5E5', background: '#FAFAFA', outline: 'none' }}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#999' }}>Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    style={{ border: '1px solid #E5E5E5', background: '#FAFAFA' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#999' }}>Description / Notes</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Job details, special requirements..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg resize-none"
                    style={{ border: '1px solid #E5E5E5', background: '#FAFAFA', outline: 'none' }}
                  />
                </div>

                {/* Instructions for operator */}
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#1D4ED8' }}>📋 Instructions for Operator</label>
                  <textarea
                    value={form.instructions}
                    onChange={e => setForm({ ...form, instructions: e.target.value })}
                    placeholder="Step-by-step instructions for the field operator..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg resize-none"
                    style={{ border: '1px solid #BFDBFE', background: '#EFF6FF', outline: 'none' }}
                  />
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#D97706' }}>📝 Admin Notes (internal)</label>
                  <textarea
                    value={form.admin_notes}
                    onChange={e => setForm({ ...form, admin_notes: e.target.value })}
                    placeholder="Internal notes, special requirements..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg resize-none"
                    style={{ border: '1px solid #FDE68A', background: '#FFFBEB', outline: 'none' }}
                  />
                </div>

                {/* Checklist */}
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#059669' }}>✅ Task Checklist (one per line)</label>
                  <textarea
                    value={form.checklist_text}
                    onChange={e => setForm({ ...form, checklist_text: e.target.value })}
                    placeholder={"Isolate power supply\nTest voltage\nInstall components\nClean work area\nClient sign-off"}
                    rows={4}
                    className="w-full px-3 py-2 text-sm rounded-lg resize-none font-mono"
                    style={{ border: '1px solid #A7F3D0', background: '#F0FDF4', outline: 'none' }}
                  />
                </div>

                {/* Photo Upload — Before */}
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#999' }}>
                    📷 Fotos — Antes (vistoria)
                  </label>
                  <label className="flex items-center justify-center w-full py-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100"
                    style={{ border: '2px dashed #E5E5E5', background: '#FAFAFA' }}>
                    <span className="text-xs" style={{ color: '#999' }}>
                      {newJobPhotoBefore.length > 0
                        ? `${newJobPhotoBefore.length} foto(s) selecionada(s)`
                        : 'Clique para selecionar fotos'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => {
                        if (e.target.files) setNewJobPhotoBefore(prev => [...prev, ...Array.from(e.target.files!)])
                      }}
                    />
                  </label>
                  {newJobPhotoBefore.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newJobPhotoBefore.map((f, i) => (
                        <div key={i} className="relative group">
                          <img src={URL.createObjectURL(f)} alt="" className="w-14 h-14 object-cover rounded-lg" style={{ border: '1px solid #E5E5E5' }} />
                          <button onClick={() => setNewJobPhotoBefore(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100"
                            style={{ background: '#CC0000' }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Photo Upload — After */}
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#999' }}>
                    ✅ Fotos — Depois (job finalizado)
                  </label>
                  <label className="flex items-center justify-center w-full py-3 rounded-lg cursor-pointer transition-colors hover:bg-green-50"
                    style={{ border: '2px dashed #A7F3D0', background: '#F0FDF4' }}>
                    <span className="text-xs" style={{ color: '#059669' }}>
                      {newJobPhotoAfter.length > 0
                        ? `${newJobPhotoAfter.length} foto(s) selecionada(s)`
                        : 'Clique para selecionar fotos'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => {
                        if (e.target.files) setNewJobPhotoAfter(prev => [...prev, ...Array.from(e.target.files!)])
                      }}
                    />
                  </label>
                  {newJobPhotoAfter.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newJobPhotoAfter.map((f, i) => (
                        <div key={i} className="relative group">
                          <img src={URL.createObjectURL(f)} alt="" className="w-14 h-14 object-cover rounded-lg" style={{ border: '1px solid #A7F3D0' }} />
                          <button onClick={() => setNewJobPhotoAfter(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100"
                            style={{ background: '#CC0000' }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreate}
                  disabled={!form.title || saving}
                  className="flex-1 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50"
                  style={{ background: '#000' }}
                >
                  {saving ? 'Creating...' : 'Create Job'}
                </button>
                <button
                  onClick={() => setNewJobOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg"
                  style={{ border: '1px solid #E5E5E5', color: '#666' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
