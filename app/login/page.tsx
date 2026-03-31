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
            AI Agents<br />Running Your<br />Business
          </h1>
          <p className="text-sm mb-10" style={{ color: '#94A3B8' }}>
            Marketing, content, operations and growth — powered by AI agents that work 24/7 so you can focus on what matters.
          </p>

          {/* Feature list */}
          {[
            'AI-generated videos & social media content',
            'Automated posting to Instagram & TikTok',
            'Smart marketing campaigns per client',
            'Real-time analytics & performance tracking',
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
          <p className="text-sm mb-2" style={{ color: '#6B7280' }}>
            Enter your credentials to access your workspace
          </p>
          <p className="text-xs mb-8" style={{ color: '#94A3B8', fontStyle: 'italic' }}>
            AI agents running your business while you focus on what matters.
          </p>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={async () => {
              setLoading(true)
              setError('')
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin + '/auth/callback' },
              })
              if (error) { setError(error.message); setLoading(false) }
            }}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-3"
            style={{
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              color: '#374151',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
            <span className="text-xs" style={{ color: '#9CA3AF' }}>or</span>
            <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
          </div>

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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#374151' }}>
                  Password
                </label>
                <a href="/forgot-password" className="text-xs font-medium" style={{ color: '#1D4ED8' }}>
                  Forgot password?
                </a>
              </div>
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
