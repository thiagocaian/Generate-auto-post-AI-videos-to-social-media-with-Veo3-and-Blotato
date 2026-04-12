'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
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
    scheduled_date: '', estimated_hours: '', description: ''
  })
  const [saving, setSaving] = useState(false)

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
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...form,
          estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : null,
        })
      })
      setNewJobOpen(false)
      setForm({ title: '', client_name: '', client_email: '', client_phone: '', site_address: '', assigned_to: '', priority: 'medium', scheduled_date: '', estimated_hours: '', description: '' })
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
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
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
