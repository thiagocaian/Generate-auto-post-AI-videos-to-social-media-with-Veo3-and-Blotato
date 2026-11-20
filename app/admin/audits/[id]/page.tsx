'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'

type Activity = { id: string; type: string; payload: unknown; createdAt: string }

type AuditDetail = {
  id: string
  name: string
  businessName: string
  email: string
  phone: string | null
  industry: string | null
  website: string | null
  monthlyEnquiries: string | null
  responseProcess: string | null
  preferredDate: string | null
  preferredTime: string | null
  status: string
  score: number | null
  fit: string | null
  qualificationSummary: string | null
  consentText: string
  draft: {
    title: string | null
    bodyMarkdown: string | null
    status: string
    model: string | null
    promptVersion: string | null
  } | null
  activities: Activity[]
}

export default function AdminAuditDetailPage({ params }: { params: { id: string } }) {
  const [audit, setAudit] = useState<AuditDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const response = await fetch(`/api/admin/audits/${params.id}`, { cache: 'no-store' })
    if (response.status === 401 || response.status === 403) {
      setDenied(true)
      return
    }
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'Could not load the audit request')
    setAudit(body.audit)
    setDenied(false)
  }, [params.id])

  useEffect(() => {
    load().catch(err => setError(err instanceof Error ? err.message : 'Could not load the audit request')).finally(() => setLoading(false))
  }, [load])

  async function saveNote(event: FormEvent) {
    event.preventDefault()
    if (!note.trim()) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/audits/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: note.trim() }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(typeof body.error === 'string' ? body.error : 'Could not save the note')
        return
      }
      setNote('')
      setNotice('Note saved.')
      await load()
    } catch {
      setError('Could not save the note')
    } finally {
      setSaving(false)
    }
  }

  async function archive() {
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/audits/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(typeof body.error === 'string' ? body.error : 'Could not archive')
        return
      }
      setNotice('Archived. The lead is still in the database.')
      await load()
    } catch {
      setError('Could not archive')
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
  if (!audit) {
    return (
      <main className="min-h-screen p-6" style={{ background: '#0A0A0A', color: '#FFF' }}>
        <a href="/admin/audits" className="text-sm" style={{ color: '#886cff' }}>Back to audits</a>
        <p className="mt-6" role="alert">{error || 'Audit request not found'}</p>
      </main>
    )
  }

  const facts: Array<[string, string]> = [
    ['Email', audit.email],
    ['Phone', audit.phone || '—'],
    ['Industry', audit.industry || '—'],
    ['Website', audit.website || '—'],
    ['Monthly enquiries', audit.monthlyEnquiries || '—'],
    ['Preferred time', [audit.preferredDate, audit.preferredTime].filter(Boolean).join(' · ') || '—'],
    ['Fit', audit.fit || 'pending'],
    ['Score', audit.score == null ? '—' : String(audit.score)],
    ['Status', audit.status],
  ]

  return (
    <main className="min-h-screen" style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
      <header className="px-6 py-4 flex items-center justify-between gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <p className="text-xs mb-1"><a href="/admin/audits" style={{ color: '#886cff' }}>Audit requests</a></p>
          <h1 className="text-lg font-bold">{audit.name}</h1>
          <p className="text-xs" style={{ color: '#888' }}>{audit.businessName}</p>
        </div>
        {audit.status !== 'archived' ? (
          <button type="button" disabled={saving} onClick={archive} className="text-xs px-3 py-1.5 rounded" style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#CCC' }}>Archive</button>
        ) : null}
      </header>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {notice ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(34,197,94,0.12)', color: '#86EFAC' }} role="status">{notice}</p> : null}
        {error ? <p className="rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(255,68,68,0.12)', color: '#FF8A8A' }} role="alert">{error}</p> : null}
        <section className="rounded-xl p-4" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-sm font-bold mb-3">Request</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs" style={{ color: '#777' }}>{label}</dt>
                <dd className="mt-1 break-words">{value}</dd>
              </div>
            ))}
          </dl>
          {audit.responseProcess ? <p className="mt-4 text-sm leading-relaxed" style={{ color: '#CCC' }}>{audit.responseProcess}</p> : null}
          {audit.qualificationSummary ? <p className="mt-4 text-sm" style={{ color: '#AAA' }}>{audit.qualificationSummary}</p> : null}
        </section>
        <section className="rounded-xl p-4" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-sm font-bold mb-1">Internal draft</h2>
          <p className="text-xs mb-3" style={{ color: '#777' }}>Visible to Cytron admins only. This screen does not send it to the lead.</p>
          {audit.draft ? (
            <>
              <p className="font-semibold mb-2">{audit.draft.title || 'Untitled draft'}</p>
              <p className="text-xs mb-3" style={{ color: '#777' }}>{audit.draft.status}{audit.draft.model ? ` · ${audit.draft.model}` : ''}{audit.draft.promptVersion ? ` · ${audit.draft.promptVersion}` : ''}</p>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: '#DDD' }}>{audit.draft.bodyMarkdown || 'Draft has no body yet.'}</pre>
            </>
          ) : <p className="text-sm" style={{ color: '#888' }}>No internal draft yet. The lead is still saved.</p>}
        </section>
        <section className="rounded-xl p-4" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-sm font-bold mb-3">Notes</h2>
          <ul className="space-y-2 mb-4">
            {audit.activities.length === 0 ? <li className="text-sm" style={{ color: '#777' }}>No activity yet.</li> : audit.activities.map(activity => (
              <li key={activity.id} className="text-sm">
                <span className="uppercase text-xs" style={{ color: '#888' }}>{activity.type}</span>
                <span className="text-xs ml-2" style={{ color: '#555' }}>{new Date(activity.createdAt).toLocaleString('en-AU')}</span>
                {activity.type === 'note' && activity.payload && typeof activity.payload === 'object' && 'text' in activity.payload ? (
                  <p className="mt-1" style={{ color: '#DDD' }}>{String((activity.payload as { text: unknown }).text)}</p>
                ) : null}
              </li>
            ))}
          </ul>
          <form onSubmit={saveNote} className="space-y-3">
            <label className="block text-xs" style={{ color: '#888' }}>
              Internal note
              <textarea value={note} onChange={event => setNote(event.target.value)} rows={3} maxLength={2000} className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
            </label>
            <button type="submit" disabled={saving || !note.trim()} className="text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-50" style={{ background: '#886cff', color: '#FFF' }}>{saving ? 'Saving…' : 'Save note'}</button>
          </form>
        </section>
        <p className="text-xs" style={{ color: '#555' }}>Consent recorded: {audit.consentText}</p>
      </div>
    </main>
  )
}
