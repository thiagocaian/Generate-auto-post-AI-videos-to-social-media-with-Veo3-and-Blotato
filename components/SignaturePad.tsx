'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface SignaturePadProps {
  onSave: (dataUrl: string, signerName: string) => void
  onCancel: () => void
  type?: 'approval' | 'completion'
  jobTitle?: string
}

export default function SignaturePad({ onSave, onCancel, type = 'approval', jobTitle }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [signerName, setSignerName] = useState('')

  const getContext = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    return { canvas, ctx }
  }, [])

  // Setup canvas
  useEffect(() => {
    const result = getContext()
    if (!result) return
    const { canvas, ctx } = result

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Style
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // White background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, rect.width, rect.height)
  }, [getContext])

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const result = getContext()
    if (!result) return
    const { ctx } = result
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setIsDrawing(true)
    setHasDrawn(true)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing) return
    const result = getContext()
    if (!result) return
    const { ctx } = result
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const result = getContext()
    if (!result) return
    const { canvas, ctx } = result
    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, rect.width, rect.height)
    setHasDrawn(false)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasDrawn) return
    const dataUrl = canvas.toDataURL('image/png')
    onSave(dataUrl, signerName)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl overflow-hidden" style={{ boxShadow: '0 -10px 40px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-base font-bold" style={{ color: '#000' }}>
            {type === 'approval' ? 'Client Approval' : 'Job Completion Sign-off'}
          </h3>
          {jobTitle && (
            <p className="text-xs mt-0.5" style={{ color: '#999' }}>{jobTitle}</p>
          )}
          <p className="text-xs mt-2" style={{ color: '#666' }}>
            {type === 'approval'
              ? 'By signing below, I authorise the quoted work to proceed.'
              : 'By signing below, I confirm the work has been completed to my satisfaction.'}
          </p>
        </div>

        {/* Signer name */}
        <div className="px-5 pb-3">
          <input
            type="text"
            value={signerName}
            onChange={e => setSignerName(e.target.value)}
            placeholder="Client full name"
            className="w-full px-3 py-2 text-sm rounded-lg"
            style={{ border: '1px solid #E5E5E5', background: '#FAFAFA', outline: 'none' }}
          />
        </div>

        {/* Canvas */}
        <div className="px-5 pb-3">
          <div className="relative rounded-xl overflow-hidden" style={{ border: '2px solid #E5E5E5' }}>
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair touch-none"
              style={{ height: 180 }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-sm" style={{ color: '#CCC' }}>Sign here</p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={clearCanvas}
              className="text-xs font-medium px-3 py-1 rounded"
              style={{ color: '#999' }}
            >
              Clear
            </button>
            <p className="text-[9px]" style={{ color: '#CCC' }}>
              {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={handleSave}
            disabled={!hasDrawn || !signerName}
            className="flex-1 py-3 text-sm font-medium text-white rounded-xl disabled:opacity-40"
            style={{ background: type === 'approval' ? '#000' : '#059669' }}
          >
            {type === 'approval' ? 'Confirm & Approve' : 'Confirm Completion'}
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-3 text-sm font-medium rounded-xl"
            style={{ border: '1px solid #E5E5E5', color: '#666' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
