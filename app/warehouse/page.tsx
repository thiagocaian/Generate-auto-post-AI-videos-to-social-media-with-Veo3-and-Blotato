'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, WarehouseItem } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function WarehousePage() {
  const [items, setItems]       = useState<WarehouseItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    const { data } = await supabase.from('warehouse_items').select('*').order('name')
    if (data) setItems(data)
    setLoading(false)
  }

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))]
  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'all' || item.category === category
    return matchSearch && matchCat
  })

  const lowStock   = items.filter(i => i.current_stock <= i.minimum_stock)
  const totalValue = items.reduce((sum, i) => sum + (i.current_stock * i.unit_cost), 0)

  return (
    <div className="flex min-h-screen" style={{ background: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar active="warehouse" />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3.5"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          <div>
            <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: '#9CA3AF' }}>
              <Link href="/" style={{ color: '#1D4ED8', fontWeight: 600 }}>CYTRON</Link>
              <span>/</span>
              <span style={{ color: '#374151', fontWeight: 600 }}>Warehouse</span>
            </div>
            <h1 className="text-base font-semibold" style={{ color: '#111827' }}>Stock Guardian</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/warehouse/scan"
              className="px-3 py-1.5 rounded text-xs font-semibold text-white transition-all"
              style={{ background: '#1D4ED8' }}>
              Scan QR Code
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Items',    value: String(items.length),              sub: 'SKUs tracked'          },
              { label: 'Low Stock',      value: String(lowStock.length),           sub: 'Require attention',    alert: lowStock.length > 0 },
              { label: 'Total Value',    value: `$${totalValue.toFixed(0)}`,       sub: 'Current inventory'     },
              { label: 'Categories',     value: String(categories.length - 1),     sub: 'Product types'         },
            ].map((k, i) => (
              <div key={i} className="rounded-lg p-5" style={{ background: '#FFFFFF', border: `1px solid ${k.alert ? '#FCA5A5' : '#E5E7EB'}` }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>{k.label}</p>
                <p className="text-2xl font-bold mb-1" style={{ color: k.alert ? '#DC2626' : '#111827' }}>{k.value}</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Low stock alert */}
          {lowStock.length > 0 && (
            <div className="rounded-lg p-4 flex items-start gap-3"
              style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#DC2626' }} />
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#991B1B' }}>
                  {lowStock.length} item{lowStock.length > 1 ? 's' : ''} below minimum stock level
                </p>
                <div className="flex flex-wrap gap-2">
                  {lowStock.map(item => (
                    <span key={item.id} className="text-xs px-2 py-0.5 rounded font-medium"
                      style={{ background: '#FEE2E2', color: '#DC2626' }}>
                      {item.name} — {item.current_stock} {item.unit} remaining
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search item or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-xs rounded-lg px-4 py-2 outline-none"
              style={{ border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#111827' }}
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="text-xs rounded-lg px-4 py-2 outline-none"
              style={{ border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#374151' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All categories' : cat}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-20 text-xs" style={{ color: '#9CA3AF' }}>Loading inventory...</div>
          ) : (
            <div className="rounded-lg overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <table className="w-full text-xs">
                <thead style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                  <tr>
                    {['Item / SKU', 'Category', 'Location', 'Stock', 'Min.', 'Unit Cost', 'Total Value', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold uppercase tracking-wider"
                        style={{ color: '#6B7280', fontSize: 10 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => {
                    const isLow = item.current_stock <= item.minimum_stock
                    return (
                      <tr key={item.id} style={{
                        borderBottom: '1px solid #F9FAFB',
                        background: isLow ? '#FEF2F2' : i % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                      }}>
                        <td className="px-4 py-3">
                          <div className="font-semibold" style={{ color: '#111827' }}>{item.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{item.sku}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{item.category}</span>
                        </td>
                        <td className="px-4 py-3" style={{ color: '#6B7280' }}>{item.location || '—'}</td>
                        <td className="px-4 py-3 text-right font-semibold"
                          style={{ color: isLow ? '#DC2626' : '#16A34A' }}>
                          {item.current_stock} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-right" style={{ color: '#9CA3AF' }}>{item.minimum_stock} {item.unit}</td>
                        <td className="px-4 py-3 text-right" style={{ color: '#374151' }}>${item.unit_cost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-semibold" style={{ color: '#111827' }}>
                          ${(item.current_stock * item.unit_cost).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/warehouse/scan?item=${item.qr_code}`}
                            className="text-xs font-medium" style={{ color: '#1D4ED8' }}>
                            Move
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-xs" style={{ color: '#9CA3AF' }}>No items found</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
