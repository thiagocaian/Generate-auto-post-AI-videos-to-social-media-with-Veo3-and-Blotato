import { NextRequest, NextResponse } from 'next/server'
import { clientsSupabaseConfigured, getClientsSupabase } from '@/lib/clients-supabase'
import { qualifyLeadWithGemini } from '@/lib/gemini-lead'
import { createClientsRepository } from '@/lib/inbound/clients-repository'
import { logRoute } from '@/lib/inbound/log'
import { processLeadAudit } from '@/lib/inbound/process-lead-audit'
import { requestIp, createRateLimiter, PUBLIC_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS } from '@/lib/rate-limit'
import { hashIp } from '@/lib/ip-hash'
import { auditAdminUrl, sendTelegramMessage } from '@/lib/telegram-notify'
import { recordLeadAttribution, splitAttribution } from '@/lib/marketing/attribution'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// In-memory limiter (per IP, max 3 requests per hour). Resets on cold start.
// The durable counter in cytron-clients.rate_limits covers the next warm start.
const memoryAllow = createRateLimiter(PUBLIC_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS)

export function GET() {
  logRoute('[lead-audit]', 'method_not_allowed')
  return new NextResponse(null, { status: 405, headers: { Allow: 'POST' } })
}

// This route does not email the lead. Do not add a mailer for data.email here.
export async function POST(req: NextRequest) {
  const started = Date.now()
  let raw: unknown
  let jsonOk = true
  try {
    raw = await req.json()
  } catch {
    jsonOk = false
  }

  const split = splitAttribution(raw)
  const secret = process.env.IP_HASH_SECRET
  const result = await processLeadAudit({
    raw: split.body,
    jsonOk,
    ip: requestIp(req.headers),
    userAgent: req.headers.get('user-agent'),
    memoryAllow,
    repo: clientsSupabaseConfigured() ? createClientsRepository(getClientsSupabase()) : null,
    model: process.env.GEMINI_MODEL,
    qualify: lead => qualifyLeadWithGemini(lead, {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL,
    }),
    notify: text => sendTelegramMessage(text),
    hashIp: value => (secret ? hashIp(value, secret) : null),
    adminUrl: id => auditAdminUrl(id, req.nextUrl.origin),
    onStored: leadId => recordLeadAttribution('lead_audits', leadId, split.attribution),
    log: (event, fields) => logRoute('[lead-audit]', event, { ...fields, duration_ms: Date.now() - started }),
  })

  return NextResponse.json(result.body, { status: result.status })
}
