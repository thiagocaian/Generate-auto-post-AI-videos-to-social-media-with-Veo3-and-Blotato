'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

type Platform = {
  key: string
  name: string
  icon: string
  color: string
  connected: boolean
  username: string | null
  accountId: string | null
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6',
  tiktok: 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.83a8.28 8.28 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.24',
  facebook: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
  linkedin: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z',
}

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchPlatforms = async () => {
    try {
      const res = await fetch('/api/platforms')
      if (res.ok) {
        const data = await res.json()
        setPlatforms(data.platforms || [])
      }
    } catch (err) {
      console.error('Failed to load platforms:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchPlatforms() }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPlatforms()
  }

  const handleConnect = () => {
    window.open('https://my.blotato.com/settings', '_blank', 'noopener,noreferrer')
  }

  const connectedCount = platforms.filter(p => p.connected).length

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>
      <Sidebar active="marketing" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto pt-14 md:pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs tracking-widest mb-1" style={{ color: '#999' }}>CYTRON / PLATFORMS</p>
            <h1 className="text-2xl font-bold" style={{ color: '#000' }}>Connect Your Platforms</h1>
            <p className="text-sm mt-1" style={{ color: '#999' }}>
              Your passwords are never shared. Connection uses official OAuth authentication.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 text-sm font-medium rounded-lg"
            style={{ border: '1px solid #E5E5E5', color: '#666' }}
          >
            {refreshing ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>

        {/* Security Badge */}
        <div className="mb-6 px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <div>
            <p className="text-sm font-bold" style={{ color: '#059669' }}>Secured by OAuth</p>
            <p className="text-xs" style={{ color: '#666' }}>No passwords are stored. You authorize directly with each platform.</p>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#999' }}>Connected</p>
            <p className="text-2xl font-bold" style={{ color: '#059669' }}>{connectedCount}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#999' }}>Available</p>
            <p className="text-2xl font-bold">{platforms.length}</p>
          </div>
        </div>

        {/* Platform Cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#1A1A1A', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
            {platforms.map(p => (
              <div
                key={p.key}
                className="p-3 rounded-xl text-center transition-all cursor-pointer"
                style={{
                  border: p.connected ? `2px solid ${p.color}` : '1px solid #E5E5E5',
                  background: p.connected ? '#FAFAFA' : '#FFF',
                }}
                onClick={p.connected ? undefined : handleConnect}
              >
                {/* Icon */}
                <div className="flex justify-center mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: p.connected ? p.color : '#F0F0F0' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke={p.connected ? '#FFF' : '#999'}
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={PLATFORM_ICONS[p.key] || 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'} />
                    </svg>
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-xs font-bold mb-1">{p.name}</h3>

                {/* Status */}
                {p.connected ? (
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
                      <span className="text-xs font-medium" style={{ color: '#059669' }}>Connected</span>
                    </div>
                    <p className="text-xs truncate" style={{ color: '#999' }}>@{p.username}</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#D1D5DB' }} />
                      <span className="text-xs" style={{ color: '#CCC' }}>Connect</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* How It Works */}
        <div className="p-5 rounded-xl mb-6" style={{ border: '1px solid #E5E5E5', background: '#FAFAFA' }}>
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            How it works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Click Connect', desc: 'Opens the official platform authorization page' },
              { step: '2', title: 'Log in with YOUR account', desc: 'You log in directly with the platform — not through CYTRON' },
              { step: '3', title: 'Authorize posting', desc: 'Allow CYTRON to publish content on your behalf' },
              { step: '4', title: 'Refresh & Done', desc: 'Come back to CYTRON and click "Refresh Status"' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold text-white" style={{ background: '#1A1A1A' }}>
                  {s.step}
                </div>
                <p className="text-sm font-bold mb-1">{s.title}</p>
                <p className="text-xs" style={{ color: '#999' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Guarantees */}
        <div className="p-5 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
          <h3 className="text-sm font-bold mb-3">Security Guarantees</h3>
          <div className="space-y-2">
            {[
              'We NEVER see or store your password',
              'You can revoke access anytime from your platform settings',
              'Only posting permission is requested — no DMs, no followers',
              'Connection uses industry-standard OAuth 2.0 protocol',
              'Your account credentials are handled directly by Instagram/TikTok/Facebook',
            ].map((g, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span style={{ color: '#444' }}>{g}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
