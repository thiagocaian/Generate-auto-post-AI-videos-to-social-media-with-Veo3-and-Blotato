'use client'

import { useCallback, useEffect, useState } from 'react'

type Piece = {
  id: string
  status: string
  format: string
  title: string | null
  hook: string | null
  script: string | null
  caption: string | null
  target_platforms: string[]
  utm_campaign: string | null
  generator: string | null
  created_at: string
  idea: { title: string; source: string; source_url: string | null; score: number } | null
}

type Approval = { id: string; piece_id: string; action: string; channel: string; actor: string | null; created_at: string }

const card = { background: '#111111', border: '1px solid #222222' }

export default function AdminMarketingQueuePage() {
  const [queue, setQueue] = useState<Piece[]>([])
  const [recent, setRecent] = useState<Approval[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'signedout' | 'denied' | 'error'>('loading')
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/marketing', { cache: 'no-store' })
    if (res.status === 401) return setState('signedout')
    if (res.status === 403) return setState('denied')
    const body = await res.json().catch(() => ({}))
    if (!res.ok) { setMessage(typeof body.error === 'string' ? body.error : 'Could not load'); return setState('error') }
    setQueue(body.queue ?? [])
    setRecent(body.recent ?? [])
    setState('ready')
  }, [])

  useEffect(() => { load() }, [load])

  async function decide(id: string, action: 'approve' | 'reject') {
    const note = action === 'reject' ? window.prompt('Reason (optional)') ?? '' : ''
    setBusy(id)
    setMessage('')
    const res = await fetch('/api/admin/marketing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action, note }) })
    const body = await res.json().catch(() => ({}))
    setBusy(null)
    if (!res.ok) { setMessage(typeof body.error === 'string' ? body.error : 'Failed'); return }
    setMessage(action === 'approve' ? 'Approved. It will be distributed by the n8n flow (Blotato).' : 'Rejected.')
    load()
  }

  if (state === 'loading') return <main className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A', color: '#999' }}>Loading…</main>
  if (state === 'signedout' || state === 'denied') {
    return <main className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A', color: '#FF4444' }}>{state === 'signedout' ? 'Please sign in.' : 'Cytron admin only.'}</main>
  }

  return (
    <main className="min-h-screen p-6 md:p-10" style={{ background: '#0A0A0A', color: '#EDEDED' }}>
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Marketing content queue</h1>
          <p className="text-sm" style={{ color: '#999' }}>Approve or reject AI-generated content. Approving never posts by itself: distribution runs in n8n through Blotato.</p>
        </header>
        {message && <p className="text-sm" style={{ color: state === 'error' ? '#FF4444' : '#886cff' }}>{message}</p>}
        {queue.length === 0 && state === 'ready' && <p className="rounded-xl p-6 text-sm" style={{ ...card, color: '#999' }}>Nothing waiting for review.</p>}
        {queue.map(p => (
          <article key={p.id} className="rounded-xl p-5 space-y-3" style={card}>
            <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: '#999' }}>
              <span className="rounded px-2 py-0.5" style={{ background: '#1f1a33', color: '#b9a8ff' }}>{p.status}</span>
              <span>{p.format}</span>
              <span>{(p.target_platforms ?? []).join(' · ')}</span>
              <span>{new Date(p.created_at).toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' })} (Brisbane)</span>
              {p.generator && <span>gen: {p.generator}</span>}
            </div>
            <h2 className="text-lg font-medium">{p.title || 'Untitled'}</h2>
            {p.hook && <p className="font-medium" style={{ color: '#b9a8ff' }}>{p.hook}</p>}
            {p.script && <pre className="whitespace-pre-wrap text-sm" style={{ color: '#ccc', fontFamily: 'inherit' }}>{p.script}</pre>}
            {p.caption && <details className="text-sm" style={{ color: '#aaa' }}><summary className="cursor-pointer">Caption</summary><pre className="whitespace-pre-wrap mt-2" style={{ fontFamily: 'inherit' }}>{p.caption}</pre></details>}
            {p.idea && <p className="text-xs" style={{ color: '#777' }}>Idea: {p.idea.title} ({p.idea.source}, score {p.idea.score})</p>}
            {p.utm_campaign && <p className="text-xs" style={{ color: '#777' }}>UTM campaign: <code>{p.utm_campaign}</code></p>}
            <div className="flex gap-3 pt-1">
              <button disabled={busy === p.id} onClick={() => decide(p.id, 'approve')} className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50" style={{ background: '#22C55E', color: '#0A0A0A' }}>Approve</button>
              <button disabled={busy === p.id} onClick={() => decide(p.id, 'reject')} className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50" style={{ background: '#2a1111', color: '#FF6B6B', border: '1px solid #552222' }}>Reject</button>
            </div>
          </article>
        ))}
        {recent.length > 0 && (
          <section className="rounded-xl p-5" style={card}>
            <h3 className="mb-3 text-sm font-medium" style={{ color: '#999' }}>Recent decisions</h3>
            <ul className="space-y-1 text-xs" style={{ color: '#aaa' }}>
              {recent.map(a => <li key={a.id}>{new Date(a.created_at).toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' })} · {a.action} · {a.channel} · {a.actor ?? '—'} · {a.piece_id.slice(0, 8)}</li>)}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
