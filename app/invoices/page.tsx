'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import type { Invoice, InvoiceStatus } from '@/lib/supabase'

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  draft:   { label: 'Draft',   color: '#999999', bg: '#F5F5F5' },
  sent:    { label: 'Sent',    color: '#1D4ED8', bg: '#EFF6FF' },
  viewed:  { label: 'Viewed',  color: '#7C3AED', bg: '#F5F3FF' },
  paid:    { label: 'Paid',    color: '#059669', bg: '#D1FAE5' },
  overdue: { label: 'Overdue', color: '#CC0000', bg: '#FFF0F0' },
  void:    { label: 'Void',    color: '#666666', bg: '#F0F0F0' },
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchInvoices = () => {
    fetch('/api/invoices')
      .then(r => r.json())
      .then(d => setInvoices(d.invoices || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchInvoices() }, [])

  const filtered = statusFilter === 'all' ? invoices : invoices.filter(i => i.status === statusFilter)

  const totalBilled = invoices.reduce((s, i) => s + (i.total || 0), 0)
  const totalPaid = invoices.reduce((s, i) => s + (i.amount_paid || 0), 0)
  const outstanding = invoices.filter(i => ['sent', 'viewed', 'overdue'].includes(i.status))
  const outstandingValue = outstanding.reduce((s, i) => s + ((i.total || 0) - (i.amount_paid || 0)), 0)

  const handleRecordPayment = async () => {
    if (!selectedInvoice || !paymentAmount) return
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record_payment',
        id: selectedInvoice.id,
        amount: Number(paymentAmount),
        method: paymentMethod,
      })
    })
    setPaymentOpen(false)
    setPaymentAmount('')
    setSelectedInvoice(null)
    fetchInvoices()
  }

  const handleSend = async (id: string) => {
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send', id })
    })
    fetchInvoices()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' })
    fetchInvoices()
    setSelectedInvoice(null)
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>
      <Sidebar active="invoices" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-widest mb-1" style={{ color: '#999' }}>CYTRON / INVOICES</p>
            <h1 className="text-2xl font-bold" style={{ color: '#000' }}>Invoices</h1>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Billed', value: `$${totalBilled.toLocaleString()}`, sub: `${invoices.length} invoices` },
            { label: 'Paid', value: `$${totalPaid.toLocaleString()}`, sub: 'received' },
            { label: 'Outstanding', value: `$${outstandingValue.toLocaleString()}`, sub: `${outstanding.length} pending` },
            { label: 'Overdue', value: invoices.filter(i => i.status === 'overdue').length, sub: 'need attention' },
          ].map(kpi => (
            <div key={kpi.label} className="p-4 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#999' }}>{kpi.label}</p>
              <p className="text-2xl font-bold" style={{ color: '#000' }}>{kpi.value}</p>
              <p className="text-xs mt-1" style={{ color: '#BBB' }}>{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-3 mb-6">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg"
            style={{ border: '1px solid #E5E5E5', background: '#FAFAFA' }}
          >
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        {/* Invoices table */}
        {loading ? (
          <div className="text-center py-20" style={{ color: '#999' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium" style={{ color: '#999' }}>No invoices yet</p>
            <p className="text-sm mt-1" style={{ color: '#BBB' }}>Invoices are generated from completed jobs</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E5E5' }}>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#999' }}>Invoice</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#999' }}>Client</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#999' }}>Total</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#999' }}>Paid</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#999' }}>Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#999' }}>Due</th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#999' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr
                    key={inv.id}
                    className="cursor-pointer hover:bg-gray-50"
                    style={{ borderBottom: '1px solid #F0F0F0' }}
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td className="px-4 py-3 font-mono font-medium" style={{ color: '#000' }}>{inv.invoice_number}</td>
                    <td className="px-4 py-3" style={{ color: '#333' }}>{inv.client_name}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#000' }}>${inv.total?.toLocaleString()}</td>
                    <td className="px-4 py-3" style={{ color: '#059669' }}>${inv.amount_paid?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: statusConfig[inv.status]?.bg, color: statusConfig[inv.status]?.color }}>
                        {statusConfig[inv.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#999' }}>{inv.due_date || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        {inv.status === 'draft' && (
                          <button
                            onClick={e => { e.stopPropagation(); handleSend(inv.id) }}
                            className="text-xs px-2 py-1 rounded font-medium"
                            style={{ background: '#EFF6FF', color: '#1D4ED8' }}
                          >
                            Send
                          </button>
                        )}
                        {['sent', 'viewed', 'overdue'].includes(inv.status) && (
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedInvoice(inv); setPaymentOpen(true) }}
                            className="text-xs px-2 py-1 rounded font-medium"
                            style={{ background: '#ECFDF5', color: '#059669' }}
                          >
                            Record Payment
                          </button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(inv.id) }}
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{ background: '#FFF0F0', color: '#CC0000' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment Modal */}
        {paymentOpen && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <h2 className="text-lg font-bold mb-1">Record Payment</h2>
              <p className="text-sm mb-4" style={{ color: '#999' }}>
                {selectedInvoice.invoice_number} — ${selectedInvoice.total?.toLocaleString()} total
                {selectedInvoice.amount_paid ? ` ($${selectedInvoice.amount_paid} already paid)` : ''}
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#999' }}>Amount ($)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    placeholder={String((selectedInvoice.total || 0) - (selectedInvoice.amount_paid || 0))}
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    style={{ border: '1px solid #E5E5E5', background: '#FAFAFA', outline: 'none' }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#999' }}>Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    style={{ border: '1px solid #E5E5E5', background: '#FAFAFA' }}
                  >
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleRecordPayment}
                  disabled={!paymentAmount}
                  className="flex-1 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50"
                  style={{ background: '#059669' }}
                >
                  Confirm Payment
                </button>
                <button
                  onClick={() => { setPaymentOpen(false); setPaymentAmount('') }}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg"
                  style={{ border: '1px solid #E5E5E5', color: '#666' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
