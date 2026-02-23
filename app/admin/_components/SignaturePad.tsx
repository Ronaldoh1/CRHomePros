'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Pencil, RotateCcw, Save, CheckCircle, Loader2 } from 'lucide-react'
import { ref, uploadString, getDownloadURL } from 'firebase/storage'
import { ensureStorage } from '@/lib/firebase-auth'

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void
  savedSignatureUrl?: string | null
  label?: string
  compact?: boolean
}

export function SignaturePad({ onSignatureChange, savedSignatureUrl, label = 'Signature', compact = false }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [useSaved, setUseSaved] = useState(!!savedSignatureUrl)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = '#1a1a2e'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  useEffect(() => {
    if (savedSignatureUrl && useSaved) {
      onSignatureChange(savedSignatureUrl)
    }
  }, [savedSignatureUrl, useSaved])

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDrawing(true)
    setUseSaved(false)
    const { x, y } = getPos(e)
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()
    const { x, y } = getPos(e)
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasDrawn(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    if (hasDrawn && canvasRef.current) {
      onSignatureChange(canvasRef.current.toDataURL('image/png'))
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
    setSaved(false)
    onSignatureChange(null)
  }

  const saveAsDefault = async () => {
    if (!canvasRef.current) return
    const s = ensureStorage()
    if (!s) { console.warn('Firebase Storage not configured'); return }
    setSaving(true)
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png')
      const storageRef = ref(s, 'admin/signature/carlos-default.png')
      await uploadString(storageRef, dataUrl, 'data_url')
      const url = await getDownloadURL(storageRef)
      onSignatureChange(url)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save signature:', err)
    }
    setSaving(false)
  }

  const h = compact ? 100 : 150

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Pencil className="w-3.5 h-3.5" />
          {label}
        </label>
        <div className="flex gap-2">
          {savedSignatureUrl && !useSaved && (
            <button
              type="button"
              onClick={() => {
                setUseSaved(true)
                onSignatureChange(savedSignatureUrl)
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
            >
              Use Saved
            </button>
          )}
          {hasDrawn && (
            <>
              <button
                type="button"
                onClick={saveAsDefault}
                disabled={saving}
                className="text-xs px-2.5 py-1 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 flex items-center gap-1"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <CheckCircle className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                {saved ? 'Saved!' : 'Save as Default'}
              </button>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs px-2.5 py-1 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            </>
          )}
        </div>
      </div>

      {useSaved && savedSignatureUrl ? (
        <div className="relative border border-white/10 rounded-xl bg-white p-4 flex items-center justify-center" style={{ height: h }}>
          <img src={savedSignatureUrl} alt="Saved signature" className="max-h-full max-w-full object-contain" />
          <button
            type="button"
            onClick={() => { setUseSaved(false); clearCanvas() }}
            className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
          >
            Draw New
          </button>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={600}
          height={h * 2}
          className="w-full border border-white/10 rounded-xl bg-white cursor-crosshair touch-none"
          style={{ height: h }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      )}
      {!hasDrawn && !useSaved && (
        <p className="text-xs text-slate-400 text-center">Draw your signature above</p>
      )}
    </div>
  )
}
