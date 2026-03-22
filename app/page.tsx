'use client'

import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts'

// ── Data ──────────────────────────────────────────────────────────────────────

const budgetBreakdown = [
  { name: 'Labour',          value: 398000, color: '#1D4ED8' },
  { name: 'Materials',       value: 310000, color: '#0891B2' },
  { name: 'Sub-Contracting', value: 142000, color: '#7C3AED' },
  { name: 'Other',           value: 87000,  color: '#D97706' },
]
const totalBudget  = 1450000
const totalUsed    = budgetBreakdown.reduce((a, b) => a + b.value, 0)
const budgetPct    = Math.round((totalUsed / totalBudget) * 100)

const costData = [
  { cat: 'Labour',    budget: 420000, actual: 398000 },
  { cat: 'Materials', budget: 280000, actual: 310000 },
  { cat: 'Other',     budget: 100000, actual: 87000  },
  { cat: 'Sub-Cont.', budget: 150000, actual: 142000 },
]

const gates = [
  { id: 'GATE 1', name: 'Electrical Rough-In',       status: 'passed',     date: '24/01/2026', start: 0,   width: 22 },
  { id: 'GATE 2', name: 'MSB Installation',           status: 'passed',     date: '07/08/2026', start: 22,  width: 28 },
  { id: 'GATE 3', name: 'Testing & Commissioning',    status: 'in-progress',date: '23/12/2026', start: 50,  width: 30 },
  { id: 'GATE 4', name: 'Final AS3012 Inspection',    status: 'pending',    date: '15/02/2027', start: 80,  width: 20 },
]

const gateStatus: Record<string, { label: string; bg: string; color: string }> = {
  passed:      { label: 'Passed',      bg: '#DCFCE7', color: '#15803D' },
  'in-progress':{ label: 'In Progress', bg: '#FEF9C3', color: '#92400E' },
  pending:     { label: 'Pending',     bg: '#FEE2E2', color: '#DC2626' },
}

// Risk matrix: rows = impact, cols = likelihood
const impactLabels     = ['Severe', 'Major', 'Moderate', 'Minor', 'Insignificant']
const likelihoodLabels = ['Remote', 'Unlikely', 'Possible', 'Likely', 'Almost Certain']
const riskMatrix = [
  [3, 3, 4, 4, 4],
  [2, 3, 3, 4, 4],
  [1, 2, 3, 3, 4],
  [1, 1, 2, 3, 3],
  [1, 1, 1, 2, 2],
]
const riskDots: { row: number; col: number; label: string }[] = [
  { row: 0, col: 2, label: 'R1' },
  { row: 1, col: 3, label: 'R2' },
  { row: 2, col: 1, label: 'R3' },
  { row: 3, col: 4, label: 'R4' },
]
const riskColors = ['', '#DCFCE7', '#FEF9C3', '#FED7AA', '#FEE2E2']
const riskText   = ['', '#15803D', '#92400E', '#C2410C', '#DC2626']

const projects = [
  { name: 'Madeline Tower',   client: 'Mosaic Property Group', budget: 850000,  spent: 612000, pct: 72, status: 'On Track',  color: '#1D4ED8' },
  { name: 'Miles Residences', client: 'Hutchinson Builders',   budget: 420000,  spent: 189000, pct: 45, status: 'On Track',  color: '#0891B2' },
  { name: 'Griffith Uni',     client: 'Griffith University',   budget: 180000,  spent: 158000, pct: 88, status: 'Closing',   color: '#7C3AED' },
]

const activities = [
  { action: 'Work order assigned',         detail: 'WO-2057 — Jake Brennan · Madeline Tower L12',   time: '1h ago',  color: '#D97706' },
  { action: 'Compliance report generated', detail: 'AS3012 CR-0041 · Madeline Tower L12 — PASS',     time: '3h ago',  color: '#16A34A' },
  { action: 'Stock exit registered',       detail: 'Cable 2.5mm² 50m · Madeline Tower',             time: '5h ago',  color: '#DC2626' },
  { action: 'Low stock alert',             detail: 'DALI Controller — 3 remaining (min: 5)',          time: '6h ago',  color: '#D97706' },
  { action: 'Marketing post published',    detail: 'Madeline Tower render — Instagram & TikTok',      time: '1d ago',  color: '#7C3AED' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}K`
}

// Semi-circle gauge (SVG)
function Gauge({ pct, label }: { pct: number; label: string }) {
  const r = 62, cx = 80, cy = 78
  const clamp = Math.min(Math.max(pct, 0), 100) / 100
  const angle  = clamp * Math.PI
  const x2     = cx + r * Math.cos(Math.PI - angle)
  const y2     = cy - r * Math.sin(Math.PI - angle)
  const large  = clamp > 0.5 ? 1 : 0
  return (
    <svg viewBox="0 0 160 90" width="160" height="90">
      {/* BG arc */}
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#F3F4F6" strokeWidth="10" strokeLinecap="round" />
      {/* Active arc */}
      {clamp > 0 && (
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
          fill="none" stroke="#1D4ED8" strokeWidth="10" strokeLinecap="round" />
      )}
      {/* Needle */}
      <line
        x1={cx} y1={cy}
        x2={cx + (r - 14) * Math.cos(Math.PI - angle)}
        y2={cy - (r - 14) * Math.sin(Math.PI - angle)}
        stroke="#111827" strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill="#111827" />
      {/* Labels */}
      <text x={cx - r + 2} y={cy + 14} fontSize="9" fill="#9CA3AF">0</text>
      <text x={cx + r - 10} y={cy + 14} fontSize="9" fill="#9CA3AF">100</text>
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">{pct}</text>
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize="8" fill="#9CA3AF">{label}</text>
    </svg>
  )
}

// Sidebar icon set (SVG only, no emoji)
const NavIcon = ({ path, vb = '0 0 24 24' }: { path: string; vb?: string }) => (
  <svg width="16" height="16" viewBox={vb} fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
)

const ChartTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
      <p style={{ color: '#6B7280', fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <b>${(p.value / 1000).toFixed(0)}K</b></p>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="flex min-h-screen text-sm" style={{ background: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Narrow icon sidebar ── */}
      <aside className="w-14 flex-shrink-0 flex flex-col items-center py-4 gap-5"
        style={{ background: '#1E293B', borderRight: '1px solid #0F172A' }}>
        {/* Logo */}
        <div className="w-8 h-8 rounded flex items-center justify-center font-black text-xs text-white mb-2"
          style={{ background: '#1D4ED8' }}>C</div>
        {/* Nav links */}
        {[
          { href: '/',                icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',           active: true  },
          { href: '/warehouse',       icon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' },
          { href: '/quotes',          icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' },
          { href: '/field-commander', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' },
          { href: '/compliance',      icon: 'M9 11l3 3L22 4' },
          { href: '/marketing',       icon: 'M15 10l4.553-2.069A1 1 0 0121 8.806v6.388a1 1 0 01-1.447.894L15 14M3 8h12v8H3z' },
        ].map((item, i) => (
          <Link key={i} href={item.href}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            style={item.active
              ? { background: '#1D4ED8', color: '#FFFFFF' }
              : { color: '#64748B' }
            }>
            <NavIcon path={item.icon} />
          </Link>
        ))}
      </aside>

      {/* ── Wide content sidebar ── */}
      <aside className="w-52 flex-shrink-0 flex flex-col"
        style={{ background: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}>
        <div className="px-4 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <div className="font-bold text-xs tracking-widest mb-0.5" style={{ color: '#111827' }}>CYTRON</div>
          <div className="text-xs" style={{ color: '#9CA3AF' }}>Automation Platform</div>
        </div>

        <div className="px-4 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#CBD5E1' }}>Client</div>
          <div className="font-semibold text-xs" style={{ color: '#111827' }}>Maco Electrics Pty Ltd</div>
          <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: '#16A34A' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: '#16A34A' }}></span>
            Gold Coast, QLD
          </div>
        </div>

        {/* Project selector */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#CBD5E1' }}>Projects</div>
          {projects.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 cursor-pointer rounded px-1 hover:bg-gray-50">
              <div>
                <div className="text-xs font-medium" style={{ color: '#374151' }}>{p.name}</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>{p.client.split(' ')[0]}</div>
              </div>
              <div className="text-xs font-semibold" style={{ color: p.color }}>{p.pct}%</div>
            </div>
          ))}
        </div>

        {/* Module links */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {[
            { label: 'Overview',     active: true  },
            { label: 'Status'                       },
            { label: 'Finances'                     },
            { label: 'Work Orders'                  },
            { label: 'Compliance'                   },
            { label: 'Activity Feed'                },
          ].map((item) => (
            <div key={item.label}
              className="px-3 py-1.5 rounded text-xs font-medium cursor-pointer"
              style={item.active ? { background: '#EFF6FF', color: '#1D4ED8' } : { color: '#6B7280' }}>
              {item.label}
            </div>
          ))}
        </nav>

        <div className="px-4 py-3 text-xs" style={{ borderTop: '1px solid #E5E7EB', color: '#D1D5DB' }}>
          v1.0 &middot; Build 2026.03
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#9CA3AF' }}>
            <span style={{ color: '#1D4ED8', fontWeight: 600 }}>Maco Electrics</span>
            <span>/</span>
            <span style={{ color: '#374151', fontWeight: 600 }}>Project Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs" style={{ color: '#9CA3AF' }}>Last updated: 22/03/2026 14:36</div>
            <div className="px-3 py-1 rounded text-xs font-semibold"
              style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse mr-1.5" style={{ background: '#16A34A' }}></span>
              5 Agents Online
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: '#1D4ED8' }}>M</div>
          </div>
        </header>

        {/* Tab strip */}
        <div className="flex items-center gap-0 px-6"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          {['Overview', 'Status', 'Scope', 'Labour & Finances', 'Work Orders', 'Compliance', 'Activity Feed'].map((t, i) => (
            <div key={t} className="px-4 py-2.5 text-xs font-medium cursor-pointer"
              style={i === 0
                ? { color: '#1D4ED8', borderBottom: '2px solid #1D4ED8' }
                : { color: '#6B7280', borderBottom: '2px solid transparent' }}>
              {t}
            </div>
          ))}
        </div>

        {/* Scrollable dashboard */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── Row 1: Budget gauge + Progress gauge + KPIs ── */}
          <div className="grid grid-cols-4 gap-4">

            {/* Used Budget donut */}
            <div className="rounded-lg p-4 col-span-1" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Used Budget</div>
              <div className="flex items-center justify-between mb-2">
                <ResponsiveContainer width={90} height={90}>
                  <PieChart>
                    <Pie data={[
                      { value: totalUsed    },
                      { value: totalBudget - totalUsed },
                    ]} cx="50%" cy="50%" innerRadius={28} outerRadius={40} startAngle={90} endAngle={-270} dataKey="value" paddingAngle={2}>
                      <Cell fill="#1D4ED8" />
                      <Cell fill="#F3F4F6" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 pl-2">
                  <div className="text-lg font-black" style={{ color: '#111827' }}>{fmt(totalUsed)}</div>
                  <div className="text-xs" style={{ color: '#9CA3AF' }}>of {fmt(totalBudget)}</div>
                  <div className="text-xs font-semibold mt-1" style={{ color: '#1D4ED8' }}>{budgetPct}% used</div>
                </div>
              </div>
              <div className="space-y-1 mt-2">
                {budgetBreakdown.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm" style={{ background: b.color }}></div>
                      <span style={{ color: '#6B7280' }}>{b.name}</span>
                    </div>
                    <span className="font-semibold" style={{ color: '#374151' }}>{fmt(b.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress gauge */}
            <div className="rounded-lg p-4 col-span-1 flex flex-col items-center justify-center"
              style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-2 self-start" style={{ color: '#9CA3AF' }}>Project Progress</div>
              <Gauge pct={68} label="overall %" />
              <div className="grid grid-cols-3 gap-2 w-full mt-3">
                {[
                  { label: 'Madeline', val: '72%', color: '#1D4ED8' },
                  { label: 'Miles',    val: '45%', color: '#0891B2' },
                  { label: 'Griffith', val: '88%', color: '#7C3AED' },
                ].map((p, i) => (
                  <div key={i} className="text-center">
                    <div className="text-sm font-bold" style={{ color: p.color }}>{p.val}</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>{p.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* KPI cards: 2 stacked per column */}
            <div className="col-span-2 grid grid-cols-2 gap-3">
              {[
                { label: 'Active Projects',   value: '3',       sub: '3 sites active',         up: true,  trend: 'On Schedule' },
                { label: 'Open Work Orders',  value: '12',      sub: '4 due this week',        up: null,  trend: 'Review req.'  },
                { label: 'Compliance Reports',value: '38',      sub: '2 pending sign-off',     up: true,  trend: '94% Pass Rate'},
                { label: 'Stock Alerts',      value: '2',       sub: 'DALI · MCB',             up: false, trend: 'Action req.'  },
              ].map((k, i) => (
                <div key={i} className="rounded-lg p-4 flex flex-col justify-between"
                  style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                  <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>{k.label}</div>
                  <div className="text-2xl font-black" style={{ color: '#111827' }}>{k.value}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>{k.sub}</span>
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{
                      background: k.up === true ? '#F0FDF4' : k.up === false ? '#FEF2F2' : '#FEF9C3',
                      color:      k.up === true ? '#15803D' : k.up === false ? '#DC2626' : '#92400E',
                    }}>{k.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Row 2: Gates Timeline + Gate table ── */}
          <div className="grid grid-cols-2 gap-4">

            {/* Timeline */}
            <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Gates Timeline</div>
                <div className="flex items-center gap-1 text-xs" style={{ color: '#9CA3AF' }}>
                  <div className="w-16 h-0.5 rounded" style={{ background: '#1D4ED8' }}></div>
                  Current phase
                </div>
              </div>
              {/* Scale */}
              <div className="flex justify-between text-xs mb-1" style={{ color: '#CBD5E1' }}>
                <span>Jan 26</span><span>Apr 26</span><span>Jul 26</span><span>Oct 26</span><span>Jan 27</span>
              </div>
              {/* Current line */}
              <div className="relative">
                <div className="absolute top-0 bottom-0" style={{ left: '50%', width: 1, background: '#1D4ED8', opacity: 0.4 }} />
                <div className="space-y-2">
                  {gates.map((g, i) => {
                    const s = gateStatus[g.status]
                    return (
                      <div key={i} className="relative flex items-center gap-2">
                        <div className="text-xs w-14 flex-shrink-0 font-medium" style={{ color: '#6B7280' }}>{g.id}</div>
                        <div className="flex-1 relative h-5 rounded" style={{ background: '#F9FAFB' }}>
                          <div className="absolute top-0 bottom-0 rounded" style={{
                            left: `${g.start}%`, width: `${g.width}%`,
                            background: s.bg, border: `1px solid ${s.color}33`
                          }} />
                          <div className="absolute inset-0 flex items-center px-2">
                            <span className="text-xs font-medium truncate" style={{ color: s.color }}>{g.name}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Gate status table */}
            <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#9CA3AF' }}>Gates</div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                    {['Gate', 'Name', 'Status', 'Date'].map((h) => (
                      <th key={h} className="text-left pb-2 text-xs font-semibold" style={{ color: '#9CA3AF' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gates.map((g, i) => {
                    const s = gateStatus[g.status]
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                        <td className="py-2 text-xs font-semibold" style={{ color: '#374151' }}>{g.id}</td>
                        <td className="py-2 text-xs" style={{ color: '#6B7280' }}>{g.name}</td>
                        <td className="py-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded"
                            style={{ background: s.bg, color: s.color }}>{s.label}</span>
                        </td>
                        <td className="py-2 text-xs" style={{ color: '#9CA3AF' }}>{g.date}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Agent status strip */}
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#CBD5E1' }}>AI Agents</div>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { name: 'Stock Guardian',    href: '/warehouse',       color: '#1D4ED8' },
                    { name: 'Quote Master',       href: '/quotes',          color: '#7C3AED' },
                    { name: 'Field Commander',    href: '/field-commander', color: '#D97706' },
                    { name: 'Compliance Shield',  href: '/compliance',      color: '#16A34A' },
                    { name: 'Content Engine',     href: '/marketing',       color: '#0891B2' },
                  ].map((a, i) => (
                    <Link key={i} href={a.href}
                      className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-50 text-xs"
                      style={{ color: '#374151' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: a.color }}></div>
                        {a.name}
                      </div>
                      <span className="font-medium" style={{ color: '#16A34A' }}>Operational</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 3: Risk matrix + Budget vs Actual ── */}
          <div className="grid grid-cols-2 gap-4">

            {/* Risk matrix */}
            <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Project Risks</div>
              <div className="flex gap-3">
                {/* Y axis label */}
                <div className="flex items-center">
                  <div className="text-xs font-semibold" style={{ color: '#9CA3AF', writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.1em' }}>
                    IMPACT
                  </div>
                </div>
                <div className="flex-1">
                  {/* Matrix */}
                  {riskMatrix.map((row, ri) => (
                    <div key={ri} className="flex gap-0.5 mb-0.5">
                      <div className="w-20 flex items-center text-xs flex-shrink-0" style={{ color: '#6B7280' }}>
                        {impactLabels[ri]}
                      </div>
                      {row.map((cell, ci) => {
                        const dot = riskDots.find(d => d.row === ri && d.col === ci)
                        return (
                          <div key={ci} className="flex-1 h-9 rounded flex items-center justify-center relative"
                            style={{ background: riskColors[cell] }}>
                            {dot && (
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ background: riskText[cell], color: '#fff' }}>
                                {dot.label.replace('R', '')}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                  {/* X axis */}
                  <div className="flex mt-1">
                    <div className="w-20 flex-shrink-0"></div>
                    {likelihoodLabels.map((l) => (
                      <div key={l} className="flex-1 text-center" style={{ fontSize: 8, color: '#9CA3AF' }}>{l}</div>
                    ))}
                  </div>
                  <div className="text-center text-xs font-semibold mt-1" style={{ color: '#9CA3AF', letterSpacing: '0.1em' }}>
                    LIKELIHOOD
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="flex gap-3 mt-3 pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
                {[
                  { label: 'Low',      color: '#DCFCE7' },
                  { label: 'Medium',   color: '#FEF9C3' },
                  { label: 'High',     color: '#FED7AA' },
                  { label: 'Critical', color: '#FEE2E2' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: '#6B7280' }}>
                    <div className="w-3 h-3 rounded-sm border" style={{ background: l.color, borderColor: '#E5E7EB' }}></div>
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Budget vs Actual */}
            <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Costs — Budgeted vs Actual</div>
                </div>
                <div className="flex gap-4 text-xs" style={{ color: '#6B7280' }}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded inline-block" style={{ background: '#1D4ED8' }}></span>Budget
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded inline-block" style={{ background: '#0891B2' }}></span>Actual
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={costData} margin={{ top: 0, right: 4, left: -10, bottom: 0 }} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="cat" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="budget" name="Budget" fill="#1D4ED8" radius={[3, 3, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="actual"  name="Actual"  fill="#0891B2" radius={[3, 3, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>

              {/* Activity */}
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#CBD5E1' }}>Activity Feed</div>
                {activities.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5"
                    style={{ borderBottom: i < 2 ? '1px solid #F9FAFB' : 'none' }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium" style={{ color: '#374151' }}>{item.action}</span>
                      <span className="text-xs ml-1" style={{ color: '#9CA3AF' }}>— {item.detail}</span>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: '#D1D5DB' }}>{item.time}</span>
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
