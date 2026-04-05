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
    <div className="flex min-h-screen" style={{ background: '#FFFFFF', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar active="warehouse" />

      <main className="flex-1 flex flex-col overflow-hidden pt-12 md:pt-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3.5"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E5E5' }}>
          <div>
            <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: '#999999' }}>
              <Link href="/" style={{ color: '#000000', fontWeight: 600 }}>CYTRON</Link>
              <span>/</span>
              <span style={{ color: '#333333', fontWeight: 600 }}>Warehouse</span>
            </div>
            <h1 className="text-base font-semibold" style={{ color: '#000000' }}>Stock Guardian</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/warehouse/scan"
              className="px-3 py-1.5 text-xs font-semibold transition-all"
              style={{ background: '#000000', color: '#FFFFFF' }}>
              Scan QR Code
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5" style={{ background: '#FAFAFA' }}>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: 'Total Items',    value: String(items.length),              sub: 'SKUs tracked'          },
              { label: 'Low Stock',      value: String(lowStock.length),           sub: 'Require attention',    alert: lowStock.length > 0 },
              { label: 'Total Value',    value: `$${totalValue.toFixed(0)}`,       sub: 'Current inventory'     },
              { label: 'Categories',     value: String(categories.length - 1),     sub: 'Product types'         },
            ].map((k, i) => (
              <div key={i} className="p-5" style={{
                background: '#FFFFFF',
                border: `1px solid ${k.alert ? '#FFCCCC' : '#E5E5E5'}`
              }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#999999' }}>{k.label}</p>
                <p className="text-2xl font-bold mb-1" style={{ color: k.alert ? '#CC0000' : '#000000' }}>{k.value}</p>
                <p className="text-xs" style={{ color: '#999999' }}>{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Low stock alert */}
          {lowStock.length > 0 && (
            <div className="p-4 flex items-start gap-3"
              style={{ background: '#FFF0F0', border: '1px solid #FFCCCC' }}>
              <div className="w-1.5 h-1.5 mt-1.5 flex-shrink-0" style={{ background: '#CC0000' }} />
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#CC0000' }}>
                  {lowStock.length} item{lowStock.length > 1 ? 's' : ''} below minimum stock level
                </p>
                <div className="flex flex-wrap gap-2">
                  {lowStock.map(item => (
                    <span key={item.id} className="text-xs px-2 py-0.5 font-medium"
                      style={{ background: '#FFF0F0', color: '#CC0000', border: '1px solid #FFCCCC' }}>
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
              className="flex-1 text-xs px-4 py-2 outline-none"
              style={{ border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#000000' }}
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="text-xs px-4 py-2 outline-none"
              style={{ border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#000000' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All categories' : cat}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-20 text-xs" style={{ color: '#999999' }}>Loading inventory...</div>
          ) : (
            <div className="overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
              <table className="w-full text-xs">
                <thead style={{ borderBottom: '1px solid #E5E5E5', background: '#FAFAFA' }}>
                  <tr>
                    {['Item / SKU', 'Category', 'Location', 'Stock', 'Min.', 'Unit Cost', 'Total Value', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold uppercase tracking-wider"
                        style={{ color: '#999999', fontSize: 10 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => {
                    const isLow = item.current_stock <= item.minimum_stock
                    return (
                      <tr key={item.id} style={{
                        borderBottom: '1px solid #E5E5E5',
                        background: isLow ? '#FFF5F5' : i % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                      }}>
                        <td className="px-4 py-3">
                          <div className="font-semibold" style={{ color: '#000000' }}>{item.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: '#999999' }}>{item.sku}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 text-xs font-medium"
                            style={{ background: '#F0F0F0', color: '#000000' }}>{item.category}</span>
                        </td>
                        <td className="px-4 py-3" style={{ color: '#333333' }}>{item.location || '—'}</td>
                        <td className="px-4 py-3 text-right font-semibold"
                          style={{ color: isLow ? '#CC0000' : '#000000' }}>
                          {item.current_stock} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-right" style={{ color: '#999999' }}>{item.minimum_stock} {item.unit}</td>
                        <td className="px-4 py-3 text-right" style={{ color: '#333333' }}>${item.unit_cost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-semibold" style={{ color: '#000000' }}>
                          ${(item.current_stock * item.unit_cost).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/warehouse/scan?item=${item.qr_code}`}
                            className="text-xs font-medium" style={{ color: '#333333' }}>
                            Move
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-xs" style={{ color: '#999999' }}>No items found</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
