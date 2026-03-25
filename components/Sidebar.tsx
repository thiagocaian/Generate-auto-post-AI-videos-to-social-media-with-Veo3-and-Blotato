'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LogoIcon } from '@/components/Logo'

type NavItem = { label: string; href: string; key: string; iconPath: string; badge?: string }

const navItems: NavItem[] = [
  { label: 'Dashboard',      href: '/',                key: 'dashboard',    iconPath: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { label: 'Warehouse',      href: '/warehouse',       key: 'warehouse',    iconPath: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' },
  { label: 'Quoting',        href: '/quotes',          key: 'quotes',       iconPath: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8' },
  { label: 'Subcontractors', href: '/field-commander', key: 'field',        iconPath: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  { label: 'Compliance',     href: '/compliance',      key: 'compliance',   iconPath: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
  { label: 'Marketing AI',   href: '/marketing',       key: 'marketing',    iconPath: 'M15 10l4.553-2.069A1 1 0 0121 8.806v6.388a1 1 0 01-1.447.894L15 14M3 8h12v8H3a1 1 0 01-1-1V9a1 1 0 011-1z' },
]

export default function Sidebar({ active }: { active: string }) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('Loading...')
  const [lowStockCount, setLowStockCount] = useState(0)

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email ?? null)

        // Get company name
        const { data: member } = await supabase
          .from('company_members')
          .select('companies(name)')
          .eq('user_id', user.id)
          .single()

        if (member?.companies) {
          const co = member.companies as unknown as { name: string }
          setCompanyName(co.name)
        }
      }

      // Get low stock count
      const { data: items } = await supabase
        .from('warehouse_items')
        .select('current_stock, minimum_stock')
      if (items) {
        setLowStockCount(items.filter(i => i.current_stock <= i.minimum_stock).length)
      }
    }
    loadUserData()
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
    <div className="flex flex-shrink-0">
      {/* Narrow icon strip */}
      <aside className="w-14 flex flex-col items-center py-4 gap-4"
        style={{ background: '#1E293B', borderRight: '1px solid #0F172A' }}>
        <div className="mb-2"></div>
        {navWithBadge.map((item) => {
          const isActive = item.key === active
          return (
            <Link key={item.key} href={item.href}
              title={item.label}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all relative"
              style={isActive ? { background: '#1D4ED8', color: '#FFFFFF' } : { color: '#64748B' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.iconPath} />
              </svg>
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: '#D97706', color: '#fff', fontSize: 9 }}>{item.badge}</span>
              )}
            </Link>
          )
        })}

        {/* Sign out at bottom */}
        <div className="mt-auto">
          <button onClick={handleSignOut} title="Sign out"
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            style={{ color: '#475569' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Wide label sidebar */}
      <aside className="w-52 flex flex-col"
        style={{ background: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}>
        <div className="px-4 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: '0.12em', color: '#111827', lineHeight: 1 }}>CYTRON</div>
          <div style={{ fontWeight: 500, fontSize: 9, letterSpacing: '0.08em', color: '#9CA3AF', marginTop: 3 }}>AI agents running your business.</div>
        </div>

        <div className="px-4 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#CBD5E1' }}>Active Client</div>
          <div className="font-semibold text-xs" style={{ color: '#111827' }}>{companyName}</div>
          <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: '#16A34A' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: '#16A34A' }}></span>
            Gold Coast, QLD
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navWithBadge.map((item) => {
            const isActive = item.key === active
            return (
              <Link key={item.key} href={item.href}
                className="flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors"
                style={isActive ? { background: '#EFF6FF', color: '#1D4ED8' } : { color: '#6B7280' }}>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                    style={{ background: '#FEF3C7', color: '#92400E' }}>{item.badge}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User info at bottom */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid #E5E7EB' }}>
          {userEmail && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: '#1D4ED8' }}>
                {userEmail[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: '#111827' }}>
                  {userEmail.split('@')[0]}
                </div>
                <div className="text-xs truncate" style={{ color: '#9CA3AF' }}>
                  {userEmail}
                </div>
              </div>
            </div>
          )}
          <button onClick={handleSignOut}
            className="w-full text-left text-xs px-2 py-1.5 rounded transition-colors"
            style={{ color: '#6B7280' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2', e.currentTarget.style.color = '#DC2626')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = '#6B7280')}>
            Sign out
          </button>
        </div>
      </aside>
    </div>
  )
}
