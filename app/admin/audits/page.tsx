'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'

const STATUSES = ['new', 'contacted', 'converted', 'closed'] as const
type AuditStatus = (typeof STATUSES)[number]

type Audit = {
  id: string
  created_at: string
  name: string
  business_name: string
  email: string
  phone: string | null
  industry: string | null
  response_process: string | null
  preferred_date: string | null
  preferred_time: string | null
  status: AuditStatus
  notes: string | null
}

const STATUS_COLOR: Record<AuditStatus, string> = {
  new: '#D97706',
  contacted: '#1D4ED8',
  converted: '#22C55E',
  closed: '#666666',
}

export default function AdminAuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [adminEmail, setAdminEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'' | AuditStatus>('')
  const [editing, setEditing] = useState<Audit | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Audit | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  async function load() {
    setError('')
    const response = await fetch('/api/admin/audits', { cache: 'no-store' })
    if (response.status === 401 || response.status === 403) {
      setDenied(true)
      return
    }
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'Could not load audit requests')
    setAudits(body.audits ?? [])
    setAdminEmail(body.adminEmail ?? '')
    setDenied(false)
  }

  useEffect(() => {
    load().catch(err => setError(err instanceof Error ? err.message : 'Could not load audit requests')).finally(() => setLoading(false))
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return audits.filter(audit => {
      if (status && audit.status !== status) return false
      if (!q) return true
      return [audit.name, audit.business_name, audit.email, audit.phone, audit.industry, audit.response_process, audit.notes]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [audits, query, status])

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!editing) return
    setSaving(true)
    setFormError('')
    try {
      const response = await fetch(`/api/admin/audits/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editing.name,
          businessName: editing.business_name,
          email: editing.email,
          phone: editing.phone ?? '',
          preferredDate: editing.preferred_date ?? undefined,
          preferredTime: editing.preferred_time ?? undefined,
          status: editing.status,
          notes: editing.notes ?? '',
        }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        setFormError(typeof body.error === 'string' ? body.error : 'Could not save')
        return
      }
      setNotice(`${editing.name} saved.`)
      setEditing(null)
      await load()
    } catch {
      setFormError('Could not save')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!pendingDelete) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/audits/${pendingDelete.id}`, { method: 'DELETE' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(typeof body.error === 'string' ? body.error : 'Could not delete')
        return
      }
      setNotice(`${pendingDelete.name} deleted.`)
      setPendingDelete(null)
      await load()
    } catch {
      setError('Could not delete')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#886cff', borderTopColor: 'transparent' }} /></main>
  }
  if (denied) {
    return (
      <main className="min-h-screen flex items-center justify-center text-center" style={{ background: '#0A0A0A', color: '#FF4444' }}>
        <div>
          <p className="text-2xl font-bold mb-2">Access Denied</p>
          <p className="text-sm" style={{ color: '#666' }}>Admin only. Your email is not authorized.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
      <header className="px-6 py-4 flex items-center justify-between gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <h1 className="text-lg font-bold">Audit requests</h1>
          <p className="text-xs" style={{ color: '#666' }}>{adminEmail || 'CYTRON Admin'}</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/clients" className="text-xs px-3 py-1.5 rounded" style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#CCC' }}>Clients</a>
          <a href="/admin" className="text-xs px-3 py-1.5 rounded" style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#999' }}>Admin</a>
        </div>
      </header>
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-sm mb-5" style={{ color: '#888' }}>People who booked a free audit at cytronai.com. Only the company admin can see this list.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {STATUSES.map(item => (
            <button key={item} type="button" onClick={() => setStatus(current => current === item ? '' : item)} className="p-4 rounded-xl text-left" style={{ background: 'rgba(255,255,255,0.04)', border: status === item ? `1px solid ${STATUS_COLOR[item]}` : '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs capitalize" style={{ color: '#666' }}>{item}</p>
              <p className="text-2xl font-bold" style={{ color: STATUS_COLOR[item] }}>{audits.filter(audit => audit.status === item).length}</p>
            </button>
          ))}
        </div>
        <label className="block text-xs mb-4" style={{ color: '#888' }}>
          Search
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, business, email" className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
        </label>
        {notice ? <p className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(34,197,94,0.12)', color: '#86EFAC' }} role="status">{notice}</p> : null}
        {error ? <p className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(255,68,68,0.12)', color: '#FF8A8A' }} role="alert">{error}</p> : null}
        <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <table className="w-full text-sm" style={{ minWidth: 860 }}>
            <thead>
              <tr style={{ color: '#777', background: 'rgba(255,255,255,0.03)' }}>
                <th className="text-left font-medium px-4 py-3">Name</th>
                <th className="text-left font-medium px-4 py-3">Business</th>
                <th className="text-left font-medium px-4 py-3">When</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center" style={{ color: '#666' }}>No audit requests yet.</td></tr>
              ) : visible.map(audit => (
                <tr key={audit.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold">{audit.name}</p>
                    <p className="text-xs mt-1" style={{ color: '#888' }}>{audit.email}</p>
                    <p className="text-xs" style={{ color: '#666' }}>{audit.phone || 'No phone'}</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p>{audit.business_name}</p>
                    <p className="text-xs mt-1" style={{ color: '#888' }}>{audit.industry || 'No industry'}</p>
                    {audit.response_process ? <p className="text-xs mt-1 max-w-xs" style={{ color: '#777' }}>{audit.response_process}</p> : null}
                  </td>
                  <td className="px-4 py-3 align-top text-xs" style={{ color: '#CCC' }}>
                    <p>{audit.preferred_date || 'No date'}</p>
                    <p>{audit.preferred_time || 'No time'}</p>
                    <p className="mt-1" style={{ color: '#666' }}>Received {new Date(audit.created_at).toLocaleDateString('en-AU')}</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="text-xs px-2 py-0.5 rounded font-bold uppercase" style={{ background: STATUS_COLOR[audit.status] || '#333', color: '#FFF' }}>{audit.status}</span>
                    {audit.notes ? <p className="text-xs mt-2 max-w-xs" style={{ color: '#888' }}>{audit.notes}</p> : null}
                  </td>
                  <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                    <button type="button" onClick={() => { setFormError(''); setEditing(audit) }} className="text-xs px-2 py-1 rounded mr-2" style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#DDD' }}>Edit</button>
                    <button type="button" onClick={() => setPendingDelete(audit)} className="text-xs px-2 py-1 rounded" style={{ border: '1px solid rgba(255,68,68,0.4)', color: '#FF8A8A' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="audit-editor-title">
          <button type="button" aria-label="Close editor" className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={() => { if (!saving) setEditing(null) }} />
          <form onSubmit={save} className="relative w-full max-w-lg rounded-xl p-5 max-h-[90vh] overflow-y-auto" style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 id="audit-editor-title" className="text-lg font-bold mb-4">Edit {editing.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Name" value={editing.name} onChange={value => setEditing({ ...editing, name: value })} />
              <Field label="Business" value={editing.business_name} onChange={value => setEditing({ ...editing, business_name: value })} />
              <Field label="Email" value={editing.email} onChange={value => setEditing({ ...editing, email: value })} />
              <Field label="Phone" value={editing.phone ?? ''} onChange={value => setEditing({ ...editing, phone: value })} />
              <Field label="Date" type="date" value={editing.preferred_date ?? ''} onChange={value => setEditing({ ...editing, preferred_date: value })} />
              <Field label="Time" value={editing.preferred_time ?? ''} onChange={value => setEditing({ ...editing, preferred_time: value })} />
              <label className="text-xs sm:col-span-2" style={{ color: '#888' }}>
                Status
                <select value={editing.status} onChange={event => setEditing({ ...editing, status: event.target.value as AuditStatus })} className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }}>
                  {STATUSES.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-xs sm:col-span-2" style={{ color: '#888' }}>
                Admin notes
                <textarea value={editing.notes ?? ''} onChange={event => setEditing({ ...editing, notes: event.target.value })} rows={3} className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
              </label>
            </div>
            {formError ? <p className="text-sm mt-3" style={{ color: '#FF8A8A' }} role="alert">{formError}</p> : null}
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" disabled={saving} onClick={() => setEditing(null)} className="text-sm px-3 py-2" style={{ color: '#AAA' }}>Cancel</button>
              <button type="submit" disabled={saving} className="text-sm font-bold px-4 py-2 rounded-lg" style={{ background: '#886cff', color: '#FFF' }}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      ) : null}

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="delete-audit-title">
          <button type="button" className="absolute inset-0" aria-label="Cancel delete" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={() => { if (!saving) setPendingDelete(null) }} />
          <div className="relative w-full max-w-md rounded-xl p-5" style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 id="delete-audit-title" className="text-lg font-bold mb-2">Delete {pendingDelete.name}?</h2>
            <p className="text-sm" style={{ color: '#999' }}>This removes the audit request. It does not delete a login.</p>
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" disabled={saving} onClick={() => setPendingDelete(null)} className="text-sm px-3 py-2" style={{ color: '#AAA' }}>Cancel</button>
              <button type="button" disabled={saving} onClick={remove} className="text-sm font-bold px-4 py-2 rounded-lg" style={{ background: '#FF4444', color: '#FFF' }}>{saving ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="text-xs" style={{ color: '#888' }}>
      {label}
      <input type={type} value={value} onChange={event => onChange(event.target.value)} className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
    </label>
  )
}
