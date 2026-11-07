import { NextResponse } from 'next/server'
import { forbidden, getRequestUser, isCompanyAdminEmail, unauthorized } from '@/lib/auth'

export async function requireClientsAdmin(): Promise<
  { ok: true; email: string } | { ok: false; response: NextResponse }
> {
  try {
    const user = await getRequestUser()
    if (!user) return { ok: false, response: unauthorized() }
    if (!isCompanyAdminEmail(user.email)) {
      return { ok: false, response: forbidden() }
    }
    return { ok: true, email: user.email }
  } catch {
    return { ok: false, response: unauthorized() }
  }
}
