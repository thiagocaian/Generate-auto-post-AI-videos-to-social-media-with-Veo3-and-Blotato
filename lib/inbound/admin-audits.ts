import { z } from 'zod'
import { LEAD_STATUSES, type ActivityRecord, type DraftRecord, type InboundRepository, type LeadPatch, type LeadRecord } from './repository'

const STATUS = z.enum(LEAD_STATUSES)

export const AdminListQuery = z.object({
  status: STATUS.optional(),
  q: z.string().trim().max(200).optional(),
})

export const AdminPatchSchema = z.object({
  status: STATUS.optional(),
  notes: z.string().trim().max(2000).optional(),
  name: z.string().trim().min(1).max(100).optional(),
  businessName: z.string().trim().min(1).max(200).optional(),
  email: z.string().trim().email().max(200).optional(),
  phone: z.string().trim().max(30).optional(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  preferredTime: z.string().trim().min(1).max(20).optional(),
}).refine(value => Object.keys(value).length > 0, { message: 'Provide at least one field to update' })

const NoteSchema = z.object({
  note: z.string().trim().min(1).max(2000),
})

export type AuditListItem = {
  id: string
  tenantId: string
  name: string
  businessName: string
  email: string
  phone: string | null
  industry: string | null
  website: string | null
  monthlyEnquiries: string | null
  responseProcess: string | null
  preferredDate: string | null
  preferredTime: string | null
  status: string
  score: number | null
  fit: LeadRecord['fit']
  qualificationSummary: string | null
  consentAt: string
  createdAt: string
  draft: { id: string; title: string | null; status: DraftRecord['status'] } | null
}

export type AuditDetail = AuditListItem & {
  qualificationJson: unknown | null
  consentText: string
  draft: {
    id: string
    title: string | null
    bodyMarkdown: string | null
    status: DraftRecord['status']
    model: string | null
    promptVersion: string | null
    createdAt: string
  } | null
  activities: Array<{ id: string; type: string; payload: unknown; createdAt: string }>
}

type AdminResult = { status: number; body: Record<string, unknown> }

function iso(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}

function latestByLead(drafts: DraftRecord[], tenantId: string): Map<string, DraftRecord> {
  const map = new Map<string, DraftRecord>()
  for (const draft of drafts) {
    if (draft.tenant_id !== tenantId) continue
    const previous = map.get(draft.lead_id)
    if (!previous || previous.created_at < draft.created_at) map.set(draft.lead_id, draft)
  }
  return map
}

export function toListItem(lead: LeadRecord, draft: DraftRecord | null): AuditListItem {
  return {
    id: lead.id,
    tenantId: lead.tenant_id,
    name: lead.name,
    businessName: lead.company,
    email: lead.email,
    phone: lead.phone,
    industry: lead.industry,
    website: lead.website,
    monthlyEnquiries: lead.monthly_enquiries,
    responseProcess: lead.response_process,
    preferredDate: lead.preferred_date,
    preferredTime: lead.preferred_time,
    status: lead.status,
    score: lead.score,
    fit: lead.fit,
    qualificationSummary: lead.qualification_summary,
    consentAt: iso(lead.consent_at),
    createdAt: iso(lead.created_at),
    draft: draft ? { id: draft.id, title: draft.title, status: draft.status } : null,
  }
}

export function toDetail(lead: LeadRecord, draft: DraftRecord | null, activities: ActivityRecord[]): AuditDetail {
  const list = toListItem(lead, draft)
  return {
    ...list,
    qualificationJson: lead.qualification_json ?? null,
    consentText: lead.consent_text,
    draft: draft ? {
      id: draft.id,
      title: draft.title,
      bodyMarkdown: draft.body_markdown,
      status: draft.status,
      model: draft.model,
      promptVersion: draft.prompt_version,
      createdAt: iso(draft.created_at),
    } : null,
    activities: activities
      .filter(activity => activity.tenant_id === lead.tenant_id && activity.lead_id === lead.id)
      .map(activity => ({
        id: activity.id,
        type: activity.type,
        payload: activity.payload,
        createdAt: iso(activity.created_at),
      })),
  }
}

function matchesQuery(item: AuditListItem, q: string): boolean {
  return [item.name, item.businessName, item.email, item.phone, item.industry, item.responseProcess]
    .join(' ')
    .toLowerCase()
    .includes(q)
}

async function ownLead(repo: InboundRepository, tenantId: string, id: string): Promise<LeadRecord | null> {
  const lead = await repo.getLead(id)
  if (!lead || lead.tenant_id !== tenantId) return null
  return lead
}

export async function listAdminAudits(repo: InboundRepository, query: { status?: string | null; q?: string | null }, adminEmail: string): Promise<AdminResult> {
  if (query.status && !STATUS.safeParse(query.status).success) {
    return { status: 400, body: { error: 'Unknown status' } }
  }
  const parsed = AdminListQuery.safeParse({
    status: query.status || undefined,
    q: query.q?.trim() || undefined,
  })
  if (!parsed.success) return { status: 400, body: { error: 'Unknown status' } }

  try {
    const tenantId = await repo.tenantId()
    const leads = (await repo.listLeads()).filter(lead => lead.tenant_id === tenantId)
    const drafts = latestByLead(await repo.listDrafts(leads.map(lead => lead.id)), tenantId)
    const q = parsed.data.q?.toLowerCase()
    const audits = leads
      .map(lead => toListItem(lead, drafts.get(lead.id) ?? null))
      .filter(item => !parsed.data.status || item.status === parsed.data.status)
      .filter(item => !q || matchesQuery(item, q))
    return { status: 200, body: { audits, adminEmail } }
  } catch {
    return { status: 500, body: { error: 'Could not load audit requests' } }
  }
}

export async function getAdminAudit(repo: InboundRepository, id: string, adminEmail: string): Promise<AdminResult> {
  if (!z.string().uuid().safeParse(id).success) return { status: 400, body: { error: 'Invalid audit id' } }
  try {
    const tenantId = await repo.tenantId()
    const lead = await ownLead(repo, tenantId, id)
    if (!lead) return { status: 404, body: { error: 'Audit request not found' } }
    const [drafts, activities] = await Promise.all([
      repo.listDrafts([lead.id]),
      repo.listActivities(lead.id),
    ])
    const draft = latestByLead(drafts, tenantId).get(lead.id) ?? null
    return { status: 200, body: { audit: toDetail(lead, draft, activities), adminEmail } }
  } catch {
    return { status: 500, body: { error: 'Could not load the audit request' } }
  }
}

export function rejectDelete(): AdminResult {
  return { status: 405, body: { error: 'Method not allowed' } }
}

export async function patchAdminAudit(repo: InboundRepository, id: string, raw: unknown, jsonOk: boolean): Promise<AdminResult> {
  if (!z.string().uuid().safeParse(id).success) return { status: 400, body: { error: 'Invalid audit id' } }
  if (!jsonOk) return { status: 400, body: { error: 'Invalid JSON' } }
  const parsed = AdminPatchSchema.safeParse(raw)
  if (!parsed.success) return { status: 400, body: { error: parsed.error.issues[0]?.message || 'Invalid audit' } }

  try {
    const tenantId = await repo.tenantId()
    const lead = await ownLead(repo, tenantId, id)
    if (!lead) return { status: 404, body: { error: 'Audit request not found' } }

    const patch: LeadPatch = {}
    if (parsed.data.status !== undefined) patch.status = parsed.data.status
    if (parsed.data.name !== undefined) patch.name = parsed.data.name
    if (parsed.data.businessName !== undefined) patch.company = parsed.data.businessName
    if (parsed.data.email !== undefined) patch.email = parsed.data.email.toLowerCase()
    if (parsed.data.phone !== undefined) patch.phone = parsed.data.phone || null
    if (parsed.data.preferredDate !== undefined) patch.preferred_date = parsed.data.preferredDate
    if (parsed.data.preferredTime !== undefined) patch.preferred_time = parsed.data.preferredTime

    if (Object.keys(patch).length > 0) {
      await repo.updateLead(id, tenantId, patch)
      if (parsed.data.status && parsed.data.status !== lead.status) {
        await repo.insertActivity({
          tenant_id: tenantId,
          lead_id: id,
          type: 'status_change',
          payload: { from: lead.status, to: parsed.data.status },
        })
      }
    }
    if (parsed.data.notes) {
      await repo.insertActivity({
        tenant_id: tenantId,
        lead_id: id,
        type: 'note',
        payload: { text: parsed.data.notes },
      })
    }

    const updated = await ownLead(repo, tenantId, id)
    if (!updated) return { status: 404, body: { error: 'Audit request not found' } }
    const drafts = latestByLead(await repo.listDrafts([id]), tenantId)
    return { status: 200, body: { audit: toListItem(updated, drafts.get(id) ?? null) } }
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : ''
    if (code === '23505') {
      return { status: 409, body: { error: 'Another audit request already uses this email or business name' } }
    }
    return { status: 500, body: { error: 'Could not update the audit request' } }
  }
}

export async function addAdminNote(repo: InboundRepository, id: string, raw: unknown, jsonOk: boolean): Promise<AdminResult> {
  if (!z.string().uuid().safeParse(id).success) return { status: 400, body: { error: 'Invalid audit id' } }
  if (!jsonOk) return { status: 400, body: { error: 'Invalid JSON' } }
  const parsed = NoteSchema.safeParse(raw)
  if (!parsed.success) return { status: 400, body: { error: parsed.error.issues[0]?.message || 'Invalid note' } }
  const patched = await patchAdminAudit(repo, id, { notes: parsed.data.note }, true)
  if (patched.status !== 200) return patched
  const activities = await repo.listActivities(id)
  const note = [...activities].reverse().find(activity => activity.type === 'note')
  return { status: 200, body: { ok: true, activityId: note?.id } }
}
