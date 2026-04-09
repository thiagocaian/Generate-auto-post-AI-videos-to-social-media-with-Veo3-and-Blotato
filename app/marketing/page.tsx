'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

type Post = { id: string; caption: string; platform: string; reach: number; likes: number; created_at: string; status: string; image_url: string; video_url: string }

const pipeline = [
  { label: 'Photo Intake',       tool: 'Secure Upload'     },
  { label: 'Scene Analysis',     tool: 'CYTRON Vision AI'  },
  { label: 'Video Generation',   tool: 'CYTRON Video Engine'},
  { label: 'Caption Writer',     tool: 'CYTRON Copy AI'    },
  { label: 'Auto Publisher',     tool: 'Multi-Platform'    },
]

// Default brand config per company (can be expanded per client)
const BRAND_CONFIG: Record<string, { product_name: string; target_audience: string; style: string; caption_tone: string }> = {
  'inkwell_printing': {
    product_name: 'Custom Screen Printed Apparel',
    target_audience: 'athletes, teams, businesses and streetwear lovers aged 18-40',
    style: 'cinematic slow motion, golden hour warm light, film grain texture, close-up of hands on press, ink bleeding through silk screen, bold graffiti-meets-craft aesthetic, 9:16 vertical',
    caption_tone: 'bold, authentic, street energy, proud craftsman',
  },
  'default': {
    product_name: 'Product',
    target_audience: 'general audience aged 18-45',
    style: 'cinematic, natural lighting, warm tones, authentic human moments, 9:16 vertical',
    caption_tone: 'engaging, authentic, professional',
  },
}

// ─── Ready to Use Tab (upload video pronto) ─────────────────────────────────
function ReadyToUseTab({ platforms, togglePlatform, caption, setCaption, posting, setPosting, uploadError, setUploadError, setPosts, setStats, stats }: {
  platforms: string[]; togglePlatform: (p: string) => void; caption: string; setCaption: (c: string) => void;
  posting: boolean; setPosting: (p: boolean) => void; uploadError: string | null; setUploadError: (e: string | null) => void;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>; setStats: React.Dispatch<React.SetStateAction<{ total: number; published: number; totalReach: number; totalLikes: number }>>; stats: { total: number; published: number; totalReach: number; totalLikes: number };
}) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [postMode, setPostMode] = useState<'idle' | 'uploaded' | 'posting' | 'posted'>('idle')
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleVideoSelect = async (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|mov|webm|avi)$/i)) {
      setUploadError('Please select a video file (MP4, MOV, WebM)')
      return
    }
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
    setUploadError(null)

    // Upload to Supabase
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setUploadedVideoUrl(data.url)
      setPostMode('uploaded')
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const quickPost = async () => {
    if (!uploadedVideoUrl || !caption.trim() || platforms.length === 0) {
      setUploadError('Add a caption and select at least one platform')
      return
    }
    setPosting(true)
    setPostMode('posting')
    setUploadError(null)
    try {
      const res = await fetch('/api/marketing/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: uploadedVideoUrl, caption, platforms: platforms.map(p => p.toLowerCase()) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Post failed')

      // Save to DB
      for (const p of platforms) {
        try {
          const dbRes = await fetch('/api/marketing-posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: uploadedVideoUrl, caption, platform: p.toLowerCase(), status: 'published' }),
          })
          const dbData = await dbRes.json()
          if (dbData.post) setPosts(prev => [dbData.post, ...prev])
        } catch { /* non-blocking */ }
      }
      setStats(prev => ({ ...prev, total: prev.total + 1, published: prev.published + platforms.length }))
      setPostMode('posted')
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Post failed')
      setPostMode('uploaded')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="p-6 md:p-8" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2" style={{ color: '#000000' }}>Upload & Post</h2>
        <p className="text-sm" style={{ color: '#999999' }}>Upload your ready-made video. Add caption. Post to all platforms.</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Upload Zone */}
        {!videoPreview && (
          <div
            className="aspect-video flex flex-col items-center justify-center cursor-pointer mb-6 transition-all hover:border-black"
            style={{ background: '#FAFAFA', border: '2px dashed #E5E5E5' }}
            onClick={() => videoInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleVideoSelect(f) }}
          >
            <span className="text-4xl mb-3">📁</span>
            <p className="text-sm font-semibold" style={{ color: '#333333' }}>Drop your video here or click to browse</p>
            <p className="text-xs mt-1" style={{ color: '#999999' }}>MP4, MOV, WebM — Max 50MB</p>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoSelect(f) }} />
          </div>
        )}

        {/* Video Preview */}
        {videoPreview && (
          <div className="mb-6">
            <div className="relative">
              <video src={videoPreview} controls className="w-full max-h-[400px] object-contain" style={{ background: '#000', border: '1px solid #E5E5E5' }} />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-white">Uploading...</p>
                  </div>
                </div>
              )}
              {postMode === 'posted' && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
                  <div className="text-center">
                    <span className="text-4xl block mb-2">✅</span>
                    <p className="text-sm font-bold text-white">Published to {platforms.join(', ')}!</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: '#999999' }}>{videoFile?.name} ({((videoFile?.size || 0) / 1024 / 1024).toFixed(1)}MB)</span>
              <button onClick={() => { setVideoFile(null); setVideoPreview(null); setUploadedVideoUrl(null); setPostMode('idle'); setCaption('') }}
                className="text-xs px-2 py-1" style={{ background: '#F5F5F5', color: '#666', border: '1px solid #E5E5E5' }}>Change</button>
            </div>
          </div>
        )}

        {/* Caption + Post Controls */}
        {postMode !== 'idle' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: '#333' }}>Caption</label>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3}
                placeholder="Write your caption for all platforms..."
                className="w-full text-sm px-3 py-2 resize-none outline-none"
                style={{ border: '1px solid #E5E5E5', color: '#000', background: '#FAFAFA' }} />
            </div>

            {/* Platform Selection */}
            <div className="p-4" style={{ background: '#F9F9F9', border: '1px solid #E5E5E5' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: '#666' }}>POST TO:</p>
              <div className="flex items-center gap-3 flex-wrap">
                {['Instagram', 'TikTok', 'Facebook', 'LinkedIn'].map((p) => (
                  <button key={p} onClick={() => togglePlatform(p)}
                    className="px-3 py-1.5 text-xs font-semibold transition-all"
                    style={{ background: platforms.includes(p) ? '#000' : '#FFF', color: platforms.includes(p) ? '#FFF' : '#999', border: `1px solid ${platforms.includes(p) ? '#000' : '#E5E5E5'}` }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {uploadError && <div className="p-3 text-xs" style={{ background: '#FFF0F0', color: '#CC0000', border: '1px solid #FFDDDD' }}>{uploadError}</div>}

            <div className="flex gap-3">
              <button onClick={quickPost} disabled={posting || postMode === 'posted' || !uploadedVideoUrl}
                className="flex-1 text-sm font-semibold py-3 transition-all"
                style={{ background: posting ? '#CCC' : '#000', color: '#FFF' }}>
                {posting ? 'Publishing...' : postMode === 'posted' ? 'Published!' : `Post to ${platforms.length} platform${platforms.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Record Tab (câmera real) ────────────────────────────────────────────────
function RecordTab({ platforms, togglePlatform, caption, setCaption, posting, setPosting, uploadError, setUploadError, setPosts, setStats, stats }: {
  platforms: string[]; togglePlatform: (p: string) => void; caption: string; setCaption: (c: string) => void;
  posting: boolean; setPosting: (p: boolean) => void; uploadError: string | null; setUploadError: (e: string | null) => void;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>; setStats: React.Dispatch<React.SetStateAction<{ total: number; published: number; totalReach: number; totalLikes: number }>>; stats: { total: number; published: number; totalReach: number; totalLikes: number };
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [cameraActive, setCameraActive] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [postMode, setPostMode] = useState<'idle' | 'camera' | 'recorded' | 'uploaded' | 'posting' | 'posted'>('idle')
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } }, audio: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)
      setPostMode('camera')
      setUploadError(null)
    } catch (err) {
      setUploadError('Camera access denied. Please allow camera permission.')
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
  }

  const startRecording = () => {
    if (!streamRef.current) return
    chunksRef.current = []
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
    const recorder = new MediaRecorder(streamRef.current, { mimeType })
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      setRecordedBlob(blob)
      setRecordedUrl(URL.createObjectURL(blob))
      setPostMode('recorded')
      stopCamera()
    }
    mediaRecorderRef.current = recorder
    recorder.start(1000)
    setRecording(true)
    setRecordTime(0)
    timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const uploadAndPost = async (aiEnhance: boolean) => {
    if (!recordedBlob) return
    setUploading(true)
    setUploadError(null)
    try {
      const file = new File([recordedBlob], `recording-${Date.now()}.webm`, { type: 'video/webm' })
      const form = new FormData()
      form.append('file', file)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: form })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed')
      setUploadedVideoUrl(uploadData.url)
      setPostMode('uploaded')

      if (!aiEnhance) {
        // Quick Post Raw
        if (!caption.trim()) { setUploadError('Add a caption first'); setUploading(false); return }
        setPosting(true)
        setPostMode('posting')
        const postRes = await fetch('/api/marketing/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: uploadData.url, caption, platforms: platforms.map(p => p.toLowerCase()) }),
        })
        const postData = await postRes.json()
        if (!postRes.ok) throw new Error(postData.error || 'Post failed')

        for (const p of platforms) {
          try {
            const dbRes = await fetch('/api/marketing-posts', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image_url: uploadData.url, caption, platform: p.toLowerCase(), status: 'published' }),
            })
            const dbData = await dbRes.json()
            if (dbData.post) setPosts(prev => [dbData.post, ...prev])
          } catch { /* non-blocking */ }
        }
        setStats(prev => ({ ...prev, total: prev.total + 1, published: prev.published + platforms.length }))
        setPostMode('posted')
        setPosting(false)
      }
      // If aiEnhance, user would need to go to AI Create tab with the uploaded URL
      // For now, show success of upload
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed')
      setPostMode('recorded')
    } finally {
      setUploading(false)
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const reset = () => {
    stopCamera(); setRecordedBlob(null); setRecordedUrl(null); setUploadedVideoUrl(null); setPostMode('idle'); setCaption(''); setRecordTime(0)
  }

  return (
    <div className="p-6 md:p-8" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2" style={{ color: '#000' }}>Record & Post</h2>
        <p className="text-sm" style={{ color: '#999' }}>Record from your camera. Choose AI enhance or quick post raw.</p>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Camera / Video Preview */}
        <div className="aspect-[9/16] max-h-[500px] mx-auto mb-6 relative overflow-hidden" style={{ background: '#0a0a0a', border: '1px solid #E5E5E5' }}>
          {/* Live Camera Feed */}
          {(postMode === 'idle' || postMode === 'camera') && (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} muted playsInline />
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={startCamera}>
                  <div className="text-center">
                    <span className="text-5xl block mb-4">📹</span>
                    <p className="text-sm font-semibold text-white">Tap to open camera</p>
                    <p className="text-xs mt-1" style={{ color: '#666' }}>Allow camera & microphone access</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Recorded Playback */}
          {recordedUrl && postMode !== 'camera' && postMode !== 'idle' && (
            <>
              <video src={recordedUrl} controls className="w-full h-full object-cover" />
              {postMode === 'posted' && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
                  <div className="text-center">
                    <span className="text-4xl block mb-2">✅</span>
                    <p className="text-sm font-bold text-white">Published to {platforms.join(', ')}!</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Recording Timer */}
          {recording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono text-white">{formatTime(recordTime)}</span>
            </div>
          )}

          {/* Upload Overlay */}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-white">Uploading & posting...</p>
              </div>
            </div>
          )}

          {/* Record / Stop Button */}
          {cameraActive && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              {!recording ? (
                <button onClick={startRecording} className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ background: '#CC0000', border: '3px solid #FFF' }}>
                  <div className="w-6 h-6 rounded-full" style={{ background: '#FFF' }} />
                </button>
              ) : (
                <button onClick={stopRecording} className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ background: '#CC0000', border: '3px solid #FFF' }}>
                  <div className="w-6 h-6" style={{ background: '#FFF' }} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Post Options — Show after recording */}
        {(postMode === 'recorded' || postMode === 'uploaded') && (
          <>
            {/* Caption */}
            <div className="mb-4">
              <label className="text-xs font-semibold block mb-2" style={{ color: '#333' }}>Caption</label>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3}
                placeholder="Write your caption..."
                className="w-full text-sm px-3 py-2 resize-none outline-none"
                style={{ border: '1px solid #E5E5E5', color: '#000', background: '#FAFAFA' }} />
            </div>

            {/* Platform Selection */}
            <div className="p-4 mb-4" style={{ background: '#F9F9F9', border: '1px solid #E5E5E5' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: '#666' }}>POST TO:</p>
              <div className="flex items-center gap-3 flex-wrap">
                {['Instagram', 'TikTok', 'Facebook', 'LinkedIn'].map((p) => (
                  <button key={p} onClick={() => togglePlatform(p)}
                    className="px-3 py-1.5 text-xs font-semibold transition-all"
                    style={{ background: platforms.includes(p) ? '#000' : '#FFF', color: platforms.includes(p) ? '#FFF' : '#999', border: `1px solid ${platforms.includes(p) ? '#000' : '#E5E5E5'}` }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {uploadError && <div className="p-3 text-xs mb-4" style={{ background: '#FFF0F0', color: '#CC0000', border: '1px solid #FFDDDD' }}>{uploadError}</div>}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button onClick={() => uploadAndPost(false)} disabled={posting || uploading}
                className="py-3 text-sm font-semibold transition-all"
                style={{ background: '#000', color: '#FFF' }}>
                {posting ? 'Publishing...' : '⚡ Quick Post Raw'}
              </button>
              <button onClick={() => uploadAndPost(true)} disabled={posting || uploading}
                className="py-3 text-sm font-semibold transition-all"
                style={{ background: '#FFF', color: '#000', border: '1px solid #E5E5E5' }}>
                🤖 AI Enhance + Post
              </button>
            </div>
            <button onClick={reset} className="w-full text-xs py-2" style={{ color: '#999' }}>Record again</button>
          </>
        )}

        {postMode === 'posted' && (
          <button onClick={reset} className="w-full text-sm font-semibold py-3 mt-4" style={{ background: '#F5F5F5', color: '#333', border: '1px solid #E5E5E5' }}>
            Record another
          </button>
        )}
      </div>
    </div>
  )
}

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'ai-create' | 'ready-to-use' | 'record'>('ai-create')
  const [step, setStep] = useState<'idle' | 'uploaded' | 'uploading' | 'analysing' | 'generating' | 'ready' | 'posted'>('idle')
  const [dragOver, setDragOver]   = useState(false)
  const [previews, setPreviews]     = useState<string[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const videoUrlRef = useRef<string | null>(null)
  // Legacy single-value aliases for backward compatibility
  const preview = previews[0] || null
  const uploadedUrl = uploadedUrls[0] || null
  const [caption, setCaption]     = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['Instagram', 'TikTok'])
  const [posting, setPosting]     = useState(false)
  const [company, setCompany]     = useState<{ name: string; slug: string } | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [brief, setBrief]         = useState('')
  const [posts, setPosts]         = useState<Post[]>([])
  const [stats, setStats]         = useState({ total: 0, published: 0, totalReach: 0, totalLikes: 0 })
  const [pendingPostId, setPendingPostId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Load company info + posts on mount
  useEffect(() => {
    fetch('/api/company')
      .then(r => r.json())
      .then(d => { if (d.company) setCompany(d.company) })
      .catch(() => {})

    fetch('/api/marketing-posts')
      .then(r => r.json())
      .then(d => {
        if (d.posts) setPosts(d.posts)
        if (d.stats) setStats(d.stats)
      })
      .catch(() => {})
  }, [])

  // Compress image client-side (mobile camera photos are 5-10MB, Vercel limit is 4.5MB)
  const compressImage = (file: File, maxWidth = 2000, quality = 0.85): Promise<File> => {
    return new Promise((resolve) => {
      // Skip compression for small files (<2MB)
      if (file.size < 2 * 1024 * 1024) { resolve(file); return }

      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressed = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
              console.log(`[COMPRESS] ${file.name}: ${(file.size/1024/1024).toFixed(1)}MB → ${(compressed.size/1024/1024).toFixed(1)}MB`)
              resolve(compressed)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          quality,
        )
        URL.revokeObjectURL(img.src)
      }
      img.onerror = () => { resolve(file) }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFiles = async (files: File[]) => {
    // Accept image files — handle mobile camera where file.type can be empty (HEIC/HEIF)
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.bmp', '.tiff']
    const imageFiles = files.filter(f =>
      f.type.startsWith('image/') ||
      imageExts.some(ext => f.name.toLowerCase().endsWith(ext)) ||
      (f.type === '' && f.size > 0) // Mobile camera fallback — empty type but has data
    )
    if (imageFiles.length === 0) return

    // CRITICAL: Clear ALL previous video/caption state so old content is never reused
    setGeneratedVideoUrl(null)
    videoUrlRef.current = null
    setCaption('')
    setBrief('')

    setPreviews(imageFiles.map(f => URL.createObjectURL(f)))
    setStep('uploading')
    setUploadError(null)

    try {
      const urls: string[] = []
      for (const file of imageFiles) {
        // Compress before upload (critical for mobile camera photos)
        const compressed = await compressImage(file)
        const form = new FormData()
        form.append('file', compressed)
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        urls.push(data.url)
      }
      setUploadedUrls(urls)
      setStep('uploaded')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setUploadError(message)
      setStep('idle')
    }
  }

  // Legacy single-file handler
  const handleFile = (file: File) => handleFiles([file])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) handleFiles(files)
  }

  const getBrandConfig = () => {
    const slug = company?.slug || 'default'
    return BRAND_CONFIG[slug] || BRAND_CONFIG['default']
  }

  const startPolling = (postId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    let attempts = 0
    pollingRef.current = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/marketing-posts?id=${postId}`)
        const data = await res.json()
        const post = data.post || data.posts?.[0]
        if (post?.video_url) {
          clearInterval(pollingRef.current!)
          pollingRef.current = null
          setCaption(post.caption || caption)
          setStep('ready')
        }
      } catch { /* retry */ }
      if (attempts >= 24) { // 2 min timeout (24 x 5s)
        clearInterval(pollingRef.current!)
        pollingRef.current = null
        // Fallback: show ready with placeholder caption
        setStep('ready')
        if (!caption) setCaption('Your AI-generated content is ready for review.')
      }
    }, 5000)
  }

  const runAgent = async () => {
    setStep('analysing')
    const brand = getBrandConfig()
    const allImageUrls = uploadedUrls.length > 0 ? uploadedUrls : ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1080&q=80']

    try {
      // 1. Call GPT-4o Vision with ALL photos + submit video generation
      const genRes = await fetch('/api/generate-video-from-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: allImageUrls[0],
          imageUrls: allImageUrls,
          brief,
          brandConfig: {
            product_name: brand.product_name,
            brand: company?.name || 'Brand',
            target_audience: brand.target_audience,
            style: brand.style,
            caption_tone: brand.caption_tone,
            platform: platforms.join(',').toLowerCase(),
          },
        }),
      })
      const genData = await genRes.json()

      if (!genRes.ok || !genData.requestId) {
        setUploadError(genData.error || 'Failed to start video generation')
        setStep('idle')
        return
      }

      // Set caption from GPT-4o
      if (genData.caption) setCaption(genData.caption)
      setStep('generating')

      // 2. Poll for video completion (every 8s, max 5 min)
      const falStatusUrl = genData.statusUrl || ''
      const falResponseUrl = genData.responseUrl || ''
      let attempts = 0
      const maxAttempts = 38 // ~5 min (38 x 8s)

      const pollInterval = setInterval(async () => {
        attempts++
        try {
          // Poll via server API to avoid CORS issues with fal.ai
          const pollRes = await fetch(`/api/generate-video-from-photo?statusUrl=${encodeURIComponent(falStatusUrl)}&responseUrl=${encodeURIComponent(falResponseUrl)}`)
          const pollData = await pollRes.json()
          console.log('Poll attempt', attempts, ':', pollData.status, pollData.videoUrl ? 'URL:' + pollData.videoUrl.substring(0, 60) : '')

          if (pollData.status === 'COMPLETED' && pollData.videoUrl) {
            clearInterval(pollInterval)
            console.log('VIDEO READY:', pollData.videoUrl)

            // Immediately upload to Blotato storage so URL doesn't expire
            try {
              const uploadRes = await fetch('/api/marketing/post', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl: pollData.videoUrl }),
              })
              const uploadData = await uploadRes.json()
              const permanentUrl = uploadData.permanentUrl || pollData.videoUrl
              console.log('PERMANENT URL:', permanentUrl)
              videoUrlRef.current = permanentUrl
              setGeneratedVideoUrl(permanentUrl)
              setUploadedUrls([permanentUrl])
            } catch {
              // Fallback to original URL
              videoUrlRef.current = pollData.videoUrl
              setGeneratedVideoUrl(pollData.videoUrl)
              setUploadedUrls([pollData.videoUrl])
            }

            setStep('ready')
            return
          }

          if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
            setUploadError('Video generation timed out (5 min). Please try again.')
            setStep('idle')
          }
        } catch (err) {
          console.log('Poll error:', err)
        }
      }, 8000)

      pollingRef.current = pollInterval
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Agent failed')
      setStep('idle')
    }
  }

  const postNow = async () => {
    try {
      // Stop any running polling first
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      setPosting(true)
      setUploadError(null)
      // Use the video URL from ref (guaranteed to be current) or fall back to state
      const imageUrl = videoUrlRef.current || generatedVideoUrl || uploadedUrls[0] || ''
      console.log('POSTING WITH URL:', imageUrl ? imageUrl.substring(0, 80) : '(empty)')

      // Safety check: block publishing if no video was generated for this session
      if (!imageUrl) {
        setUploadError('No video found. Please run the AI Agent first to generate a video.')
        setStep('uploaded')
        setPosting(false)
        return
      }

      if (!caption.trim()) {
        setUploadError('Caption is empty. Please add a caption before publishing.')
        setPosting(false)
        return
      }

      if (platforms.length === 0) {
        setUploadError('No platforms selected. Please select Instagram or TikTok.')
        setPosting(false)
        return
      }

      const publishResults: { platform: string; success: boolean; error?: string }[] = []

      // Post to each platform via Blotato API
      for (const platform of platforms) {
        const platformLower = platform.toLowerCase()
        try {
          const res = await fetch('/api/marketing/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageUrl: imageUrl,
              caption,
              platforms: [platformLower],
            }),
          })
          const data = await res.json()
          const success = res.ok && (data.successes?.length > 0 || data.postSubmissionId)
          publishResults.push({ platform: platformLower, success, error: success ? undefined : (data.error || data.failures?.[0]?.error || 'Unknown error') })
        } catch (err) {
          publishResults.push({ platform: platformLower, success: false, error: err instanceof Error ? err.message : 'Network error' })
        }
      }

      const successCount = publishResults.filter(r => r.success).length
      const failedPlatforms = publishResults.filter(r => !r.success)

      // Save to database (non-blocking, errors won't crash the flow)
      for (const result of publishResults) {
        try {
          const res = await fetch('/api/marketing-posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_url: imageUrl,
              caption,
              brief,
              platform: result.platform,
              status: result.success ? 'published' : 'failed',
            }),
          })
          const data = await res.json()
          if (data.post) setPosts(prev => [data.post, ...prev])
        } catch { /* non-blocking */ }
      }

      // Update stats
      setStats(prev => ({
        total: prev.total + successCount,
        published: prev.published + successCount,
        totalReach: prev.totalReach,
        totalLikes: prev.totalLikes,
      }))

      if (failedPlatforms.length > 0) {
        const errorDetails = failedPlatforms.map(f => `${f.platform}: ${f.error}`).join(' | ')
        if (successCount === 0) {
          setUploadError(`Failed to post: ${errorDetails}`)
          setStep('ready') // Stay on ready so user can retry
          setPosting(false)
          return
        } else {
          setUploadError(`Partial success — failed: ${errorDetails}`)
        }
      }

      setStep('posted')
      setPosting(false)
    } catch (err) {
      console.error('postNow crash:', err)
      setUploadError(err instanceof Error ? err.message : 'Publishing failed. Please try again.')
      setStep('ready')
      setPosting(false)
    }
  }

  const togglePlatform = (p: string) =>
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFFFF', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar active="marketing" />

      <main className="flex-1 flex flex-col overflow-hidden pt-12 md:pt-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3.5"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E5E5' }}>
          <div>
            <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: '#999999' }}>
              <Link href="/" style={{ color: '#000000', fontWeight: 600 }}>CYTRON</Link>
              <span>/</span>
              <span style={{ color: '#333333', fontWeight: 600 }}>Marketing AI</span>
            </div>
            <h1 className="text-base font-semibold" style={{ color: '#000000' }}>Video Hub</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
              style={{ background: '#F5F5F5', color: '#666666', border: '1px solid #E5E5E5' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: '#666666' }}></span>
              Agent Online
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ background: '#FAFAFA' }}>

          {/* ─── Video Hub Tabs ─────────────────────────────────────── */}
          <div className="flex items-center gap-1 mb-5 p-1" style={{ background: '#F0F0F0', border: '1px solid #E5E5E5' }}>
            {[
              { id: 'ai-create' as const, icon: '✨', label: 'AI Create', desc: 'Photo → Video' },
              { id: 'ready-to-use' as const, icon: '📚', label: 'Ready to Use', desc: 'Pick & Post' },
              { id: 'record' as const, icon: '📹', label: 'Record', desc: 'Camera → Post' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold transition-all"
                style={{
                  background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                  color: activeTab === tab.id ? '#000000' : '#999999',
                  border: activeTab === tab.id ? '1px solid #E5E5E5' : '1px solid transparent',
                }}
              >
                <span>{tab.icon}</span>
                <span className="hidden md:inline">{tab.label}</span>
                <span className="hidden lg:inline text-xs font-normal" style={{ color: '#BBBBBB' }}>— {tab.desc}</span>
              </button>
            ))}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
            {[
              { label: 'Posts Published',  value: String(stats.published),  sub: stats.published ? `${stats.published} total` : 'No posts yet',           up: stats.published > 0 },
              { label: 'Total Reach',      value: String(stats.totalReach), sub: stats.totalReach ? 'across platforms' : 'Start posting to track', up: stats.totalReach > 0 },
              { label: 'Total Likes',      value: stats.totalLikes ? String(stats.totalLikes) : '—',  sub: stats.totalLikes ? 'across platforms' : 'No data yet',            up: stats.totalLikes > 0 },
              { label: 'Videos Generated', value: String(stats.total),      sub: 'via Kling AI',           up: stats.total > 0 },
            ].map((k, i) => (
              <div key={i} className="p-3 md:p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2 md:mb-3" style={{ color: '#999999' }}>{k.label}</p>
                <p className="text-xl md:text-2xl font-bold mb-1" style={{ color: '#000000' }}>{k.value}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#999999' }}>{k.sub}</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5"
                    style={{ color: k.up ? '#000000' : '#CCCCCC' }}>{k.up ? 'Active' : 'Waiting'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ─── TAB: Ready to Use (Upload video pronto) ────────────── */}
          {activeTab === 'ready-to-use' && (
            <ReadyToUseTab
              platforms={platforms}
              togglePlatform={togglePlatform}
              caption={caption}
              setCaption={setCaption}
              posting={posting}
              setPosting={setPosting}
              uploadError={uploadError}
              setUploadError={setUploadError}
              setPosts={setPosts}
              setStats={setStats}
              stats={stats}
            />
          )}

          {/* ─── TAB: Record (Câmera real) ───────────────────────────── */}
          {activeTab === 'record' && (
            <RecordTab
              platforms={platforms}
              togglePlatform={togglePlatform}
              caption={caption}
              setCaption={setCaption}
              posting={posting}
              setPosting={setPosting}
              uploadError={uploadError}
              setUploadError={setUploadError}
              setPosts={setPosts}
              setStats={setStats}
              stats={stats}
            />
          )}

          {/* ─── TAB: AI Create (existing flow) ──────────────────────── */}
          {activeTab === 'ai-create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">

            {/* Upload + Flow */}
            <div className="lg:col-span-2 space-y-4">

              <div className="p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold" style={{ color: '#000000' }}>New Content</h2>
                  {step !== 'idle' && (
                    <button onClick={() => { setStep('idle'); setPreviews([]); setCaption(''); setUploadedUrls([]); setGeneratedVideoUrl(null); videoUrlRef.current = null }}
                      className="text-xs px-3 py-1"
                      style={{ background: '#F5F5F5', color: '#666666', border: '1px solid #E5E5E5' }}>
                      Reset
                    </button>
                  )}
                </div>

                {uploadError && (
                  <div className="mb-3 p-3 text-xs" style={{ background: '#FFF0F0', color: '#CC0000', border: '1px solid #FFCCCC' }}>
                    {uploadError}
                  </div>
                )}

                {step === 'idle' && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed flex flex-col items-center justify-center py-14 cursor-pointer transition-colors"
                    style={{ borderColor: dragOver ? '#999999' : '#E5E5E5', background: dragOver ? '#F0F0F0' : '#FAFAFA' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#333333' }}>Drop your site photos here</p>
                    <p className="text-xs" style={{ color: '#999999' }}>or click to select from your device (multiple allowed)</p>
                    <input ref={fileRef} type="file" accept="image/*,.heic,.heif" multiple className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) handleFiles(Array.from(e.target.files))
                        e.target.value = '' // Reset so same file can be re-selected
                      }} />
                  </div>
                )}

                {step === 'uploading' && previews.length > 0 && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="flex gap-2 flex-wrap justify-center">
                      {previews.map((p, i) => (
                        <img key={i} src={p} alt={`upload ${i+1}`} className="w-20 h-20 object-cover opacity-60" />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#333333' }}>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#000000' }} />
                      Uploading {previews.length} photo{previews.length > 1 ? 's' : ''} to secure storage...
                    </div>
                  </div>
                )}

                {step !== 'idle' && step !== 'uploading' && previews.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className={`flex-shrink-0 ${previews.length > 1 ? 'grid grid-cols-2 gap-1 w-full sm:w-44' : 'w-full sm:w-44 h-44'} overflow-hidden`} style={{ border: '1px solid #E5E5E5' }}>
                      {previews.map((p, i) => (
                        <img key={i} src={p} alt={`photo ${i+1}`} className={`${previews.length > 1 ? 'w-full h-20' : 'w-full h-full'} object-cover`} />
                      ))}
                    </div>
                    <div className="flex-1 space-y-3">
                      {/* Status */}
                      <div className="p-3" style={{ background: '#FAFAFA', border: '1px solid #E5E5E5' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${['analysing','generating'].includes(step) ? 'animate-pulse' : ''}`}
                            style={{ background: step === 'posted' ? '#000000' : step === 'ready' ? '#000000' : ['analysing','generating'].includes(step) ? '#000000' : '#CCCCCC' }} />
                          <span className="text-xs font-semibold" style={{ color: '#333333' }}>
                            {step === 'uploaded'   && 'Photo ready — click Run AI Agent'}
                            {step === 'analysing'  && 'AI analysing your photo...'}
                            {step === 'generating' && 'Generating cinematic video with Kling AI...'}
                            {step === 'ready'      && 'Video ready — review and post'}
                            {step === 'posted'     && 'Published to Instagram + TikTok'}
                          </span>
                        </div>
                        {step === 'uploaded' && uploadedUrls.length > 0 && (
                          <p className="text-xs mt-1" style={{ color: '#999999' }}>{uploadedUrls.length} photo{uploadedUrls.length > 1 ? 's' : ''} uploaded successfully</p>
                        )}
                        {['analysing', 'generating'].includes(step) && (
                          <div className="h-1 overflow-hidden mt-2" style={{ background: '#F0F0F0' }}>
                            <div className="h-full transition-all"
                              style={{ width: step === 'analysing' ? '35%' : '75%', background: '#000000' }} />
                          </div>
                        )}
                      </div>

                      {(step === 'ready' || step === 'posted') && (
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: '#999999' }}>AI-Generated Caption</p>
                          <textarea value={caption} onChange={(e) => setCaption(e.target.value)}
                            rows={3} disabled={step === 'posted'}
                            className="w-full text-xs px-3 py-2 resize-none outline-none"
                            style={{ border: '1px solid #E5E5E5', color: '#000000', background: '#FAFAFA' }} />
                        </div>
                      )}

                      {step !== 'posted' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: '#999999' }}>Post to:</span>
                          {['Instagram', 'TikTok'].map(p => (
                            <button key={p} onClick={() => togglePlatform(p)}
                              className="text-xs px-2.5 py-1 font-medium transition-all"
                              style={{
                                background: platforms.includes(p) ? '#000000' : '#F5F5F5',
                                color: platforms.includes(p) ? '#FFFFFF' : '#999999',
                                border: `1px solid ${platforms.includes(p) ? '#000000' : '#E5E5E5'}`,
                              }}>{p}</button>
                          ))}
                        </div>
                      )}

                      {step === 'uploaded' && (
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: '#999999' }}>Creative Brief <span style={{ color: '#CCCCCC', fontWeight: 400 }}>(optional)</span></p>
                          <textarea
                            value={brief}
                            onChange={(e) => setBrief(e.target.value)}
                            rows={3}
                            placeholder="Describe what you want — e.g. 'Show the screen printing process in slow motion with ink close-ups' or 'Focus on the team wearing the custom jerseys at a game'"
                            className="w-full text-xs px-3 py-2 resize-none outline-none mb-2"
                            style={{ border: '1px solid #E5E5E5', color: '#000000', background: '#FAFAFA' }}
                          />
                        </div>
                      )}

                      <div>
                        {step === 'uploaded' && (
                          <button onClick={runAgent}
                            className="text-xs font-semibold px-4 py-2"
                            style={{ background: '#000000', color: '#FFFFFF' }}>
                            Run AI Agent
                          </button>
                        )}
                        {step === 'ready' && (
                          <button onClick={postNow} disabled={posting}
                            className="text-xs font-semibold px-4 py-2"
                            style={{ background: posting ? '#CCCCCC' : '#000000', color: '#FFFFFF' }}>
                            {posting ? 'Publishing...' : 'Publish Now'}
                          </button>
                        )}
                        {step === 'posted' && (
                          <span className="text-xs font-semibold px-3 py-2 inline-block"
                            style={{ background: '#F0F0F0', color: '#000000' }}>
                            Published successfully
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Posts */}
              <div className="p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#000000' }}>Recent Posts</h2>
                {posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                    </svg>
                    <p className="text-xs font-medium" style={{ color: '#999999' }}>No posts yet</p>
                    <p className="text-xs mt-0.5" style={{ color: '#CCCCCC' }}>Upload a photo above to create your first AI video</p>
                  </div>
                ) : (
                <div className="space-y-3">
                  {posts.map(post => (
                    <div key={post.id} className="flex gap-3 p-3"
                      style={{ background: '#FAFAFA', border: '1px solid #E5E5E5' }}>
                      {post.image_url ? (
                        <img src={post.image_url} alt="" className="w-14 h-14 flex-shrink-0 object-cover" />
                      ) : (
                        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center text-xs font-bold"
                          style={{ background: '#F5F5F5', color: '#999999' }}>IMG</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-1.5 py-0.5 capitalize"
                            style={{ background: '#F5F5F5', color: '#666666' }}>{post.platform}</span>
                          <span className="text-xs px-1.5 py-0.5 capitalize"
                            style={{ background: post.status === 'published' ? '#F0F0F0' : '#FFF0F0', color: post.status === 'published' ? '#000000' : '#CC0000' }}>{post.status}</span>
                          <span className="text-xs" style={{ color: '#CCCCCC' }}>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs truncate" style={{ color: '#333333' }}>{post.caption || 'No caption'}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs" style={{ color: '#999999' }}>{post.reach} reach</span>
                          <span className="text-xs" style={{ color: '#999999' }}>{post.likes} likes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Pipeline */}
              <div className="p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#000000' }} />
                  <h2 className="text-sm font-semibold" style={{ color: '#000000' }}>Automation Pipeline</h2>
                </div>
                {pipeline.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2"
                    style={{ borderBottom: i < pipeline.length - 1 ? '1px solid #E5E5E5' : 'none' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#000000' }} />
                      <span className="text-xs font-medium" style={{ color: '#333333' }}>{s.label}</span>
                    </div>
                    <span className="text-xs" style={{ color: '#999999' }}>{s.tool}</span>
                  </div>
                ))}
              </div>

              {/* Calendar */}
              <div className="p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                <h2 className="text-sm font-semibold mb-3" style={{ color: '#000000' }}>This Week</h2>
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {['M','T','W','T','F','S','S'].map((d, i) => (
                    <div key={i} className="text-xs pb-1" style={{ color: '#999999' }}>{d}</div>
                  ))}
                  {[0,0,0,0,0,0,0].map((posted, i) => (
                    <div key={i} className="aspect-square flex items-center justify-center text-xs font-bold"
                      style={{ background: posted ? '#000000' : '#F5F5F5', color: posted ? '#FFFFFF' : '#CCCCCC' }}>
                      {posted ? '•' : '·'}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-center mt-2" style={{ color: '#999999' }}>0 posts this week · Goal: 5</p>
              </div>

              {/* Integrations status */}
              <div className="p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                <h2 className="text-sm font-semibold mb-3" style={{ color: '#000000' }}>Integrations</h2>
                {[
                  { label: 'n8n Webhook',  ok: true  },
                  { label: 'Kling AI',     ok: true  },
                  { label: 'Blotato API',  ok: true  },
                  { label: 'Instagram',    ok: true  },
                  { label: 'TikTok',       ok: true  },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5"
                    style={{ borderBottom: i < 4 ? '1px solid #E5E5E5' : 'none' }}>
                    <span className="text-xs" style={{ color: '#333333' }}>{s.label}</span>
                    <span className="text-xs font-medium" style={{ color: s.ok ? '#000000' : '#CC0000' }}>
                      {s.ok ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  )
}
