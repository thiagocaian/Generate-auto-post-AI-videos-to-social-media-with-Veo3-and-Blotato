'use client'

import Link from 'next/link'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

// ── Data ──────────────────────────────────────────────────────────────────────

const weeklyTransactions = [
  { day: 'Mon', intake: 12, exit: 8 },
  { day: 'Tue', intake: 18, exit: 14 },
  { day: 'Wed', intake: 9,  exit: 22 },
  { day: 'Thu', intake: 24, exit: 11 },
  { day: 'Fri', intake: 16, exit: 18 },
  { day: 'Sat', intake: 6,  exit: 4  },
  { day: 'Sun', intake: 3,  exit: 2  },
]

const stockByCategory = [
  { cat: 'Cables',   qty: 148 },
  { cat: 'Conduit',  qty: 72  },
  { cat: 'Switches', qty: 54  },
  { cat: 'DALI',     qty: 11  },
  { cat: 'MCB',      qty: 39  },
  { cat: 'Other',    qty: 26  },
]

const compliancePie = [
  { name: 'AS3012',    value: 18, color: '#1D4ED8' },
  { name: 'RCD',       value: 9,  color: '#0891B2' },
  { name: 'HV',        value: 4,  color: '#D97706' },
  { name: 'Emergency', value: 7,  color: '#7C3AED' },
]

const activities = [
  { action: 'Work order assigned',         detail: 'WO-2057 — Jake Brennan · Madeline Tower L12 MSB', time: '1h ago',  color: '#D97706' },
  { action: 'Compliance report generated', detail: 'AS3012 CR-0041 · Madeline Tower L12 — PASS',      time: '3h ago',  color: '#16A34A' },
  { action: 'Stock exit registered',       detail: 'Cable 2.5mm² — 50m · Madeline Tower',             time: '5h ago',  color: '#DC2626' },
  { action: 'Low stock alert',             detail: 'DALI Controller — 3 remaining (minimum: 5)',       time: '6h ago',  color: '#D97706' },
  { action: 'Marketing post published',    detail: 'Madeline Tower render — Instagram & TikTok',       time: '1d ago',  color: '#7C3AED' },
]

const agents = [
  { name: 'Stock Guardian',    module: 'Warehouse Management',  href: '/warehouse',       status: 'Operational', lastAction: 'Low stock alert — DALI Controller',  time: '5h ago',  accent: '#1D4ED8' },
  { name: 'Quote Master',      module: 'Quoting & Estimating',  href: '/quotes',          status: 'Operational', lastAction: 'AI quote generated — Madeline L2',   time: '2h ago',  accent: '#7C3AED' },
  { name: 'Field Commander',   module: 'Subcontractor Manager', href: '/field-commander', status: 'Operational', lastAction: 'WO-2057 assigned — Jake Brennan',     time: '1h ago',  accent: '#D97706' },
  { name: 'Compliance Shield', module: 'AS3012 Reporting',      href: '/compliance',      status: 'Operational', lastAction: 'Report CR-0041 filed — PASS',         time: '3h ago',  accent: '#16A34A' },
  { name: 'Content Engine',    module: 'Marketing Automation',  href: '/marketing',       status: 'Operational', lastAction: 'Post published — Instagram & TikTok', time: '1d ago',  accent: '#0891B2' },
]

const projects = [
  { name: 'Madeline Tower',   client: 'Mosaic Property Group',  budget: '$850K', pct: 72, color: '#1D4ED8' },
  { name: 'Miles Residences', client: 'Hutchinson Builders',    budget: '$420K', pct: 45, color: '#0891B2' },
  { name: 'Griffith Uni',     client: 'Griffith University',    budget: '$180K', pct: 88, color: '#7C3AED' },
]

// ── Tooltip ───────────────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: { color: string; name: string; value: number }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, padding: '8px 12px', fontSize: 12 }}>
      <p style={{ color: '#6B7280', fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

// ── Nav icons (SVG, no emoji) ─────────────────────────────────────────────────

const icons: Record<string, JSX.Element> = {
  dashboard: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  warehouse: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    </svg>
  ),
  quotes: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  field: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  compliance: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  marketing: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="flex min-h-screen" style={{ background: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}>
        <div className="px-5 py-5" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded flex items-center justify-center text-white font-black text-xs"
              style={{ background: '#1D4ED8' }}>C</div>
            <div>
              <div className="font-bold text-sm tracking-wider" style={{ color: '#111827', letterSpacing: '0.08em' }}>CYTRON</div>
              <div className="text-xs" style={{ color: '#9CA3AF' }}>Automation Platform</div>
            </div>
          </div>
        </div>

        <div className="mx-3 mt-4 px-3 py-2.5 rounded" style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#93C5FD' }}>Active Client</div>
          <div className="font-semibold text-sm" style={{ color: '#1E3A8A' }}>Maco Electrics</div>
          <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#3B82F6' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#3B82F6' }}></span>
            Gold Coast, QLD
          </div>
        </div>

        <nav className="flex-1 px-3 mt-5 space-y-0.5">
          {[
            { label: 'Dashboard',      href: '/',                icon: icons.dashboard,   active: true  },
            { label: 'Warehouse',      href: '/warehouse',       icon: icons.warehouse,   badge: '2'    },
            { label: 'Quoting',        href: '/quotes',          icon: icons.quotes                     },
            { label: 'Subcontractors', href: '/field-commander', icon: icons.field                      },
            { label: 'Compliance',     href: '/compliance',      icon: icons.compliance                 },
            { label: 'Marketing AI',   href: '/marketing',       icon: icons.marketing                  },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-colors"
              style={item.active
                ? { background: '#EFF6FF', color: '#1D4ED8' }
                : { color: '#6B7280' }
              }
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                {item.label}
              </div>
              {item.badge && (
                <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                  style={{ background: '#FEF3C7', color: '#92400E' }}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 text-xs" style={{ borderTop: '1px solid #E5E7EB', color: '#D1D5DB' }}>
          v1.0.0 &middot; Build 2026.03
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-8 py-3.5"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          <div>
            <h1 className="text-base font-semibold" style={{ color: '#111827' }}>Operations Dashboard</h1>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Sunday, 22 March 2026 &middot; Real-time overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5"
              style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: '#16A34A' }}></span>
              5 Agents Online
            </div>
            <div className="text-xs px-3 py-1.5 rounded font-medium"
              style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>
              QLD &middot; Australia
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: '#1D4ED8' }}>M</div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

          {/* ── KPI row ── */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Active Projects',  value: '3',       sub: 'Madeline · Miles · Griffith', trend: 'On Track',  up: true  },
              { label: 'Warehouse Value',  value: '$24,850', sub: '12 SKUs tracked',              trend: '+8% wk',    up: true  },
              { label: 'Social Reach',     value: '691',     sub: 'Instagram + TikTok',           trend: '+12% mo',   up: true  },
              { label: 'Stock Alerts',     value: '2',       sub: 'DALI · MCB below minimum',     trend: 'Action req',up: false },
            ].map((k, i) => (
              <div key={i} className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>{k.label}</p>
                <p className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>{k.value}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>{k.sub}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{
                      background: k.up ? '#F0FDF4' : '#FEF2F2',
                      color: k.up ? '#15803D' : '#DC2626',
                    }}>
                    {k.up ? '▲' : '▼'} {k.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Charts row ── */}
          <div className="grid grid-cols-3 gap-4">

            {/* Area chart */}
            <div className="col-span-2 rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>Warehouse Transactions</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Stock intake vs exit — this week</p>
                </div>
                <div className="flex gap-4 text-xs" style={{ color: '#6B7280' }}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 inline-block rounded" style={{ background: '#1D4ED8' }}></span>Intake
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 inline-block rounded" style={{ background: '#0891B2' }}></span>Exit
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={weeklyTransactions} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gIntake" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1D4ED8" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="gExit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0891B2" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#0891B2" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="intake" name="Intake" stroke="#1D4ED8" strokeWidth={2} fill="url(#gIntake)" dot={false} />
                  <Area type="monotone" dataKey="exit"   name="Exit"   stroke="#0891B2" strokeWidth={2} fill="url(#gExit)"   dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Donut chart */}
            <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div className="mb-4">
                <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>Compliance Reports</h3>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>38 total reports by type</p>
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={compliancePie} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                    paddingAngle={2} dataKey="value">
                    {compliancePie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
                {compliancePie.map((e, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: '#374151' }}>
                    <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: e.color }}></span>
                    {e.name}
                    <span className="ml-auto font-semibold" style={{ color: '#111827' }}>{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom row ── */}
          <div className="grid grid-cols-3 gap-4">

            {/* Stock bar chart */}
            <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <h3 className="text-sm font-semibold mb-1" style={{ color: '#111827' }}>Stock by Category</h3>
              <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>Current units on hand</p>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={stockByCategory} layout="vertical" margin={{ top: 0, right: 4, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="cat" type="category" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="qty" name="Units" radius={[0, 3, 3, 0]}>
                    {stockByCategory.map((e, i) => (
                      <Cell key={i} fill={e.qty < 15 ? '#DC2626' : '#1D4ED8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Agents */}
            <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>AI Agents</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>All 5 agents operational</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded font-semibold"
                  style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
                  5 Online
                </span>
              </div>
              <div className="space-y-2">
                {agents.map((a, i) => (
                  <Link key={i} href={a.href}
                    className="flex items-center gap-3 px-3 py-2 rounded transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #F3F4F6' }}>
                    <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: a.accent }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate" style={{ color: '#111827' }}>{a.name}</div>
                      <div className="text-xs truncate" style={{ color: '#9CA3AF' }}>{a.lastAction}</div>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: '#D1D5DB' }}>{a.time}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Projects + Activity */}
            <div className="flex flex-col gap-4">

              {/* Projects */}
              <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#111827' }}>Active Projects</h3>
                <div className="space-y-3">
                  {projects.map((p, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-xs font-semibold" style={{ color: '#111827' }}>{p.name}</span>
                          <span className="text-xs ml-2" style={{ color: '#9CA3AF' }}>{p.budget}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: p.color }}>{p.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                        <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div className="flex-1 rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#111827' }}>Recent Activity</h3>
                <div className="space-y-0">
                  {activities.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-2"
                      style={{ borderBottom: i < activities.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color: '#374151' }}>{item.action}</p>
                        <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{item.detail}</p>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: '#D1D5DB' }}>{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ── Status bar ── */}
          <div className="rounded-lg px-5 py-3 flex items-center justify-between"
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D1D5DB' }}>System Status</span>
            <div className="flex items-center gap-6">
              {['Database', 'n8n Workflows', 'Supabase', 'Vercel'].map((s) => (
                <div key={s} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#16A34A' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#16A34A' }}></span>
                  {s}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
