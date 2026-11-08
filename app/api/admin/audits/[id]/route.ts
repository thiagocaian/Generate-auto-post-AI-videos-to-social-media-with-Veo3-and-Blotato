import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminClient } from '@/lib/auth'
import { requireClientsAdmin } from '@/lib/clients/access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STATUSES = ['new', 'contacted', 'converted', 'closed'] as const

const PatchSchema = z.object({
  status: z.enum(STATUSES).optional(),
  notes: z.string().trim().max(2000).optional(),
  name: z.string().trim().min(1).max(100).optional(),
  businessName: z.string().trim().min(1).max(200).optional(),
  email: z.string().trim().email().max(200).optional(),
  phone: z.string().trim().max(30).optional(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  preferredTime: z.string().trim().min(1).max(20).optional(),
}).refine(value => Object.keys(value).length > 0, { message: 'Provide at least one field to update' })

function failure(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireClientsAdmin()
  if (!auth.ok) return auth.response
  if (!z.string().uuid().safeParse(params.id).success) return failure(400, 'Invalid audit id')

  const raw = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(raw)
  if (!parsed.success) return failure(400, parsed.error.issues[0]?.message || 'Invalid audit')

  const patch: Record<string, string | null> = {}
  if (parsed.data.status !== undefined) patch.status = parsed.data.status
  if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes
  if (parsed.data.name !== undefined) patch.name = parsed.data.name
  if (parsed.data.businessName !== undefined) patch.business_name = parsed.data.businessName
  if (parsed.data.email !== undefined) patch.email = parsed.data.email.toLowerCase()
  if (parsed.data.phone !== undefined) patch.phone = parsed.data.phone || null
  if (parsed.data.preferredDate !== undefined) patch.preferred_date = parsed.data.preferredDate
  if (parsed.data.preferredTime !== undefined) patch.preferred_time = parsed.data.preferredTime

  const admin = getAdminClient()
  const { data, error } = await admin.from('lead_audits').update(patch).eq('id', params.id).select('*').maybeSingle()
  if (error) return failure(500, 'Could not update the audit request')
  if (!data) return failure(404, 'Audit request not found')
  return NextResponse.json({ audit: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireClientsAdmin()
  if (!auth.ok) return auth.response
  if (!z.string().uuid().safeParse(params.id).success) return failure(400, 'Invalid audit id')

  const admin = getAdminClient()
  const { data, error } = await admin.from('lead_audits').delete().eq('id', params.id).select('id').maybeSingle()
  if (error) return failure(500, 'Could not delete the audit request')
  if (!data) return failure(404, 'Audit request not found')
  return NextResponse.json({ ok: true, id: data.id })
}
