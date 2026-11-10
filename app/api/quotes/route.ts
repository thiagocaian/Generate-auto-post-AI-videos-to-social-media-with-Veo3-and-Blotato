import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { companyRecordFilters, scopedRowMissing } from '@/lib/security/company-scope'
import { parseUuid } from '@/lib/validation/ids'
import { parseQuoteCreate } from '@/lib/validation/quotes'

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

// GET — list quotes for user's company
export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const scope = await requireCompanyId(user.id)
  if (!scope.ok) return scope.response

  const { data, error } = await scope.admin
    .from('quotes')
    .select('*')
    .eq('company_id', scope.companyId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ quotes: data })
}

// POST — create a new quote
export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const raw = await req.json().catch(() => null)
  const parsed = parseQuoteCreate(raw)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const scope = await requireCompanyId(user.id)
  if (!scope.ok) return scope.response

  // Auto-generate quote number
  const { count } = await scope.admin
    .from('quotes')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', scope.companyId)

  const quoteNumber = `QT-${String(1001 + (count || 0)).padStart(4, '0')}`
  const body = parsed.data

  const { data, error } = await scope.admin.from('quotes').insert({
    company_id: scope.companyId,
    user_id: user.id,
    quote_number: quoteNumber,
    client_name: body.client_name,
    project_name: body.project_name || null,
    items: body.items || [],
    subtotal: body.subtotal || 0,
    gst: body.gst || 0,
    total: body.total || 0,
    status: body.status || 'draft',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, quote: data })
}

// DELETE — delete a quote owned by the caller's company
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const raw = await req.json().catch(() => null)
  const id = parseUuid(raw && typeof raw === 'object' ? (raw as { id?: unknown }).id : undefined)
  if (!id.ok) return NextResponse.json({ error: id.error }, { status: 400 })

  const scope = await requireCompanyId(user.id)
  if (!scope.ok) return scope.response

  const record = companyRecordFilters(scope.companyId, id.id)
  const { data, error } = await scope.admin
    .from('quotes')
    .delete()
    .eq('id', record.id)
    .eq('company_id', record.company_id)
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (scopedRowMissing(data)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
