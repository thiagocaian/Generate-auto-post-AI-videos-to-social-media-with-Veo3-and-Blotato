'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CytronLogin } from '@/components/ui/cytron-login'
import { safeNextPath } from '@/lib/safe-next'

function friendlyAuthError(message: string) {
  if (/failed to fetch|network|load failed/i.test(message)) {
    return 'Unable to connect to the sign-in service'
  }
  return message
}

function LoginContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const nextPath = safeNextPath(searchParams.get('next'))
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin'
  const callbackError = searchParams.get('error') === 'auth_callback_error'
    ? 'That sign-in link has expired. Enter your email and password to continue.'
    : ''

  async function handleLogin(email: string, password: string) {
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(friendlyAuthError(signInError.message))
        setLoading(false)
        return
      }
      window.location.assign(nextPath)
    } catch {
      setError('Unable to connect to the sign-in service')
      setLoading(false)
    }
  }

  async function handleSignUp(email: string, password: string, fullName: string) {
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (signUpError) {
        setError(friendlyAuthError(signUpError.message))
        setLoading(false)
        return
      }
      if (data.session) {
        window.location.assign('/onboarding')
        return
      }
      setNotice('Check your email to confirm the account, then sign in.')
      setLoading(false)
    } catch {
      setError('Unable to connect to the sign-in service')
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const { supabase } = await import('@/lib/supabase')
      const next = encodeURIComponent(nextPath)
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
      })
      if (oauthError) {
        setError(friendlyAuthError(oauthError.message))
        setLoading(false)
      }
    } catch {
      setError('Unable to connect to the sign-in service')
      setLoading(false)
    }
  }

  return (
    <CytronLogin
      onSubmit={handleLogin}
      onSignUp={handleSignUp}
      onGoogleLogin={handleGoogleLogin}
      error={error || callbackError}
      notice={notice}
      loading={loading}
      defaultTab={defaultTab}
    />
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginContent />
    </Suspense>
  )
}
