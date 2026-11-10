import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PUBLIC_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS, clientIp, createRateLimiter } from '@/lib/rate-limit'
import { parseBooking } from '@/lib/validation/booking'

// In-memory limiter. Resets on cold start — basic abuse prevention, not a hard guarantee.
const checkRateLimit = createRateLimiter(PUBLIC_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS)

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST — create a demo request (public, no auth required)
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers.get('x-forwarded-for'))
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const raw = await req.json().catch(() => null)
  const parsed = parseBooking(raw)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const admin = getAdmin()
  const booking = parsed.data

  const { data, error } = await admin.from('demo_requests').insert({
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    business_name: booking.business_name,
    business_type: booking.business_type,
    preferred_date: booking.preferred_date,
    preferred_time: booking.preferred_time,
    message: booking.message,
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
    } catch {
      // Don't fail the request if webhook fails
    }
  }

  return NextResponse.json({ success: true, booking: data })
}
