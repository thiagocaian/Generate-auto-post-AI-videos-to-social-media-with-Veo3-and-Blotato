'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type NavItem = { label: string; href: string; key: string; iconPath: string; badge?: string }

const navItems: NavItem[] = [
  { label: 'Dashboard',      href: '/dashboard',       key: 'dashboard',    iconPath: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { label: 'Warehouse',      href: '/warehouse',       key: 'warehouse',    iconPath: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' },
  { label: 'Quoting',        href: '/quotes',          key: 'quotes',       iconPath: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8' },
  { label: 'Materials',      href: '/materials',       key: 'materials',    iconPath: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { label: 'Jobs',            href: '/jobs',            key: 'jobs',         iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Invoices',       href: '/invoices',        key: 'invoices',     iconPath: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'Calendar',       href: '/calendar',        key: 'calendar',     iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Subcontractors', href: '/field-commander', key: 'field',        iconPath: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  { label: 'Compliance',     href: '/compliance',      key: 'compliance',   iconPath: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
  { label: 'Marketing AI',   href: '/marketing',       key: 'marketing',    iconPath: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Platforms',     href: '/platforms',       key: 'platforms',    iconPath: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71' },
  { label: 'Billing',      href: '/billing',         key: 'billing',      iconPath: 'M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM1 10h22' },
]

export default function Sidebar({ active }: { active: string }) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('Loading...')
  const [lowStockCount, setLowStockCount] = useState(0)
  const [plan, setPlan] = useState('starter')
  const [planStatus, setPlanStatus] = useState('trial')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email ?? null)
        const { data: member } = await supabase
          .from('company_members')
          .select('companies(name, plan, plan_status)')
          .eq('user_id', user.id)
          .single()
        if (member?.companies) {
          const co = member.companies as unknown as { name: string; plan?: string; plan_status?: string }
          setCompanyName(co.name)
          if (co.plan) setPlan(co.plan)
          if (co.plan_status) setPlanStatus(co.plan_status)
        }
      }
      const { data: items } = await supabase
        .from('warehouse_items')
        .select('current_stock, minimum_stock')
      if (items) {
        setLowStockCount(items.filter(i => i.current_stock <= i.minimum_stock).length)
      }
    }
    loadUserData()
  }, [])

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navWithBadge = navItems.map(item =>
    item.key === 'warehouse' && lowStockCount > 0
      ? { ...item, badge: String(lowStockCount) }
      : item
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: '#1A1A1A', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
            <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: '#FFFFFF' }}>CYTRON</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg"
          style={{ color: '#FFFFFF' }}>
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile slide-out menu */}
      <div className={`md:hidden fixed top-12 left-0 bottom-0 z-50 w-72 flex flex-col transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#FFFFFF', borderRight: '1px solid #E8E8E8' }}>

        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #F0F0F0' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: '#1A1A1A', color: '#FFFFFF' }}>
            {userEmail ? userEmail[0].toUpperCase() : 'C'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: '#1A1A1A' }}>{companyName}</div>
            <div className="text-xs truncate" style={{ color: '#999' }}>{userEmail || ''}</div>
          </div>
        </div>

        <div className="px-4 pt-4 pb-1">
          <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#BCBCBC' }}>Modules</div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {navWithBadge.map((item) => {
            const isActive = item.key === active
            return (
              <Link key={item.key} href={item.href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={isActive
                  ? { background: '#F5F5F5', color: '#1A1A1A' }
                  : { color: '#666' }
                }>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: isActive ? 1 : 0.5 }}>
                  <path d={item.iconPath} />
                </svg>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: '#F0F0F0', color: '#1A1A1A' }}>{item.badge}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4" style={{ borderTop: '1px solid #F0F0F0' }}>
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-2 text-left text-sm px-3 py-2 rounded-lg transition-colors"
            style={{ color: '#999' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <aside className="w-[52px] flex flex-col items-center py-5 gap-1"
          style={{ background: '#1A1A1A' }}>
          <div className="mb-4 w-9 h-9 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="5.64" y1="5.64" x2="18.36" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="5.64" y2="18.36" />
            </svg>
          </div>
          <div className="w-6 mb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
          {navWithBadge.map((item) => {
            const isActive = item.key === active
            return (
              <Link key={item.key} href={item.href}
                title={item.label}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-all relative"
                style={isActive
                  ? { background: 'rgba(255,255,255,0.12)', color: '#FFFFFF' }
                  : { color: 'rgba(255,255,255,0.35)' }
                }
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.iconPath} />
                </svg>
                {item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-xs flex items-center justify-center font-bold rounded-full"
                    style={{ background: '#FFFFFF', color: '#1A1A1A', fontSize: 9 }}>{item.badge}</span>
                )}
              </Link>
            )
          })}
          <div className="mt-auto">
            <button onClick={handleSignOut} title="Sign out"
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
              style={{ color: 'rgba(255,255,255,0.25)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>
          </div>
        </aside>

        <aside className="w-56 flex flex-col"
          style={{ background: '#FFFFFF', borderRight: '1px solid #E8E8E8' }}>
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #F0F0F0' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: '#1A1A1A', color: '#FFFFFF' }}>
              {userEmail ? userEmail[0].toUpperCase() : 'C'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: '#1A1A1A' }}>{companyName}</div>
              <div className="text-xs truncate" style={{ color: '#AAAAAA' }}>{userEmail || ''}</div>
            </div>
          </div>

          <div className="px-5 pt-5 pb-1.5">
            <div className="text-xs font-medium uppercase tracking-wider" style={{ color: '#BCBCBC' }}>Modules</div>
          </div>
          <nav className="px-3 space-y-0.5">
            {navWithBadge.map((item) => {
              const isActive = item.key === active
              return (
                <Link key={item.key} href={item.href}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
                  style={isActive
                    ? { background: '#F5F5F5', color: '#1A1A1A', fontWeight: 600 }
                    : { color: '#666', fontWeight: 500 }
                  }
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#FAFAFA' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div className="flex items-center gap-2.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                      style={{ opacity: isActive ? 1 : 0.5 }}>
                      <path d={item.iconPath} />
                    </svg>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: '#F0F0F0', color: '#1A1A1A' }}>{item.badge}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="px-5 pt-6 pb-1.5" style={{ borderTop: '1px solid #F0F0F0', marginTop: 16 }}>
            <div className="text-xs font-medium uppercase tracking-wider" style={{ color: '#BCBCBC' }}>Status</div>
          </div>
          <div className="px-3 space-y-0.5">
            {[
              { label: 'All Systems', dot: '#22C55E' },
              { label: 'AI Agents', dot: '#22C55E' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 text-sm" style={{ color: '#666' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
                <span style={{ fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto px-5 py-4" style={{ borderTop: '1px solid #F0F0F0' }}>
            <Link href="/billing" className="flex items-center justify-between mb-1 group cursor-pointer">
              <span className="text-xs font-medium group-hover:text-[#886cff] transition-colors" style={{ color: '#AAAAAA' }}>Plan</span>
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded"
                style={{
                  background: planStatus === 'trial' ? '#886cff' : '#1A1A1A',
                  color: '#FFFFFF',
                  letterSpacing: '0.05em',
                }}>
                {plan} {planStatus === 'trial' ? '(trial)' : ''}
              </span>
            </Link>
            <button onClick={handleSignOut}
              className="w-full flex items-center gap-2 text-left text-xs mt-3 px-0 py-1.5 transition-colors"
              style={{ color: '#CCCCCC' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FF4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#CCCCCC'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Sign out
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}
