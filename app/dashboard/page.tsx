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
    jobs: { total: number; active: number; completed: number; pipelineValue: number }
    invoices: { total: number; totalBilled: number; totalPaid: number; outstanding: number }
  }
  recent: {
    posts: { id: string; caption: string; platform: string; status: string; created_at: string }[]
    quotes: { id: string; quote_number: string; client_name: string; total: number; status: string; created_at: string }[]
    jobs: { id: string; job_number: string; title: string; client_name: string; status: string; total_value: number; created_at: string }[]
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

type StockSummary = { totalItems: number; totalValue: number; lowStockCount: number; healthScore: number; lowStockItems: { name: string; current: number; minimum: number }[] }

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [platformStatus, setPlatformStatus] = useState<Array<{ name: string; connected: boolean; username?: string }>>([])
  const [stock, setStock] = useState<StockSummary | null>(null)

  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        if (d.company) {
          setData(d)
        } else if (d.error) {
          setLoadError(d.error)
        }
      })
      .catch(() => setLoadError('Could not load dashboard data.'))

    fetch('/api/reports?period=month')
      .then(r => r.json())
      .then(d => { if (d.inventory) setStock(d.inventory) })
      .catch(() => {})

    fetch('/api/platforms')
      .then(r => r.json())
      .then(d => {
        if (d.platforms) setPlatformStatus(d.platforms.map((p: { name: string; connected: boolean; username?: string }) => ({ name: p.name, connected: p.connected, username: p.username })))
      })
      .catch(() => setPlatformStatus([{ name: 'Instagram', connected: false }, { name: 'TikTok', connected: false }]))
  }, [])

  const company = data?.company
  const s = data?.stats
  const recent = data?.recent
  const plan = company?.plan || 'starter'
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter

  // No company found — show setup prompt
  if (loadError && !data) {
    return (
      <div className="flex min-h-screen" style={{ background: '#F7F7F7', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <Sidebar active="dashboard" />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl" style={{ background: '#1A1A1A' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Set up your workspace</h1>
            <p className="text-sm mb-6" style={{ color: '#888' }}>
              Your account isn&apos;t linked to a company yet. Complete onboarding to get started.
            </p>
            <Link href="/onboarding"
              className="inline-block px-6 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ background: '#1A1A1A', color: '#FFFFFF' }}>
              Start Onboarding →
            </Link>
          </div>
        </main>
      </div>
    )
  }

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6 md:mb-8">
            {[
              {
                label: 'Active Jobs',
                value: s ? String(s.jobs?.active || 0) : '0',
                sub: s?.jobs?.total ? `${s.jobs.total} total` : 'No jobs yet',
                change: null,
              },
              {
                label: 'Pipeline Value',
                value: s ? `$${((s.jobs?.pipelineValue || 0) / 1000).toFixed(1)}k` : '$0',
                sub: s?.jobs?.completed ? `${s.jobs.completed} completed` : 'No completed jobs',
                change: null,
              },
              {
                label: 'Invoiced',
                value: s ? `$${((s.invoices?.totalBilled || 0) / 1000).toFixed(1)}k` : '$0',
                sub: s?.invoices?.total ? `${s.invoices.total} invoices` : 'No invoices yet',
                change: null,
              },
              {
                label: 'Quotes Value',
                value: s ? `$${((s.quotes?.totalValue || 0) / 1000).toFixed(1)}k` : '$0',
                sub: s?.quotes?.total ? `${s.quotes.total} quotes` : 'No quotes yet',
                change: null,
              },
              {
                label: 'Posts Published',
                value: s ? String(s.marketing?.published || 0) : '0',
                sub: s?.marketing?.total ? `${s.marketing.total} total` : 'No posts yet',
                change: null,
              },
              {
                label: 'Compliance',
                value: s ? String(s.compliance?.total || 0) : '0',
                sub: s?.compliance?.total ? `${s.compliance.passed} passed` : 'No reports yet',
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: 'New Job', desc: 'Create and assign jobs', href: '/jobs',
                      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                    { label: 'Invoices', desc: 'Billing and payments', href: '/invoices',
                      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    { label: 'Calendar', desc: 'Schedule and plan', href: '/calendar',
                      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                    { label: 'New Quote', desc: 'AI-powered quoting', href: '/quotes',
                      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                    { label: 'Warehouse', desc: 'QR scan, manage stock', href: '/warehouse',
                      icon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' },
                    { label: 'Marketing AI', desc: 'Video and social media', href: '/marketing',
                      icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
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

              {/* Stock Report Widget */}
              {stock && (
                <div className="p-5 md:p-6 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #EBEBEB' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 20V10M12 20V4M6 20v-6"/>
                      </svg>
                      <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#1A1A1A' }}>Stock Report</h2>
                      {stock.lowStockCount > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FF4444', color: '#fff' }}>
                          {stock.lowStockCount} crítico{stock.lowStockCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <Link href="/reports" className="text-xs font-semibold" style={{ color: '#886cff' }}>Ver relatório →</Link>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Itens', value: String(stock.totalItems) },
                      { label: 'Valor', value: `$${(stock.totalValue / 1000).toFixed(1)}k` },
                      { label: 'Saúde', value: stock.healthScore + '%', color: stock.healthScore >= 80 ? '#22C55E' : '#F59E0B' },
                    ].map((m, i) => (
                      <div key={i} className="rounded-lg p-3 text-center" style={{ background: '#F8F8F8' }}>
                        <div className="text-xs mb-1" style={{ color: '#AAAAAA' }}>{m.label}</div>
                        <div className="text-lg font-bold" style={{ color: m.color || '#1A1A1A' }}>{m.value}</div>
                      </div>
                    ))}
                  </div>

                  {stock.lowStockItems.length > 0 && (
                    <div className="space-y-2">
                      {stock.lowStockItems.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg"
                          style={{ background: '#FFF5F5', border: '1px solid #FFE0E0' }}>
                          <span className="text-xs font-medium truncate" style={{ color: '#1A1A1A' }}>{item.name}</span>
                          <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: '#FF4444' }}>
                            {item.current} / {item.minimum} mín
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recent Activity */}
              <div className="p-5 md:p-6 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #EBEBEB' }}>
                <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: '#1A1A1A' }}>Recent Activity</h2>
                {recent && (recent.posts.length > 0 || recent.quotes.length > 0 || recent.jobs?.length > 0) ? (
                  <div className="space-y-2">
                    {recent.jobs?.map(j => (
                      <div key={j.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                        style={{ background: '#FAFAFA' }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ background: '#F0F0F0' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#333' }}>{j.job_number} — {j.title}</p>
                            <p className="text-xs" style={{ color: '#AAAAAA' }}>{j.client_name || 'No client'} • {j.status}</p>
                          </div>
                        </div>
                        <span className="text-xs flex-shrink-0 ml-2" style={{ color: '#CCCCCC' }}>{timeAgo(j.created_at)}</span>
                      </div>
                    ))}
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
                {(platformStatus.length > 0 ? platformStatus : [{ name: 'Instagram', connected: false }, { name: 'TikTok', connected: false }]).map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5"
                    style={{ borderBottom: i < (platformStatus.length || 2) - 1 ? '1px solid #F5F5F5' : 'none' }}>
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
