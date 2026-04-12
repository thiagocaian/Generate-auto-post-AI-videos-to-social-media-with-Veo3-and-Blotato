import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

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

// GET — list jobs for user's company
export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()

  const { data: member } = await admin
    .from('company_members')
    .select('companies(id)')
    .eq('user_id', user.id)
    .single()

  const companyId = (member?.companies as any)?.id
  if (!companyId) return NextResponse.json({ error: 'No company' }, { status: 404 })

  // Optional filters from query params
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  let query = admin
    .from('jobs')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  // Calendar month filter
  if (month && year) {
    const startDate = `${year}-${month.padStart(2, '0')}-01`
    const endDate = `${year}-${month.padStart(2, '0')}-31`
    query = query.gte('scheduled_date', startDate).lte('scheduled_date', endDate)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ jobs: data })
}

// POST — create, update, or perform actions on jobs
export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()
  const body = await req.json()

  const { data: member } = await admin
    .from('company_members')
    .select('companies(id)')
    .eq('user_id', user.id)
    .single()

  const companyId = (member?.companies as any)?.id
  if (!companyId) return NextResponse.json({ error: 'No company' }, { status: 404 })

  const action = body.action || 'create'

  // ── CREATE ────────────────────────────────────
  if (action === 'create') {
    const { count } = await admin
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)

    const jobNumber = `JOB-${String(1 + (count || 0)).padStart(4, '0')}`

    const { data, error } = await admin.from('jobs').insert({
      company_id: companyId,
      user_id: user.id,
      job_number: jobNumber,
      title: body.title,
      description: body.description || null,
      client_name: body.client_name || null,
      client_email: body.client_email || null,
      client_phone: body.client_phone || null,
      site_address: body.site_address || null,
      status: body.status || 'enquiry',
      priority: body.priority || 'medium',
      assigned_to: body.assigned_to || null,
      quote_id: body.quote_id || null,
      scheduled_date: body.scheduled_date || null,
      scheduled_time_start: body.scheduled_time_start || null,
      scheduled_time_end: body.scheduled_time_end || null,
      estimated_hours: body.estimated_hours || null,
      notes: body.notes || null,
      tags: body.tags || [],
      total_value: body.total_value || 0,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, job: data })
  }

  // ── UPDATE STATUS ─────────────────────────────
  if (action === 'update_status') {
    const { id, status: newStatus } = body

    const { data, error } = await admin
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, job: data })
  }

  // ── UPDATE (general) ──────────────────────────
  if (action === 'update') {
    const { id, ...fields } = body
    delete fields.action

    const { data, error } = await admin
      .from('jobs')
      .update(fields)
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, job: data })
  }

  // ── LINK QUOTE ────────────────────────────────
  if (action === 'link_quote') {
    const { id, quote_id } = body

    // Fetch quote to get total value
    const { data: quote } = await admin
      .from('quotes')
      .select('total, client_name, project_name')
      .eq('id', quote_id)
      .single()

    const updateFields: any = { quote_id }
    if (quote?.total) updateFields.total_value = quote.total
    if (quote?.client_name && !body.keep_client) updateFields.client_name = quote.client_name
    updateFields.status = 'quoted'

    const { data, error } = await admin
      .from('jobs')
      .update(updateFields)
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, job: data })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// DELETE — remove a job
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data: member } = await admin
    .from('company_members')
    .select('companies(id)')
    .eq('user_id', user.id)
    .single()

  const companyId = (member?.companies as any)?.id
  if (!companyId) return NextResponse.json({ error: 'No company' }, { status: 404 })

  const { error } = await admin
    .from('jobs')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
