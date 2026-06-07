import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

// ─── Server-side auth helpers ────────────────────────────────────────────────

/** Returns the verified user from an API route context, or null. */
export async function getRequestUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
}

/** Returns the company_id for the authenticated user, scoped by company_members. */
export async function getRequestUserCompany(): Promise<{ user: User; companyId: string } | null> {
  const user = await getRequestUser()
  if (!user) return null

  const admin = getAdminClient()
  const { data: member } = await admin
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return null
  return { user, companyId: member.company_id }
}

/** Convenience: returns a 401 JSON response. */
export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/** Convenience: returns a 403 JSON response. */
export function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ─── Service-role client ─────────────────────────────────────────────────────

/** Supabase admin client — only for server-side use. */
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
