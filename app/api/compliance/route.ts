import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — fetch all compliance reports
export async function GET() {
  const { data, error } = await supabase
    .from('compliance_reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data })
}

// POST — create new compliance report
export async function POST(req: NextRequest) {
  const body = await req.json()

  const count = await supabase.from('compliance_reports').select('id', { count: 'exact', head: true })
  const num = `CR-${String(42 + (count.count || 0)).padStart(4, '0')}`
  const ref = `QLD-2026-${num.replace('CR-', '')}`

  const { data, error } = await supabase.from('compliance_reports').insert({
    report_number: num,
    report_type: body.reportType,
    project_name: body.project,
    site_location: body.location,
    inspector_name: body.inspector,
    license_number: body.license,
    inspection_date: body.date || new Date().toISOString().split('T')[0],
    supply_voltage: body.voltage,
    result: body.result || 'pass',
    notes: body.notes,
    regulatory_ref: ref,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, report: data, ref })
}
