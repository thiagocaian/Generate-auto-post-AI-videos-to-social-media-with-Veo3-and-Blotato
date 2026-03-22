import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — fetch work orders + subcontractors
export async function GET() {
  const [ordersRes, subsRes] = await Promise.all([
    supabase.from('work_orders').select('*').order('created_at', { ascending: false }),
    supabase.from('subcontractors').select('*').order('name'),
  ])

  if (ordersRes.error) return NextResponse.json({ error: ordersRes.error.message }, { status: 500 })
  if (subsRes.error)   return NextResponse.json({ error: subsRes.error.message  }, { status: 500 })

  return NextResponse.json({ workOrders: ordersRes.data, subcontractors: subsRes.data })
}

// POST — create work order
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  if (action === 'create_order') {
    const count = await supabase.from('work_orders').select('id', { count: 'exact', head: true })
    const num = `WO-${2052 + (count.count || 0)}`
    const { data, error } = await supabase.from('work_orders').insert({
      order_number: num,
      title: body.title,
      project_name: body.project,
      assignee_name: body.assignee,
      due_date: body.dueDate || null,
      notes: body.notes,
      status: 'pending',
      priority: 'medium',
      tasks: body.notes ? [body.notes] : [],
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, order: data })
  }

  if (action === 'checkin') {
    const { id, status } = body
    const { error } = await supabase.from('subcontractors').update({
      status,
      checkin_time: status === 'in' ? new Date().toISOString() : null,
    }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
