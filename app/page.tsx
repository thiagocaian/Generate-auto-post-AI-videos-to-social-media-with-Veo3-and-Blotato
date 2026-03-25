'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

export default function Home() {
  const [company, setCompany] = useState<{ name: string; slug: string } | null>(null)
  const [stats, setStats] = useState({ total: 0, published: 0, totalReach: 0, totalLikes: 0 })

  useEffect(() => {
    fetch('/api/company')
      .then(r => r.json())
      .then(d => { if (d.company) setCompany(d.company) })
      .catch(() => {})

    fetch('/api/marketing-posts')
      .then(r => r.json())
      .then(d => { if (d.stats) setStats(d.stats) })
      .catch(() => {})
  }, [])

  const clientName = company?.name || 'Loading...'

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
            <h1 className="text-base font-semibold" style={{ color: '#111827' }}>Welcome, {clientName}</h1>
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

          {/* KPIs — all zeroed */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Posts Published',   value: String(stats.published), sub: stats.published ? `${stats.published} total` : 'No posts yet',           status: stats.published > 0 ? 'Active' : 'Waiting' },
              { label: 'Total Reach',       value: String(stats.totalReach), sub: stats.totalReach ? 'across platforms' : 'Start posting to track', status: stats.totalReach > 0 ? 'Active' : 'Waiting' },
              { label: 'Total Likes',       value: stats.totalLikes ? String(stats.totalLikes) : '—', sub: stats.totalLikes ? 'across platforms' : 'No data yet',            status: stats.totalLikes > 0 ? 'Active' : 'Waiting' },
              { label: 'Videos Generated',  value: String(stats.total), sub: 'via Kling AI',           status: 'Ready' },
            ].map((k, i) => (
              <div key={i} className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>{k.label}</p>
                <p className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>{k.value}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>{k.sub}</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: k.status === 'Ready' ? '#F0FDF4' : '#F9FAFB', color: k.status === 'Ready' ? '#15803D' : '#9CA3AF' }}>{k.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5">

            {/* Left column */}
            <div className="col-span-2 space-y-4">

              {/* Quick Actions */}
              <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>Get Started</h2>
                <div className="space-y-3">
                  <Link href="/marketing"
                    className="flex items-center gap-4 p-4 rounded-lg transition-all hover:shadow-sm"
                    style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: '#1D4ED8' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 10l4.553-2.069A1 1 0 0121 8.806v6.388a1 1 0 01-1.447.894L15 14M3 8h12v8H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#1D4ED8' }}>Create Your First AI Video</p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>Upload a photo and let AI generate a cinematic video for Instagram & TikTok</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto flex-shrink-0">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>

                  <div className="flex items-center gap-4 p-4 rounded-lg"
                    style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: '#F3F4F6' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 01-12 0 6 6 0 0112 0zM2 21a8 8 0 0116 0" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#374151' }}>Connect Social Accounts</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>Link your Instagram and TikTok for auto-publishing</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded ml-auto" style={{ background: '#FEF9C3', color: '#92400E' }}>Coming soon</span>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg"
                    style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: '#F3F4F6' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20V10M18 20V4M6 20v-4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#374151' }}>View Analytics</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>Track reach, engagement and growth across platforms</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded ml-auto" style={{ background: '#F9FAFB', color: '#9CA3AF' }}>No data yet</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity — empty */}
              <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>Recent Activity</h2>
                <div className="flex flex-col items-center justify-center py-10">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>No activity yet</p>
                  <p className="text-xs mt-1" style={{ color: '#D1D5DB' }}>Your AI-generated content will appear here</p>
                </div>
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
                  { name: 'Auto Publisher',   href: '/marketing', status: 'Ready',   color: '#16A34A' },
                  { name: 'Caption Writer',   href: '/marketing', status: 'Ready',   color: '#16A34A' },
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

              {/* Plan info */}
              <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <h2 className="text-sm font-semibold mb-3" style={{ color: '#111827' }}>Your Plan</h2>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>Starter</span>
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: '#6B7280' }}>AI Videos</span>
                    <span style={{ color: '#374151' }}>0 / 10 this month</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#F3F4F6' }}>
                    <div className="h-full rounded-full" style={{ width: '0%', background: '#1D4ED8' }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: '#6B7280' }}>Auto Posts</span>
                    <span style={{ color: '#374151' }}>0 / 30 this month</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#F3F4F6' }}>
                    <div className="h-full rounded-full" style={{ width: '0%', background: '#0891B2' }} />
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
