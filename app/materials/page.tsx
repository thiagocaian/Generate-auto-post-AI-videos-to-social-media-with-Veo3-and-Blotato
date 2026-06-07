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
type PurchaseOrder = {
  id: string; created_at: string; distributor_name: string; distributor_website: string
  items: any[]; total: number; status: string; specialty: string; notes: string
}

const UNITS = ['m\u00B2', 'm linear', 'unit', 'box', 'L', 'kg', 'roll']

const PO_STATUSES = ['draft', 'sent', 'confirmed', 'received'] as const
const PO_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#F5F5F5', text: '#666' },
  sent: { bg: '#DBEAFE', text: '#1D4ED8' },
  confirmed: { bg: '#FEF3C7', text: '#92400E' },
  received: { bg: '#D1FAE5', text: '#059669' },
}

// Feature 4: Specialty options
const SPECIALTIES = [
  { value: 'flooring', label: 'Flooring' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'general', label: 'General Construction' },
]

const SPECIALTY_MATERIALS: Record<string, string[]> = {
  flooring: [
    'Vinyl Plank', 'Hybrid Flooring', 'Laminate', 'Engineered Timber',
    'Carpet Tile', 'Underlay', 'Adhesive', 'Skirting Board (Rodape)',
    'Transition Profile', 'Scotia/Quarter Round', 'Moisture Barrier',
    'Stair Nosing', 'Reducer Strip', 'T-Moulding', 'Tile Levelling Clips',
    'Floor Levelling Compound', 'Tack Strip', 'Gripper Rod',
  ],
  electrical: [
    'TPS Cable 2.5mm', 'TPS Cable 1.5mm', 'Conduit 20mm', 'Conduit 25mm',
    'GPO (Power Point)', 'Light Switch', 'LED Downlight', 'LED Panel',
    'RCD Safety Switch', 'Circuit Breaker 20A', 'Switchboard', 'Junction Box',
    'Cable Clips', 'Earth Stake', 'Smoke Alarm', 'Flex & Plug',
  ],
  plumbing: [
    'PVC Pipe 50mm', 'PVC Pipe 100mm', 'Copper Pipe 15mm', 'PEX Pipe 16mm',
    'Ball Valve', 'Gate Valve', 'Mixer Tap', 'Basin Waste',
    'Toilet Suite', 'Shower Head', 'Silicone Sealant', 'PTFE Tape',
    'Solvent Cement', 'Pipe Clips', 'Pressure Relief Valve', 'Tempering Valve',
  ],
  hvac: [
    'Flexible Duct 250mm', 'Rigid Duct 300mm', 'Duct Tape (Foil)', 'Air Filter',
    'Diffuser Grille', 'Return Air Grille', 'Thermostat', 'Refrigerant R410A',
    'Condensate Pump', 'Insulation Wrap', 'Damper', 'Split System Bracket',
    'Flare Nut Set', 'Vacuum Pump Oil', 'Copper Coil 6mm', 'Cable Tie Pack',
  ],
  general: [
    'Structural Timber 90x45', 'Plywood 12mm', 'MDF Sheet', 'Plasterboard',
    'Cement Bag 20kg', 'Concrete Mix', 'Rebar 12mm', 'Screws Box',
    'Nails Box', 'Silicone', 'Waterproof Membrane', 'Insulation Batts',
    'Roofing Screw', 'Flashing', 'Sarking', 'DPC (Damp Proof Course)',
  ],
}

// Feature 4: Specialty category mapping for distributor filtering
const SPECIALTY_CATEGORIES: Record<string, string[]> = {
  flooring: ['vinyl', 'timber', 'laminate', 'underlay', 'adhesive', 'skirting', 'trim', 'hybrid', 'carpet', 'carpet_tile', 'engineered_timber', 'bamboo', 'adhesives', 'tools', 'accessories'],
  electrical: ['electrical', 'cable', 'lighting', 'switchgear', 'tools', 'accessories'],
  plumbing: ['plumbing', 'pipes', 'fittings', 'fixtures', 'drainage', 'tools', 'accessories'],
  hvac: ['hvac', 'ducting', 'refrigeration', 'air_conditioning', 'tools', 'accessories'],
  general: ['timber', 'concrete', 'steel', 'fasteners', 'building', 'tools', 'accessories', 'general'],
}

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

  // Feature 1: Recent materials for autocomplete
  const [recentMaterials, setRecentMaterials] = useState<string[]>([])

  // Feature 2: Distributor management
  const [showDistributorModal, setShowDistributorModal] = useState(false)
  const [editingDistributor, setEditingDistributor] = useState<Distributor | null>(null)
  const [distForm, setDistForm] = useState({ name: '', website: '', phone: '', location: '', categories: '' })

  // Feature 3: Purchase orders
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [showPOs, setShowPOs] = useState(false)
  const [creatingPO, setCreatingPO] = useState(false)

  // Feature 4: Specialty
  const [specialty, setSpecialty] = useState('flooring')

  // Load specialty from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cytron_materials_specialty')
      if (saved && SPECIALTIES.some(s => s.value === saved)) {
        setSpecialty(saved)
      }
    }
  }, [])

  // Save specialty to localStorage when it changes
  const handleSpecialtyChange = (value: string) => {
    setSpecialty(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem('cytron_materials_specialty', value)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const res = await fetch('/api/materials')
    if (res.ok) {
      const data = await res.json()
      setDistributors(data.distributors || [])
      setHistory(data.searches || [])
      setRecentMaterials(data.recent_materials || [])
      setPurchaseOrders(data.purchase_orders || [])
      if (!data.distributors?.length && !seeded) {
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
    setMaterials([...materials, { name: '', qty: 0, unit: 'm\u00B2' }])
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

  // Feature 1: Add material name to textarea from chip
  const addChipToTextarea = (name: string) => {
    const trimmed = freeText.trim()
    if (trimmed) {
      setFreeText(trimmed + '\n' + name)
    } else {
      setFreeText(name)
    }
  }

  // Parse free text into structured materials using AI
  const parseFreeText = async () => {
    if (!freeText.trim()) return
    setParsing(true)
    try {
      const res = await fetch('/api/materials/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'parse', text: freeText, specialty })
      })
      const data = await res.json()
      if (data.materials?.length) {
        setMaterials(data.materials)
      }
    } catch (err) {
      const lines = freeText.split(/[,\n;]+/).filter(Boolean)
      const parsed: MaterialItem[] = []
      for (const line of lines) {
        const match = line.trim().match(/(\d+\.?\d*)\s*(m\u00B2|m2|m linear|ml|metros?|un|unid|caixa|box|L|litro|kg|rolo|roll)?\s*(?:de\s+)?(.+)/i)
        if (match) {
          const qty = parseFloat(match[1])
          let unit = (match[2] || 'm\u00B2').toLowerCase()
          if (unit === 'm2' || unit === 'metro' || unit === 'metros') unit = 'm\u00B2'
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

  // Feature 4: Filter distributors by specialty categories
  const activeDistributors = distributors.filter(d => d.active)
  const specialtyCategories = SPECIALTY_CATEGORIES[specialty] || []
  const filteredDistributors = activeDistributors.filter(d => {
    if (!d.categories?.length) return true
    return d.categories.some(c => specialtyCategories.includes(c.toLowerCase()))
  })
  // If no distributors match the specialty filter, show all active ones
  const displayDistributors = filteredDistributors.length > 0 ? filteredDistributors : activeDistributors

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
          distributors: displayDistributors.map(d => ({
            name: d.name,
            website: d.website,
            categories: d.categories,
          })),
          specialty,
        })
      })
      const data = await res.json()
      setResults(data)

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

  // Feature 2: Distributor management
  const openAddDistributor = () => {
    setEditingDistributor(null)
    setDistForm({ name: '', website: '', phone: '', location: '', categories: '' })
    setShowDistributorModal(true)
  }

  const openEditDistributor = (d: Distributor) => {
    setEditingDistributor(d)
    setDistForm({
      name: d.name,
      website: d.website || '',
      phone: d.phone || '',
      location: d.location || '',
      categories: (d.categories || []).join(', '),
    })
    setShowDistributorModal(true)
  }

  const saveDistributor = async () => {
    const categories = distForm.categories.split(',').map(c => c.trim().toLowerCase()).filter(Boolean)
    if (editingDistributor) {
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_distributor',
          id: editingDistributor.id,
          name: distForm.name,
          website: distForm.website,
          phone: distForm.phone,
          location: distForm.location,
          categories,
        })
      })
    } else {
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_distributor',
          name: distForm.name,
          website: distForm.website,
          phone: distForm.phone,
          location: distForm.location,
          categories,
        })
      })
    }
    setShowDistributorModal(false)
    loadData()
  }

  const toggleDistributorActive = async (d: Distributor) => {
    await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_distributor',
        id: d.id,
        active: !d.active,
      })
    })
    loadData()
  }

  const deleteDistributor = async (id: string) => {
    await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_distributor', id })
    })
    loadData()
  }

  // Feature 3: Purchase order creation
  const createPurchaseOrder = async (distResult: DistributorResult) => {
    setCreatingPO(true)
    try {
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_po',
          distributor_name: distResult.distributor,
          distributor_website: distResult.website,
          items: distResult.items,
          total: distResult.grand_total,
          specialty,
        })
      })
      loadData()
    } finally {
      setCreatingPO(false)
    }
  }

  const updatePOStatus = async (id: string, status: string) => {
    await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_po_status', id, status })
    })
    loadData()
  }

  const fmt = (n: number) => `$${n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const currentCommonMaterials = SPECIALTY_MATERIALS[specialty] || SPECIALTY_MATERIALS.flooring
  const specialtyLabel = SPECIALTIES.find(s => s.value === specialty)?.label || 'Flooring'

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>
      <Sidebar active="quotes" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto pt-14 md:pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs tracking-widest mb-1" style={{ color: '#999' }}>CYTRON / MATERIALS</p>
            <h1 className="text-2xl font-bold" style={{ color: '#000' }}>{specialtyLabel} Materials Calculator</h1>
            <p className="text-sm mt-1" style={{ color: '#999' }}>Compare prices across Gold Coast distributors</p>
          </div>
          <div className="flex gap-2 items-center">
            {/* Feature 4: Specialty selector */}
            <select
              value={specialty}
              onChange={e => handleSpecialtyChange(e.target.value)}
              className="px-3 py-2 text-sm font-medium rounded-lg appearance-none cursor-pointer"
              style={{ border: '1px solid #E5E5E5', color: '#1A1A1A', background: '#FAFAFA', minWidth: 140 }}
            >
              {SPECIALTIES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#999' }}>Searches</p>
            <p className="text-2xl font-bold">{history.length}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#999' }}>Distributors</p>
            <p className="text-2xl font-bold">{displayDistributors.length}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#999' }}>Purchase Orders</p>
            <p className="text-2xl font-bold">{purchaseOrders.length}</p>
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
                    <span className="mx-2">--</span>
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

        {/* Materials Input -- Free Text */}
        <div className="mb-6 p-5 rounded-xl" style={{ border: '2px solid #1A1A1A' }}>
          <h2 className="text-lg font-bold mb-1">What materials do you need?</h2>
          <p className="text-xs mb-3" style={{ color: '#999' }}>
            Write your list naturally -- e.g. &quot;50m2 vinyl plank, 14m rodape, 5L adhesive&quot;
          </p>

          {/* Feature 1: Recent materials chips */}
          {recentMaterials.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium mb-1.5" style={{ color: '#999' }}>Recent:</p>
              <div className="flex flex-wrap gap-1.5">
                {recentMaterials.slice(0, 12).map((name, i) => (
                  <button
                    key={i}
                    onClick={() => addChipToTextarea(name)}
                    className="text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                    style={{ background: '#F0F0F0', color: '#1A1A1A', border: '1px solid #E5E5E5' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.background = '#E5E5E5' }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.background = '#F0F0F0' }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Common materials for selected specialty */}
          <div className="mb-3">
            <p className="text-xs font-medium mb-1.5" style={{ color: '#999' }}>Common {specialtyLabel}:</p>
            <div className="flex flex-wrap gap-1.5">
              {currentCommonMaterials.slice(0, 10).map((name, i) => (
                <button
                  key={i}
                  onClick={() => addChipToTextarea(name)}
                  className="text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                  style={{ background: '#FAFAFA', color: '#666', border: '1px solid #E5E5E5' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.background = '#F0F0F0' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.background = '#FAFAFA' }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            placeholder={specialty === 'flooring'
              ? "Example:\n50m\u00B2 vinyl plank\n14 metros rodape\n5L cola para piso\n3 caixas underlay\n10m perfil de transicao"
              : `Example:\nList your ${specialtyLabel.toLowerCase()} materials here...\nInclude quantity and units`}
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
              {displayDistributors.slice(0, 5).map((d, i) => (
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
                                      {isCheapest && ' \u2713'}
                                    </div>
                                    <div className="text-xs" style={{ color: '#999' }}>
                                      {fmt(item.unit_price)}/{item.price_unit.replace('per ', '')}
                                      {item.source === 'estimated' && (
                                        <span className="ml-1 px-1 rounded" style={{ background: '#FFF3CD', color: '#856404', fontSize: 9 }}>est.</span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ color: '#CCC' }}>--</span>
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
                            {isBest && ' \u2713'}
                          </td>
                        )
                      })}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Best Option Summary + Create Order */}
            {results.best_option && (
              <div className="mt-4 p-5 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#059669' }}>
                      Best Option: {results.best_option.distributor}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#666' }}>
                      Total: {fmt(results.best_option.total)}
                      {results.best_option.savings > 0 && (
                        <span className="ml-2">
                          -- Save {fmt(results.best_option.savings)} vs most expensive
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Feature 3: Create PO button */}
                    <button
                      onClick={() => {
                        const bestResult = results.results.find(r => r.distributor === results.best_option.distributor)
                        if (bestResult) createPurchaseOrder(bestResult)
                      }}
                      disabled={creatingPO}
                      className="px-4 py-2 text-sm font-bold rounded-lg disabled:opacity-40"
                      style={{ background: '#059669', color: '#FFF' }}
                    >
                      {creatingPO ? 'Creating...' : 'Create Order'}
                    </button>
                    <div className="text-2xl font-black" style={{ color: '#059669' }}>
                      {fmt(results.best_option.total)}
                    </div>
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

        {/* Feature 3: Purchase Orders Section */}
        {purchaseOrders.length > 0 && (
          <div className="mb-6 p-5 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#666' }}>
                Purchase Orders ({purchaseOrders.length})
              </h2>
              <button
                onClick={() => setShowPOs(!showPOs)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ border: '1px solid #E5E5E5', color: '#666' }}
              >
                {showPOs ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {showPOs && (
              <div className="space-y-2">
                {purchaseOrders.map((po) => {
                  const statusStyle = PO_STATUS_COLORS[po.status] || PO_STATUS_COLORS.draft
                  const currentIdx = PO_STATUSES.indexOf(po.status as typeof PO_STATUSES[number])
                  const nextStatus = currentIdx < PO_STATUSES.length - 1 ? PO_STATUSES[currentIdx + 1] : null
                  return (
                    <div key={po.id} className="flex items-center justify-between text-sm p-3 rounded-lg" style={{ background: '#FAFAFA', border: '1px solid #F0F0F0' }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold">{po.distributor_name}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: statusStyle.bg, color: statusStyle.text }}
                          >
                            {po.status}
                          </span>
                          {po.specialty && po.specialty !== 'flooring' && (
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#F0F0F0', color: '#666' }}>
                              {po.specialty}
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#999' }}>
                          {new Date(po.created_at).toLocaleDateString('en-AU')} -- {po.items?.length || 0} items
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        {nextStatus && (
                          <button
                            onClick={() => updatePOStatus(po.id, nextStatus)}
                            className="text-xs px-2.5 py-1 rounded-lg font-medium"
                            style={{ background: '#1A1A1A', color: '#FFF' }}
                          >
                            Mark {nextStatus}
                          </button>
                        )}
                        <span className="font-bold" style={{ color: '#059669' }}>{fmt(po.total)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Active Distributors */}
        <div className="p-5 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#666' }}>
              Active Distributors ({displayDistributors.length})
            </h2>
            {/* Feature 2: Manage button */}
            <button
              onClick={openAddDistributor}
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{ border: '1px solid #E5E5E5', color: '#666' }}
            >
              Manage
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayDistributors.map((d, i) => (
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

      {/* Feature 2: Distributor Management Modal */}
      {showDistributorModal && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', zIndex: 9999 }}
          onClick={() => setShowDistributorModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)', position: 'relative', zIndex: 10000 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Manage Distributors</h2>
              <button
                onClick={() => setShowDistributorModal(false)}
                className="text-sm px-2 py-1 rounded"
                style={{ color: '#999' }}
              >
                Close
              </button>
            </div>

            {/* Add/Edit Form */}
            <div className="mb-5 p-4 rounded-xl" style={{ background: '#FAFAFA', border: '1px solid #E5E5E5' }}>
              <h3 className="text-sm font-bold mb-3">
                {editingDistributor ? 'Edit Distributor' : 'Add Distributor'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#666' }}>Name *</label>
                  <input
                    type="text"
                    value={distForm.name}
                    onChange={e => setDistForm({ ...distForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    style={{ border: '1px solid #E5E5E5', color: '#1A1A1A' }}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#666' }}>Website</label>
                  <input
                    type="text"
                    value={distForm.website}
                    onChange={e => setDistForm({ ...distForm, website: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    style={{ border: '1px solid #E5E5E5', color: '#1A1A1A' }}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#666' }}>Phone</label>
                  <input
                    type="text"
                    value={distForm.phone}
                    onChange={e => setDistForm({ ...distForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    style={{ border: '1px solid #E5E5E5', color: '#1A1A1A' }}
                    placeholder="(07) 1234 5678"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#666' }}>Location</label>
                  <input
                    type="text"
                    value={distForm.location}
                    onChange={e => setDistForm({ ...distForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    style={{ border: '1px solid #E5E5E5', color: '#1A1A1A' }}
                    placeholder="Gold Coast QLD"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium block mb-1" style={{ color: '#666' }}>Categories (comma-separated)</label>
                  <input
                    type="text"
                    value={distForm.categories}
                    onChange={e => setDistForm({ ...distForm, categories: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    style={{ border: '1px solid #E5E5E5', color: '#1A1A1A' }}
                    placeholder="vinyl, timber, adhesive, tools"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={saveDistributor}
                  disabled={!distForm.name.trim()}
                  className="px-4 py-2 text-sm font-bold text-white rounded-lg disabled:opacity-40"
                  style={{ background: '#1A1A1A' }}
                >
                  {editingDistributor ? 'Update' : 'Add Distributor'}
                </button>
                {editingDistributor && (
                  <button
                    onClick={() => {
                      setEditingDistributor(null)
                      setDistForm({ name: '', website: '', phone: '', location: '', categories: '' })
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-lg"
                    style={{ border: '1px solid #E5E5E5', color: '#666' }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            {/* Distributor List */}
            <div className="space-y-2">
              {distributors.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg" style={{ border: '1px solid #F0F0F0', background: d.active ? '#FFF' : '#FAFAFA', opacity: d.active ? 1 : 0.6 }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{d.name}</p>
                    <p className="text-xs" style={{ color: '#999' }}>{d.location} {d.phone ? `-- ${d.phone}` : ''}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {d.categories?.map((c, ci) => (
                        <span key={ci} className="text-xs px-1 py-0.5 rounded" style={{ background: '#F0F0F0', color: '#666', fontSize: 10 }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-3">
                    <button
                      onClick={() => openEditDistributor(d)}
                      className="text-xs px-2 py-1 rounded"
                      style={{ border: '1px solid #E5E5E5', color: '#666' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleDistributorActive(d)}
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        border: '1px solid #E5E5E5',
                        color: d.active ? '#92400E' : '#059669',
                        background: d.active ? '#FFFBEB' : '#F0FDF4',
                      }}
                    >
                      {d.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteDistributor(d.id)}
                      className="text-xs px-2 py-1 rounded"
                      style={{ border: '1px solid #FCA5A5', color: '#DC2626', background: '#FEF2F2' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
