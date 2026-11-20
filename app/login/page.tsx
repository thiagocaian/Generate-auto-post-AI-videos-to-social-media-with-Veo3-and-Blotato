import { Suspense } from 'react'
import { publicSignupEnabled } from '@/lib/auth-flags'
import { LoginContent } from './login-content'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#886cff] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent signupEnabled={publicSignupEnabled()} />
    </Suspense>
  )
}
