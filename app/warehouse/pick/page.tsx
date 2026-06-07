'use client'
import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type PickItem = {
  position: string
  sku: string
  product: string
  qty: number
  scanned: boolean
  wrongScan?: boolean
}

// Demo order shown when no real order is passed
const DEMO_ORDER = {
  orderName: '#HOM-1042',
  customer: 'Sarah Mitchell',
  totalItems: 6,
  estimatedMinutes: 9,
  pickItems: [
    { position: 'A1', sku: 'TWK-6PCT',  product: 'Teeth Whitening Kit 6%',   qty: 2, scanned: false },
    { position: 'A2', sku: 'WPN-PRO',   product: 'Whitening Pen Pro',         qty: 1, scanned: false },
    { position: 'A3', sku: 'WTS-STD',   product: 'Whitening Tray Set',        qty: 1, scanned: false },
    { position: 'B1', sku: 'DMS-50',    product: 'Dry Mouth Spray 50ml',      qty: 2, scanned: false },
    { position: 'C1', sku: 'LED-ACC',   product: 'LED Whitening Accelerator', qty: 1, scanned: false },
    { position: 'D1', sku: 'GFT-WHT',   product: 'Gift Box – Whitening Bundle', qty: 1, scanned: false },
  ] as PickItem[]
}

function PickPageInner() {
  const params = useSearchParams()
  const [order, setOrder] = useState(DEMO_ORDER)
  const [items, setItems] = useState<PickItem[]>(DEMO_ORDER.pickItems)
  const [scanInput, setScanInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [lastScan, setLastScan] = useState<{ sku: string; ok: boolean } | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [dispatched, setDispatched] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrRef = useRef<any>(null)

  // Load order from URL params if present
  useEffect(() => {
    const orderParam = params.get('order')
    if (orderParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(orderParam))
        setOrder(parsed)
        setItems(parsed.pickItems.map((i: PickItem) => ({ ...i, scanned: false })))
      } catch {}
    }
    // Focus input on mount
    inputRef.current?.focus()
  }, [params])

  const scannedCount = items.filter(i => i.scanned).length
  const allDone = scannedCount === items.length
  const progress = Math.round((scannedCount / items.length) * 100)

  // Find next unscanned
  const nextItem = items.find(i => !i.scanned)

  function handleScan(code: string) {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    setScanInput('')

    const idx = items.findIndex(i => i.sku.toUpperCase() === trimmed && !i.scanned)
    if (idx !== -1) {
      // Correct item
      setItems(prev => prev.map((item, i) =>
        i === idx ? { ...item, scanned: true, wrongScan: false } : item
      ))
      setLastScan({ sku: trimmed, ok: true })
      setActiveIdx(idx + 1)
      // Vibrate on success
      if (navigator.vibrate) navigator.vibrate(100)
    } else {
      // Wrong item
      setLastScan({ sku: trimmed, ok: false })
      if (navigator.vibrate) navigator.vibrate([100, 50, 100])
    }

    setTimeout(() => setLastScan(null), 2000)
    inputRef.current?.focus()
  }

  // Camera scan
  useEffect(() => {
    if (scanning && scannerRef.current) {
      import('html5-qrcode').then(({ Html5Qrcode }) => {
        const scanner = new Html5Qrcode('pick-qr-reader')
        html5QrRef.current = scanner
        scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decoded: string) => {
            scanner.stop().catch(() => {})
            setScanning(false)
            handleScan(decoded)
          },
          () => {}
        ).catch(() => setScanning(false))
      })
    }
    return () => {
      if (html5QrRef.current) html5QrRef.current.stop().catch(() => {})
    }
  }, [scanning])

  async function confirmPack() {
    setConfirming(true)
    try {
      await fetch('/api/warehouse/pack-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderName: order.orderName,
          customer: order.customer,
          allScanned: true,
          itemsCount: items.length,
          missingItems: [],
          confirmedAt: new Date().toISOString()
        })
      }).catch(() => {})
    } finally {
      setConfirming(false)
      setDispatched(true)
    }
  }

  // DISPATCHED screen
  if (dispatched) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="text-8xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-400">Pack Confirmed!</h1>
          <p className="text-gray-400 text-lg">{order.orderName}</p>
          <p className="text-gray-500">{items.length} items packed</p>
          <div className="mt-6 bg-teal-900/40 border border-teal-500/40 rounded-2xl p-4 text-sm text-teal-300">
            🚚 Starshipit is printing the label<br />
            📬 Shopify will update automatically
          </div>
          <Link
            href="/warehouse/pick"
            className="block mt-8 bg-gray-800 hover:bg-gray-700 py-4 px-8 rounded-2xl text-gray-300 font-medium transition-colors"
          >
            Next Order →
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/warehouse" className="text-gray-500 text-sm">← Warehouse</Link>
          <span className="text-xs text-gray-500 font-mono">PICK &amp; PACK</span>
          <span className="text-xs text-teal-400 font-bold">{scannedCount}/{items.length}</span>
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-teal-900/30 border-b border-teal-800/40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">{order.orderName}</div>
            <div className="text-gray-400 text-sm">{order.customer}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-teal-400">{progress}%</div>
            <div className="text-xs text-gray-500">complete</div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Scan feedback */}
      {lastScan && (
        <div className={`px-4 py-3 text-center font-bold text-lg transition-all ${
          lastScan.ok
            ? 'bg-green-500/20 text-green-400 border-b border-green-500/30'
            : 'bg-red-500/20 text-red-400 border-b border-red-500/30'
        }`}>
          {lastScan.ok ? `✅ ${lastScan.sku} — Confirmed!` : `❌ ${lastScan.sku} — Not in this order!`}
        </div>
      )}

      {/* Next item highlight */}
      {nextItem && !allDone && (
        <div className="mx-4 mt-4 bg-blue-900/40 border border-blue-500/40 rounded-2xl p-4">
          <div className="text-xs text-blue-400 font-semibold mb-1">NEXT TO PICK</div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
              {nextItem.position}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{nextItem.product}</div>
              <div className="text-sm text-gray-400">{nextItem.sku} · Qty: {nextItem.qty}</div>
            </div>
          </div>
        </div>
      )}

      {/* All done banner */}
      {allDone && (
        <div className="mx-4 mt-4 bg-green-900/40 border border-green-500/40 rounded-2xl p-4 text-center">
          <div className="text-2xl mb-1">🎉</div>
          <div className="font-bold text-green-400">All items picked!</div>
          <div className="text-sm text-gray-400 mt-1">Seal the box and confirm below</div>
        </div>
      )}

      {/* Scan input */}
      <div className="px-4 mt-4 space-y-2">
        {scanning ? (
          <div className="rounded-2xl overflow-hidden border border-gray-700">
            <div id="pick-qr-reader" className="w-full" ref={scannerRef} />
            <button
              onClick={() => { setScanning(false); html5QrRef.current?.stop().catch(() => {}) }}
              className="w-full py-3 bg-gray-900 text-gray-400 text-sm"
            >
              Cancel camera
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan(scanInput)}
              placeholder="Scan barcode or type SKU..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-lg font-mono focus:outline-none focus:border-teal-500"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              onClick={() => setScanning(true)}
              className="bg-gray-800 hover:bg-gray-700 px-4 rounded-xl text-2xl transition-colors"
            >
              📷
            </button>
          </div>
        )}
        <p className="text-xs text-gray-600 text-center">
          Hardware scanner auto-submits · Press Enter for manual
        </p>
      </div>

      {/* Pick list */}
      <div className="flex-1 px-4 mt-4 space-y-2 pb-40">
        <div className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wider">Pick List — sorted by zone</div>
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              item.scanned
                ? 'bg-green-900/20 border-green-800/40 opacity-60'
                : i === activeIdx
                ? 'bg-blue-900/30 border-blue-600/60'
                : 'bg-gray-900 border-gray-800'
            }`}
          >
            {/* Zone badge */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
              item.scanned ? 'bg-green-700' : 'bg-gray-700'
            }`}>
              {item.scanned ? '✓' : item.position}
            </div>
            {/* Item info */}
            <div className="flex-1 min-w-0">
              <div className={`font-medium text-sm truncate ${item.scanned ? 'line-through text-gray-500' : ''}`}>
                {item.product}
              </div>
              <div className="text-xs text-gray-500 font-mono">{item.sku} · ×{item.qty}</div>
            </div>
            {/* Status */}
            <div className="shrink-0">
              {item.scanned
                ? <span className="text-green-400 text-lg">✅</span>
                : <span className="text-gray-600 text-lg">○</span>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/95 backdrop-blur border-t border-gray-800">
        {allDone ? (
          <button
            onClick={confirmPack}
            disabled={confirming}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 py-5 rounded-2xl font-bold text-xl transition-colors shadow-lg shadow-green-900/40"
          >
            {confirming ? 'Confirming...' : '✅ CONFIRM PACK — Seal & Dispatch'}
          </button>
        ) : (
          <button
            disabled
            className="w-full bg-gray-800 py-5 rounded-2xl font-bold text-xl text-gray-500 cursor-not-allowed"
          >
            {scannedCount}/{items.length} items scanned
          </button>
        )}
      </div>
    </main>
  )
}

export default function PickPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>}>
      <PickPageInner />
    </Suspense>
  )
}
