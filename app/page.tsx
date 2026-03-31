'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

type DashboardData = {
  company: { name: string; slug: string; plan: string; plan_status: string }
  role: string
  stats: {
    marketing: { total: number; published: number; totalReach: number; totalLikes: number; videosGenerated: number }
    quotes: { total: number; totalValue: number; approved: number }
    compliance: { total: number; passed: number; failed: number; pending: number }
    workOrders: { total: number; active: number; completed: number }
  }
  recent: {
    posts: { id: string; caption: string; platform: string; status: string; created_at: string }[]
    quotes: { id: string; quote_number: string; client_name: string; total: number; status: string; created_at: string }[]
  }
}

const PLAN_LIMITS: Record<string, { videos: number; posts: number }> = {
  starter: { videos: 10, posts: 30 },
  pro: { videos: 50, posts: 150 },
  enterprise: { videos: 999, posts: 999 },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { if (d.company) setData(d) })
      .catch(() => {})
  }, [])

  const company = data?.company
  const s = data?.stats
  const recent = data?.recent
  const plan = company?.plan || 'starter'
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter

  return (
    <div className="flex min-h-screen" style={{ background: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar active="dashboard" />

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3.5"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          <div>
            <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: '#9CA3AF' }}>
              <Link href="/" style={{ color: '#1D4ED8', fontWeight: 600 }}>CYTRON</Link>
              <span>/</span>
              <span style={{ color: '#374151', fontWeight: 600 }}>Dashboard</span>
            </div>
            <h1 className="text-base font-semibold" style={{ color: '#111827' }}>Welcome, {company?.name || 'Loading...'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5"
              style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: '#16A34A' }}></span>
              All Systems Online
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              {
                label: 'Posts Published',
                value: s ? String(s.marketing.published) : '—',
                sub: s?.marketing.published ? `${s.marketing.total} total` : 'No posts yet',
                status: s && s.marketing.published > 0 ? 'Active' : 'Waiting',
              },
              {
                label: 'Quotes Value',
                value: s ? `$${(s.quotes.totalValue / 1000).toFixed(1)}k` : '—',
                sub: s?.quotes.total ? `${s.quotes.total} quotes • ${s.quotes.approved} approved` : 'No quotes yet',
                status: s && s.quotes.total > 0 ? 'Active' : 'Waiting',
              },
              {
                label: 'Compliance',
                value: s ? String(s.compliance.total) : '—',
                sub: s?.compliance.total ? `${s.compliance.passed} passed • ${s.compliance.failed} failed` : 'No reports yet',
                status: s && s.compliance.failed > 0 ? 'Alert' : s && s.compliance.total > 0 ? 'Active' : 'Waiting',
              },
              {
                label: 'Work Orders',
                value: s ? String(s.workOrders.active) : '—',
                sub: s?.workOrders.total ? `${s.workOrders.completed} completed of ${s.workOrders.total}` : 'No orders yet',
                status: s && s.workOrders.active > 0 ? 'Active' : 'Waiting',
              },
            ].map((k, i) => (
              <div key={i} className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>{k.label}</p>
                <p className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>{k.value}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>{k.sub}</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                    style={{
                      background: k.status === 'Active' ? '#F0FDF4' : k.status === 'Alert' ? '#FEF2F2' : '#F9FAFB',
                      color: k.status === 'Active' ? '#15803D' : k.status === 'Alert' ? '#DC2626' : '#9CA3AF',
                    }}>{k.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5">

            {/* Left column */}
            <div className="col-span-2 space-y-4">

              {/* Quick Actions */}
              <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Create AI Video', desc: 'Upload photo, generate video', href: '/marketing', icon: 'M15 10l4.553-2.069A1 1 0 0121 8.806v6.388a1 1 0 01-1.447.894L15 14M3 8h12v8H3a1 1 0 01-1-1V9a1 1 0 011-1z' },
                    { label: 'New Quote', desc: 'AI-powered quote generator', href: '/quotes', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                    { label: 'Compliance Report', desc: 'Generate inspection report', href: '/compliance', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'Warehouse', desc: 'Scan QR, manage stock', href: '/warehouse', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                  ].map((a, i) => (
                    <Link key={i} href={a.href}
                      className="flex items-center gap-3 p-3.5 rounded-lg transition-all hover:shadow-sm"
                      style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: '#1D4ED8' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={a.icon} />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#374151' }}>{a.label}</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>{a.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>Recent Activity</h2>
                {recent && (recent.posts.length > 0 || recent.quotes.length > 0) ? (
                  <div className="space-y-2">
                    {recent.posts.map(p => (
                      <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded"
                        style={{ background: '#F9FAFB' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M15 10l4.553-2.069A1 1 0 0121 8.806v6.388a1 1 0 01-1.447.894L15 14M3 8h12v8H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium" style={{ color: '#374151' }}>
                              {p.caption ? (p.caption.length > 50 ? p.caption.slice(0, 50) + '...' : p.caption) : 'Marketing post'}
                            </p>
                            <p className="text-xs" style={{ color: '#9CA3AF' }}>{p.platform}</p>
                          </div>
                        </div>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>{timeAgo(p.created_at)}</span>
                      </div>
                    ))}
                    {recent.quotes.map(q => (
                      <div key={q.id} className="flex items-center justify-between py-2 px-3 rounded"
                        style={{ background: '#F9FAFB' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: '#FEF9C3' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium" style={{ color: '#374151' }}>{q.quote_number} — {q.client_name}</p>
                            <p className="text-xs" style={{ color: '#9CA3AF' }}>${q.total?.toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>{timeAgo(q.created_at)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>No activity yet</p>
                    <p className="text-xs mt-1" style={{ color: '#D1D5DB' }}>Your AI-generated content will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">

              {/* AI Agents Status */}
              <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#16A34A' }} />
                  <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>AI Agents</h2>
                </div>
                {[
                  { name: 'Content Engine',   href: '/marketing', status: 'Ready',   color: '#16A34A' },
                  { name: 'Video Generator',  href: '/marketing', status: 'Ready',   color: '#16A34A' },
                  { name: 'Quote AI',         href: '/quotes',    status: 'Ready',   color: '#16A34A' },
                  { name: 'Field Commander',  href: '/field-commander', status: 'Ready', color: '#16A34A' },
                ].map((a, i) => (
                  <Link key={i} href={a.href}
                    className="flex items-center justify-between py-2"
                    style={{ borderBottom: i < 3 ? '1px solid #F3F4F6' : 'none' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: a.color }} />
                      <span className="text-xs font-medium" style={{ color: '#374151' }}>{a.name}</span>
                    </div>
                    <span className="text-xs font-medium" style={{ color: a.color }}>{a.status}</span>
                  </Link>
                ))}
              </div>

              {/* Connected Platforms */}
              <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <h2 className="text-sm font-semibold mb-3" style={{ color: '#111827' }}>Platforms</h2>
                {[
                  { name: 'Instagram',  connected: false },
                  { name: 'TikTok',     connected: true  },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2"
                    style={{ borderBottom: i < 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <span className="text-xs" style={{ color: '#374151' }}>{p.name}</span>
                    <span className="text-xs font-medium" style={{ color: p.connected ? '#16A34A' : '#9CA3AF' }}>
                      {p.connected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Plan info — real data */}
              <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <h2 className="text-sm font-semibold mb-3" style={{ color: '#111827' }}>Your Plan</h2>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded capitalize" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                    {plan}
                  </span>
                  {company?.plan_status === 'trial' && (
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#FEF9C3', color: '#92400E' }}>Trial</span>
                  )}
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: '#6B7280' }}>AI Videos</span>
                    <span style={{ color: '#374151' }}>{s?.marketing.videosGenerated || 0} / {limits.videos} this month</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#F3F4F6' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min(100, ((s?.marketing.videosGenerated || 0) / limits.videos) * 100)}%`,
                      background: '#1D4ED8',
                    }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: '#6B7280' }}>Auto Posts</span>
                    <span style={{ color: '#374151' }}>{s?.marketing.published || 0} / {limits.posts} this month</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#F3F4F6' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min(100, ((s?.marketing.published || 0) / limits.posts) * 100)}%`,
                      background: '#0891B2',
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
