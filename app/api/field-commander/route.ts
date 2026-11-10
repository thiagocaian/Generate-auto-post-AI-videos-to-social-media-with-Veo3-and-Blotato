import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getRequestUserCompany, getAdminClient, unauthorized } from '@/lib/auth'
import { companyRecordFilters, scopedRowMissing } from '@/lib/security/company-scope'
import { parseUuid } from '@/lib/validation/ids'

const CreateOrderSchema = z.object({
  action: z.literal('create_order'),
  title: z.string().min(1).max(200),
  project: z.string().min(1).max(200),
  assignee: z.string().min(1).max(100),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().max(2000).optional(),
})

const CheckinSchema = z.object({
  action: z.literal('checkin'),
  id: z.string().uuid(),
  status: z.enum(['in', 'out']),
})

const PostBodySchema = z.discriminatedUnion('action', [CreateOrderSchema, CheckinSchema])

// GET — fetch work orders + subcontractors for user's company
export async function GET() {
  const auth = await getRequestUserCompany()
  if (!auth) return unauthorized()

  const admin = getAdminClient()
  const [ordersRes, subsRes] = await Promise.all([
    admin.from('work_orders').select('*').eq('company_id', auth.companyId).order('created_at', { ascending: false }),
    admin.from('subcontractors').select('*').eq('company_id', auth.companyId).order('name'),
  ])

  if (ordersRes.error) return NextResponse.json({ error: ordersRes.error.message }, { status: 500 })
  if (subsRes.error)   return NextResponse.json({ error: subsRes.error.message }, { status: 500 })

  return NextResponse.json({ workOrders: ordersRes.data, subcontractors: subsRes.data })
}

// POST — create work order or check in subcontractor
export async function POST(req: NextRequest) {
  const auth = await getRequestUserCompany()
  if (!auth) return unauthorized()

  const raw = await req.json()
  const parsed = PostBodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }
  const body = parsed.data

  const admin = getAdminClient()

  if (body.action === 'create_order') {
    const count = await admin
      .from('work_orders')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', auth.companyId)
    const num = `WO-${2052 + (count.count || 0)}`
    const { data, error } = await admin.from('work_orders').insert({
      company_id: auth.companyId,
      order_number: num,
      title: body.title,
      project_name: body.project,
      assignee_name: body.assignee,
      due_date: body.dueDate ?? null,
      notes: body.notes,
      status: 'pending',
      priority: 'medium',
      tasks: body.notes ? [body.notes] : [],
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, order: data })
  }

  // action === 'checkin' — only a subcontractor in this company can be updated
  const record = companyRecordFilters(auth.companyId, body.id)
  const { data: sub, error } = await admin
    .from('subcontractors')
    .update({
      status: body.status,
      checkin_time: body.status === 'in' ? new Date().toISOString() : null,
    })
    .eq('id', record.id)
    .eq('company_id', record.company_id)
    .select('id')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (scopedRowMissing(sub)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

// DELETE — delete a work order (must belong to same company)
export async function DELETE(req: NextRequest) {
  const auth = await getRequestUserCompany()
  if (!auth) return unauthorized()

  const raw = await req.json().catch(() => null)
  const id = parseUuid(raw && typeof raw === 'object' ? (raw as { id?: unknown }).id : undefined)
  if (!id.ok) return NextResponse.json({ error: id.error }, { status: 400 })

  const admin = getAdminClient()
  const record = companyRecordFilters(auth.companyId, id.id)
  const { data, error } = await admin
    .from('work_orders')
    .delete()
    .eq('id', record.id)
    .eq('company_id', record.company_id)
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (scopedRowMissing(data)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
