'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

type Post = { id: string; caption: string; platform: string; reach: number; likes: number; created_at: string; status: string; image_url: string; video_url: string }

const pipeline = [
  { label: 'Photo Intake',       tool: 'n8n Webhook'      },
  { label: 'Scene Analysis',     tool: 'Claude Vision'    },
  { label: 'Video Generation',   tool: 'Kling AI (fal.ai)'},
  { label: 'Caption Writer',     tool: 'Claude Sonnet'    },
  { label: 'Auto Publisher',     tool: 'Blotato API'      },
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

export default function MarketingPage() {
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

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return

    setPreviews(imageFiles.map(f => URL.createObjectURL(f)))
    setStep('uploading')
    setUploadError(null)

    try {
      const urls: string[] = []
      for (const file of imageFiles) {
        const form = new FormData()
        form.append('file', file)
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
    const imageUrl = uploadedUrls[0] || 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1080&q=80'

    try {
      // 1. Call GPT-4o Vision + submit video generation
      const genRes = await fetch('/api/generate-video-from-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
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
            videoUrlRef.current = pollData.videoUrl
            setGeneratedVideoUrl(pollData.videoUrl)
            setUploadedUrls([pollData.videoUrl])
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
    setPosting(true)
    // Use the video URL from ref (guaranteed to be current) or fall back to state
    const imageUrl = videoUrlRef.current || generatedVideoUrl || uploadedUrls[0] || ''
    console.log('POSTING WITH URL:', imageUrl.substring(0, 80))
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

    // Save to database
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

    if (failedPlatforms.length > 0 && successCount === 0) {
      setUploadError(`Failed to post: ${failedPlatforms.map(f => f.platform).join(', ')}`)
    }

    setStep('posted')
    setPosting(false)
  }

  const togglePlatform = (p: string) =>
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  return (
    <div className="flex min-h-screen" style={{ background: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar active="marketing" />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3.5"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          <div>
            <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: '#9CA3AF' }}>
              <Link href="/" style={{ color: '#1D4ED8', fontWeight: 600 }}>CYTRON</Link>
              <span>/</span>
              <span style={{ color: '#374151', fontWeight: 600 }}>Marketing AI</span>
            </div>
            <h1 className="text-base font-semibold" style={{ color: '#111827' }}>Content Engine</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5"
              style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: '#16A34A' }}></span>
              Agent Online
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Posts Published',  value: String(stats.published),  sub: stats.published ? `${stats.published} total` : 'No posts yet',           up: stats.published > 0 },
              { label: 'Total Reach',      value: String(stats.totalReach), sub: stats.totalReach ? 'across platforms' : 'Start posting to track', up: stats.totalReach > 0 },
              { label: 'Total Likes',      value: stats.totalLikes ? String(stats.totalLikes) : '—',  sub: stats.totalLikes ? 'across platforms' : 'No data yet',            up: stats.totalLikes > 0 },
              { label: 'Videos Generated', value: String(stats.total),      sub: 'via Kling AI',           up: stats.total > 0 },
            ].map((k, i) => (
              <div key={i} className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>{k.label}</p>
                <p className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>{k.value}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>{k.sub}</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: k.up ? '#F0FDF4' : '#F9FAFB', color: k.up ? '#15803D' : '#9CA3AF' }}>{k.up ? 'Active' : 'Waiting'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5">

            {/* Upload + Flow */}
            <div className="col-span-2 space-y-4">

              <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>New Content</h2>
                  {step !== 'idle' && (
                    <button onClick={() => { setStep('idle'); setPreviews([]); setCaption(''); setUploadedUrls([]); setGeneratedVideoUrl(null); videoUrlRef.current = null }}
                      className="text-xs px-3 py-1 rounded"
                      style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>
                      Reset
                    </button>
                  )}
                </div>

                {uploadError && (
                  <div className="mb-3 p-3 rounded-lg text-xs" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                    ⚠️ {uploadError}
                  </div>
                )}

                {step === 'idle' && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center py-14 cursor-pointer"
                    style={{ borderColor: dragOver ? '#1D4ED8' : '#E5E7EB', background: dragOver ? '#EFF6FF' : '#F9FAFB' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#374151' }}>Drop your site photos here</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>or click to select from your device (multiple allowed)</p>
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                      onChange={(e) => e.target.files && e.target.files.length > 0 && handleFiles(Array.from(e.target.files))} />
                  </div>
                )}

                {step === 'uploading' && previews.length > 0 && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="flex gap-2 flex-wrap justify-center">
                      {previews.map((p, i) => (
                        <img key={i} src={p} alt={`upload ${i+1}`} className="w-20 h-20 object-cover rounded-lg opacity-60" />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#1D4ED8' }} />
                      Uploading {previews.length} photo{previews.length > 1 ? 's' : ''} to secure storage...
                    </div>
                  </div>
                )}

                {step !== 'idle' && step !== 'uploading' && previews.length > 0 && (
                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 ${previews.length > 1 ? 'grid grid-cols-2 gap-1 w-44' : 'w-44 h-44'} rounded-lg overflow-hidden`} style={{ border: '1px solid #E5E7EB' }}>
                      {previews.map((p, i) => (
                        <img key={i} src={p} alt={`photo ${i+1}`} className={`${previews.length > 1 ? 'w-full h-20' : 'w-full h-full'} object-cover`} />
                      ))}
                    </div>
                    <div className="flex-1 space-y-3">
                      {/* Status */}
                      <div className="rounded-lg p-3" style={{ background: step === 'posted' ? '#F0FDF4' : '#F9FAFB', border: '1px solid #E5E7EB' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${['analysing','generating'].includes(step) ? 'animate-pulse' : ''}`}
                            style={{ background: step === 'posted' ? '#16A34A' : step === 'ready' ? '#16A34A' : ['analysing','generating'].includes(step) ? '#1D4ED8' : '#9CA3AF' }} />
                          <span className="text-xs font-semibold" style={{ color: '#374151' }}>
                            {step === 'uploaded'   && 'Photo ready — click Run AI Agent'}
                            {step === 'analysing'  && 'AI analysing your photo...'}
                            {step === 'generating' && 'Generating cinematic video with Kling AI...'}
                            {step === 'ready'      && 'Video ready — review and post'}
                            {step === 'posted'     && 'Published to Instagram + TikTok'}
                          </span>
                        </div>
                        {step === 'uploaded' && uploadedUrls.length > 0 && (
                          <p className="text-xs mt-1" style={{ color: '#16A34A' }}>✓ {uploadedUrls.length} photo{uploadedUrls.length > 1 ? 's' : ''} uploaded successfully</p>
                        )}
                        {['analysing', 'generating'].includes(step) && (
                          <div className="h-1 rounded-full overflow-hidden mt-2" style={{ background: '#E5E7EB' }}>
                            <div className="h-full rounded-full transition-all"
                              style={{ width: step === 'analysing' ? '35%' : '75%', background: '#1D4ED8' }} />
                          </div>
                        )}
                      </div>

                      {(step === 'ready' || step === 'posted') && (
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>AI-Generated Caption</p>
                          <textarea value={caption} onChange={(e) => setCaption(e.target.value)}
                            rows={3} disabled={step === 'posted'}
                            className="w-full text-xs rounded-lg px-3 py-2 resize-none outline-none"
                            style={{ border: '1px solid #E5E7EB', color: '#374151', background: '#FAFAFA' }} />
                        </div>
                      )}

                      {step !== 'posted' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>Post to:</span>
                          {['Instagram', 'TikTok'].map(p => (
                            <button key={p} onClick={() => togglePlatform(p)}
                              className="text-xs px-2.5 py-1 rounded font-medium transition-all"
                              style={{
                                background: platforms.includes(p) ? '#EFF6FF' : '#F9FAFB',
                                color: platforms.includes(p) ? '#1D4ED8' : '#9CA3AF',
                                border: `1px solid ${platforms.includes(p) ? '#BFDBFE' : '#E5E7EB'}`,
                              }}>{p}</button>
                          ))}
                        </div>
                      )}

                      {step === 'uploaded' && (
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Creative Brief <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></p>
                          <textarea
                            value={brief}
                            onChange={(e) => setBrief(e.target.value)}
                            rows={3}
                            placeholder="Describe what you want — e.g. 'Show the screen printing process in slow motion with ink close-ups' or 'Focus on the team wearing the custom jerseys at a game'"
                            className="w-full text-xs rounded-lg px-3 py-2 resize-none outline-none mb-2"
                            style={{ border: '1px solid #E5E7EB', color: '#374151', background: '#FAFAFA' }}
                          />
                        </div>
                      )}

                      <div>
                        {step === 'uploaded' && (
                          <button onClick={runAgent}
                            className="text-xs font-semibold px-4 py-2 rounded text-white"
                            style={{ background: '#1D4ED8' }}>
                            Run AI Agent
                          </button>
                        )}
                        {step === 'ready' && (
                          <button onClick={postNow} disabled={posting}
                            className="text-xs font-semibold px-4 py-2 rounded text-white"
                            style={{ background: posting ? '#9CA3AF' : '#16A34A' }}>
                            {posting ? 'Publishing...' : 'Publish Now'}
                          </button>
                        )}
                        {step === 'posted' && (
                          <span className="text-xs font-semibold px-3 py-2 rounded"
                            style={{ background: '#F0FDF4', color: '#15803D' }}>
                            Published successfully
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Posts */}
              <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>Recent Posts</h2>
                {posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                    </svg>
                    <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>No posts yet</p>
                    <p className="text-xs mt-0.5" style={{ color: '#D1D5DB' }}>Upload a photo above to create your first AI video</p>
                  </div>
                ) : (
                <div className="space-y-3">
                  {posts.map(post => (
                    <div key={post.id} className="flex gap-3 p-3 rounded-lg"
                      style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                      {post.image_url ? (
                        <img src={post.image_url} alt="" className="w-14 h-14 rounded-lg flex-shrink-0 object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold"
                          style={{ background: '#EFF6FF', color: '#1D4ED8' }}>IMG</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-1.5 py-0.5 rounded capitalize"
                            style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{post.platform}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded capitalize"
                            style={{ background: post.status === 'published' ? '#F0FDF4' : '#FEF9C3', color: post.status === 'published' ? '#15803D' : '#92400E' }}>{post.status}</span>
                          <span className="text-xs" style={{ color: '#D1D5DB' }}>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs truncate" style={{ color: '#6B7280' }}>{post.caption || 'No caption'}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>{post.reach} reach</span>
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>{post.likes} likes</span>
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
              <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#16A34A' }} />
                  <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>Automation Pipeline</h2>
                </div>
                {pipeline.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2"
                    style={{ borderBottom: i < pipeline.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#16A34A' }} />
                      <span className="text-xs font-medium" style={{ color: '#374151' }}>{s.label}</span>
                    </div>
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>{s.tool}</span>
                  </div>
                ))}
              </div>

              {/* Calendar */}
              <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <h2 className="text-sm font-semibold mb-3" style={{ color: '#111827' }}>This Week</h2>
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {['M','T','W','T','F','S','S'].map((d, i) => (
                    <div key={i} className="text-xs pb-1" style={{ color: '#9CA3AF' }}>{d}</div>
                  ))}
                  {[0,0,0,0,0,0,0].map((posted, i) => (
                    <div key={i} className="aspect-square rounded flex items-center justify-center text-xs font-bold"
                      style={{ background: posted ? '#EFF6FF' : '#F9FAFB', color: posted ? '#1D4ED8' : '#D1D5DB' }}>
                      {posted ? '•' : '·'}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-center mt-2" style={{ color: '#9CA3AF' }}>0 posts this week · Goal: 5</p>
              </div>

              {/* Integrations status */}
              <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <h2 className="text-sm font-semibold mb-3" style={{ color: '#111827' }}>Integrations</h2>
                {[
                  { label: 'n8n Webhook',  ok: true  },
                  { label: 'Kling AI',     ok: true  },
                  { label: 'Blotato API',  ok: true  },
                  { label: 'Instagram',    ok: true  },
                  { label: 'TikTok',       ok: true  },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5"
                    style={{ borderBottom: i < 4 ? '1px solid #F9FAFB' : 'none' }}>
                    <span className="text-xs" style={{ color: '#374151' }}>{s.label}</span>
                    <span className="text-xs font-medium" style={{ color: s.ok ? '#16A34A' : '#DC2626' }}>
                      {s.ok ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
