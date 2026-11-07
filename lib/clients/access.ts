import { NextResponse } from 'next/server'
import { forbidden, getRequestUser, isCompanyAdminEmail, unauthorized } from '@/lib/auth'

export async function requireClientsAdmin(): Promise<
  { ok: true; email: string } | { ok: false; response: NextResponse }
> {
  try {
    const user = await getRequestUser()
    const email = user?.email
    if (!user || !email) return { ok: false, response: unauthorized() }
    if (!isCompanyAdminEmail(email)) {
      return { ok: false, response: forbidden() }
    }
    return { ok: true, email }
  } catch {
    return { ok: false, response: unauthorized() }
  }
}
