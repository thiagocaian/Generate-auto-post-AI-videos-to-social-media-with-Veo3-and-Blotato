import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { renderNotificationHtml, sendInternalNotification } from '@/lib/notify'
import { PUBLIC_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS, clientIp, createRateLimiter } from '@/lib/rate-limit'
import { parseEarlyAccess } from '@/lib/validation/early-access'

// In-memory limiter. Resets on cold start — basic abuse prevention, not a hard guarantee.
const checkRateLimit = createRateLimiter(PUBLIC_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS)

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers.get('x-forwarded-for'))
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const raw = await req.json().catch(() => null)
  const parsed = parseEarlyAccess(raw)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const submittedAt = new Date().toISOString()
  // Insert, not upsert: a duplicate email raises 23505. That stays a success
  // response (the address is already on the list) and does not send another email.
  const { error } = await supabase.from('early_access_leads').insert({
    email: parsed.data.email,
    source: 'landing_page',
    created_at: submittedAt,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ success: true })
    }
    console.error('[EARLY ACCESS] Error:', error.message)
    return NextResponse.json({ error: 'Failed to register. Please try again.' }, { status: 500 })
  }

  await sendInternalNotification({
    label: 'early-access',
    replyTo: parsed.data.email,
    subject: `New early-access signup: ${parsed.data.email}`,
    html: renderNotificationHtml('New early-access signup', [
      ['Email', parsed.data.email],
      ['Source', 'landing_page'],
      ['Submitted', submittedAt],
    ]),
  })

  return NextResponse.json({ success: true })
}
