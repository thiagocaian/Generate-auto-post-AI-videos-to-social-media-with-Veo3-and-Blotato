import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser, getAdminClient, unauthorized, forbidden } from '@/lib/auth'

// Super admin emails — CYTRON team only, can see ALL companies
const SUPER_ADMINS = ['labofantasma@gmail.com']

export async function GET(req: NextRequest) {
  const user = await getRequestUser()
  if (!user) return unauthorized()

  const isSuperAdmin = SUPER_ADMINS.includes(user.email ?? '')
  const admin = getAdminClient()

  if (isSuperAdmin) {
    // Full cross-company view — CYTRON team only
    const [companiesRes, connectionReqsRes, recentJobsRes, recentPostsRes, platformsRes] = await Promise.all([
      admin.from('companies').select('id, name, slug, plan, plan_status, created_at').order('created_at', { ascending: false }),
      admin.from('material_searches').select('*').like('best_distributor', 'CONNECTION_REQUEST%').order('created_at', { ascending: false }).limit(50),
      admin.from('jobs').select('id, job_number, title, client_name, status, company_id, created_at').order('created_at', { ascending: false }).limit(20),
      admin.from('marketing_posts').select('id, platform, status, caption, created_at, company_id').order('created_at', { ascending: false }).limit(20),
      fetch('https://backend.blotato.com/v2/users/me/accounts', {
        headers: { 'blotato-api-key': process.env.BLOTATO_API_KEY ?? '' },
      }).then(r => r.json()).catch(() => ({ items: [] })),
    ])

    return NextResponse.json({
      companies: companiesRes.data ?? [],
      connection_requests: (connectionReqsRes.data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id,
        created_at: r.created_at,
        company_id: r.company_id,
        ...((r.items as Record<string, unknown>[])?.[0] ?? {}),
      })),
      recent_jobs: recentJobsRes.data ?? [],
      recent_posts: recentPostsRes.data ?? [],
      blotato_accounts: (platformsRes as { items?: unknown[] }).items ?? [],
      admin_email: user.email,
      scope: 'global',
    })
  }

  // Company-scoped admin — owner or admin role only
  const { data: member } = await admin
    .from('company_members')
    .select('role, company_id')
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'admin'].includes(member.role)) {
    return forbidden()
  }

  const companyId = member.company_id

  const [companyRes, jobsRes, postsRes] = await Promise.all([
    admin.from('companies').select('id, name, slug, plan, plan_status, created_at').eq('id', companyId).single(),
    admin.from('jobs').select('id, job_number, title, client_name, status, company_id, created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(20),
    admin.from('marketing_posts').select('id, platform, status, caption, created_at, company_id').eq('company_id', companyId).order('created_at', { ascending: false }).limit(20),
  ])

  return NextResponse.json({
    companies: companyRes.data ? [companyRes.data] : [],
    connection_requests: [],
    recent_jobs: jobsRes.data ?? [],
    recent_posts: postsRes.data ?? [],
    blotato_accounts: [],
    admin_email: user.email,
    scope: 'company',
  })
}
