'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState, type ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ClientEditor } from '@/components/admin/client-editor'
import { clientToForm, labelClientStatus, type Client, type ClientInput, type ClientStatus } from '@/lib/clients/types'

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

export default function AdminClientDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<ClientInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError('')
    async function load() {
      try {
        const response = await fetch(`/api/admin/clients/${id}`, { cache: 'no-store' })
        if (cancelled) return
        if (response.status === 401 || response.status === 403) {
          setDenied(true)
          return
        }
        const body = await response.json().catch(() => ({}))
        if (cancelled) return
        if (response.status === 404) {
          setMissing(true)
          setClient(null)
          return
        }
        if (!response.ok) {
          throw new Error(typeof body.error === 'string' ? body.error : 'Could not load client')
        }
        const next = body.client as Client
        setClient(next)
        setForm(clientToForm(next))
        setMissing(false)
        setDenied(false)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load client')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!editing && !confirmingDelete) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving) {
        setEditing(false)
        setConfirmingDelete(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing, confirmingDelete, saving])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const response = await fetch(`/api/admin/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        setFormError(typeof body.error === 'string' ? body.error : 'Could not save client')
        return
      }
      setClient(body.client)
      setForm(clientToForm(body.client))
      setNotice(`${body.client.name} saved.`)
      setEditing(false)
    } catch {
      setFormError('Could not save client')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!client) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, { method: 'DELETE' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(typeof body.error === 'string' ? body.error : 'Could not delete client')
        return
      }
      router.push('/admin/clients')
    } catch {
      setError('Could not delete client')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Screen><Spinner /></Screen>
  if (denied) return <Denied />
  if (missing || !client) {
    return (
      <Screen>
        <div className="max-w-lg mx-auto pt-24 text-center">
          <h1 className="text-2xl font-bold mb-2">Client not found</h1>
          <p className="text-sm mb-6" style={{ color: '#888' }}>{error || 'This client record was not found.'}</p>
          <Link href="/admin/clients" className="text-sm px-3 py-2 rounded" style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#DDD' }}>
            Back to clients
          </Link>
        </div>
      </Screen>
    )
  }

  const rows = [
    ['Email', client.email],
    ['Phone', client.phone || '—'],
    ['Company', client.company || '—'],
    ['Address', client.address || '—'],
    ['Created', client.createdAt ? new Date(client.createdAt).toLocaleString('en-AU') : '—'],
    ['Updated', client.updatedAt ? new Date(client.updatedAt).toLocaleString('en-AU') : '—'],
  ]

  return (
    <Screen>
      <header className="px-6 py-4 flex items-center justify-between gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="min-w-0">
          <p className="text-xs mb-1" style={{ color: '#666' }}>Client record</p>
          <h1 className="text-lg font-bold truncate">{client.name}</h1>
        </div>
        <Link href="/admin/clients" className="text-xs px-3 py-1.5 rounded shrink-0" style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#999' }}>
          Back to clients
        </Link>
      </header>
      <div className="p-6 max-w-3xl mx-auto">
        {notice ? (
          <p className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(34,197,94,0.12)', color: '#86EFAC' }} role="status">{notice}</p>
        ) : null}
        {error ? (
          <p className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(255,68,68,0.12)', color: '#FF8A8A' }} role="alert">{error}</p>
        ) : null}
        <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <span className="text-xs px-2 py-0.5 rounded font-bold uppercase" style={{ background: STATUS_COLOR[client.status], color: '#FFF' }}>
              {labelClientStatus(client.status)}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setForm(clientToForm(client)); setFormError(''); setEditing(true) }} className="text-xs px-3 py-1.5 rounded" style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#DDD' }}>
                Edit
              </button>
              <button type="button" onClick={() => setConfirmingDelete(true)} className="text-xs px-3 py-1.5 rounded" style={{ border: '1px solid rgba(255,68,68,0.4)', color: '#FF8A8A' }}>
                Delete
              </button>
            </div>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rows.map(([label, value]) => (
              <div key={label} className={label === 'Address' ? 'sm:col-span-2' : undefined}>
                <dt className="text-xs uppercase tracking-wide" style={{ color: '#777' }}>{label}</dt>
                <dd className="mt-1 text-sm">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#777' }}>Notes</p>
            <p className="text-sm whitespace-pre-wrap" style={{ color: client.notes ? '#FFF' : '#666' }}>{client.notes || 'No notes'}</p>
          </div>
        </div>
      </div>
      {editing ? (
        <ClientEditor
          title={`Edit ${client.name}`}
          form={form}
          onChange={setForm}
          saving={saving}
          formError={formError}
          onSubmit={onSubmit}
          onClose={() => { if (!saving) setEditing(false) }}
        />
      ) : null}
      {confirmingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="delete-client-title">
          <button type="button" aria-label="Cancel delete" className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={() => { if (!saving) setConfirmingDelete(false) }} />
          <div className="relative w-full max-w-md rounded-xl p-5" style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 id="delete-client-title" className="text-lg font-bold mb-2">Delete {client.name}?</h2>
            <p className="text-sm" style={{ color: '#999' }}>This removes the client record. It does not delete their login.</p>
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" disabled={saving} onClick={() => setConfirmingDelete(false)} className="text-sm px-3 py-2 rounded-lg" style={{ color: '#AAA' }}>Cancel</button>
              <button type="button" disabled={saving} onClick={confirmDelete} className="text-sm font-bold px-4 py-2 rounded-lg" style={{ background: '#FF4444', color: '#FFF' }}>
                {saving ? 'Deleting…' : 'Delete client'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Screen>
  )
}

function Screen({ children }: { children: ReactNode }) {
  return <main className="min-h-screen" style={{ background: '#0A0A0A', color: '#FFFFFF' }}>{children}</main>
}

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#886cff', borderTopColor: 'transparent' }} />
    </div>
  )
}

function Denied() {
  return (
    <Screen>
      <div className="min-h-screen flex items-center justify-center text-center" style={{ color: '#FF4444' }}>
        <div>
          <p className="text-2xl font-bold mb-2">Access Denied</p>
          <p className="text-sm" style={{ color: '#666' }}>Admin only. Your email is not authorized.</p>
        </div>
      </div>
    </Screen>
  )
}
