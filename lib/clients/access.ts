import { NextResponse } from 'next/server'
import { forbidden, getRequestUser, unauthorized } from '@/lib/auth'
import { adminEmailStatus } from '@/lib/company-admin'

export async function requireClientsAdmin(): Promise<
  { ok: true; email: string } | { ok: false; response: NextResponse }
> {
  try {
    const user = await getRequestUser()
    const email = user?.email
    const decision = adminEmailStatus(email)
    if (decision === 403) return { ok: false, response: forbidden() }
    if (decision !== 200 || !email) return { ok: false, response: unauthorized() }
    return { ok: true, email }
  } catch {
    return { ok: false, response: unauthorized() }
  }
}
