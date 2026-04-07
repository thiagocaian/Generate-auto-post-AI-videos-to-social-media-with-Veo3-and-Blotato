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
    <div className="flex min-h-screen" style={{ background: '#F7F7F7', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar active="dashboard" />

      <main className="flex-1 flex flex-col overflow-hidden pt-12 md:pt-0">

        {/* Header */}
        <header className="flex items-center justify-between px-5 md:px-8 py-4"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #EBEBEB' }}>
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1A1A1A' }}>Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: '#AAAAAA' }}>
              {company?.name ? `${company.name} — Overview` : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex px-3 py-1.5 text-xs font-medium items-center gap-2 rounded-lg"
              style={{ background: '#F5F5F5', color: '#888' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22C55E' }}></span>
              All Systems Online
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-8">
            {[
              {
                label: 'Posts Published',
                value: s ? String(s.marketing.published) : '0',
                sub: s?.marketing.published ? `${s.marketing.total} total` : 'No posts yet',
                change: s && s.marketing.published > 0 ? '+12%' : null,
              },
              {
                label: 'Quotes Value',
                value: s ? `$${(s.quotes.totalValue / 1000).toFixed(1)}k` : '$0',
                sub: s?.quotes.total ? `${s.quotes.total} quotes` : 'No quotes yet',
                change: s && s.quotes.total > 0 ? '+8%' : null,
              },
              {
                label: 'Compliance',
                value: s ? String(s.compliance.total) : '0',
                sub: s?.compliance.total ? `${s.compliance.passed} passed` : 'No reports yet',
                change: null,
              },
              {
                label: 'Work Orders',
                value: s ? String(s.workOrders.active) : '0',
                sub: s?.workOrders.total ? `${s.workOrders.completed} completed` : 'No orders yet',
                change: null,
              },
            ].map((k, i) => (
              <div key={i} className="p-4 md:p-5 rounded-xl"
                style={{ background: '#FFFFFF', border: '1px solid #EBEBEB' }}>
                <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#AAAAAA' }}>{k.label}</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl md:text-3xl font-bold" style={{ color: '#1A1A1A' }}>{k.value}</p>
                  {k.change && (
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded mb-1"
                      style={{ background: '#ECFDF5', color: '#059669' }}>{k.change}</span>
                  )}
                </div>
                <p className="text-xs mt-1.5" style={{ color: '#BCBCBC' }}>{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">

              {/* Quick Actions */}
              <div className="p-5 md:p-6 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #EBEBEB' }}>
                <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: '#1A1A1A' }}>Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Create AI Video', desc: 'Upload photo, generate video', href: '/marketing',
                      icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'New Quote', desc: 'AI-powered quoting', href: '/quotes',
                      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                    { label: 'Compliance', desc: 'Inspection reports', href: '/compliance',
                      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'Warehouse', desc: 'QR scan, manage stock', href: '/warehouse',
                      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                  ].map((a, i) => (
                    <Link key={i} href={a.href}
                      className="flex items-center gap-3 p-3.5 rounded-xl transition-all group"
                      style={{ background: '#FAFAFA', border: '1px solid #F0F0F0' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F5'; e.currentTarget.style.borderColor = '#E0E0E0' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.borderColor = '#F0F0F0' }}>
                      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-lg"
                        style={{ background: '#1A1A1A' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d={a.icon} />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#1A1A1A' }}>{a.label}</p>
                        <p className="text-xs truncate" style={{ color: '#AAAAAA' }}>{a.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-5 md:p-6 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #EBEBEB' }}>
                <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: '#1A1A1A' }}>Recent Activity</h2>
                {recent && (recent.posts.length > 0 || recent.quotes.length > 0) ? (
                  <div className="space-y-2">
                    {recent.posts.map(p => (
                      <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                        style={{ background: '#FAFAFA' }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ background: '#F0F0F0' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#333' }}>
                              {p.caption ? (p.caption.length > 45 ? p.caption.slice(0, 45) + '...' : p.caption) : 'Marketing post'}
                            </p>
                            <p className="text-xs" style={{ color: '#AAAAAA' }}>{p.platform}</p>
                          </div>
                        </div>
                        <span className="text-xs flex-shrink-0 ml-2" style={{ color: '#CCCCCC' }}>{timeAgo(p.created_at)}</span>
                      </div>
                    ))}
                    {recent.quotes.map(q => (
                      <div key={q.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                        style={{ background: '#FAFAFA' }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ background: '#F0F0F0' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#333' }}>{q.quote_number} — {q.client_name}</p>
                            <p className="text-xs" style={{ color: '#AAAAAA' }}>${q.total?.toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="text-xs flex-shrink-0 ml-2" style={{ color: '#CCCCCC' }}>{timeAgo(q.created_at)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full mb-3" style={{ background: '#F5F5F5' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: '#999' }}>No activity yet</p>
                    <p className="text-xs mt-1" style={{ color: '#CCCCCC' }}>Your AI-generated content will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4 md:space-y-6">

              {/* AI Agents Status */}
              <div className="p-5 md:p-6 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #EBEBEB' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22C55E' }} />
                  <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#1A1A1A' }}>AI Agents</h2>
                </div>
                {[
                  { name: 'Content Engine',   href: '/marketing', status: 'Ready' },
                  { name: 'Video Generator',  href: '/marketing', status: 'Ready' },
                  { name: 'Quote AI',         href: '/quotes',    status: 'Ready' },
                  { name: 'Field Commander',  href: '/field-commander', status: 'Ready' },
                ].map((a, i) => (
                  <Link key={i} href={a.href}
                    className="flex items-center justify-between py-2.5 transition-colors"
                    style={{ borderBottom: i < 3 ? '1px solid #F5F5F5' : 'none' }}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: '#1A1A1A' }} />
                      <span className="text-sm font-medium" style={{ color: '#444' }}>{a.name}</span>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#BCBCBC' }}>{a.status}</span>
                  </Link>
                ))}
              </div>

              {/* Connected Platforms */}
              <div className="p-5 md:p-6 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #EBEBEB' }}>
                <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#1A1A1A' }}>Platforms</h2>
                {[
                  { name: 'Instagram',  connected: false },
                  { name: 'TikTok',     connected: true  },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5"
                    style={{ borderBottom: i < 1 ? '1px solid #F5F5F5' : 'none' }}>
                    <span className="text-sm" style={{ color: '#444' }}>{p.name}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: p.connected ? '#22C55E' : '#CCCCCC' }}>
                      {p.connected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Plan info */}
              <div className="p-5 md:p-6 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #EBEBEB' }}>
                <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: '#1A1A1A' }}>Usage</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span style={{ color: '#AAAAAA' }}>AI Videos</span>
                      <span className="font-semibold" style={{ color: '#444' }}>{s?.marketing.videosGenerated || 0} / {limits.videos}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F0F0F0' }}>
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${Math.min(100, ((s?.marketing.videosGenerated || 0) / limits.videos) * 100)}%`,
                        background: '#1A1A1A',
                      }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span style={{ color: '#AAAAAA' }}>Auto Posts</span>
                      <span className="font-semibold" style={{ color: '#444' }}>{s?.marketing.published || 0} / {limits.posts}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F0F0F0' }}>
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${Math.min(100, ((s?.marketing.published || 0) / limits.posts) * 100)}%`,
                        background: '#888',
                      }} />
                    </div>
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
