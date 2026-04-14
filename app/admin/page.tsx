'use client'

import { useState, useEffect } from 'react'

type ConnectionRequest = {
  id: string
  created_at: string
  company_id: string
  platform: string
  handle: string
  requested_by: string
  requested_at: string
}

type Company = {
  id: string; name: string; slug: string; plan: string; plan_status: string; created_at: string
}

type BlotaloAccount = {
  id: string; platform: string; username: string
}

export default function AdminPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin')
      .then(r => { if (!r.ok) throw new Error('Access denied'); return r.json() })
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A', color: '#FFF' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#886cff', borderTopColor: 'transparent' }} />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A', color: '#FF4444' }}>
      <div className="text-center">
        <p className="text-2xl font-bold mb-2">Access Denied</p>
        <p className="text-sm" style={{ color: '#666' }}>Admin only. Your email is not authorized.</p>
      </div>
    </div>
  )

  const requests: ConnectionRequest[] = data?.connection_requests || []
  const companies: Company[] = data?.companies || []
  const blotato: BlotaloAccount[] = data?.blotato_accounts || []
  const recentJobs = data?.recent_jobs || []
  const recentPosts = data?.recent_posts || []

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#886cff' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold">CYTRON Admin</h1>
            <p className="text-xs" style={{ color: '#666' }}>{data?.admin_email}</p>
          </div>
        </div>
        <a href="/dashboard" className="text-xs px-3 py-1.5 rounded" style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#999' }}>
          Back to Dashboard
        </a>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Companies', value: companies.length, color: '#886cff' },
            { label: 'Connection Requests', value: requests.length, color: '#E4405F' },
            { label: 'Blotato Accounts', value: blotato.length, color: '#22C55E' },
            { label: 'Total Jobs', value: recentJobs.length, color: '#1D4ED8' },
            { label: 'Posts Published', value: recentPosts.length, color: '#D97706' },
          ].map(k => (
            <div key={k.label} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs mb-1" style={{ color: '#666' }}>{k.label}</p>
              <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection Requests — PRIORITY */}
          <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: requests.length > 0 ? '#E4405F' : '#22C55E' }} />
              Connection Requests
              {requests.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#E4405F', color: '#FFF' }}>{requests.length}</span>}
            </h2>
            {requests.length === 0 ? (
              <p className="text-sm" style={{ color: '#666' }}>No pending requests</p>
            ) : (
              <div className="space-y-2">
                {requests.map(r => (
                  <div key={r.id} className="p-3 rounded-lg flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: '#E4405F' }}>{r.platform}</span>
                        <span className="text-sm font-medium">@{r.handle}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#666' }}>
                        by {r.requested_by} — {new Date(r.requested_at || r.created_at).toLocaleDateString('en-AU')}
                      </p>
                    </div>
                    <a
                      href="https://my.blotato.com/settings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded font-bold"
                      style={{ background: '#886cff', color: '#FFF' }}
                    >
                      Connect in Blotato
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blotato Connected Accounts */}
          <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
              Blotato Connected Accounts
            </h2>
            {blotato.length === 0 ? (
              <p className="text-sm" style={{ color: '#666' }}>No accounts connected</p>
            ) : (
              <div className="space-y-2">
                {blotato.map((a, i) => (
                  <div key={i} className="p-3 rounded-lg flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
                      <span className="text-sm font-bold capitalize">{a.platform}</span>
                      <span className="text-sm" style={{ color: '#999' }}>@{a.username}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>Active</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Companies */}
          <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4">Companies</h2>
            <div className="space-y-2">
              {companies.map(c => (
                <div key={c.id} className="p-3 rounded-lg flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div>
                    <p className="text-sm font-bold">{c.name}</p>
                    <p className="text-xs" style={{ color: '#666' }}>{c.slug} — {new Date(c.created_at).toLocaleDateString('en-AU')}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded font-bold uppercase" style={{
                    background: c.plan === 'enterprise' ? '#886cff' : c.plan === 'pro' ? '#1D4ED8' : '#333',
                    color: '#FFF'
                  }}>{c.plan}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4">Recent Activity</h2>
            <div className="space-y-2">
              {recentJobs.slice(0, 5).map((j: any) => (
                <div key={j.id} className="p-2 rounded-lg flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#1D4ED8', color: '#FFF' }}>JOB</span>
                    <span className="text-xs">{j.job_number} — {j.title}</span>
                  </div>
                  <span className="text-xs" style={{ color: '#666' }}>{j.status}</span>
                </div>
              ))}
              {recentPosts.slice(0, 5).map((p: any) => (
                <div key={p.id} className="p-2 rounded-lg flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#D97706', color: '#FFF' }}>POST</span>
                    <span className="text-xs truncate" style={{ maxWidth: 200 }}>{p.platform} — {p.caption?.substring(0, 40)}</span>
                  </div>
                  <span className="text-xs" style={{ color: '#666' }}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
