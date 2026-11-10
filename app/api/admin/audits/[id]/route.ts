import { NextRequest, NextResponse } from 'next/server'
import { requireClientsAdmin } from '@/lib/clients/access'
import { clientsSupabaseConfigured, getClientsSupabase } from '@/lib/clients-supabase'
import { getAdminAudit, patchAdminAudit, rejectDelete } from '@/lib/inbound/admin-audits'
import { createClientsRepository } from '@/lib/inbound/clients-repository'
import { logRoute } from '@/lib/inbound/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function repoOrNull() {
  if (!clientsSupabaseConfigured()) return null
  return createClientsRepository(getClientsSupabase())
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireClientsAdmin()
  if (!auth.ok) return auth.response
  const repo = repoOrNull()
  if (!repo) {
    logRoute('[admin/audits]', 'not_configured')
    return NextResponse.json({ error: 'Could not load the audit request' }, { status: 500 })
  }
  const result = await getAdminAudit(repo, params.id, auth.email)
  return NextResponse.json(result.body, { status: result.status })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireClientsAdmin()
  if (!auth.ok) return auth.response
  const repo = repoOrNull()
  if (!repo) return NextResponse.json({ error: 'Could not update the audit request' }, { status: 500 })

  let raw: unknown
  let jsonOk = true
  try {
    raw = await req.json()
  } catch {
    jsonOk = false
  }
  const result = await patchAdminAudit(repo, params.id, raw, jsonOk)
  return NextResponse.json(result.body, { status: result.status })
}

export async function DELETE() {
  const auth = await requireClientsAdmin()
  if (!auth.ok) return auth.response
  logRoute('[admin/audits]', 'delete_rejected')
  const result = rejectDelete()
  return NextResponse.json(result.body, { status: result.status })
}
