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

// GET — list invoices for user's company
export async function GET() {
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

  const { data, error } = await admin
    .from('invoices')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ invoices: data })
}

// POST — create, update, or perform actions on invoices
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
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)

    const invoiceNumber = `INV-${String(1001 + (count || 0)).padStart(4, '0')}`

    const subtotal = body.subtotal || 0
    const taxRate = body.tax_rate ?? 10
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    const { data, error } = await admin.from('invoices').insert({
      company_id: companyId,
      user_id: user.id,
      invoice_number: invoiceNumber,
      job_id: body.job_id || null,
      quote_id: body.quote_id || null,
      client_name: body.client_name,
      client_email: body.client_email || null,
      client_address: body.client_address || null,
      items: body.items || [],
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      status: 'draft',
      due_date: body.due_date || null,
      notes: body.notes || null,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, invoice: data })
  }

  // ── CREATE FROM JOB ───────────────────────────
  if (action === 'create_from_job') {
    const { job_id } = body

    // Fetch job
    const { data: job } = await admin
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .eq('company_id', companyId)
      .single()

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    // Fetch linked quote items if available
    let items: any[] = []
    let subtotal = 0
    if (job.quote_id) {
      const { data: quote } = await admin
        .from('quotes')
        .select('items, subtotal, gst, total')
        .eq('id', job.quote_id)
        .single()

      if (quote) {
        items = quote.items || []
        subtotal = quote.subtotal || 0
      }
    }

    if (!subtotal && job.total_value) {
      subtotal = job.total_value
    }

    const taxRate = 10
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    // Auto-generate invoice number
    const { count } = await admin
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)

    const invoiceNumber = `INV-${String(1001 + (count || 0)).padStart(4, '0')}`

    // Due date: 30 days from now
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    const { data: invoice, error } = await admin.from('invoices').insert({
      company_id: companyId,
      user_id: user.id,
      invoice_number: invoiceNumber,
      job_id: job.id,
      quote_id: job.quote_id || null,
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

    // Update job status to 'invoiced'
    await admin
      .from('jobs')
      .update({ status: 'invoiced' })
      .eq('id', job_id)
      .eq('company_id', companyId)

    return NextResponse.json({ success: true, invoice })
  }

  // ── RECORD PAYMENT ────────────────────────────
  if (action === 'record_payment') {
    const { id, amount, method } = body

    // Fetch current invoice
    const { data: invoice } = await admin
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single()

    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    const newAmountPaid = (invoice.amount_paid || 0) + (amount || 0)
    const isPaid = newAmountPaid >= invoice.total

    const { data, error } = await admin
      .from('invoices')
      .update({
        amount_paid: newAmountPaid,
        payment_method: method || null,
        payment_date: new Date().toISOString(),
        status: isPaid ? 'paid' : 'sent',
      })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Cascade: if paid and linked to a job, update job status
    if (isPaid && invoice.job_id) {
      await admin
        .from('jobs')
        .update({ status: 'paid' })
        .eq('id', invoice.job_id)
        .eq('company_id', companyId)
    }

    return NextResponse.json({ success: true, invoice: data })
  }

  // ── SEND INVOICE ──────────────────────────────
  if (action === 'send') {
    const { id } = body

    const { data, error } = await admin
      .from('invoices')
      .update({
        status: 'sent',
        issued_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, invoice: data })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// DELETE — remove an invoice
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
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
