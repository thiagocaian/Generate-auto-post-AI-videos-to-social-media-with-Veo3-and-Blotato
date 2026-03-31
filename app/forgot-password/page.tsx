'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { LogoWordmark } from '@/components/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <LogoWordmark variant="light" size="sm" />
        </div>

        {sent ? (
          <div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: '#F0FDF4' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>Check your email</h2>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              We sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
            </p>
            <Link href="/login" className="text-sm font-semibold" style={{ color: '#1D4ED8' }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>Reset password</h2>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#374151' }}>
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{ border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#111827' }}
                  onFocus={e => e.target.style.borderColor = '#1D4ED8'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              {error && (
                <div className="rounded-lg px-4 py-3 text-sm" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
                style={{ background: loading ? '#93C5FD' : '#1D4ED8', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-xs font-semibold" style={{ color: '#1D4ED8' }}>
                Back to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
