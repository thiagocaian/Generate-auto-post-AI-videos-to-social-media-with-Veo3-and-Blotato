import { NextResponse } from 'next/server'
import { forbidden, getRequestUser, unauthorized } from '@/lib/auth'

// Same CYTRON super-admin allowlist as app/api/admin/route.ts.
// Duplicated here so this feature does not edit that route.
const SUPER_ADMINS = ['labofantasma@gmail.com']

export async function requireClientsAdmin(): Promise<
  { ok: true; email: string } | { ok: false; response: NextResponse }
> {
  try {
    const user = await getRequestUser()
    if (!user) return { ok: false, response: unauthorized() }
    if (!user.email || !SUPER_ADMINS.includes(user.email)) {
      return { ok: false, response: forbidden() }
    }
    return { ok: true, email: user.email }
  } catch {
    return { ok: false, response: unauthorized() }
  }
}
