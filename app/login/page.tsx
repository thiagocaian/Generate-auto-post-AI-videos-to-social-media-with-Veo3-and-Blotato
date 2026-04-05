'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CytronLogin } from '@/components/ui/cytron-login'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        router.push('/')
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
      onGoogleLogin={handleGoogleLogin}
      error={error}
      loading={loading}
    />
  )
}
