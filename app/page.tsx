import Link from 'next/link'

const agents = [
  {
    id: 'stock-guardian',
    name: 'STOCK GUARDIAN',
    module: 'Warehouse',
    icon: '📦',
    status: 'online',
    lastAction: 'Low stock alert sent — DALI Controller',
    lastTime: '5h ago',
    capabilities: ['Monitor stock levels', 'Trigger reorder alerts', 'QR scan intake/exit', 'n8n → Telegram + Email'],
    color: '#2563EB',
    bg: '#EFF6FF',
    href: '/warehouse',
  },
  {
    id: 'quote-master',
    name: 'QUOTE MASTER',
    module: 'Quoting',
    icon: '📋',
    status: 'online',
    lastAction: 'AI quote generated — Madeline Tower Stage 2',
    lastTime: '2h ago',
    capabilities: ['Parse project specs', 'Generate itemised quote', 'Digital signature flow', 'PDF delivery'],
    color: '#7C3AED',
    bg: '#F5F3FF',
    href: '/quotes',
  },
  {
    id: 'field-commander',
    name: 'FIELD COMMANDER',
    module: 'Subcontractors',
    icon: '👷',
    status: 'online',
    lastAction: 'Work order WO-2047 assigned — Jake Brennan checked in',
    lastTime: '1h ago',
    capabilities: ['Assign work orders', 'GPS check-in/out', 'Compliance photo capture', 'Subcontractor payroll'],
    color: '#D97706',
    bg: '#FFFBEB',
    href: '/field-commander',
  },
  {
    id: 'compliance-shield',
    name: 'COMPLIANCE SHIELD',
    module: 'AS3012 Reporting',
    icon: '📄',
    status: 'online',
    lastAction: 'AS3012 report CR-0041 generated — Madeline Tower L12',
    lastTime: '3h ago',
    capabilities: ['AS3012 form auto-fill', 'Generate regulatory PDFs', 'Per-project archive', 'Regulatory submission'],
    color: '#059669',
    bg: '#ECFDF5',
    href: '/compliance',
  },
  {
    id: 'content-engine',
    name: 'CONTENT ENGINE',
    module: 'Marketing AI',
    icon: '🎬',
    status: 'online',
    lastAction: 'Madeline Tower render → Instagram + TikTok',
    lastTime: '1d ago',
    capabilities: ['Photo → Kling cinematic video', 'AI caption writer', 'Auto-post Instagram + TikTok', 'Content calendar'],
    color: '#DB2777',
    bg: '#FDF2F8',
    href: '/marketing',
  },
]

const kpis = [
  { label: 'Active Projects', value: '3', sub: 'Madeline · Miles · Griffith', icon: '🏗', color: '#2563EB', bg: '#EFF6FF' },
  { label: 'Warehouse Value', value: '$24,850', sub: '12 SKUs tracked', icon: '📦', color: '#00B050', bg: '#E8F5EE' },
  { label: 'Social Reach', value: '691', sub: '+12% this month', icon: '📊', color: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Stock Alerts', value: '2', sub: 'Requires attention', icon: '⚠️', color: '#D97706', bg: '#FFFBEB', alert: true },
]

const activities = [
  { action: 'Work order assigned', detail: 'WO-2047 → Jake Brennan · Madeline Tower L12 MSB', time: '1h ago', dot: '#D97706' },
  { action: 'Compliance report generated', detail: 'AS3012 CR-0041 · Madeline Tower L12 — PASS', time: '3h ago', dot: '#059669' },
  { action: 'Stock exit registered', detail: 'Cable 2.5mm² — 50m → Madeline Tower', time: '5h ago', dot: '#EF4444' },
  { action: 'Low stock alert sent', detail: 'DALI Controller — 3 remaining (min: 5)', time: '6h ago', dot: '#F59E0B' },
  { action: 'Marketing post published', detail: 'Madeline Tower render → Instagram + TikTok', time: '1d ago', dot: '#8B5CF6' },
]

const projects = [
  { name: 'Madeline Tower', client: 'Mosaic Property Group', floors: '40L', budget: '$850K', pct: 72 },
  { name: 'Miles Residences', client: 'Hutchinson Builders', floors: '15L', budget: '$420K', pct: 45 },
  { name: 'Griffith University', client: 'Griffith University', floors: '—', budget: '$180K', pct: 88 },
]

export default function Home() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F4F6F8' }}>

      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E9EF' }}>
        <div className="px-5 py-5" style={{ borderBottom: '1px solid #E5E9EF' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white" style={{ background: 'linear-gradient(135deg, #00B050, #007A32)' }}>
              C
            </div>
            <div>
              <div className="font-black text-base tracking-widest" style={{ color: '#1A1A2E' }}>CYTRON</div>
              <div className="text-xs" style={{ color: '#9CA3AF' }}>Automation Platform</div>
            </div>
          </div>
        </div>

        <div className="mx-3 mt-4 px-3 py-2.5 rounded-lg" style={{ background: '#E8F5EE', border: '1px solid #C8E6D4' }}>
          <div className="text-xs font-semibold mb-0.5" style={{ color: '#9CA3AF' }}>ACTIVE CLIENT</div>
          <div className="font-bold text-sm" style={{ color: '#1A1A2E' }}>Maco Electrics</div>
          <div className="text-xs font-medium flex items-center gap-1 mt-0.5" style={{ color: '#00B050' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#00B050' }}></span>
            Gold Coast, QLD
          </div>
        </div>

        <nav className="flex-1 px-3 mt-5 space-y-0.5">
          {[
            { label: 'Dashboard', href: '/', icon: '⊞', active: true },
            { label: 'Warehouse', href: '/warehouse', icon: '📦', badge: '2' },
            { label: 'Quoting', href: '/quotes', icon: '📋' },
            { label: 'Subcontractors', href: '/field-commander', icon: '👷' },
            { label: 'Compliance', href: '/compliance', icon: '📄' },
            { label: 'Marketing AI', href: '/marketing', icon: '🎬' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
              style={item.active
                ? { background: '#E8F5EE', color: '#00B050' }
                : { color: '#6B7280' }
              }
            >
              <div className="flex items-center gap-2.5">
                <span>{item.icon}</span>
                {item.label}
              </div>
              {item.badge && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#FEF3C7', color: '#D97706' }}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4" style={{ borderTop: '1px solid #E5E9EF' }}>
          <div className="text-xs" style={{ color: '#D1D5DB' }}>v1.0.0 · Build 2026.03</div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">

        <header className="flex items-center justify-between px-8 py-4" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E9EF' }}>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#1A1A2E' }}>Command Center</h1>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Sunday, 22 March 2026 · All systems operational</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5" style={{ background: '#E8F5EE', color: '#00B050' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00B050' }}></span>
              5 Agents Online
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: '#1A1A2E' }}>
              M
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6">

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E9EF' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: kpi.bg }}>
                    {kpi.icon}
                  </div>
                  {kpi.alert && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#FEF3C7', color: '#D97706' }}>
                      Action needed
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold mb-0.5" style={{ color: kpi.alert ? '#D97706' : kpi.color }}>
                  {kpi.value}
                </div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: '#1A1A2E' }}>{kpi.label}</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* AI Agents */}
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="font-bold" style={{ color: '#1A1A2E' }}>AI Agents</h2>
              <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Autonomous agents that run each module — always working in the background</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#E8F5EE', color: '#00B050' }}>2 online · 3 in development</span>
          </div>

          <div className="grid grid-cols-5 gap-3 mb-6">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={agent.href}
                className={`rounded-xl p-4 flex flex-col transition-all ${agent.status === 'online' ? 'hover:shadow-md cursor-pointer' : 'cursor-default'}`}
                style={{ background: '#FFFFFF', border: `1px solid ${agent.status === 'online' ? agent.color + '33' : '#E5E9EF'}` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: agent.bg }}>
                    {agent.icon}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'online' ? 'animate-pulse' : ''}`}
                      style={{ background: agent.status === 'online' ? '#00B050' : '#D1D5DB' }} />
                    <span className="text-xs" style={{ color: agent.status === 'online' ? '#00B050' : '#9CA3AF' }}>
                      {agent.status === 'online' ? 'Online' : 'Building'}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div className="font-black text-xs tracking-wider mb-0.5" style={{ color: agent.color }}>{agent.name}</div>
                <div className="text-xs mb-3" style={{ color: '#9CA3AF' }}>{agent.module}</div>

                {/* Capabilities */}
                <div className="flex-1 space-y-1 mb-3">
                  {agent.capabilities.slice(0, 3).map((cap, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: '#6B7280' }}>
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: agent.color }} />
                      {cap}
                    </div>
                  ))}
                </div>

                {/* Last action */}
                {agent.status === 'online' && (
                  <div className="pt-2" style={{ borderTop: '1px solid #F3F4F6' }}>
                    <div className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>{agent.lastAction}</div>
                    {agent.lastTime && <div className="text-xs mt-0.5" style={{ color: '#D1D5DB' }}>{agent.lastTime}</div>}
                  </div>
                )}
                {agent.status === 'building' && (
                  <div className="pt-2" style={{ borderTop: '1px solid #F3F4F6' }}>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                      <div className="h-full rounded-full" style={{ width: '35%', background: `linear-gradient(90deg, ${agent.color}66, ${agent.color})` }} />
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#D1D5DB' }}>In development</div>
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Activity */}
            <div className="col-span-2 rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E9EF' }}>
              <h3 className="font-bold text-sm mb-4" style={{ color: '#1A1A2E' }}>Recent Activity</h3>
              <div className="space-y-0">
                {activities.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-3" style={{ borderBottom: i < activities.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.dot }} />
                    <div className="flex-1">
                      <div className="text-xs font-semibold" style={{ color: '#1A1A2E' }}>{item.action}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{item.detail}</div>
                    </div>
                    <div className="text-xs flex-shrink-0" style={{ color: '#D1D5DB' }}>{item.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E9EF' }}>
              <h3 className="font-bold text-sm mb-4" style={{ color: '#1A1A2E' }}>Active Projects</h3>
              <div className="space-y-3">
                {projects.map((proj, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-xs" style={{ color: '#1A1A2E' }}>{proj.name}</div>
                      <div className="text-xs font-bold" style={{ color: '#00B050' }}>{proj.pct}%</div>
                    </div>
                    <div className="text-xs mb-2" style={{ color: '#9CA3AF' }}>{proj.client}</div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E9EF' }}>
                      <div className="h-full rounded-full" style={{ width: `${proj.pct}%`, background: 'linear-gradient(90deg, #007A32, #00B050)' }} />
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs" style={{ color: '#D1D5DB' }}>
                      <span>{proj.floors}</span>
                      <span>{proj.budget}</span>
                    </div>
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
