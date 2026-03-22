'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
type WorkOrderStatus = 'pending' | 'active' | 'completed' | 'issue'
type CheckinStatus = 'out' | 'in'

interface WorkOrder {
  id: string
  order_number: string
  title: string
  project_name: string
  location: string
  assignee_name: string
  trade: string
  status: WorkOrderStatus
  priority: 'high' | 'medium' | 'low'
  due_date: string
  estimated_hours: number
  tasks: string[]
  checkin_time?: string
  photo_logged?: boolean
}

interface Subcontractor {
  id: string
  name: string
  trade: string
  license: string
  phone: string
  status: CheckinStatus
  checkin_time?: string
  current_site?: string
  jobs_this_month: number
  rating: number
}

// ─── Data fetched from Supabase via API ───────────────────────────────────────

// ─── Sidebar nav ─────────────────────────────────────────────────────────────
const navItems = [
  { label: 'Dashboard',      href: '/',                icon: '⊞' },
  { label: 'Warehouse',      href: '/warehouse',       icon: '📦', badge: '2' },
  { label: 'Quoting',        href: '/quotes',          icon: '📋' },
  { label: 'Subcontractors', href: '/field-commander', icon: '👷', active: true },
  { label: 'Compliance',     href: '/compliance',      icon: '📄' },
  { label: 'Marketing AI',   href: '/marketing',       icon: '🎬' },
]

const statusConfig: Record<WorkOrderStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FFFBEB', dot: '#F59E0B' },
  active:    { label: 'Active',    color: '#2563EB', bg: '#EFF6FF', dot: '#3B82F6' },
  completed: { label: 'Completed', color: '#059669', bg: '#ECFDF5', dot: '#10B981' },
  issue:     { label: 'Issue',     color: '#DC2626', bg: '#FEF2F2', dot: '#EF4444' },
}

const priorityConfig = {
  high:   { label: 'High',   color: '#DC2626', bg: '#FEF2F2' },
  medium: { label: 'Medium', color: '#D97706', bg: '#FFFBEB' },
  low:    { label: 'Low',    color: '#059669', bg: '#ECFDF5' },
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FieldCommanderPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'team'>('orders')
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([])
  const [loading, setLoading] = useState(true)
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [newOrderForm, setNewOrderForm] = useState({ title: '', project: '', assignee: '', dueDate: '', notes: '' })
  const [orderCreated, setOrderCreated] = useState(false)

  useEffect(() => {
    fetch('/api/field-commander')
      .then(r => r.json())
      .then(d => {
        setWorkOrders(d.workOrders || [])
        setSubcontractors(d.subcontractors || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const onSite = subcontractors.filter(s => s.status === 'in').length
  const totalOrders = workOrders.length
  const activeOrders = workOrders.filter(w => w.status === 'active').length
  const issueOrders = workOrders.filter(w => w.status === 'issue').length

  async function handleCheckin(id: string, currentStatus: CheckinStatus) {
    const newStatus = currentStatus === 'in' ? 'out' : 'in'
    setSubcontractors(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
    await fetch('/api/field-commander', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkin', id, status: newStatus }),
    })
  }

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/field-commander', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_order', ...newOrderForm }),
    })
    setNewOrderOpen(false)
    setOrderCreated(true)
    setNewOrderForm({ title: '', project: '', assignee: '', dueDate: '', notes: '' })
    // Refresh orders
    fetch('/api/field-commander').then(r => r.json()).then(d => setWorkOrders(d.workOrders || []))
    setTimeout(() => setOrderCreated(false), 4000)
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F4F6F8' }}>

      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E9EF' }}>
        <div className="px-5 py-5" style={{ borderBottom: '1px solid #E5E9EF' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white" style={{ background: 'linear-gradient(135deg, #00B050, #007A32)' }}>C</div>
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
          {navItems.map(item => (
            <Link key={item.label} href={item.href}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={item.active ? { background: '#FFFBEB', color: '#D97706' } : { color: '#6B7280' }}
            >
              <div className="flex items-center gap-2.5">
                <span>{item.icon}</span>{item.label}
              </div>
              {item.badge && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#FEF3C7', color: '#D97706' }}>{item.badge}</span>
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

        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E9EF' }}>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xl">👷</span>
              <h1 className="text-lg font-bold" style={{ color: '#1A1A2E' }}>FIELD COMMANDER</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#FFFBEB', color: '#D97706' }}>Subcontractors</span>
            </div>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Sunday, 22 March 2026 · {onSite} workers on site</p>
          </div>
          <div className="flex items-center gap-3">
            {issueOrders > 0 && (
              <div className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 animate-pulse" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                ⚠️ {issueOrders} Issue{issueOrders > 1 ? 's' : ''} Reported
              </div>
            )}
            <button
              onClick={() => setNewOrderOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: '#D97706' }}
            >
              + New Work Order
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6">

          {/* Order Created Toast */}
          {orderCreated && (
            <div className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3 font-semibold text-sm" style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#059669' }}>
              <span>✅</span> Work order created and assigned via Telegram notification.
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Work Orders', value: String(totalOrders), sub: 'This week', icon: '📋', color: '#D97706', bg: '#FFFBEB' },
              { label: 'Active Now', value: String(activeOrders), sub: 'On site working', icon: '⚡', color: '#2563EB', bg: '#EFF6FF' },
              { label: 'On Site', value: String(onSite), sub: `of ${subcontractors.length} subcontractors`, icon: '📍', color: '#059669', bg: '#ECFDF5' },
              { label: 'Issues', value: String(issueOrders), sub: 'Require attention', icon: '⚠️', color: '#DC2626', bg: '#FEF2F2', alert: issueOrders > 0 },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-xl p-5" style={{ background: '#FFFFFF', border: `1px solid ${kpi.alert ? '#FECACA' : '#E5E9EF'}` }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: kpi.bg }}>{kpi.icon}</div>
                </div>
                <div className="text-2xl font-bold mb-0.5" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: '#1A1A2E' }}>{kpi.label}</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: '#F3F4F6' }}>
            {(['orders', 'team'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                style={activeTab === tab
                  ? { background: '#FFFFFF', color: '#D97706', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { color: '#6B7280' }}
              >
                {tab === 'orders' ? '📋 Work Orders' : '👷 Team'}
              </button>
            ))}
          </div>

          {/* WORK ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="grid grid-cols-1 gap-4">
              {loading && <div className="text-center py-10 text-sm" style={{ color: '#9CA3AF' }}>Loading work orders...</div>}
              {workOrders.map(order => {
                const st = statusConfig[order.status]
                const pr = priorityConfig[order.priority]
                const tasks: string[] = Array.isArray(order.tasks) ? order.tasks : []
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="rounded-xl p-5 cursor-pointer transition-all"
                    style={{
                      background: '#FFFFFF',
                      border: selectedOrder?.id === order.id ? '2px solid #D97706' : '1px solid #E5E9EF',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold" style={{ color: '#9CA3AF' }}>{order.order_number}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: st.bg, color: st.color }}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: st.dot }}></span>
                            {st.label}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: pr.bg, color: pr.color }}>{pr.label}</span>
                        </div>
                        <div className="font-bold text-sm mb-0.5" style={{ color: '#1A1A2E' }}>{order.title}</div>
                        <div className="text-xs mb-2" style={{ color: '#6B7280' }}>📍 {order.project_name} · {order.location}</div>
                        <div className="flex items-center gap-4 text-xs" style={{ color: '#9CA3AF' }}>
                          <span>👤 {order.assignee_name}</span>
                          <span>🔧 {order.trade}</span>
                          <span>🕐 {order.estimated_hours}h estimated</span>
                          <span>📅 Due {order.due_date}</span>
                          {order.checkin_time && <span style={{ color: '#059669' }}>✅ Checked in {order.checkin_time}</span>}
                          {order.photo_logged && <span>📷 Photo logged</span>}
                        </div>
                      </div>
                    </div>

                    {/* Expanded tasks */}
                    {selectedOrder?.id === order.id && (
                      <div className="mt-4 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>
                        <div className="text-xs font-bold mb-2" style={{ color: '#6B7280' }}>TASK CHECKLIST</div>
                        <div className="grid grid-cols-2 gap-2">
                          {tasks.map((task, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm" style={{ color: '#1A1A2E' }}>
                              <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: order.status === 'completed' ? '#ECFDF5' : '#F3F4F6', color: order.status === 'completed' ? '#059669' : '#9CA3AF' }}>
                                {order.status === 'completed' ? '✓' : i + 1}
                              </span>
                              {task}
                            </div>
                          ))}
                        </div>
                        {order.status === 'issue' && (
                          <div className="mt-3 px-3 py-2 rounded-lg text-xs font-semibold" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                            ⚠️ Issue flagged — awaiting supervisor review. Telegram alert sent to Tim McKay.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* TEAM TAB */}
          {activeTab === 'team' && (
            <div className="grid grid-cols-1 gap-4">
              {loading && <div className="text-center py-10 text-sm" style={{ color: '#9CA3AF' }}>Loading team...</div>}
              {subcontractors.map(sc => {
                const isIn = sc.status === 'in'
                return (
                  <div key={sc.id} className="rounded-xl p-5 flex items-center gap-5" style={{ background: '#FFFFFF', border: '1px solid #E5E9EF' }}>
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black flex-shrink-0 text-white"
                      style={{ background: isIn ? 'linear-gradient(135deg,#D97706,#F59E0B)' : '#E5E9EF', color: isIn ? 'white' : '#9CA3AF' }}>
                      {sc.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm" style={{ color: '#1A1A2E' }}>{sc.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: isIn ? '#ECFDF5' : '#F3F4F6', color: isIn ? '#059669' : '#9CA3AF' }}>
                          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                            style={{ background: isIn ? '#10B981' : '#D1D5DB' }}></span>
                          {isIn ? `On Site${sc.checkin_time ? ` · ${new Date(sc.checkin_time).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}` : ''}` : 'Off Site'}
                        </span>
                      </div>
                      <div className="text-xs mb-1" style={{ color: '#6B7280' }}>🔧 {sc.trade} · 📋 {sc.license}</div>
                      {isIn && sc.current_site && (
                        <div className="text-xs" style={{ color: '#2563EB' }}>📍 {sc.current_site}</div>
                      )}
                    </div>
                    <div className="text-center flex-shrink-0">
                      <div className="text-lg font-black" style={{ color: '#D97706' }}>{sc.jobs_this_month}</div>
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>jobs/mo</div>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <div className="text-sm font-bold" style={{ color: '#F59E0B' }}>{'★'.repeat(sc.rating)}</div>
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>rating</div>
                    </div>
                    <button
                      onClick={() => handleCheckin(sc.id, sc.status)}
                      className="px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                      style={isIn
                        ? { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }
                        : { background: '#ECFDF5', color: '#059669', border: '1px solid #6EE7B7' }
                      }
                    >
                      {isIn ? 'Check Out' : 'Check In'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* New Work Order Modal */}
      {newOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-lg rounded-2xl p-8" style={{ background: '#FFFFFF' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-black" style={{ color: '#1A1A2E' }}>New Work Order</h2>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Assignee will receive Telegram notification instantly.</p>
              </div>
              <button onClick={() => setNewOrderOpen(false)} className="text-2xl leading-none" style={{ color: '#9CA3AF' }}>×</button>
            </div>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              {[
                { label: 'Job Title', key: 'title', placeholder: 'e.g. Switchboard Installation L5' },
                { label: 'Project / Site', key: 'project', placeholder: 'e.g. Madeline Tower — Level 5' },
                { label: 'Assign To', key: 'assignee', placeholder: 'e.g. Jake Brennan' },
                { label: 'Due Date', key: 'dueDate', placeholder: '24 Mar 2026' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>{f.label.toUpperCase()}</label>
                  <input
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid #E5E9EF', color: '#1A1A2E', background: '#FAFAFA' }}
                    placeholder={f.placeholder}
                    value={(newOrderForm as Record<string, string>)[f.key]}
                    onChange={e => setNewOrderForm(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>NOTES / TASKS</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                  style={{ border: '1px solid #E5E9EF', color: '#1A1A2E', background: '#FAFAFA' }}
                  placeholder="Describe tasks, special requirements..."
                  value={newOrderForm.notes}
                  onChange={e => setNewOrderForm(p => ({ ...p, notes: e.target.value }))}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
                style={{ background: '#D97706' }}
              >
                Create & Notify via Telegram 📲
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
