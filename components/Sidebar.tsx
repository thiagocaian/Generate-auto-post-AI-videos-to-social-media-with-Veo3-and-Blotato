import Link from 'next/link'

const navItems = [
  { label: 'Dashboard',      href: '/',                key: 'dashboard',    iconPath: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { label: 'Warehouse',      href: '/warehouse',       key: 'warehouse',    iconPath: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z', badge: '2' },
  { label: 'Quoting',        href: '/quotes',          key: 'quotes',       iconPath: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8' },
  { label: 'Subcontractors', href: '/field-commander', key: 'field',        iconPath: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  { label: 'Compliance',     href: '/compliance',      key: 'compliance',   iconPath: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
  { label: 'Marketing AI',   href: '/marketing',       key: 'marketing',    iconPath: 'M15 10l4.553-2.069A1 1 0 0121 8.806v6.388a1 1 0 01-1.447.894L15 14M3 8h12v8H3a1 1 0 01-1-1V9a1 1 0 011-1z' },
]

export default function Sidebar({ active }: { active: string }) {
  return (
    <div className="flex flex-shrink-0">
      {/* Narrow icon strip */}
      <aside className="w-14 flex flex-col items-center py-4 gap-4"
        style={{ background: '#1E293B', borderRight: '1px solid #0F172A' }}>
        <div className="w-8 h-8 rounded flex items-center justify-center font-black text-xs text-white mb-2"
          style={{ background: '#1D4ED8' }}>C</div>
        {navItems.map((item) => {
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
      </aside>

      {/* Wide label sidebar */}
      <aside className="w-52 flex flex-col"
        style={{ background: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}>
        <div className="px-4 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <div className="font-bold text-sm tracking-widest" style={{ color: '#111827', letterSpacing: '0.08em' }}>CYTRON</div>
          <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Automation Platform</div>
        </div>

        <div className="px-4 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#CBD5E1' }}>Active Client</div>
          <div className="font-semibold text-xs" style={{ color: '#111827' }}>Maco Electrics Pty Ltd</div>
          <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: '#16A34A' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: '#16A34A' }}></span>
            Gold Coast, QLD
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map((item) => {
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

        <div className="px-4 py-3 text-xs" style={{ borderTop: '1px solid #E5E7EB', color: '#D1D5DB' }}>
          v1.0 &middot; Build 2026.03
        </div>
      </aside>
    </div>
  )
}
