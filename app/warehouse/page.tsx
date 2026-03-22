'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, WarehouseItem } from '@/lib/supabase'

export default function WarehousePage() {
  const [items, setItems] = useState<WarehouseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    const { data, error } = await supabase
      .from('warehouse_items')
      .select('*')
      .order('name')
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

  const lowStock = items.filter(i => i.current_stock <= i.minimum_stock)
  const totalValue = items.reduce((sum, i) => sum + (i.current_stock * i.unit_cost), 0)

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-white">← CYTRON</Link>
          <span className="text-gray-600">/</span>
          <span className="font-semibold">📦 Warehouse</span>
        </div>
        <div className="flex gap-3">
          <Link href="/warehouse/scan" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            📷 Escanear QR
          </Link>
          <Link href="/warehouse/items/new" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Novo Item
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-gray-400 text-xs mb-1">Total de Itens</div>
            <div className="text-2xl font-bold">{items.length}</div>
          </div>
          <div className={`bg-gray-900 rounded-xl p-4 border ${lowStock.length > 0 ? 'border-orange-500/50' : 'border-gray-800'}`}>
            <div className="text-gray-400 text-xs mb-1">⚠️ Estoque Baixo</div>
            <div className={`text-2xl font-bold ${lowStock.length > 0 ? 'text-orange-400' : ''}`}>{lowStock.length}</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-gray-400 text-xs mb-1">Valor Total</div>
            <div className="text-2xl font-bold">${totalValue.toFixed(0)}</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-gray-400 text-xs mb-1">Categorias</div>
            <div className="text-2xl font-bold">{categories.length - 1}</div>
          </div>
        </div>

        {/* Low stock alert */}
        {lowStock.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
            <div className="font-semibold text-orange-400 mb-2">⚠️ {lowStock.length} iten(s) com estoque abaixo do mínimo</div>
            <div className="flex flex-wrap gap-2">
              {lowStock.map(item => (
                <span key={item.id} className="text-sm bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">
                  {item.name} — {item.current_stock} {item.unit} restantes
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar item ou SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'Todas categorias' : cat}</option>
            ))}
          </select>
        </div>

        {/* Items table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Carregando inventário...</div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-400">
                  <th className="text-left px-4 py-3">Item / SKU</th>
                  <th className="text-left px-4 py-3">Categoria</th>
                  <th className="text-left px-4 py-3">Localização</th>
                  <th className="text-right px-4 py-3">Estoque</th>
                  <th className="text-right px-4 py-3">Mínimo</th>
                  <th className="text-right px-4 py-3">Custo Unit.</th>
                  <th className="text-right px-4 py-3">Valor Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const isLow = item.current_stock <= item.minimum_stock
                  return (
                    <tr key={item.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${isLow ? 'bg-orange-500/5' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-500 text-xs">{item.sku}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-800 px-2 py-1 rounded text-xs">{item.category}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{item.location || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${isLow ? 'text-orange-400' : 'text-green-400'}`}>
                          {item.current_stock} {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">{item.minimum_stock} {item.unit}</td>
                      <td className="px-4 py-3 text-right text-gray-300">${item.unit_cost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium">${(item.current_stock * item.unit_cost).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/warehouse/scan?item=${item.qr_code}`} className="text-blue-400 hover:text-blue-300 text-xs">
                          Mover →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-500">Nenhum item encontrado</div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
