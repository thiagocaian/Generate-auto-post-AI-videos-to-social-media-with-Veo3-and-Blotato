import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get company
  const { data: member } = await admin
    .from('company_members')
    .select('role, companies(id, name, slug, plan, plan_status, primary_color, logo_url)')
    .eq('user_id', user.id)
    .single()

  if (!member?.companies) {
    return NextResponse.json({ error: 'No company found' }, { status: 404 })
  }

  const company = member.companies as any
  const companyId = company.id as string

  // Fetch all stats in parallel
  const [marketing, quotes, compliance, workOrders, jobs, invoices, recentPosts, recentQuotes, recentJobs] = await Promise.all([
    // Marketing stats
    admin
      .from('marketing_posts')
      .select('id, status, reach, likes, video_url')
      .eq('company_id', companyId),

    // Quotes stats
    admin
      .from('quotes')
      .select('id, total, status')
      .eq('company_id', companyId),

    // Compliance stats
    admin
      .from('compliance_reports')
      .select('id, result'),

    // Work orders stats
    admin
      .from('work_orders')
      .select('id, status'),

    // Jobs stats
    admin
      .from('jobs')
      .select('id, status, total_value, scheduled_date')
      .eq('company_id', companyId),

    // Invoices stats
    admin
      .from('invoices')
      .select('id, status, total, amount_paid')
      .eq('company_id', companyId),

    // Recent posts (last 5)
    admin
      .from('marketing_posts')
      .select('id, caption, platform, status, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5),

    // Recent quotes (last 5)
    admin
      .from('quotes')
      .select('id, quote_number, client_name, total, status, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5),

    // Recent jobs (last 5)
    admin
      .from('jobs')
      .select('id, job_number, title, client_name, status, total_value, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const posts = marketing.data || []
  const quotesList = quotes.data || []
  const reports = compliance.data || []
  const orders = workOrders.data || []
  const jobsList = jobs.data || []
  const invoicesList = invoices.data || []

  const stats = {
    marketing: {
      total: posts.length,
      published: posts.filter(p => p.status === 'published').length,
      totalReach: posts.reduce((sum, p) => sum + (p.reach || 0), 0),
      totalLikes: posts.reduce((sum, p) => sum + (p.likes || 0), 0),
      videosGenerated: posts.filter(p => p.video_url).length,
    },
    quotes: {
      total: quotesList.length,
      totalValue: quotesList.reduce((sum, q) => sum + (q.total || 0), 0),
      approved: quotesList.filter(q => q.status === 'approved').length,
    },
    compliance: {
      total: reports.length,
      passed: reports.filter(r => r.result === 'pass').length,
      failed: reports.filter(r => r.result === 'fail').length,
      pending: reports.filter(r => r.result === 'pending').length,
    },
    workOrders: {
      total: orders.length,
      active: orders.filter(o => o.status === 'active' || o.status === 'pending').length,
      completed: orders.filter(o => o.status === 'completed').length,
    },
    jobs: {
      total: jobsList.length,
      active: jobsList.filter(j => j.status === 'scheduled' || j.status === 'in_progress').length,
      completed: jobsList.filter(j => ['completed', 'invoiced', 'paid'].includes(j.status)).length,
      pipelineValue: jobsList.reduce((sum, j) => sum + (j.total_value || 0), 0),
    },
    invoices: {
      total: invoicesList.length,
      totalBilled: invoicesList.reduce((sum, i) => sum + (i.total || 0), 0),
      totalPaid: invoicesList.reduce((sum, i) => sum + (i.amount_paid || 0), 0),
      outstanding: invoicesList.filter(i => ['sent', 'viewed', 'overdue'].includes(i.status)).length,
    },
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    company,
    role: member.role,
    stats,
    recent: {
      posts: recentPosts.data || [],
      quotes: recentQuotes.data || [],
      jobs: recentJobs.data || [],
    },
  })
}
