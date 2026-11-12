import { NextRequest, NextResponse } from 'next/server'
import { forbidden, getAdminClient, getRequestUser, isCompanyAdminEmail, unauthorized } from '@/lib/auth'
import { CYTRON_COMPANY_ID } from '@/lib/marketing/attribution'
import { nextStatus, parseQueueDecision, REVIEWABLE_STATUSES } from '@/lib/marketing/queue'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const companyId = () => process.env.MKT_COMPANY_ID || CYTRON_COMPANY_ID

async function requireCytronAdmin() {
  const user = await getRequestUser()
  if (!user) return { ok: false as const, response: unauthorized() }
  if (!isCompanyAdminEmail(user.email)) return { ok: false as const, response: forbidden() }
  return { ok: true as const, user }
}

// GET — content waiting for review + recent decisions (Cytron admin only)
export async function GET() {
  const auth = await requireCytronAdmin()
  if (!auth.ok) return auth.response
  const db = getAdminClient()
  const [queue, recent] = await Promise.all([
    db.from('mkt_content_pieces')
      .select('id, status, format, title, hook, script, caption, target_platforms, platform_variants, media_urls, utm_campaign, generator, created_at, idea:mkt_content_ideas(title, source, source_url, score)')
      .eq('company_id', companyId()).in('status', [...REVIEWABLE_STATUSES]).order('created_at', { ascending: false }).limit(50),
    db.from('mkt_approvals').select('id, piece_id, action, channel, actor, note, created_at')
      .eq('company_id', companyId()).order('created_at', { ascending: false }).limit(20),
  ])
  if (queue.error || recent.error) {
    console.error('[admin/marketing] load failed:', queue.error?.message || recent.error?.message)
    return NextResponse.json({ error: 'Could not load the content queue' }, { status: 500 })
  }
  return NextResponse.json({ queue: queue.data ?? [], recent: recent.data ?? [], adminEmail: auth.user.email })
}

// POST — approve or reject one piece. Approval does NOT publish; n8n distribution (Blotato) picks it up.
export async function POST(req: NextRequest) {
  const auth = await requireCytronAdmin()
  if (!auth.ok) return auth.response
  const parsed = parseQueueDecision(await req.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { id, action, note } = parsed.data
  const db = getAdminClient()

  const { data: piece, error: readError } = await db.from('mkt_content_pieces').select('id, status')
    .eq('id', id).eq('company_id', companyId()).maybeSingle()
  if (readError) return NextResponse.json({ error: 'Could not load the piece' }, { status: 500 })
  if (!piece) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const status = nextStatus(piece.status, action)
  if (!status) return NextResponse.json({ error: `Cannot ${action} a piece in status ${piece.status}` }, { status: 409 })

  const update: Record<string, unknown> = { status }
  if (action === 'reject') update.rejection_reason = note
  const { error: updateError } = await db.from('mkt_content_pieces').update(update)
    .eq('id', id).eq('company_id', companyId()).eq('status', piece.status)
  if (updateError) return NextResponse.json({ error: 'Could not update the piece' }, { status: 500 })

  const { error: logError } = await db.from('mkt_approvals').insert({
    company_id: companyId(), piece_id: id, action: action === 'approve' ? 'approved' : 'rejected',
    channel: 'web', actor: auth.user.email ?? auth.user.id, note,
  })
  if (logError) console.error('[admin/marketing] approval log failed:', logError.message)
  return NextResponse.json({ ok: true, id, status })
}
