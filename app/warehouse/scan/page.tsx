'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase, WarehouseItem } from '@/lib/supabase'

type TransactionType = 'entry' | 'exit'

export default function ScanPage() {
  const [scanning, setScanning] = useState(false)
  const [scannedItem, setScannedItem] = useState<WarehouseItem | null>(null)
  const [transactionType, setTransactionType] = useState<TransactionType>('exit')
  const [quantity, setQuantity] = useState(1)
  const [projectId, setProjectId] = useState('')
  const [projects, setProjects] = useState<{id: string, name: string}[]>([])
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrRef = useRef<any>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Keep screen awake while on this page (prevents device sleep during scanning)
  useEffect(() => {
    async function requestWakeLock() {
      if (!('wakeLock' in navigator)) return
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      } catch {
        // Wake lock not supported or denied — silent fail
      }
    }

    requestWakeLock()

    // Re-acquire wake lock when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestWakeLock()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      wakeLockRef.current?.release().catch(() => {})
    }
  }, [])

  useEffect(() => {
    supabase.from('projects').select('id, name').eq('status', 'active').then(({ data }) => {
      if (data) setProjects(data)
    })
  }, [])

  useEffect(() => {
    if (scanning && scannerRef.current) {
      import('html5-qrcode').then(({ Html5Qrcode }) => {
        const scanner = new Html5Qrcode('qr-reader')
        html5QrRef.current = scanner
        scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            scanner.stop()
            setScanning(false)
            lookupItem(decodedText)
          },
          () => {}
        ).catch(() => setScanning(false))
      })
    }
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {})
      }
    }
  }, [scanning])

  async function lookupItem(qrCode: string) {
    const { data } = await supabase
      .from('warehouse_items')
      .select('*')
      .eq('qr_code', qrCode)
      .single()
    if (data) setScannedItem(data)
    else alert('Item não encontrado: ' + qrCode)
  }

  async function handleTransaction() {
    if (!scannedItem) return
    setLoading(true)

    const newStock = transactionType === 'entry'
      ? scannedItem.current_stock + quantity
      : scannedItem.current_stock - quantity

    if (newStock < 0) {
      alert('Estoque insuficiente!')
      setLoading(false)
      return
    }

    // 1. Insert transaction
    const { error: txError } = await supabase.from('warehouse_transactions').insert({
      item_id: scannedItem.id,
      project_id: projectId || null,
      transaction_type: transactionType,
      quantity,
      unit_cost: scannedItem.unit_cost,
      total_cost: quantity * scannedItem.unit_cost,
      notes,
      performed_by: 'Maco Team'
    })

    // 2. Update stock
    await supabase
      .from('warehouse_items')
      .update({ current_stock: newStock })
      .eq('id', scannedItem.id)

    // 3. Trigger n8n for low stock alert
    if (newStock <= scannedItem.minimum_stock) {
      await fetch('/api/warehouse/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: scannedItem,
          newStock,
          type: 'low_stock'
        })
      }).catch(() => {})
    }

    setLoading(false)
    if (!txError) {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setScannedItem(null)
        setQuantity(1)
        setNotes('')
      }, 2500)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <Link href="/warehouse" className="text-gray-400 hover:text-white">← CYTRON / Warehouse</Link>
        <span className="text-gray-600">/</span>
        <span className="font-semibold">📷 Escanear QR Code</span>
      </div>

      <div className="max-w-md mx-auto px-6 py-8">

        {/* Success message */}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 text-center mb-6">
            <div className="text-5xl mb-3">✅</div>
            <div className="text-green-400 font-semibold text-lg">Transação registrada!</div>
            <div className="text-gray-400 text-sm mt-1">
              {transactionType === 'exit' ? 'Saída' : 'Entrada'} de {quantity} {scannedItem?.unit} — {scannedItem?.name}
            </div>
          </div>
        )}

        {/* Item found */}
        {scannedItem && !success ? (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl p-5 border border-blue-500/40">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-lg">{scannedItem.name}</div>
                  <div className="text-gray-400 text-sm">{scannedItem.sku} • {scannedItem.location}</div>
                </div>
                <button onClick={() => setScannedItem(null)} className="text-gray-500 hover:text-white text-sm">✕</button>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Estoque atual</div>
                  <div className={`font-bold text-lg ${scannedItem.current_stock <= scannedItem.minimum_stock ? 'text-orange-400' : 'text-green-400'}`}>
                    {scannedItem.current_stock} {scannedItem.unit}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Mínimo</div>
                  <div className="font-bold text-lg text-gray-300">{scannedItem.minimum_stock} {scannedItem.unit}</div>
                </div>
                <div>
                  <div className="text-gray-400">Custo unit.</div>
                  <div className="font-bold text-lg">${scannedItem.unit_cost}</div>
                </div>
              </div>
            </div>

            {/* Transaction type */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTransactionType('exit')}
                className={`py-3 rounded-xl font-medium transition-colors ${transactionType === 'exit' ? 'bg-red-600' : 'bg-gray-800 text-gray-400'}`}
              >
                📤 Saída
              </button>
              <button
                onClick={() => setTransactionType('entry')}
                className={`py-3 rounded-xl font-medium transition-colors ${transactionType === 'entry' ? 'bg-green-600' : 'bg-gray-800 text-gray-400'}`}
              >
                📥 Entrada
              </button>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">Quantidade ({scannedItem.unit})</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 bg-gray-800 rounded-xl text-xl">−</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-center text-xl font-bold focus:outline-none focus:border-blue-500"
                />
                <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 bg-gray-800 rounded-xl text-xl">+</button>
              </div>
            </div>

            {/* Project (for exits) */}
            {transactionType === 'exit' && (
              <div>
                <label className="text-sm text-gray-400 block mb-2">Projeto</label>
                <select
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecionar projeto...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">Observações (opcional)</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Instalação painel ap. 15"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Total da transação</span>
                <span className="font-bold">${(quantity * scannedItem.unit_cost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estoque após</span>
                <span className={`font-bold ${
                  (transactionType === 'exit' ? scannedItem.current_stock - quantity : scannedItem.current_stock + quantity) <= scannedItem.minimum_stock
                    ? 'text-orange-400' : 'text-green-400'
                }`}>
                  {transactionType === 'exit' ? scannedItem.current_stock - quantity : scannedItem.current_stock + quantity} {scannedItem.unit}
                </span>
              </div>
            </div>

            <button
              onClick={handleTransaction}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              {loading ? 'Registrando...' : `✓ Confirmar ${transactionType === 'exit' ? 'Saída' : 'Entrada'}`}
            </button>
          </div>
        ) : !success && (
          <div className="space-y-6">
            {/* QR Scanner */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              {scanning ? (
                <div>
                  <div id="qr-reader" className="w-full" />
                  <button
                    onClick={() => { setScanning(false); html5QrRef.current?.stop().catch(() => {}) }}
                    className="w-full py-3 text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setScanning(true)}
                  className="w-full py-16 flex flex-col items-center gap-3 hover:bg-gray-800/50 transition-colors"
                >
                  <span className="text-6xl">📷</span>
                  <span className="font-semibold text-lg">Escanear QR Code</span>
                  <span className="text-gray-500 text-sm">Aponte a câmera para o código do item</span>
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800" /></div>
              <div className="relative text-center"><span className="bg-gray-950 px-3 text-gray-500 text-sm">ou digite manualmente</span></div>
            </div>

            {/* Manual entry */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Código do item (ex: QR-CAB-2.5-BLK)"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => lookupItem(manualCode)}
                className="bg-blue-600 hover:bg-blue-500 px-4 rounded-xl font-medium transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
