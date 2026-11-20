import { NextRequest, NextResponse } from 'next/server'
import { requireClientsAdmin } from '@/lib/clients/access'
import { clientsSupabaseConfigured, getClientsSupabase } from '@/lib/clients-supabase'
import { addAdminNote } from '@/lib/inbound/admin-audits'
import { createClientsRepository } from '@/lib/inbound/clients-repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireClientsAdmin()
  if (!auth.ok) return auth.response
  if (!clientsSupabaseConfigured()) {
    return NextResponse.json({ error: 'Could not update the audit request' }, { status: 500 })
  }
  let raw: unknown
  let jsonOk = true
  try {
    raw = await req.json()
  } catch {
    jsonOk = false
  }
  const result = await addAdminNote(createClientsRepository(getClientsSupabase()), params.id, raw, jsonOk)
  return NextResponse.json(result.body, { status: result.status })
}
