import { Suspense } from 'react'
import type { Metadata } from 'next'
import { publicSignupEnabled } from '@/lib/auth-flags'
import { LoginContent } from './login-content'

const title = 'Client login — CYTRON'
const description = 'Sign in to your workspace.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://cytronai.com/login' },
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description,
    url: 'https://cytronai.com/login',
  },
  twitter: {
    title,
    description,
  },
}

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
