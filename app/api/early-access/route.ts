import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { renderNotificationHtml, sendInternalNotification } from '@/lib/notify'
import { requestIp } from '@/lib/rate-limit'
import { allowPublicRate, tooManyRequests } from '@/lib/durable-rate'
import { parseEarlyAccess } from '@/lib/validation/early-access'
import { recordLeadAttribution, splitAttribution } from '@/lib/marketing/attribution'

export async function POST(req: NextRequest) {
  const ip = requestIp(req.headers)
  if (!(await allowPublicRate(ip))) return tooManyRequests()

  const { body: raw, attribution } = splitAttribution(await req.json().catch(() => null))
  const parsed = parseEarlyAccess(raw)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const submittedAt = new Date().toISOString()
  // Insert, not upsert: a duplicate email raises 23505. That stays a success
  // response (the address is already on the list) and does not send another email.
  const { data: inserted, error } = await supabase.from('early_access_leads').insert({
    email: parsed.data.email,
    source: 'landing_page',
    created_at: submittedAt,
  }).select('id').single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ success: true })
    }
    console.error('[EARLY ACCESS] Error:', error.message)
    return NextResponse.json({ error: 'Failed to register. Please try again.' }, { status: 500 })
  }

  await recordLeadAttribution('early_access_leads', typeof inserted?.id === 'string' ? inserted.id : null, attribution)

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
