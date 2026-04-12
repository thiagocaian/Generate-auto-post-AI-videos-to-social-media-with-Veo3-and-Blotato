import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST — create a demo request (public, no auth required)
export async function POST(req: NextRequest) {
  const admin = getAdmin()
  const body = await req.json()

  const { name, email, phone, business_name, business_type, preferred_date, preferred_time, message } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  const { data, error } = await admin.from('demo_requests').insert({
    name,
    email,
    phone: phone || null,
    business_name: business_name || null,
    business_type: business_type || null,
    preferred_date: preferred_date || null,
    preferred_time: preferred_time || null,
    message: message || null,
    status: 'pending',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Optional: trigger n8n webhook for notification
  if (process.env.N8N_DEMO_WEBHOOK) {
    try {
      await fetch(process.env.N8N_DEMO_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: 'demo_request' }),
      })
    } catch (e) {
      // Don't fail the request if webhook fails
    }
  }

  return NextResponse.json({ success: true, booking: data })
}
