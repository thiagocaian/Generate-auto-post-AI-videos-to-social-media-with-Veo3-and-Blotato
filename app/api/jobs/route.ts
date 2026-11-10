import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { companyRecordFilters, scopedRowMissing } from '@/lib/security/company-scope'
import { parseUuid } from '@/lib/validation/ids'
import { parseJobPost } from '@/lib/validation/jobs'

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

function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

async function requireCompanyId(userId: string): Promise<
  | { ok: true; admin: ReturnType<typeof getAdmin>; companyId: string }
  | { ok: false; response: NextResponse }
> {
  const admin = getAdmin()
  const { data: member } = await admin
    .from('company_members')
    .select('companies(id)')
    .eq('user_id', userId)
    .single()

  const companyId = (member?.companies as { id?: string } | null)?.id
  if (typeof companyId !== 'string' || companyId.length === 0) {
    return { ok: false, response: NextResponse.json({ error: 'No company' }, { status: 404 }) }
  }
  return { ok: true, admin, companyId }
}

// GET — list jobs for user's company
export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const scope = await requireCompanyId(user.id)
  if (!scope.ok) return scope.response
  const { admin, companyId } = scope

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

  const raw = await req.json().catch(() => null)
  const parsed = parseJobPost(raw)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const scope = await requireCompanyId(user.id)
  if (!scope.ok) return scope.response
  const { admin, companyId } = scope
  const command = parsed.data

  // ── CREATE ────────────────────────────────────
  if (command.action === 'create') {
    if (command.insert.quote_id) {
      const quoteScope = companyRecordFilters(companyId, command.insert.quote_id)
      const { data: quote, error: quoteError } = await admin
        .from('quotes')
        .select('id')
        .eq('id', quoteScope.id)
        .eq('company_id', quoteScope.company_id)
        .maybeSingle()
      if (quoteError) return NextResponse.json({ error: quoteError.message }, { status: 500 })
      if (scopedRowMissing(quote)) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const { count } = await admin
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)

    const jobNumber = `JOB-${String(1 + (count || 0)).padStart(4, '0')}`

    const { data, error } = await admin.from('jobs').insert({
      company_id: companyId,
      user_id: user.id,
      job_number: jobNumber,
      ...command.insert,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, job: data })
  }

  // ── UPDATE STATUS ─────────────────────────────
  if (command.action === 'update_status') {
    const record = companyRecordFilters(companyId, command.id)
    const { data, error } = await admin
      .from('jobs')
      .update({ status: command.status })
      .eq('id', record.id)
      .eq('company_id', record.company_id)
      .select()
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (scopedRowMissing(data)) return notFound()
    return NextResponse.json({ success: true, job: data })
  }

  // ── UPDATE (general) ──────────────────────────
  if (command.action === 'update') {
    const record = companyRecordFilters(companyId, command.id)
    const { data, error } = await admin
      .from('jobs')
      .update(command.fields)
      .eq('id', record.id)
      .eq('company_id', record.company_id)
      .select()
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (scopedRowMissing(data)) return notFound()
    return NextResponse.json({ success: true, job: data })
  }

  // ── LINK QUOTE ────────────────────────────────
  const quoteScope = companyRecordFilters(companyId, command.quote_id)
  const { data: quote, error: quoteError } = await admin
    .from('quotes')
    .select('total, client_name, project_name')
    .eq('id', quoteScope.id)
    .eq('company_id', quoteScope.company_id)
    .maybeSingle()

  if (quoteError) return NextResponse.json({ error: quoteError.message }, { status: 500 })
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

  const updateFields: Record<string, unknown> = { quote_id: command.quote_id, status: 'quoted' }
  if (quote.total) updateFields.total_value = quote.total
  if (quote.client_name && !command.keep_client) updateFields.client_name = quote.client_name

  const jobScope = companyRecordFilters(companyId, command.id)
  const { data, error } = await admin
    .from('jobs')
    .update(updateFields)
    .eq('id', jobScope.id)
    .eq('company_id', jobScope.company_id)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (scopedRowMissing(data)) return notFound()
  return NextResponse.json({ success: true, job: data })
}

// DELETE — remove a job
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseUuid(new URL(req.url).searchParams.get('id'))
  if (!id.ok) return NextResponse.json({ error: id.error }, { status: 400 })

  const scope = await requireCompanyId(user.id)
  if (!scope.ok) return scope.response

  const record = companyRecordFilters(scope.companyId, id.id)
  const { data, error } = await scope.admin
    .from('jobs')
    .delete()
    .eq('id', record.id)
    .eq('company_id', record.company_id)
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (scopedRowMissing(data)) return notFound()
  return NextResponse.json({ success: true })
}
