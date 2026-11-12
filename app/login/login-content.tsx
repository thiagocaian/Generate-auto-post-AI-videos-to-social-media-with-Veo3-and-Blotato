'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CytronLogin } from '@/components/ui/cytron-login'
import { PASSWORD_MIN_LENGTH } from '@/lib/auth-flags'

export function LoginContent({ signupEnabled }: { signupEnabled: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const defaultTab = signupEnabled && searchParams.get('tab') === 'signup' ? 'signup' : 'signin'

  async function precheck(path: string, body?: unknown) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.status === 429) {
      setError('Too many attempts. Please try again later.')
      return false
    }
    if (!res.ok) {
      const json = await res.json().catch(() => null)
      setError(typeof json?.error === 'string' ? json.error : 'Unable to continue. Please try again.')
      return false
    }
    return true
  }

  async function handleLogin(email: string, password: string) {
    setLoading(true)
    setError('')

    try {
      if (!(await precheck('/api/auth/attempt'))) {
        setLoading(false)
        return
      }
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Unable to connect to authentication service')
      setLoading(false)
    }
  }

  async function handleSignUp(email: string, password: string, fullName: string) {
    setLoading(true)
    setError('')

    try {
      if (password.length < PASSWORD_MIN_LENGTH) {
        setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
        setLoading(false)
        return
      }
      if (!(await precheck('/api/auth/signup', { email, password, fullName }))) {
        setLoading(false)
        return
      }
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else if (data.user) {
        router.push('/onboarding')
        router.refresh()
      }
    } catch {
      setError('Unable to connect to authentication service')
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    try {
      if (!(await precheck('/api/auth/attempt'))) {
        setLoading(false)
        return
      }
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/auth/callback' },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch {
      setError('Unable to connect to authentication service')
      setLoading(false)
    }
  }

  return (
    <CytronLogin
      onSubmit={handleLogin}
      onSignUp={signupEnabled ? handleSignUp : undefined}
      onGoogleLogin={handleGoogleLogin}
      error={error}
      loading={loading}
      defaultTab={defaultTab}
      signupEnabled={signupEnabled}
    />
  )
}
