import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/auth'
import { requireClientsAdmin } from '@/lib/clients/access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STATUSES = ['new', 'contacted', 'converted', 'closed'] as const

export async function GET(req: NextRequest) {
  const auth = await requireClientsAdmin()
  if (!auth.ok) return auth.response

  const status = req.nextUrl.searchParams.get('status')
  if (status && !STATUSES.includes(status as (typeof STATUSES)[number])) {
    return NextResponse.json({ error: 'Unknown status' }, { status: 400 })
  }

  const admin = getAdminClient()
  let query = admin.from('lead_audits').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Could not load audit requests' }, { status: 500 })

  const q = req.nextUrl.searchParams.get('q')?.trim().toLowerCase()
  const audits = (data ?? []).filter(row => {
    if (!q) return true
    return [row.name, row.business_name, row.email, row.phone, row.industry, row.response_process, row.notes]
      .join(' ')
      .toLowerCase()
      .includes(q)
  })

  return NextResponse.json({ audits, adminEmail: auth.email })
}
