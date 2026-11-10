import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
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

  const { error } = await supabase
    .from('early_access_leads')
    .upsert(
      { email: parsed.data.email, source: 'landing_page', created_at: new Date().toISOString() },
      { onConflict: 'email' }
    )

  if (error) {
    console.error('[EARLY ACCESS] Error:', error.message)
    return NextResponse.json({ error: 'Failed to register. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
