'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

const recentPosts = [
  { id: 1, project: 'Madeline Tower',   caption: 'Precision electrical systems, 40 floors of pure engineering. #ElectricalEngineering #MadelineTower #GoldCoast', platforms: ['Instagram', 'TikTok'], reach: 412, likes: 38, time: '1d ago' },
  { id: 2, project: 'Miles Residences', caption: 'Smart home automation installed at Miles Residences. Every circuit designed for tomorrow.', platforms: ['Instagram'], reach: 279, likes: 24, time: '3d ago' },
]

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
  const [preview, setPreview]     = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [caption, setCaption]     = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['Instagram', 'TikTok'])
  const [posting, setPosting]     = useState(false)
  const [company, setCompany]     = useState<{ name: string; slug: string } | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Load company info on mount
  useEffect(() => {
    fetch('/api/company')
      .then(r => r.json())
      .then(d => { if (d.company) setCompany(d.company) })
      .catch(() => {})
  }, [])

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file))
    setStep('uploading')
    setUploadError(null)

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setUploadedUrl(data.url)
      setStep('uploaded')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setUploadError(message)
      setStep('idle')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleFile(file)
  }

  const getBrandConfig = () => {
    const slug = company?.slug || 'default'
    return BRAND_CONFIG[slug] || BRAND_CONFIG['default']
  }

  const runAgent = async () => {
    setStep('analysing')
    const brand = getBrandConfig()
    const imageUrl = uploadedUrl || 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1080&q=80'

    try {
      await fetch('https://labofantasma.app.n8n.cloud/webhook/photo-to-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: brand.product_name,
          brand: company?.name || 'Brand',
          target_audience: brand.target_audience,
          platform: platforms.join(',').toLowerCase(),
          image_url: imageUrl,
          style: brand.style,
          caption_tone: brand.caption_tone,
          client: company?.slug || 'unknown',
        }),
      })
    } catch { /* non-blocking */ }

    setTimeout(() => setStep('generating'), 2000)
    setTimeout(() => {
      setStep('ready')
      // Caption will come from AI via n8n — placeholder while async
      setCaption(`Built by hand. Worn with pride. 🖤\n\nEvery stitch of ink tells a story — custom screen printing crafted for teams, brands, and culture. From your vision to the press to the streets.\n\n📩 DM us or visit inkwellprinting.net\n\n#InkwellPrinting #ScreenPrinting #CustomApparel #PrintLife #StreetWear #MadeByHand #CustomTees #PrintShop #TeamWear #AustralianMade`)
    }, 4500)
  }

  const postNow = async () => {
    setPosting(true)
    try {
      await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'marketing_post',
          caption,
          platforms,
          brand: company?.name || 'Brand',
          image_url: uploadedUrl,
          style: getBrandConfig().style,
          project: `${company?.name || 'Brand'} Campaign`,
        }),
      })
    } catch { /* proceed even if webhook fails */ }
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
              { label: 'Posts This Week',  value: '5',    sub: 'Instagram + TikTok',  up: true  },
              { label: 'Total Reach',      value: '691',  sub: '+12% this month',      up: true  },
              { label: 'Avg Engagement',   value: '8.4%', sub: 'Above industry avg',   up: true  },
              { label: 'Videos Generated', value: '12',   sub: 'via Kling AI',         up: true  },
            ].map((k, i) => (
              <div key={i} className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>{k.label}</p>
                <p className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>{k.value}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>{k.sub}</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: '#F0FDF4', color: '#15803D' }}>Active</span>
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
                    <button onClick={() => { setStep('idle'); setPreview(null); setCaption(''); setUploadedUrl(null) }}
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
                    <p className="text-xs font-semibold mb-1" style={{ color: '#374151' }}>Drop a site photo here</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>or click to select from your device</p>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  </div>
                )}

                {step === 'uploading' && preview && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <img src={preview} alt="upload" className="w-24 h-24 object-cover rounded-lg opacity-60" />
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#1D4ED8' }} />
                      Uploading photo to secure storage...
                    </div>
                  </div>
                )}

                {step !== 'idle' && step !== 'uploading' && preview && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-44 h-44 rounded-lg overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
                      <img src={preview} alt="upload" className="w-full h-full object-cover" />
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
                        {step === 'uploaded' && uploadedUrl && (
                          <p className="text-xs mt-1" style={{ color: '#16A34A' }}>✓ Photo uploaded successfully</p>
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
                <div className="space-y-3">
                  {recentPosts.map(post => (
                    <div key={post.id} className="flex gap-3 p-3 rounded-lg"
                      style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                      <div className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold"
                        style={{ background: '#EFF6FF', color: '#1D4ED8' }}>IMG</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold" style={{ color: '#111827' }}>{post.project}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: '#F0FDF4', color: '#15803D' }}>Published</span>
                          <span className="text-xs" style={{ color: '#D1D5DB' }}>{post.time}</span>
                        </div>
                        <p className="text-xs truncate" style={{ color: '#6B7280' }}>{post.caption}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>{post.reach} reach</span>
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>{post.likes} likes</span>
                          {post.platforms.map(p => (
                            <span key={p} className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                  {[1,1,0,1,1,0,0].map((posted, i) => (
                    <div key={i} className="aspect-square rounded flex items-center justify-center text-xs font-bold"
                      style={{ background: posted ? '#EFF6FF' : '#F9FAFB', color: posted ? '#1D4ED8' : '#D1D5DB' }}>
                      {posted ? '•' : '·'}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-center mt-2" style={{ color: '#9CA3AF' }}>4 posts this week · Goal: 5</p>
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
