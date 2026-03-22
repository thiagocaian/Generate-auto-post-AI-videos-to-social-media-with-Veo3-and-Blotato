'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LogoWordmark, LogoIcon } from '@/components/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: '#0F172A' }}>

        {/* Logo */}
        <LogoWordmark variant="dark" size="md" />

        {/* Hero text */}
        <div>
          <h1 className="text-4xl font-bold mb-4 leading-tight" style={{ color: '#F8FAFC' }}>
            Intelligent<br />Automation<br />Platform
          </h1>
          <p className="text-sm mb-10" style={{ color: '#94A3B8' }}>
            Field operations, compliance, warehousing and quoting — unified for electrical contractors.
          </p>

          {/* Feature list */}
          {[
            'AI-powered work order management',
            'Real-time stock control with QR scanning',
            'Automated compliance reporting',
            'Instant quote generation',
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#1D4ED8' }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm" style={{ color: '#CBD5E1' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-xs" style={{ color: '#475569' }}>
          © 2026 Cytron Platform. All rights reserved.
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <LogoWordmark variant="light" size="sm" />
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>Sign in</h2>
          <p className="text-sm mb-8" style={{ color: '#6B7280' }}>
            Enter your credentials to access your workspace
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: '#374151' }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  color: '#111827',
                }}
                onFocus={e => e.target.style.borderColor = '#1D4ED8'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: '#374151' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  color: '#111827',
                }}
                onFocus={e => e.target.style.borderColor = '#1D4ED8'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm"
                style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{
                background: loading ? '#93C5FD' : '#1D4ED8',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid #E5E7EB' }}>
            <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
              Don&apos;t have access?{' '}
              <a href="mailto:admin@cytron.io" style={{ color: '#1D4ED8', fontWeight: 600 }}>
                Contact your administrator
              </a>
            </p>
          </div>

          {/* Plan badges */}
          <div className="mt-6 flex justify-center gap-2">
            {['Starter', 'Pro', 'Enterprise'].map(p => (
              <span key={p} className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
