import { NextResponse } from 'next/server'
import { forbidden, getRequestUser, unauthorized } from '@/lib/auth'

// Clients desk allowlist. Kept separate from app/api/admin/route.ts so that route stays unchanged.
const SUPER_ADMINS = ['admin@cytroncorporation.com']

export async function requireClientsAdmin(): Promise<
  { ok: true; email: string } | { ok: false; response: NextResponse }
> {
  try {
    const user = await getRequestUser()
    if (!user) return { ok: false, response: unauthorized() }
    if (!user.email || !SUPER_ADMINS.includes(user.email.toLowerCase())) {
      return { ok: false, response: forbidden() }
    }
    return { ok: true, email: user.email }
  } catch {
    return { ok: false, response: unauthorized() }
  }
}
