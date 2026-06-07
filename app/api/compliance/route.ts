import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getRequestUserCompany, getAdminClient, unauthorized, forbidden } from '@/lib/auth'

const CreateReportSchema = z.object({
  reportType: z.string().min(1).max(100),
  project: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  inspector: z.string().min(1).max(100),
  license: z.string().min(1).max(50),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  voltage: z.string().max(20).optional(),
  result: z.enum(['pass', 'fail', 'conditional']).default('pass'),
  notes: z.string().max(2000).optional(),
})

// GET — fetch compliance reports for the user's company
export async function GET() {
  const auth = await getRequestUserCompany()
  if (!auth) return unauthorized()

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('compliance_reports')
    .select('*')
    .eq('company_id', auth.companyId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data })
}

// POST — create new compliance report
export async function POST(req: NextRequest) {
  const auth = await getRequestUserCompany()
  if (!auth) return unauthorized()

  const raw = await req.json()
  const parsed = CreateReportSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }
  const body = parsed.data

  const admin = getAdminClient()
  const count = await admin
    .from('compliance_reports')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', auth.companyId)
  const num = `CR-${String(42 + (count.count || 0)).padStart(4, '0')}`
  const ref = `QLD-2026-${num.replace('CR-', '')}`

  const { data, error } = await admin.from('compliance_reports').insert({
    company_id: auth.companyId,
    report_number: num,
    report_type: body.reportType,
    project_name: body.project,
    site_location: body.location,
    inspector_name: body.inspector,
    license_number: body.license,
    inspection_date: body.date ?? new Date().toISOString().split('T')[0],
    supply_voltage: body.voltage,
    result: body.result,
    notes: body.notes,
    regulatory_ref: ref,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, report: data, ref })
}

// DELETE — delete a compliance report (must belong to same company)
export async function DELETE(req: NextRequest) {
  const auth = await getRequestUserCompany()
  if (!auth) return unauthorized()

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const admin = getAdminClient()

  // Verify ownership before deleting
  const { data: existing } = await admin
    .from('compliance_reports')
    .select('company_id')
    .eq('id', id)
    .single()

  if (!existing || existing.company_id !== auth.companyId) return forbidden()

  const { error } = await admin.from('compliance_reports').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
