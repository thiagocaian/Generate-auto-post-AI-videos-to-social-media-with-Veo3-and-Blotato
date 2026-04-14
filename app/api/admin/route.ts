import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Admin emails allowed to access this endpoint
const ADMIN_EMAILS = ['labofantasma@gmail.com', 'thiago@cytronai.com']

async function getAuthUser() {
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
  return user
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access only' }, { status: 403 })
  }

  const admin = getAdmin()

  // Fetch all data in parallel
  const [companiesRes, connectionReqsRes, recentJobsRes, recentPostsRes, platformsRes] = await Promise.all([
    // All companies
    admin.from('companies').select('id, name, slug, plan, plan_status, created_at').order('created_at', { ascending: false }),
    // Connection requests (saved as material_searches with CONNECTION_REQUEST prefix)
    admin.from('material_searches').select('*').like('best_distributor', 'CONNECTION_REQUEST%').order('created_at', { ascending: false }).limit(50),
    // Recent jobs across all companies
    admin.from('jobs').select('id, job_number, title, client_name, status, company_id, created_at').order('created_at', { ascending: false }).limit(20),
    // Recent marketing posts
    admin.from('marketing_posts').select('id, platform, status, caption, created_at, company_id').order('created_at', { ascending: false }).limit(20),
    // Blotato connected accounts
    fetch('https://backend.blotato.com/v2/users/me/accounts', {
      headers: { 'blotato-api-key': process.env.BLOTATO_API_KEY || '' },
    }).then(r => r.json()).catch(() => ({ items: [] })),
  ])

  return NextResponse.json({
    companies: companiesRes.data || [],
    connection_requests: (connectionReqsRes.data || []).map((r: any) => ({
      id: r.id,
      created_at: r.created_at,
      company_id: r.company_id,
      ...((r.items as any[])?.[0] || {}),
    })),
    recent_jobs: recentJobsRes.data || [],
    recent_posts: recentPostsRes.data || [],
    blotato_accounts: platformsRes.items || [],
    admin_email: user.email,
  })
}
