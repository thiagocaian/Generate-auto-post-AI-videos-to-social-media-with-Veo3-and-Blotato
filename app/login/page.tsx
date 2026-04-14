'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CytronLogin } from '@/components/ui/cytron-login'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Support ?tab=signup from landing page CTAs
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin'

  async function handleLogin(email: string, password: string) {
    setLoading(true)
    setError('')

    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Unable to connect to authentication service')
      setLoading(false)
    }
  }

  async function handleSignUp(email: string, password: string, fullName: string) {
    setLoading(true)
    setError('')

    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else if (data.user) {
        // Redirect to onboarding after successful signup
        router.push('/onboarding')
        router.refresh()
      }
    } catch (err) {
      setError('Unable to connect to authentication service')
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/auth/callback' },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch (err) {
      setError('Unable to connect to authentication service')
      setLoading(false)
    }
  }

  return (
    <CytronLogin
      onSubmit={handleLogin}
      onSignUp={handleSignUp}
      onGoogleLogin={handleGoogleLogin}
      error={error}
      loading={loading}
      defaultTab={defaultTab as "signin" | "signup"}
    />
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#886cff] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
