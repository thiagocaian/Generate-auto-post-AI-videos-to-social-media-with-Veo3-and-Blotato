import { NextRequest, NextResponse } from 'next/server'
import { runKeepalive } from '@/lib/inbound/keepalive'
import { logRoute } from '@/lib/inbound/log'
import { pingSupabase } from '@/lib/inbound/supabase-ping'
import { sendTelegramMessage } from '@/lib/telegram-notify'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PROJECTS = {
  'cytron-platform': {
    url: () => process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: () => process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  'cytron-clients': {
    url: () => process.env.CLIENTS_SUPABASE_URL,
    key: () => process.env.CLIENTS_SUPABASE_SERVICE_ROLE_KEY,
  },
} as const

export function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function GET(req: NextRequest) {
  const result = await runKeepalive({
    authorization: req.headers.get('authorization'),
    secret: process.env.CRON_SECRET,
    ping: project => {
      const target = PROJECTS[project]
      return pingSupabase(target.url(), target.key())
    },
    alert: text => sendTelegramMessage(text),
  })
  if (result.status === 401) logRoute('[keepalive]', 'unauthorized')
  else if (result.status === 200) logRoute('[keepalive]', 'ok platform+clients')
  else {
    const projects = result.body.projects as Record<string, string> | undefined
    logRoute('[keepalive]', 'fail', {
      project: projects?.['cytron-clients'] === 'ok' ? 'cytron-platform' : 'cytron-clients',
      reason: projects?.['cytron-clients'] === 'ok' ? projects?.['cytron-platform'] ?? 'error' : projects?.['cytron-clients'] ?? 'error',
    })
  }
  return NextResponse.json(result.body, { status: result.status })
}
