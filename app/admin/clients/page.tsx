'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { ClientEditor } from '@/components/admin/client-editor'
import { CLIENT_STATUSES, clientToForm, labelClientStatus, type Client, type ClientInput, type ClientStatus } from '@/lib/clients/types'

const EMPTY_FORM: ClientInput = {
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  status: 'lead',
  notes: '',
}

const STATUS_COLOR: Record<ClientStatus, string> = {
  lead: '#D97706',
  active: '#22C55E',
  paused: '#1D4ED8',
  archived: '#666666',
}

type EditorState =
  | { mode: 'create' }
  | { mode: 'edit'; client: Client }
  | null

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [adminEmail, setAdminEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'' | ClientStatus>('')
  const [editor, setEditor] = useState<EditorState>(null)
  const [form, setForm] = useState<ClientInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null)

  async function loadClients() {
    setError('')
    const response = await fetch('/api/admin/clients', { cache: 'no-store' })
    if (response.status === 401 || response.status === 403) {
      setDenied(true)
      return
    }
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(typeof body.error === 'string' ? body.error : 'Could not load clients')
    }
    setClients(body.clients ?? [])
    setAdminEmail(body.adminEmail ?? '')
    setDenied(false)
  }

  useEffect(() => {
    loadClients()
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load clients'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!editor && !pendingDelete) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving) {
        setEditor(null)
        setPendingDelete(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editor, pendingDelete, saving])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clients.filter(client => {
      if (status && client.status !== status) return false
      if (!q) return true
      return [client.name, client.email, client.phone, client.company, client.address, client.notes]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [clients, query, status])

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormError('')
    setEditor({ mode: 'create' })
  }

  function openEdit(client: Client) {
    setForm(clientToForm(client))
    setFormError('')
    setEditor({ mode: 'edit', client })
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!editor) return
    setSaving(true)
    setFormError('')
    try {
      const response = await fetch(
        editor.mode === 'create' ? '/api/admin/clients' : `/api/admin/clients/${editor.client.id}`,
        {
          method: editor.mode === 'create' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      )
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        setFormError(typeof body.error === 'string' ? body.error : 'Could not save client')
        return
      }
      const savedName = typeof body.client?.name === 'string' ? body.client.name : form.name
      setNotice(editor.mode === 'create' ? `${savedName} added.` : `${savedName} saved.`)
      setEditor(null)
      await loadClients()
    } catch {
      setFormError('Could not save client')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/clients/${pendingDelete.id}`, { method: 'DELETE' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(typeof body.error === 'string' ? body.error : 'Could not delete client')
        return
      }
      setNotice(`${pendingDelete.name} deleted.`)
      setPendingDelete(null)
      await loadClients()
    } catch {
      setError('Could not delete client')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A', color: '#FFF' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#886cff', borderTopColor: 'transparent' }} />
      </main>
    )
  }

  if (denied) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A', color: '#FF4444' }}>
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">Access Denied</p>
          <p className="text-sm" style={{ color: '#666' }}>Admin only. Your email is not authorized.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
      <header className="px-6 py-4 flex items-center justify-between gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#886cff' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold">Clients</h1>
            <p className="text-xs truncate" style={{ color: '#666' }}>{adminEmail || 'CYTRON Admin'}</p>
          </div>
        </div>
        <a href="/admin" className="text-xs px-3 py-1.5 rounded shrink-0" style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#999' }}>
          Back to Admin
        </a>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-sm mb-5" style={{ color: '#888' }}>
          Client records for the Cytron admin. Seeded contacts use example.com and are not real customers.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Stat label="Clients" value={clients.length} color="#886cff" pressed={status === ''} onClick={() => setStatus('')} />
          {CLIENT_STATUSES.map(item => (
            <Stat
              key={item}
              label={labelClientStatus(item)}
              value={clients.filter(client => client.status === item).length}
              color={STATUS_COLOR[item]}
              pressed={status === item}
              onClick={() => setStatus(current => current === item ? '' : item)}
            />
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <label className="flex-1 text-xs" style={{ color: '#888' }}>
            Search
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Name, company, email, phone, address"
              className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }}
            />
          </label>
          <label className="text-xs md:w-48" style={{ color: '#888' }}>
            Status
            <select
              value={status}
              onChange={event => setStatus(event.target.value as '' | ClientStatus)}
              className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }}
            >
              <option value="">All statuses</option>
              {CLIENT_STATUSES.map(item => (
                <option key={item} value={item}>{labelClientStatus(item)}</option>
              ))}
            </select>
          </label>
          <div className="md:self-end flex gap-2">
            {(query || status) ? (
              <button
                type="button"
                onClick={() => { setQuery(''); setStatus('') }}
                className="text-sm px-4 py-2 rounded-lg"
                style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#CCC' }}
              >
                Clear filters
              </button>
            ) : null}
            <button
              type="button"
              onClick={openCreate}
              className="w-full md:w-auto text-sm font-bold px-4 py-2 rounded-lg"
              style={{ background: '#886cff', color: '#FFF' }}
            >
              Add client
            </button>
          </div>
        </div>

        <p className="text-xs mb-3" style={{ color: '#777' }}>
          Showing {visible.length} of {clients.length}
        </p>

        {notice ? (
          <div className="mb-4 rounded-lg px-3 py-2 text-sm flex items-center justify-between gap-3" style={{ background: 'rgba(34,197,94,0.12)', color: '#86EFAC' }} role="status">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice('')} className="text-xs underline">Dismiss</button>
          </div>
        ) : null}

        {error && (
          <div className="mb-4 rounded-lg px-3 py-2 text-sm flex items-center justify-between gap-3" style={{ background: 'rgba(255,68,68,0.12)', color: '#FF8A8A' }} role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => loadClients().catch(err => setError(err instanceof Error ? err.message : 'Could not load clients'))} className="text-xs underline">
              Retry
            </button>
          </div>
        )}

        <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <table className="w-full text-sm" style={{ minWidth: 760 }}>
            <thead>
              <tr style={{ color: '#777', background: 'rgba(255,255,255,0.03)' }}>
                <th className="text-left font-medium px-4 py-3">Name</th>
                <th className="text-left font-medium px-4 py-3">Company</th>
                <th className="text-left font-medium px-4 py-3">Contact</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Updated</th>
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center" style={{ color: '#666' }}>
                    {clients.length === 0 ? 'No clients yet. Add the first sample record.' : 'No clients match this search. Clear the filters to see every record.'}
                  </td>
                </tr>
              ) : visible.map(client => (
                <tr key={client.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td className="px-4 py-3 align-top">
                    <Link href={`/admin/clients/${client.id}`} className="font-semibold hover:underline">{client.name}</Link>
                    {client.notes ? <p className="text-xs mt-1 max-w-xs" style={{ color: '#777' }}>{client.notes}</p> : null}
                  </td>
                  <td className="px-4 py-3 align-top" style={{ color: '#CCC' }}>
                    <p>{client.company || '—'}</p>
                    {client.address ? <p className="text-xs mt-1" style={{ color: '#777' }}>{client.address}</p> : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p>{client.email}</p>
                    <p className="text-xs mt-1" style={{ color: '#777' }}>{client.phone || 'No phone'}</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="text-xs px-2 py-0.5 rounded font-bold uppercase" style={{ background: STATUS_COLOR[client.status], color: '#FFF' }}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-xs" style={{ color: '#888' }}>
                    {new Date(client.updatedAt).toLocaleDateString('en-AU')}
                  </td>
                  <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                    <button type="button" onClick={() => openEdit(client)} className="text-xs px-2 py-1 rounded mr-2" style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#DDD' }}>
                      Edit
                    </button>
                    <button type="button" onClick={() => setPendingDelete(client)} className="text-xs px-2 py-1 rounded" style={{ border: '1px solid rgba(255,68,68,0.4)', color: '#FF8A8A' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editor ? (
        <ClientEditor
          title={editor.mode === 'create' ? 'Add client' : `Edit ${editor.client.name}`}
          form={form}
          onChange={setForm}
          saving={saving}
          formError={formError}
          onSubmit={onSubmit}
          onClose={() => { if (!saving) setEditor(null) }}
        />
      ) : null}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="delete-client-title">
          <button type="button" aria-label="Cancel delete" className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={() => { if (!saving) setPendingDelete(null) }} />
          <div className="relative w-full max-w-md rounded-xl p-5" style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 id="delete-client-title" className="text-lg font-bold mb-2">Delete {pendingDelete.name}?</h2>
            <p className="text-sm" style={{ color: '#999' }}>This removes the client record. It does not delete their login.</p>
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" disabled={saving} onClick={() => setPendingDelete(null)} className="text-sm px-3 py-2 rounded-lg" style={{ color: '#AAA' }}>
                Cancel
              </button>
              <button type="button" disabled={saving} onClick={confirmDelete} className="text-sm font-bold px-4 py-2 rounded-lg" style={{ background: '#FF4444', color: '#FFF' }}>
                {saving ? 'Deleting…' : 'Delete client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function Stat({
  label,
  value,
  color,
  pressed,
  onClick,
}: {
  label: string
  value: number
  color: string
  pressed: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className="p-4 rounded-xl text-left"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: pressed ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <p className="text-xs mb-1" style={{ color: '#666' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </button>
  )
}
