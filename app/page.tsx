'use client'

import Link from 'next/link'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

// ── Data ──────────────────────────────────────────────────────────────────────

const weeklyTransactions = [
  { day: 'Mon', intake: 12, exit: 8 },
  { day: 'Tue', intake: 18, exit: 14 },
  { day: 'Wed', intake: 9,  exit: 22 },
  { day: 'Thu', intake: 24, exit: 11 },
  { day: 'Fri', intake: 16, exit: 18 },
  { day: 'Sat', intake: 6,  exit: 4 },
  { day: 'Sun', intake: 3,  exit: 2 },
]

const stockByCategory = [
  { cat: 'Cables',    qty: 148 },
  { cat: 'Conduit',   qty: 72  },
  { cat: 'Switches',  qty: 54  },
  { cat: 'DALI',      qty: 11  },
  { cat: 'MCB',       qty: 39  },
  { cat: 'Other',     qty: 26  },
]

const projectProgress = [
  { name: 'Madeline Tower',    pct: 72, color: '#00B050', budget: '$850K', floors: '40L' },
  { name: 'Miles Residences',  pct: 45, color: '#3B82F6', budget: '$420K', floors: '15L' },
  { name: 'Griffith Uni',      pct: 88, color: '#8B5CF6', budget: '$180K', floors: '—'  },
]

const compliancePie = [
  { name: 'AS3012',     value: 18, color: '#00B050' },
  { name: 'RCD',        value: 9,  color: '#3B82F6' },
  { name: 'HV',         value: 4,  color: '#F59E0B' },
  { name: 'Emergency',  value: 7,  color: '#8B5CF6' },
]

const activities = [
  { action: 'Work order assigned',          detail: 'WO-2057 → Jake Brennan · Madeline Tower L12 MSB', time: '1h ago',  dot: '#F59E0B' },
  { action: 'Compliance report generated',  detail: 'AS3012 CR-0041 · Madeline Tower L12 — PASS',       time: '3h ago',  dot: '#00B050' },
  { action: 'Stock exit registered',        detail: 'Cable 2.5mm² — 50m → Madeline Tower',              time: '5h ago',  dot: '#EF4444' },
  { action: 'Low stock alert',              detail: 'DALI Controller — 3 remaining (min: 5)',            time: '6h ago',  dot: '#F59E0B' },
  { action: 'Marketing post published',     detail: 'Madeline Tower render → Instagram + TikTok',        time: '1d ago',  dot: '#8B5CF6' },
]

const agents = [
  { name: 'STOCK GUARDIAN',   module: 'Warehouse',       icon: '📦', color: '#3B82F6', href: '/warehouse',       lastAction: 'Low stock alert — DALI Controller', time: '5h ago' },
  { name: 'QUOTE MASTER',     module: 'Quoting',         icon: '📋', color: '#8B5CF6', href: '/quotes',          lastAction: 'AI quote generated — Madeline L2',  time: '2h ago' },
  { name: 'FIELD COMMANDER',  module: 'Subcontractors',  icon: '👷', color: '#F59E0B', href: '/field-commander', lastAction: 'WO-2057 assigned — Jake Brennan',    time: '1h ago' },
  { name: 'COMPLIANCE SHIELD',module: 'AS3012',          icon: '📄', color: '#00B050', href: '/compliance',      lastAction: 'Report CR-0041 — PASS',             time: '3h ago' },
  { name: 'CONTENT ENGINE',   module: 'Marketing AI',    icon: '🎬', color: '#EC4899', href: '/marketing',       lastAction: 'Instagram + TikTok published',       time: '1d ago' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, trend, trendUp }: {
  label: string; value: string; sub: string; icon: string; trend: string; trendUp: boolean
}) {
  return (
    <div className="rounded-xl p-5 flex flex-col gap-3" style={{ background: '#161B27', border: '1px solid #1F2937' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B7280' }}>{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-2xl font-black" style={{ color: '#F9FAFB' }}>{value}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: '#6B7280' }}>{sub}</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
          background: trendUp ? '#052e16' : '#450a0a',
          color: trendUp ? '#00B050' : '#EF4444'
        }}>
          {trend}
        </span>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#0F1117', border: '1px solid #1F2937', color: '#F9FAFB' }}>
        <p className="font-bold mb-1" style={{ color: '#9CA3AF' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
        ))}
      </div>
    )
  }
  return null
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="flex min-h-screen" style={{ background: '#0A0D14' }}>

      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: '#0F1117', borderRight: '1px solid #1F2937' }}>
        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid #1F2937' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #00B050, #007A32)' }}>C</div>
            <div>
              <div className="font-black text-sm tracking-widest" style={{ color: '#F9FAFB' }}>CYTRON</div>
              <div className="text-xs" style={{ color: '#4B5563' }}>Automation Platform</div>
            </div>
          </div>
        </div>

        {/* Client badge */}
        <div className="mx-3 mt-4 px-3 py-2.5 rounded-lg" style={{ background: '#052e16', border: '1px solid #064e23' }}>
          <div className="text-xs font-semibold mb-0.5" style={{ color: '#4B5563' }}>ACTIVE CLIENT</div>
          <div className="font-bold text-sm" style={{ color: '#F9FAFB' }}>Maco Electrics</div>
          <div className="text-xs font-medium flex items-center gap-1 mt-0.5" style={{ color: '#00B050' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: '#00B050' }}></span>
            Gold Coast, QLD
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 mt-5 space-y-0.5">
          {[
            { label: 'Dashboard',      href: '/',               icon: '▦',  active: true  },
            { label: 'Warehouse',      href: '/warehouse',      icon: '📦', badge: '2'    },
            { label: 'Quoting',        href: '/quotes',         icon: '📋'                },
            { label: 'Subcontractors', href: '/field-commander',icon: '👷'                },
            { label: 'Compliance',     href: '/compliance',     icon: '📄'                },
            { label: 'Marketing AI',   href: '/marketing',      icon: '🎬'                },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={item.active
                ? { background: '#052e16', color: '#00B050' }
                : { color: '#6B7280' }
              }
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{item.icon}</span>
                {item.label}
              </div>
              {item.badge && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#422006', color: '#F59E0B' }}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4" style={{ borderTop: '1px solid #1F2937' }}>
          <div className="text-xs" style={{ color: '#374151' }}>v1.0.0 · Build 2026.03</div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-7 py-3.5" style={{ background: '#0F1117', borderBottom: '1px solid #1F2937' }}>
          <div>
            <h1 className="text-base font-bold" style={{ color: '#F9FAFB' }}>Operations Dashboard</h1>
            <p className="text-xs mt-0.5" style={{ color: '#4B5563' }}>Sunday, 22 March 2026 · Real-time overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
              style={{ background: '#052e16', color: '#00B050', border: '1px solid #064e23' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00B050' }}></span>
              5 Agents Online
            </div>
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: '#161B27', color: '#6B7280', border: '1px solid #1F2937' }}>
              QLD · AUS
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #00B050, #007A32)' }}>M</div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">

          {/* ── KPI Row ── */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard label="Active Projects"  value="3"        sub="Madeline · Miles · Griffith"  icon="🏗"  trend="↑ On Track"  trendUp={true}  />
            <KpiCard label="Warehouse Value"  value="$24,850"  sub="12 SKUs tracked"               icon="📦"  trend="↑ +8% wk"   trendUp={true}  />
            <KpiCard label="Social Reach"     value="691"      sub="Instagram + TikTok"            icon="📊"  trend="↑ +12% mo"  trendUp={true}  />
            <KpiCard label="Stock Alerts"     value="2"        sub="DALI · Low MCB stock"          icon="⚠️"  trend="↓ Action"   trendUp={false} />
          </div>

          {/* ── Charts Row ── */}
          <div className="grid grid-cols-3 gap-4">

            {/* Weekly Transactions — Area */}
            <div className="col-span-2 rounded-xl p-5" style={{ background: '#161B27', border: '1px solid #1F2937' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: '#F9FAFB' }}>Warehouse Transactions</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#4B5563' }}>Stock intake vs exit — this week</p>
                </div>
                <div className="flex gap-3 text-xs" style={{ color: '#6B7280' }}>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#00B050' }}></span>Intake</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#3B82F6' }}></span>Exit</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={weeklyTransactions} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="intakeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00B050" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00B050" stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="exitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="intake" name="Intake" stroke="#00B050" strokeWidth={2} fill="url(#intakeGrad)" dot={false} />
                  <Area type="monotone" dataKey="exit"   name="Exit"   stroke="#3B82F6" strokeWidth={2} fill="url(#exitGrad)"   dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Compliance by Type — Pie */}
            <div className="rounded-xl p-5" style={{ background: '#161B27', border: '1px solid #1F2937' }}>
              <div className="mb-4">
                <h3 className="text-sm font-bold" style={{ color: '#F9FAFB' }}>Compliance Reports</h3>
                <p className="text-xs mt-0.5" style={{ color: '#4B5563' }}>38 total reports · by type</p>
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={compliancePie} cx="50%" cy="50%" innerRadius={36} outerRadius={58}
                    paddingAngle={3} dataKey="value">
                    {compliancePie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
                {compliancePie.map((e, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: '#9CA3AF' }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }}></span>
                    <span>{e.name}</span>
                    <span className="ml-auto font-bold" style={{ color: '#F9FAFB' }}>{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Stock + Agents row ── */}
          <div className="grid grid-cols-3 gap-4">

            {/* Stock by Category — Bar */}
            <div className="rounded-xl p-5" style={{ background: '#161B27', border: '1px solid #1F2937' }}>
              <div className="mb-4">
                <h3 className="text-sm font-bold" style={{ color: '#F9FAFB' }}>Stock by Category</h3>
                <p className="text-xs mt-0.5" style={{ color: '#4B5563' }}>Current units on hand</p>
              </div>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={stockByCategory} layout="vertical" margin={{ top: 0, right: 4, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="cat" type="category" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="qty" name="Units" radius={[0, 4, 4, 0]}>
                    {stockByCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.qty < 15 ? '#EF4444' : '#00B050'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* AI Agents */}
            <div className="col-span-2 rounded-xl p-5" style={{ background: '#161B27', border: '1px solid #1F2937' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: '#F9FAFB' }}>AI Agents</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#4B5563' }}>All 5 agents operational</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: '#052e16', color: '#00B050', border: '1px solid #064e23' }}>
                  ● 5 Online
                </span>
              </div>
              <div className="space-y-2">
                {agents.map((agent, i) => (
                  <Link key={i} href={agent.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:opacity-90"
                    style={{ background: '#0F1117', border: '1px solid #1F2937' }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: agent.color + '18' }}>
                      {agent.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-wider" style={{ color: agent.color }}>{agent.name}</span>
                        <span className="text-xs" style={{ color: '#374151' }}>·</span>
                        <span className="text-xs" style={{ color: '#4B5563' }}>{agent.module}</span>
                      </div>
                      <div className="text-xs truncate mt-0.5" style={{ color: '#6B7280' }}>{agent.lastAction}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs" style={{ color: '#374151' }}>{agent.time}</span>
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00B050' }} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Projects + Activity row ── */}
          <div className="grid grid-cols-3 gap-4">

            {/* Projects */}
            <div className="rounded-xl p-5" style={{ background: '#161B27', border: '1px solid #1F2937' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold" style={{ color: '#F9FAFB' }}>Active Projects</h3>
                <span className="text-xs" style={{ color: '#4B5563' }}>3 sites</span>
              </div>
              <div className="space-y-4">
                {projectProgress.map((proj, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <div className="text-xs font-semibold" style={{ color: '#F9FAFB' }}>{proj.name}</div>
                        <div className="text-xs" style={{ color: '#4B5563' }}>{proj.floors} · {proj.budget}</div>
                      </div>
                      <span className="text-sm font-black" style={{ color: proj.color }}>{proj.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#0F1117' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${proj.pct}%`, background: `linear-gradient(90deg, ${proj.color}99, ${proj.color})` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini stat row */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4" style={{ borderTop: '1px solid #1F2937' }}>
                {[
                  { label: 'Reports', val: '38' },
                  { label: 'Orders',  val: '12' },
                  { label: 'Subs',    val: '6'  },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-base font-black" style={{ color: '#F9FAFB' }}>{s.val}</div>
                    <div className="text-xs" style={{ color: '#4B5563' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity feed */}
            <div className="col-span-2 rounded-xl p-5" style={{ background: '#161B27', border: '1px solid #1F2937' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold" style={{ color: '#F9FAFB' }}>Recent Activity</h3>
                <span className="text-xs" style={{ color: '#4B5563' }}>Last 24h</span>
              </div>
              <div className="space-y-0">
                {activities.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-3"
                    style={{ borderBottom: i < activities.length - 1 ? '1px solid #1F2937' : 'none' }}>
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.dot }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold" style={{ color: '#E5E7EB' }}>{item.action}</div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: '#4B5563' }}>{item.detail}</div>
                    </div>
                    <div className="text-xs flex-shrink-0" style={{ color: '#374151' }}>{item.time}</div>
                  </div>
                ))}
              </div>

              {/* Status strip */}
              <div className="mt-4 pt-4 grid grid-cols-4 gap-3" style={{ borderTop: '1px solid #1F2937' }}>
                {[
                  { label: 'DB Connected',  ok: true  },
                  { label: 'n8n Active',    ok: true  },
                  { label: 'Supabase',      ok: true  },
                  { label: 'Vercel Deploy', ok: true  },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: s.ok ? '#00B050' : '#EF4444' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: s.ok ? '#00B050' : '#EF4444' }}></span>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
