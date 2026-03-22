'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

const recentPosts = [
  {
    id: 1,
    image: '/placeholder-site.jpg',
    project: 'Madeline Tower',
    caption: 'Precision electrical systems, 40 floors of pure engineering. ⚡ #ElectricalEngineering #MadelineTower #GoldCoast',
    platforms: ['instagram', 'tiktok'],
    reach: 412,
    likes: 38,
    time: '1d ago',
    status: 'published',
  },
  {
    id: 2,
    image: '/placeholder-site.jpg',
    project: 'Miles Residences',
    caption: 'Smart home automation installed at Miles Residences. Every circuit designed for tomorrow. 🏠⚡',
    platforms: ['instagram'],
    reach: 279,
    likes: 24,
    time: '3d ago',
    status: 'published',
  },
]

const agentLog = [
  { time: '09:14', msg: 'Photo received — analysing construction context...', type: 'think' },
  { time: '09:14', msg: 'Detected: High-rise electrical conduit installation, floor 28', type: 'detect' },
  { time: '09:15', msg: 'Generating cinematic prompt for Kling AI...', type: 'think' },
  { time: '09:15', msg: 'Video generation started (8s, cinematic mode)', type: 'action' },
  { time: '09:17', msg: 'Video ready — quality check passed ✓', type: 'success' },
  { time: '09:17', msg: 'Caption crafted: professional + hashtag optimised', type: 'action' },
  { time: '09:18', msg: 'Posted to Instagram + TikTok via Blotato ✓', type: 'success' },
]

export default function MarketingPage() {
  const [step, setStep] = useState<'idle' | 'uploaded' | 'analysing' | 'generating' | 'ready' | 'posted'>('idle')
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'tiktok'])
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file)
    setPreview(url)
    setStep('uploaded')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  const runAgent = () => {
    setStep('analysing')
    setTimeout(() => setStep('generating'), 2000)
    setTimeout(() => {
      setStep('ready')
      setCaption('Precision electrical systems installed at Madeline Tower — 40 floors of engineering excellence. ⚡🏗️ #MacoElectrics #GoldCoastElectrician #ElectricalEngineering #HighRise #Construction')
    }, 4500)
  }

  const postNow = () => {
    setStep('posted')
  }

  const reset = () => {
    setStep('idle')
    setPreview(null)
    setCaption('')
  }

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F4F6F8' }}>

      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E9EF' }}>
        <div className="px-5 py-5" style={{ borderBottom: '1px solid #E5E9EF' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white" style={{ background: 'linear-gradient(135deg, #00B050, #007A32)' }}>C</div>
            <div>
              <div className="font-black text-base tracking-widest" style={{ color: '#1A1A2E' }}>CYTRON</div>
              <div className="text-xs" style={{ color: '#9CA3AF' }}>Automation Platform</div>
            </div>
          </div>
        </div>
        <div className="mx-3 mt-4 px-3 py-2.5 rounded-lg" style={{ background: '#E8F5EE', border: '1px solid #C8E6D4' }}>
          <div className="text-xs font-semibold mb-0.5" style={{ color: '#9CA3AF' }}>ACTIVE CLIENT</div>
          <div className="font-bold text-sm" style={{ color: '#1A1A2E' }}>Maco Electrics</div>
          <div className="text-xs font-medium flex items-center gap-1 mt-0.5" style={{ color: '#00B050' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#00B050' }}></span>
            Gold Coast, QLD
          </div>
        </div>
        <nav className="flex-1 px-3 mt-5 space-y-0.5">
          {[
            { label: 'Dashboard', href: '/', icon: '⊞' },
            { label: 'Warehouse', href: '/warehouse', icon: '📦', badge: '2' },
            { label: 'Quoting', href: '#', icon: '📋', disabled: true },
            { label: 'Subcontractors', href: '#', icon: '👷', disabled: true },
            { label: 'Compliance', href: '#', icon: '📄', disabled: true },
            { label: 'Marketing AI', href: '/marketing', icon: '🎬', active: true },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${item.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}
              style={item.active ? { background: '#E8F5EE', color: '#00B050' } : { color: '#6B7280' }}
            >
              <div className="flex items-center gap-2.5">
                <span>{item.icon}</span>{item.label}
              </div>
              {item.badge && <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#FEF3C7', color: '#D97706' }}>{item.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4" style={{ borderTop: '1px solid #E5E9EF' }}>
          <div className="text-xs" style={{ color: '#D1D5DB' }}>v1.0.0 · Build 2026.03</div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-8 py-4" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E9EF' }}>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#1A1A2E' }}>Marketing AI Agent</h1>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Photo → Cinematic Video → Instagram + TikTok · Autonomous</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5" style={{ background: '#E8F5EE', color: '#00B050' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00B050' }}></span>
              Agent Online
            </div>
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#F3F4F6', color: '#6B7280' }}>
              5 posts this week
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6">

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Posts This Week', value: '5', sub: 'Instagram + TikTok', icon: '📤', color: '#DB2777', bg: '#FDF2F8' },
              { label: 'Total Reach', value: '691', sub: '+12% this month', icon: '📊', color: '#7C3AED', bg: '#F5F3FF' },
              { label: 'Avg Engagement', value: '8.4%', sub: 'Above industry avg', icon: '❤️', color: '#EF4444', bg: '#FEF2F2' },
              { label: 'Videos Generated', value: '12', sub: 'via Kling AI', icon: '🎬', color: '#00B050', bg: '#E8F5EE' },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E9EF' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-4" style={{ background: k.bg }}>{k.icon}</div>
                <div className="text-2xl font-bold mb-0.5" style={{ color: k.color }}>{k.value}</div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: '#1A1A2E' }}>{k.label}</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Main 2-col */}
          <div className="grid grid-cols-3 gap-4">

            {/* Upload + Agent flow — 2 cols */}
            <div className="col-span-2 space-y-4">

              {/* Upload zone */}
              <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E9EF' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-sm" style={{ color: '#1A1A2E' }}>New Content</h2>
                  {step !== 'idle' && (
                    <button onClick={reset} className="text-xs px-3 py-1 rounded-lg" style={{ background: '#F3F4F6', color: '#6B7280' }}>Reset</button>
                  )}
                </div>

                {step === 'idle' && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-12 cursor-pointer transition-all"
                    style={{ borderColor: dragOver ? '#00B050' : '#E5E9EF', background: dragOver ? '#F0FFF4' : '#FAFAFA' }}
                  >
                    <div className="text-4xl mb-3">📷</div>
                    <div className="font-semibold text-sm mb-1" style={{ color: '#1A1A2E' }}>Drop a site photo here</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>or click to select from your device</div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  </div>
                )}

                {step !== 'idle' && preview && (
                  <div className="flex gap-4">
                    {/* Preview */}
                    <div className="flex-shrink-0 w-48 h-48 rounded-xl overflow-hidden" style={{ border: '1px solid #E5E9EF' }}>
                      <img src={preview} alt="upload" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* Agent status */}
                      <div className="rounded-lg p-3" style={{ background: step === 'posted' ? '#E8F5EE' : '#F9FAFB', border: `1px solid ${step === 'posted' ? '#C8E6D4' : '#F3F4F6'}` }}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${['analysing','generating'].includes(step) ? 'animate-pulse' : ''}`}
                            style={{ background: step === 'posted' ? '#00B050' : step === 'ready' ? '#00B050' : ['analysing','generating'].includes(step) ? '#DB2777' : '#9CA3AF' }} />
                          <span className="text-xs font-semibold" style={{ color: '#1A1A2E' }}>
                            {step === 'uploaded' && 'Photo ready — click Analyse'}
                            {step === 'analysing' && 'AI analysing your photo...'}
                            {step === 'generating' && 'Generating cinematic video with Kling AI...'}
                            {step === 'ready' && 'Video ready — review and post'}
                            {step === 'posted' && '✓ Posted to Instagram + TikTok'}
                          </span>
                        </div>
                        {['analysing', 'generating'].includes(step) && (
                          <div className="h-1 rounded-full overflow-hidden mt-2" style={{ background: '#E5E9EF' }}>
                            <div className="h-full rounded-full animate-pulse" style={{ width: step === 'analysing' ? '35%' : '75%', background: 'linear-gradient(90deg, #007A32, #00B050)', transition: 'width 1s' }} />
                          </div>
                        )}
                      </div>

                      {/* Caption editor — shows when ready */}
                      {(step === 'ready' || step === 'posted') && (
                        <div>
                          <div className="text-xs font-semibold mb-1.5" style={{ color: '#6B7280' }}>CAPTION (AI-generated)</div>
                          <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            rows={3}
                            className="w-full text-xs rounded-lg px-3 py-2 resize-none"
                            style={{ border: '1px solid #E5E9EF', color: '#1A1A2E', background: '#FAFAFA' }}
                            disabled={step === 'posted'}
                          />
                        </div>
                      )}

                      {/* Platform selector */}
                      {step !== 'posted' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>Post to:</span>
                          {[
                            { id: 'instagram', label: '📸 Instagram' },
                            { id: 'tiktok', label: '🎵 TikTok' },
                          ].map(p => (
                            <button
                              key={p.id}
                              onClick={() => togglePlatform(p.id)}
                              className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                              style={{
                                background: selectedPlatforms.includes(p.id) ? '#E8F5EE' : '#F3F4F6',
                                color: selectedPlatforms.includes(p.id) ? '#00B050' : '#9CA3AF',
                                border: `1px solid ${selectedPlatforms.includes(p.id) ? '#C8E6D4' : 'transparent'}`,
                              }}
                            >{p.label}</button>
                          ))}
                        </div>
                      )}

                      {/* Action button */}
                      <div className="flex gap-2">
                        {step === 'uploaded' && (
                          <button onClick={runAgent} className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #DB2777, #9D174D)' }}>
                            🤖 Run AI Agent
                          </button>
                        )}
                        {step === 'ready' && (
                          <button onClick={postNow} className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #00B050, #007A32)' }}>
                            🚀 Post Now
                          </button>
                        )}
                        {step === 'posted' && (
                          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: '#E8F5EE', color: '#00B050' }}>
                            ✓ Published · Instagram + TikTok
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Posts */}
              <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E9EF' }}>
                <h2 className="font-bold text-sm mb-4" style={{ color: '#1A1A2E' }}>Recent Posts</h2>
                <div className="space-y-3">
                  {recentPosts.map(post => (
                    <div key={post.id} className="flex gap-3 p-3 rounded-xl" style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                      <div className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center text-3xl" style={{ background: '#E8F5EE' }}>🏗️</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold" style={{ color: '#1A1A2E' }}>{post.project}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#E8F5EE', color: '#00B050' }}>✓ Published</span>
                          <span className="text-xs" style={{ color: '#D1D5DB' }}>{post.time}</span>
                        </div>
                        <p className="text-xs leading-relaxed truncate" style={{ color: '#6B7280' }}>{post.caption}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>👁 {post.reach} reach</span>
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>❤️ {post.likes} likes</span>
                          {post.platforms.map(p => (
                            <span key={p} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                              {p === 'instagram' ? '📸' : '🎵'} {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Agent log */}
            <div className="space-y-4">
              <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E9EF' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00B050' }} />
                  <h2 className="font-bold text-sm" style={{ color: '#1A1A2E' }}>Agent Activity Log</h2>
                </div>
                <div className="space-y-2">
                  {agentLog.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: '#D1D5DB' }}>{log.time}</span>
                      <div className="flex-1">
                        <div className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 -mb-0.5`}
                          style={{ background: log.type === 'success' ? '#00B050' : log.type === 'action' ? '#7C3AED' : log.type === 'detect' ? '#DB2777' : '#9CA3AF' }} />
                        <span className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{log.msg}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* n8n workflow status */}
              <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E9EF' }}>
                <h2 className="font-bold text-sm mb-4" style={{ color: '#1A1A2E' }}>Automation Pipeline</h2>
                <div className="space-y-2">
                  {[
                    { label: 'Photo Intake', status: 'active', tool: 'n8n Webhook' },
                    { label: 'Scene Analysis', status: 'active', tool: 'Claude Vision' },
                    { label: 'Video Generation', status: 'active', tool: 'Kling AI (fal.ai)' },
                    { label: 'Caption Writer', status: 'active', tool: 'Claude Sonnet' },
                    { label: 'Auto Publisher', status: 'active', tool: 'Blotato API' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < 4 ? '1px solid #F3F4F6' : 'none' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00B050' }} />
                        <span className="text-xs font-medium" style={{ color: '#1A1A2E' }}>{step.label}</span>
                      </div>
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>{step.tool}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content calendar */}
              <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E9EF' }}>
                <h2 className="font-bold text-sm mb-3" style={{ color: '#1A1A2E' }}>This Week</h2>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['M','T','W','T','F','S','S'].map((d, i) => (
                    <div key={i} className="text-xs pb-1" style={{ color: '#9CA3AF' }}>{d}</div>
                  ))}
                  {[1,1,0,1,1,0,0].map((posted, i) => (
                    <div key={i} className="aspect-square rounded flex items-center justify-center text-xs"
                      style={{ background: posted ? '#E8F5EE' : '#F9FAFB', color: posted ? '#00B050' : '#D1D5DB' }}>
                      {posted ? '✓' : '·'}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-center" style={{ color: '#9CA3AF' }}>4 posts this week · Goal: 5</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
