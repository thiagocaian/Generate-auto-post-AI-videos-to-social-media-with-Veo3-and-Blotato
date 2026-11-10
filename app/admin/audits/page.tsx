'use client'

import { useEffect, useState } from 'react'

type DraftSummary = { id: string; title: string | null; status: string } | null

type Audit = {
  id: string
  name: string
  businessName: string
  email: string
  status: string
  score: number | null
  fit: string | null
  createdAt: string
  draft: DraftSummary
}

const STATUS_COLOR: Record<string, string> = {
  stored: '#D97706',
  audit_drafted: '#1D4ED8',
  contacted: '#7C3AED',
  converted: '#22C55E',
  archived: '#666666',
}

export default function AdminAuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [adminEmail, setAdminEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState<'none' | 'denied' | 'signedout'>('none')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (query.trim()) params.set('q', query.trim())
    const url = params.toString() ? `/api/admin/audits?${params}` : '/api/admin/audits'
    const handle = window.setTimeout(() => {
      fetch(url, { cache: 'no-store' })
        .then(async response => {
          if (response.status === 401) return 'signedout' as const
          if (response.status === 403) return 'denied' as const
          const body = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'Could not load audit requests')
          return body
        })
        .then(body => {
          if (cancelled) return
          if (body === 'signedout' || body === 'denied') {
            setDenied(body)
            return
          }
          setAudits(body.audits ?? [])
          setAdminEmail(body.adminEmail ?? '')
          setDenied('none')
          setError('')
        })
        .catch(err => {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load audit requests')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 200)
    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [query, status])

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#886cff', borderTopColor: 'transparent' }} /></main>
  }
  if (denied !== 'none') {
    return (
      <main className="min-h-screen flex items-center justify-center text-center" style={{ background: '#0A0A0A', color: '#FF4444' }}>
        <div>
          <p className="text-2xl font-bold mb-2">Access Denied</p>
          <p className="text-sm" style={{ color: '#666' }}>{denied === 'signedout' ? 'Sign in to review audit requests.' : 'Admin only. Your email is not authorized.'}</p>
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
        <p className="text-sm mb-5" style={{ color: '#888' }}>Inbound free-audit requests for Cytron. Drafts stay internal. Nothing here emails the lead.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <label className="text-xs" style={{ color: '#888' }}>
            Search
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, business, email" className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
          </label>
          <label className="text-xs" style={{ color: '#888' }}>
            Status
            <select value={status} onChange={event => setStatus(event.target.value)} className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }}>
              <option value="">All</option>
              {['stored', 'audit_drafted', 'qualified', 'contacted', 'converted', 'archived'].map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        {error ? <p className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(255,68,68,0.12)', color: '#FF8A8A' }} role="alert">{error}</p> : null}
        <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <table className="w-full text-sm" style={{ minWidth: 760 }}>
            <thead>
              <tr style={{ color: '#777', background: 'rgba(255,255,255,0.03)' }}>
                <th className="text-left font-medium px-4 py-3">Name</th>
                <th className="text-left font-medium px-4 py-3">Business</th>
                <th className="text-left font-medium px-4 py-3">Fit</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-right font-medium px-4 py-3">Review</th>
              </tr>
            </thead>
            <tbody>
              {audits.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center" style={{ color: '#666' }}>No audit requests yet.</td></tr>
              ) : audits.map(audit => (
                <tr key={audit.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold">{audit.name}</p>
                    <p className="text-xs mt-1" style={{ color: '#888' }}>{audit.email}</p>
                  </td>
                  <td className="px-4 py-3 align-top">{audit.businessName}</td>
                  <td className="px-4 py-3 align-top text-xs" style={{ color: '#CCC' }}>
                    <p className="uppercase">{audit.fit || 'pending'}</p>
                    <p>{audit.score == null ? 'No score' : `Score ${audit.score}`}</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="text-xs px-2 py-0.5 rounded font-bold uppercase" style={{ background: STATUS_COLOR[audit.status] || '#333', color: '#FFF' }}>{audit.status}</span>
                    <p className="text-xs mt-2" style={{ color: '#666' }}>{audit.draft ? `Draft: ${audit.draft.status}` : 'No draft'}</p>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <a href={`/admin/audits/${audit.id}`} className="text-xs px-2 py-1 rounded" style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#DDD' }}>Open</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
