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
  pending:   { label: 'Pending',   color: '#999999', bg: '#F5F5F5', dot: '#999999' },
  active:    { label: 'Active',    color: '#000000', bg: '#F0F0F0', dot: '#000000' },
  completed: { label: 'Completed', color: '#000000', bg: '#F0F0F0', dot: '#000000' },
  issue:     { label: 'Issue',     color: '#CC0000', bg: '#FFF0F0', dot: '#CC0000' },
}

const priorityConfig = {
  high:   { label: 'High',   color: '#CC0000', bg: '#FFF0F0' },
  medium: { label: 'Medium', color: '#999999', bg: '#F5F5F5' },
  low:    { label: 'Low',    color: '#000000', bg: '#F0F0F0' },
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
    <div className="flex min-h-screen" style={{ background: '#FFFFFF', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Sidebar active="field" />

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3.5"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E5E5' }}>
          <div>
            <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: '#999999' }}>
              <Link href="/" style={{ color: '#000000', fontWeight: 600 }}>CYTRON</Link>
              <span>/</span>
              <span style={{ color: '#333333', fontWeight: 600 }}>Subcontractors</span>
            </div>
            <h1 className="text-base font-semibold" style={{ color: '#000000' }}>Field Commander — {onSite} workers on site</h1>
          </div>
          <div className="flex items-center gap-3">
            {issueOrders > 0 && (
              <div className="px-3 py-1.5 text-xs font-semibold"
                style={{ background: '#FFF0F0', color: '#CC0000', border: '1px solid #FFCCCC' }}>
                {issueOrders} Issue{issueOrders > 1 ? 's' : ''} Reported
              </div>
            )}
            <button
              onClick={() => setNewOrderOpen(true)}
              className="px-4 py-2 text-xs font-semibold"
              style={{ background: '#000000', color: '#FFFFFF' }}
            >
              + New Work Order
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6" style={{ background: '#FAFAFA' }}>

          {/* Order Created Toast */}
          {orderCreated && (
            <div className="mb-4 px-4 py-3 flex items-center gap-3 text-xs font-semibold"
              style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#333333' }}>
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
              <div key={kpi.label} className="p-5"
                style={{ background: '#FFFFFF', border: `1px solid ${kpi.alert ? '#FFCCCC' : '#E5E5E5'}` }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#999999' }}>{kpi.label}</p>
                <p className="text-2xl font-bold mb-1" style={{ color: kpi.alert ? '#CC0000' : '#000000' }}>{kpi.value}</p>
                <p className="text-xs" style={{ color: '#999999' }}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mb-5" style={{ borderBottom: '1px solid #E5E5E5' }}>
            {(['orders', 'team'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2.5 text-xs font-semibold transition-all"
                style={activeTab === tab
                  ? { color: '#000000', borderBottom: '1px solid #000000' }
                  : { color: '#999999', borderBottom: '1px solid transparent' }}
              >
                {tab === 'orders' ? 'Work Orders' : 'Team'}
              </button>
            ))}
          </div>

          {/* WORK ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="grid grid-cols-1 gap-4">
              {loading && <div className="text-center py-10 text-sm" style={{ color: '#999999' }}>Loading work orders...</div>}
              {workOrders.map(order => {
                const st = statusConfig[order.status]
                const pr = priorityConfig[order.priority]
                const tasks: string[] = Array.isArray(order.tasks) ? order.tasks : []
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="p-5 cursor-pointer transition-all"
                    style={{
                      background: '#FFFFFF',
                      border: selectedOrder?.id === order.id ? '2px solid #000000' : '1px solid #E5E5E5',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold" style={{ color: '#999999' }}>{order.order_number}</span>
                          <span className="text-xs px-2 py-0.5 font-semibold" style={{ background: st.bg, color: st.color }}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: st.dot }}></span>
                            {st.label}
                          </span>
                          <span className="text-xs px-2 py-0.5 font-semibold" style={{ background: pr.bg, color: pr.color }}>{pr.label}</span>
                        </div>
                        <div className="font-bold text-sm mb-0.5" style={{ color: '#000000' }}>{order.title}</div>
                        <div className="text-xs mb-2" style={{ color: '#333333' }}>{order.project_name} · {order.location}</div>
                        <div className="flex items-center gap-4 text-xs" style={{ color: '#999999' }}>
                          <span>{order.assignee_name}</span>
                          <span>{order.trade}</span>
                          <span>{order.estimated_hours}h est.</span>
                          <span>Due {order.due_date}</span>
                          {order.checkin_time && <span style={{ color: '#333333' }}>Checked in {order.checkin_time}</span>}
                          {order.photo_logged && <span>Photo logged</span>}
                        </div>
                      </div>
                    </div>

                    {/* Expanded tasks */}
                    {selectedOrder?.id === order.id && (
                      <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E5E5E5' }}>
                        <div className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: '#999999' }}>TASK CHECKLIST</div>
                        <div className="grid grid-cols-2 gap-2">
                          {tasks.map((task, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm" style={{ color: '#000000' }}>
                              <span className="w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: order.status === 'completed' ? '#F0F0F0' : '#F5F5F5', color: order.status === 'completed' ? '#000000' : '#999999' }}>
                                {order.status === 'completed' ? '✓' : i + 1}
                              </span>
                              {task}
                            </div>
                          ))}
                        </div>
                        {order.status === 'issue' && (
                          <div className="mt-3 px-3 py-2 text-xs font-semibold" style={{ background: '#FFF0F0', color: '#CC0000', border: '1px solid #FFCCCC' }}>
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
              {loading && <div className="text-center py-10 text-sm" style={{ color: '#999999' }}>Loading team...</div>}
              {subcontractors.map(sc => {
                const isIn = sc.status === 'in'
                return (
                  <div key={sc.id} className="p-4 flex items-center gap-5" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                    <div className="w-10 h-10 flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: isIn ? '#000000' : '#F0F0F0', color: isIn ? '#FFFFFF' : '#999999' }}>
                      {sc.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm" style={{ color: '#000000' }}>{sc.name}</span>
                        <span className="text-xs px-2 py-0.5 font-semibold"
                          style={{ background: isIn ? '#F0F0F0' : '#F5F5F5', color: isIn ? '#000000' : '#999999', border: `1px solid #E5E5E5` }}>
                          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                            style={{ background: isIn ? '#000000' : '#999999' }}></span>
                          {isIn ? `On Site${sc.checkin_time ? ` · ${new Date(sc.checkin_time).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}` : ''}` : 'Off Site'}
                        </span>
                      </div>
                      <div className="text-xs mb-1" style={{ color: '#333333' }}>{sc.trade} · {sc.license}</div>
                      {isIn && sc.current_site && (
                        <div className="text-xs font-medium" style={{ color: '#333333' }}>{sc.current_site}</div>
                      )}
                    </div>
                    <div className="text-center flex-shrink-0">
                      <div className="text-base font-bold" style={{ color: '#000000' }}>{sc.jobs_this_month}</div>
                      <div className="text-xs" style={{ color: '#999999' }}>jobs/mo</div>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <div className="text-xs font-semibold" style={{ color: '#333333' }}>{sc.rating}/5</div>
                      <div className="text-xs" style={{ color: '#999999' }}>rating</div>
                    </div>
                    <button
                      onClick={() => handleCheckin(sc.id, sc.status)}
                      className="px-4 py-2 text-xs font-semibold transition-all"
                      style={isIn
                        ? { background: '#FFF0F0', color: '#CC0000', border: '1px solid #FFCCCC' }
                        : { background: '#F5F5F5', color: '#000000', border: '1px solid #E5E5E5' }
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
          <div className="w-full max-w-lg p-6" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: '#000000' }}>New Work Order</h2>
                <p className="text-xs mt-0.5" style={{ color: '#999999' }}>Assignee will receive a Telegram notification.</p>
              </div>
              <button onClick={() => setNewOrderOpen(false)} className="text-xl leading-none" style={{ color: '#999999' }}>×</button>
            </div>
            <form onSubmit={handleCreateOrder} className="space-y-3">
              {[
                { label: 'Job Title',     key: 'title',    placeholder: 'e.g. Job title'  },
                { label: 'Project / Site',key: 'project',  placeholder: 'e.g. Site / Location'     },
                { label: 'Assign To',     key: 'assignee', placeholder: 'e.g. Team member name'                 },
                { label: 'Due Date',      key: 'dueDate',  placeholder: '24 Mar 2026'                       },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-widest" style={{ color: '#999999' }}>{f.label}</label>
                  <input
                    required
                    className="w-full px-3 py-2 text-xs outline-none"
                    style={{ border: '1px solid #E5E5E5', color: '#000000', background: '#FAFAFA' }}
                    placeholder={f.placeholder}
                    value={(newOrderForm as Record<string, string>)[f.key]}
                    onChange={e => setNewOrderForm(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-widest" style={{ color: '#999999' }}>Notes / Tasks</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 text-xs outline-none resize-none"
                  style={{ border: '1px solid #E5E5E5', color: '#000000', background: '#FAFAFA' }}
                  placeholder="Describe tasks, special requirements..."
                  value={newOrderForm.notes}
                  onChange={e => setNewOrderForm(p => ({ ...p, notes: e.target.value }))}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold"
                style={{ background: '#000000', color: '#FFFFFF' }}
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
