'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

type MaterialItem = { name: string; qty: number; unit: string }
type DistributorResult = {
  distributor: string
  website: string
  items: Array<{
    material: string
    unit_price: number
    price_unit: string
    qty: number
    total: number
    source: 'website' | 'estimated'
    product_name?: string
    url?: string
  }>
  grand_total: number
}
type SearchResults = {
  results: DistributorResult[]
  best_option: { distributor: string; total: number; savings: number }
  notes: string
}
type Distributor = {
  id: string; name: string; website: string; phone: string
  location: string; categories: string[]; active: boolean
}

const UNITS = ['m²', 'm linear', 'unit', 'box', 'L', 'kg', 'roll']

const COMMON_MATERIALS = [
  'Vinyl Plank', 'Hybrid Flooring', 'Laminate', 'Engineered Timber',
  'Carpet Tile', 'Underlay', 'Adhesive', 'Skirting Board (Rodapé)',
  'Transition Profile', 'Scotia/Quarter Round', 'Moisture Barrier',
  'Stair Nosing', 'Reducer Strip', 'T-Moulding', 'Tile Levelling Clips',
  'Floor Levelling Compound', 'Tack Strip', 'Gripper Rod',
]

export default function MaterialsPage() {
  const [freeText, setFreeText] = useState('')
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [results, setResults] = useState<SearchResults | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchStep, setSearchStep] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const [parsing, setParsing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const res = await fetch('/api/materials')
    if (res.ok) {
      const data = await res.json()
      setDistributors(data.distributors || [])
      setHistory(data.searches || [])
      if (!data.distributors?.length && !seeded) {
        // Seed distributors on first load
        setSeeded(true)
        await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'seed_distributors' })
        })
        loadData()
      }
    }
  }

  const addMaterial = () => {
    setMaterials([...materials, { name: '', qty: 0, unit: 'm²' }])
  }

  const removeMaterial = (i: number) => {
    if (materials.length > 1) {
      setMaterials(materials.filter((_, idx) => idx !== i))
    }
  }

  const updateMaterial = (i: number, field: keyof MaterialItem, value: string | number) => {
    const updated = [...materials]
    updated[i] = { ...updated[i], [field]: value }
    setMaterials(updated)
  }

  // Parse free text into structured materials using AI
  const parseFreeText = async () => {
    if (!freeText.trim()) return
    setParsing(true)
    try {
      const res = await fetch('/api/materials/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'parse', text: freeText })
      })
      const data = await res.json()
      if (data.materials?.length) {
        setMaterials(data.materials)
      }
    } catch (err) {
      // Fallback: simple parsing
      const lines = freeText.split(/[,\n;]+/).filter(Boolean)
      const parsed: MaterialItem[] = []
      for (const line of lines) {
        const match = line.trim().match(/(\d+\.?\d*)\s*(m²|m2|m linear|ml|metros?|un|unid|caixa|box|L|litro|kg|rolo|roll)?\s*(?:de\s+)?(.+)/i)
        if (match) {
          const qty = parseFloat(match[1])
          let unit = (match[2] || 'm²').toLowerCase()
          if (unit === 'm2' || unit === 'metro' || unit === 'metros') unit = 'm²'
          if (unit === 'ml') unit = 'm linear'
          if (unit === 'un' || unit === 'unid') unit = 'unit'
          if (unit === 'caixa') unit = 'box'
          if (unit === 'litro') unit = 'L'
          if (unit === 'rolo') unit = 'roll'
          parsed.push({ name: match[3].trim(), qty, unit })
        }
      }
      if (parsed.length) setMaterials(parsed)
    } finally {
      setParsing(false)
    }
  }

  const validMaterials = materials.filter(m => m.name.trim() && m.qty > 0)

  const handleSearch = async () => {
    if (!validMaterials.length) return
    setSearching(true)
    setResults(null)

    const steps = [
      'Connecting to distributors...',
      'Scanning product catalogs...',
      'Analyzing prices with AI...',
      'Comparing across distributors...',
      'Calculating best options...',
    ]

    let stepIdx = 0
    setSearchStep(steps[0])
    const interval = setInterval(() => {
      stepIdx++
      if (stepIdx < steps.length) setSearchStep(steps[stepIdx])
    }, 2500)

    try {
      const res = await fetch('/api/materials/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials: validMaterials,
          distributors: distributors.map(d => ({
            name: d.name,
            website: d.website,
            categories: d.categories,
          }))
        })
      })
      const data = await res.json()
      setResults(data)

      // Save search to history
      if (data.results) {
        await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_search',
            items: validMaterials,
            results: data.results,
            best_distributor: data.best_option?.distributor,
            best_total: data.best_option?.total,
          })
        })
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      clearInterval(interval)
      setSearching(false)
      setSearchStep('')
    }
  }

  const fmt = (n: number) => `$${n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>
      <Sidebar active="quotes" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto pt-14 md:pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs tracking-widest mb-1" style={{ color: '#999' }}>CYTRON / MATERIALS</p>
            <h1 className="text-2xl font-bold" style={{ color: '#000' }}>Flooring Materials Calculator</h1>
            <p className="text-sm mt-1" style={{ color: '#999' }}>Compare prices across Gold Coast distributors</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 text-sm font-medium rounded-lg"
              style={{ border: '1px solid #E5E5E5', color: '#666' }}
            >
              History ({history.length})
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#999' }}>Searches</p>
            <p className="text-2xl font-bold">{history.length}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#999' }}>Distributors</p>
            <p className="text-2xl font-bold">{distributors.length}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#999' }}>Best Savings</p>
            <p className="text-2xl font-bold" style={{ color: '#059669' }}>
              {history.length > 0 && results?.best_option?.savings
                ? fmt(results.best_option.savings)
                : '$0'}
            </p>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && history.length > 0 && (
          <div className="mb-6 p-4 rounded-xl" style={{ border: '1px solid #E5E5E5', background: '#FAFAFA' }}>
            <h3 className="text-sm font-bold mb-3">Recent Searches</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg" style={{ background: '#FFF', border: '1px solid #EEE' }}>
                  <div>
                    <span style={{ color: '#666' }}>{new Date(s.created_at).toLocaleDateString('en-AU')}</span>
                    <span className="mx-2">—</span>
                    <span>{(s.items as MaterialItem[]).map(it => `${it.qty}${it.unit} ${it.name}`).join(', ')}</span>
                  </div>
                  <div className="font-bold" style={{ color: '#059669' }}>
                    {s.best_distributor}: {fmt(s.best_total || 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Materials Input — Free Text */}
        <div className="mb-6 p-5 rounded-xl" style={{ border: '2px solid #1A1A1A' }}>
          <h2 className="text-lg font-bold mb-1">What materials do you need?</h2>
          <p className="text-xs mb-4" style={{ color: '#999' }}>
            Write your list naturally — e.g. "50m² vinyl plank, 14m rodape, 5L adhesive"
          </p>

          <textarea
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            placeholder={"Example:\n50m² vinyl plank\n14 metros rodape\n5L cola para piso\n3 caixas underlay\n10m perfil de transicao"}
            rows={5}
            className="w-full px-4 py-3 text-sm rounded-lg resize-none"
            style={{ border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#1A1A1A', fontSize: 15, lineHeight: 1.7 }}
          />

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={parseFreeText}
              disabled={parsing || !freeText.trim()}
              className="px-5 py-2.5 text-sm font-bold rounded-lg disabled:opacity-40"
              style={{ background: '#F5F5F5', color: '#1A1A1A', border: '1px solid #E5E5E5' }}
            >
              {parsing ? 'Reading...' : 'Read List'}
            </button>
            <button
              onClick={handleSearch}
              disabled={searching || !validMaterials.length}
              className="px-6 py-2.5 text-sm font-bold text-white rounded-lg disabled:opacity-40"
              style={{ background: '#1A1A1A' }}
            >
              {searching ? 'Searching...' : 'Search Prices'}
            </button>
          </div>
        </div>

        {/* Parsed Materials List */}
        {materials.length > 0 && validMaterials.length > 0 && !searching && (
          <div className="mb-6 p-4 rounded-xl" style={{ border: '1px solid #059669', background: '#F0FDF4' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: '#059669' }}>
                Items found ({validMaterials.length})
              </h3>
              <button
                onClick={() => { setMaterials([]); setFreeText('') }}
                className="text-xs px-2 py-1 rounded"
                style={{ color: '#999', border: '1px solid #E5E5E5' }}
              >
                Clear
              </button>
            </div>
            <div className="space-y-1.5">
              {validMaterials.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg" style={{ background: '#FFF' }}>
                  <span className="font-medium">{m.name}</span>
                  <span style={{ color: '#666' }}>{m.qty} {m.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Searching Animation */}
        {searching && (
          <div className="mb-6 p-8 rounded-xl text-center" style={{ border: '1px solid #E5E5E5', background: '#FAFAFA' }}>
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#1A1A1A', borderTopColor: 'transparent' }} />
            </div>
            <p className="text-sm font-bold mb-1">Materials Agent Working</p>
            <p className="text-xs" style={{ color: '#999' }}>{searchStep}</p>
            <div className="flex justify-center gap-1 mt-4">
              {distributors.slice(0, 5).map((d, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded" style={{ background: '#F0F0F0', color: '#666' }}>
                  {d.name.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Results Table */}
        {results?.results && !searching && (
          <div className="mb-6">
            <div className="p-5 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#666' }}>
                Price Comparison
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E5E5' }}>
                      <th className="text-left py-3 px-3 font-bold" style={{ color: '#666' }}>Material</th>
                      <th className="text-left py-3 px-1 font-bold" style={{ color: '#666' }}>Qty</th>
                      {results.results.map((r, i) => (
                        <th key={i} className="text-right py-3 px-3 font-bold" style={{ color: '#666' }}>
                          <div>{r.distributor.split(' ').slice(0, 2).join(' ')}</div>
                          <div className="text-xs font-normal" style={{ color: '#BBB' }}>{r.website.replace('https://', '').split('/')[0]}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {validMaterials.map((mat, mi) => {
                      // Find cheapest price for this material
                      const prices = results.results.map(r => {
                        const item = r.items.find(it => it.material.toLowerCase().includes(mat.name.toLowerCase()) || mat.name.toLowerCase().includes(it.material.toLowerCase()))
                        return item?.total || Infinity
                      })
                      const minPrice = Math.min(...prices.filter(p => p < Infinity))

                      return (
                        <tr key={mi} style={{ borderBottom: '1px solid #F0F0F0' }}>
                          <td className="py-3 px-3 font-medium">{mat.name}</td>
                          <td className="py-3 px-1" style={{ color: '#999' }}>{mat.qty} {mat.unit}</td>
                          {results.results.map((r, ri) => {
                            const item = r.items.find(it =>
                              it.material.toLowerCase().includes(mat.name.toLowerCase()) ||
                              mat.name.toLowerCase().includes(it.material.toLowerCase())
                            )
                            const isCheapest = item && item.total === minPrice && minPrice < Infinity
                            return (
                              <td key={ri} className="py-3 px-3 text-right">
                                {item ? (
                                  <div>
                                    <div className="font-bold" style={{ color: isCheapest ? '#059669' : '#1A1A1A' }}>
                                      {fmt(item.total)}
                                      {isCheapest && ' ✓'}
                                    </div>
                                    <div className="text-xs" style={{ color: '#999' }}>
                                      {fmt(item.unit_price)}/{item.price_unit.replace('per ', '')}
                                      {item.source === 'estimated' && (
                                        <span className="ml-1 px-1 rounded" style={{ background: '#FFF3CD', color: '#856404', fontSize: 9 }}>est.</span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ color: '#CCC' }}>—</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #1A1A1A' }}>
                      <td className="py-3 px-3 font-bold" colSpan={2}>TOTAL</td>
                      {results.results.map((r, i) => {
                        const isBest = r.distributor === results.best_option?.distributor
                        return (
                          <td key={i} className="py-3 px-3 text-right font-bold text-base" style={{ color: isBest ? '#059669' : '#1A1A1A' }}>
                            {fmt(r.grand_total)}
                            {isBest && ' ✓'}
                          </td>
                        )
                      })}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Best Option Summary */}
            {results.best_option && (
              <div className="mt-4 p-5 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#059669' }}>
                      Best Option: {results.best_option.distributor}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#666' }}>
                      Total: {fmt(results.best_option.total)}
                      {results.best_option.savings > 0 && (
                        <span className="ml-2">
                          — Save {fmt(results.best_option.savings)} vs most expensive
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-2xl font-black" style={{ color: '#059669' }}>
                    {fmt(results.best_option.total)}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {results.notes && (
              <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}>
                <p className="font-bold text-xs uppercase mb-1">Agent Notes</p>
                <p>{results.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Active Distributors */}
        <div className="p-5 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#666' }}>
            Active Distributors ({distributors.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {distributors.map((d, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ border: '1px solid #F0F0F0', background: '#FAFAFA' }}>
                <p className="text-sm font-bold">{d.name}</p>
                <p className="text-xs" style={{ color: '#999' }}>{d.location}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {d.categories?.slice(0, 3).map((c, ci) => (
                    <span key={ci} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#F0F0F0', color: '#666' }}>
                      {c}
                    </span>
                  ))}
                </div>
                {d.phone && <p className="text-xs mt-2" style={{ color: '#1D4ED8' }}>{d.phone}</p>}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
