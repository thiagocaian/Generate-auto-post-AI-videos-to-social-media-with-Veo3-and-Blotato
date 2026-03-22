'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

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
    <div className="flex min-h-screen" style={{ background: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Sidebar active="field" />

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3.5"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          <div>
            <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: '#9CA3AF' }}>
              <Link href="/" style={{ color: '#1D4ED8', fontWeight: 600 }}>CYTRON</Link>
              <span>/</span>
              <span style={{ color: '#374151', fontWeight: 600 }}>Subcontractors</span>
            </div>
            <h1 className="text-base font-semibold" style={{ color: '#111827' }}>Field Commander — {onSite} workers on site</h1>
          </div>
          <div className="flex items-center gap-3">
            {issueOrders > 0 && (
              <div className="px-3 py-1.5 rounded text-xs font-semibold"
                style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5' }}>
                {issueOrders} Issue{issueOrders > 1 ? 's' : ''} Reported
              </div>
            )}
            <button
              onClick={() => setNewOrderOpen(true)}
              className="px-4 py-2 rounded text-xs font-semibold text-white"
              style={{ background: '#1D4ED8' }}
            >
              + New Work Order
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">

          {/* Order Created Toast */}
          {orderCreated && (
            <div className="mb-4 px-4 py-3 rounded-lg flex items-center gap-3 text-xs font-semibold"
              style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D' }}>
              Work order created and assigned.
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Work Orders', value: String(totalOrders), sub: 'This week',                             alert: false },
              { label: 'Active Now',  value: String(activeOrders), sub: 'On site working',                      alert: false },
              { label: 'On Site',     value: String(onSite),       sub: `of ${subcontractors.length} subs`,     alert: false },
              { label: 'Issues',      value: String(issueOrders),  sub: 'Require attention',                    alert: issueOrders > 0 },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-lg p-5"
                style={{ background: '#FFFFFF', border: `1px solid ${kpi.alert ? '#FCA5A5' : '#E5E7EB'}` }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>{kpi.label}</p>
                <p className="text-2xl font-bold mb-1" style={{ color: kpi.alert ? '#DC2626' : '#111827' }}>{kpi.value}</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mb-5" style={{ borderBottom: '1px solid #E5E7EB' }}>
            {(['orders', 'team'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2.5 text-xs font-semibold transition-all"
                style={activeTab === tab
                  ? { color: '#1D4ED8', borderBottom: '2px solid #1D4ED8' }
                  : { color: '#6B7280', borderBottom: '2px solid transparent' }}
              >
                {tab === 'orders' ? 'Work Orders' : 'Team'}
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
                      border: selectedOrder?.id === order.id ? '2px solid #1D4ED8' : '1px solid #E5E7EB',
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
                        <div className="text-xs mb-2" style={{ color: '#6B7280' }}>{order.project_name} · {order.location}</div>
                        <div className="flex items-center gap-4 text-xs" style={{ color: '#9CA3AF' }}>
                          <span>{order.assignee_name}</span>
                          <span>{order.trade}</span>
                          <span>{order.estimated_hours}h est.</span>
                          <span>Due {order.due_date}</span>
                          {order.checkin_time && <span style={{ color: '#16A34A' }}>Checked in {order.checkin_time}</span>}
                          {order.photo_logged && <span>Photo logged</span>}
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
                          <div className="mt-3 px-3 py-2 rounded text-xs font-semibold" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5' }}>
                            Issue flagged — awaiting supervisor review. Telegram alert sent.
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
                  <div key={sc.id} className="rounded-lg p-4 flex items-center gap-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: isIn ? '#1D4ED8' : '#E5E7EB', color: isIn ? '#FFFFFF' : '#9CA3AF' }}>
                      {sc.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm" style={{ color: '#1A1A2E' }}>{sc.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded font-semibold"
                          style={{ background: isIn ? '#F0FDF4' : '#F9FAFB', color: isIn ? '#15803D' : '#9CA3AF', border: `1px solid ${isIn ? '#BBF7D0' : '#E5E7EB'}` }}>
                          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                            style={{ background: isIn ? '#16A34A' : '#D1D5DB' }}></span>
                          {isIn ? `On Site${sc.checkin_time ? ` · ${new Date(sc.checkin_time).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}` : ''}` : 'Off Site'}
                        </span>
                      </div>
                      <div className="text-xs mb-1" style={{ color: '#6B7280' }}>{sc.trade} · {sc.license}</div>
                      {isIn && sc.current_site && (
                        <div className="text-xs font-medium" style={{ color: '#1D4ED8' }}>{sc.current_site}</div>
                      )}
                    </div>
                    <div className="text-center flex-shrink-0">
                      <div className="text-base font-bold" style={{ color: '#111827' }}>{sc.jobs_this_month}</div>
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>jobs/mo</div>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <div className="text-xs font-semibold" style={{ color: '#D97706' }}>{sc.rating}/5</div>
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>rating</div>
                    </div>
                    <button
                      onClick={() => handleCheckin(sc.id, sc.status)}
                      className="px-4 py-2 rounded text-xs font-semibold transition-all"
                      style={isIn
                        ? { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5' }
                        : { background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }
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
          <div className="w-full max-w-lg rounded-lg p-6" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>New Work Order</h2>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Assignee will receive a Telegram notification.</p>
              </div>
              <button onClick={() => setNewOrderOpen(false)} className="text-xl leading-none" style={{ color: '#9CA3AF' }}>×</button>
            </div>
            <form onSubmit={handleCreateOrder} className="space-y-3">
              {[
                { label: 'Job Title',     key: 'title',    placeholder: 'e.g. Switchboard Installation L5'  },
                { label: 'Project / Site',key: 'project',  placeholder: 'e.g. Madeline Tower — Level 5'     },
                { label: 'Assign To',     key: 'assignee', placeholder: 'e.g. Jake Brennan'                 },
                { label: 'Due Date',      key: 'dueDate',  placeholder: '24 Mar 2026'                       },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>{f.label}</label>
                  <input
                    required
                    className="w-full px-3 py-2 rounded text-xs outline-none"
                    style={{ border: '1px solid #E5E7EB', color: '#111827', background: '#FAFAFA' }}
                    placeholder={f.placeholder}
                    value={(newOrderForm as Record<string, string>)[f.key]}
                    onChange={e => setNewOrderForm(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Notes / Tasks</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 rounded text-xs outline-none resize-none"
                  style={{ border: '1px solid #E5E7EB', color: '#111827', background: '#FAFAFA' }}
                  placeholder="Describe tasks, special requirements..."
                  value={newOrderForm.notes}
                  onChange={e => setNewOrderForm(p => ({ ...p, notes: e.target.value }))}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded text-xs font-semibold text-white"
                style={{ background: '#1D4ED8' }}
              >
                Create Work Order
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
