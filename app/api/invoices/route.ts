import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { companyRecordFilters, scopedRowMissing } from '@/lib/security/company-scope'
import { parseUuid } from '@/lib/validation/ids'
import { parseInvoicePost } from '@/lib/validation/invoices'

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

function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 })
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

// GET — list invoices for user's company
export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const scope = await requireCompanyId(user.id)
  if (!scope.ok) return scope.response

  const { data, error } = await scope.admin
    .from('invoices')
    .select('*')
    .eq('company_id', scope.companyId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ invoices: data })
}

// POST — create, update, or perform actions on invoices
export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const raw = await req.json().catch(() => null)
  const parsed = parseInvoicePost(raw)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const scope = await requireCompanyId(user.id)
  if (!scope.ok) return scope.response
  const { admin, companyId } = scope
  const command = parsed.data

  // ── CREATE ────────────────────────────────────
  if (command.action === 'create') {
    const { count } = await admin
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)

    const invoiceNumber = `INV-${String(1001 + (count || 0)).padStart(4, '0')}`

    const subtotal = command.subtotal || 0
    const taxRate = command.tax_rate ?? 10
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    const { data, error } = await admin.from('invoices').insert({
      company_id: companyId,
      user_id: user.id,
      invoice_number: invoiceNumber,
      job_id: command.job_id,
      quote_id: command.quote_id,
      client_name: command.client_name,
      client_email: command.client_email,
      client_address: command.client_address,
      items: command.items,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      status: 'draft',
      due_date: command.due_date,
      notes: command.notes,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, invoice: data })
  }

  // ── CREATE FROM JOB ───────────────────────────
  if (command.action === 'create_from_job') {
    const jobScope = companyRecordFilters(companyId, command.job_id)
    const { data: job } = await admin
      .from('jobs')
      .select('*')
      .eq('id', jobScope.id)
      .eq('company_id', jobScope.company_id)
      .maybeSingle()

    if (!job) return notFound('Job not found')

    // Copy quote lines only when that quote belongs to this company.
    // A foreign quote id is not stored on the new invoice.
    let items: unknown[] = []
    let subtotal = 0
    let linkedQuoteId: string | null = null
    if (typeof job.quote_id === 'string' && job.quote_id.length > 0) {
      const quoteScope = companyRecordFilters(companyId, job.quote_id)
      const { data: quote } = await admin
        .from('quotes')
        .select('items, subtotal, gst, total')
        .eq('id', quoteScope.id)
        .eq('company_id', quoteScope.company_id)
        .maybeSingle()

      if (quote) {
        items = quote.items || []
        subtotal = quote.subtotal || 0
        linkedQuoteId = job.quote_id
      }
    }

    if (!subtotal && job.total_value) {
      subtotal = job.total_value
    }

    const taxRate = 10
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    const { count } = await admin
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)

    const invoiceNumber = `INV-${String(1001 + (count || 0)).padStart(4, '0')}`

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    const { data: invoice, error } = await admin.from('invoices').insert({
      company_id: companyId,
      user_id: user.id,
      invoice_number: invoiceNumber,
      job_id: job.id,
      quote_id: linkedQuoteId,
      client_name: job.client_name || 'Client',
      client_email: job.client_email || null,
      client_address: job.site_address || null,
      items,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      status: 'draft',
      due_date: dueDate.toISOString().split('T')[0],
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await admin
      .from('jobs')
      .update({ status: 'invoiced' })
      .eq('id', jobScope.id)
      .eq('company_id', jobScope.company_id)

    return NextResponse.json({ success: true, invoice })
  }

  // ── RECORD PAYMENT ────────────────────────────
  if (command.action === 'record_payment') {
    const record = companyRecordFilters(companyId, command.id)
    const { data: invoice } = await admin
      .from('invoices')
      .select('*')
      .eq('id', record.id)
      .eq('company_id', record.company_id)
      .maybeSingle()

    if (!invoice) return notFound('Invoice not found')

    const newAmountPaid = (invoice.amount_paid || 0) + (command.amount || 0)
    const isPaid = newAmountPaid >= invoice.total

    const { data, error } = await admin
      .from('invoices')
      .update({
        amount_paid: newAmountPaid,
        payment_method: command.method,
        payment_date: new Date().toISOString(),
        status: isPaid ? 'paid' : 'sent',
      })
      .eq('id', record.id)
      .eq('company_id', record.company_id)
      .select()
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (scopedRowMissing(data)) return notFound('Invoice not found')

    if (isPaid && typeof invoice.job_id === 'string' && invoice.job_id.length > 0) {
      const jobScope = companyRecordFilters(companyId, invoice.job_id)
      await admin
        .from('jobs')
        .update({ status: 'paid' })
        .eq('id', jobScope.id)
        .eq('company_id', jobScope.company_id)
    }

    return NextResponse.json({ success: true, invoice: data })
  }

  // ── SEND INVOICE ──────────────────────────────
  const record = companyRecordFilters(companyId, command.id)
  const { data, error } = await admin
    .from('invoices')
    .update({
      status: 'sent',
      issued_at: new Date().toISOString(),
    })
    .eq('id', record.id)
    .eq('company_id', record.company_id)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (scopedRowMissing(data)) return notFound('Invoice not found')
  return NextResponse.json({ success: true, invoice: data })
}

// DELETE — remove an invoice owned by the caller's company
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseUuid(new URL(req.url).searchParams.get('id'))
  if (!id.ok) return NextResponse.json({ error: id.error }, { status: 400 })

  const scope = await requireCompanyId(user.id)
  if (!scope.ok) return scope.response

  const record = companyRecordFilters(scope.companyId, id.id)
  const { data, error } = await scope.admin
    .from('invoices')
    .delete()
    .eq('id', record.id)
    .eq('company_id', record.company_id)
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (scopedRowMissing(data)) return notFound()
  return NextResponse.json({ success: true })
}
