import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { unwrapCompany } from '@/lib/company-embed'

export async function GET() {
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
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const account = { id: user.id, email: user.email }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Could not load workspace', user: account }, { status: 500 })
  }

  // Service role bypasses RLS. The browser query against companies can come
  // back empty when that table has no SELECT policy, which left the sidebar
  // name on "Loading...".
  const { createClient } = await import('@supabase/supabase-js')
  const adminClient = createClient(supabaseUrl, serviceKey)

  const { data: rows, error } = await adminClient
    .from('company_members')
    .select('role, companies(id, name, slug, plan, plan_status, primary_color, logo_url)')
    .eq('user_id', user.id)
    .limit(1)

  if (error) return NextResponse.json({ error: 'Could not load workspace', user: account }, { status: 500 })

  const member = rows?.[0]
  const company = unwrapCompany(member?.companies)
  if (!member || !company?.id) {
    return NextResponse.json({ error: 'No company found', user: account }, { status: 404 })
  }

  return NextResponse.json({
    user: account,
    company,
    role: member.role,
  })
}
