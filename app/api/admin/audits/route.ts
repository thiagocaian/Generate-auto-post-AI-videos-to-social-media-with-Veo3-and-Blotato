import { NextRequest, NextResponse } from 'next/server'
import { requireClientsAdmin } from '@/lib/clients/access'
import { clientsSupabaseConfigured, getClientsSupabase } from '@/lib/clients-supabase'
import { listAdminAudits } from '@/lib/inbound/admin-audits'
import { createClientsRepository } from '@/lib/inbound/clients-repository'
import { logRoute } from '@/lib/inbound/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireClientsAdmin()
  if (!auth.ok) return auth.response
  if (!clientsSupabaseConfigured()) {
    logRoute('[admin/audits]', 'not_configured')
    return NextResponse.json({ error: 'Could not load audit requests' }, { status: 500 })
  }

  const result = await listAdminAudits(createClientsRepository(getClientsSupabase()), {
    status: req.nextUrl.searchParams.get('status'),
    q: req.nextUrl.searchParams.get('q'),
  }, auth.email)
  if (result.status >= 400) logRoute('[admin/audits]', 'list_failed', { code: result.status })
  return NextResponse.json(result.body, { status: result.status })
}
