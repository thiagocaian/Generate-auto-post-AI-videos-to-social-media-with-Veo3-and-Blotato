import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { addAdminNote, getAdminAudit, listAdminAudits, patchAdminAudit, rejectDelete } from './admin-audits'
import { StorageError, type ActivityRecord, type DraftRecord, type InboundRepository, type LeadRecord } from './repository'

const CYTRON = '11111111-1111-4111-8111-111111111111'
const OTHER = '22222222-2222-4222-8222-222222222222'
const OWN = '33333333-3333-4333-8333-333333333333'
const FOREIGN = '44444444-4444-4444-8444-444444444444'
const NOW = '2026-11-11T01:00:00.000Z'

function lead(overrides: Partial<LeadRecord> & { id: string; tenant_id: string }): LeadRecord {
  return {
    name: 'Jane Smith',
    email: 'jane@acme.com.au',
    phone: '0400000000',
    company: 'Acme Plumbing',
    website: null,
    industry: 'Trades',
    monthly_enquiries: null,
    response_process: 'Missed calls',
    preferred_date: '2026-11-12',
    preferred_time: '10:00 AM',
    status: 'audit_drafted',
    score: 72,
    fit: 'high',
    qualification_summary: 'They described missed calls.',
    qualification_json: { fit: 'high' },
    consent_at: NOW,
    consent_text: 'I agree',
    created_at: NOW,
    ...overrides,
  }
}

function createRepo() {
  const leads: LeadRecord[] = [
    lead({ id: OWN, tenant_id: CYTRON }),
    lead({ id: FOREIGN, tenant_id: OTHER, name: 'Other Person', email: 'other@example.com', company: 'Other Co', score: 10, fit: 'low' }),
  ]
  const drafts: DraftRecord[] = [
    {
      id: '55555555-5555-4555-8555-555555555555',
      tenant_id: CYTRON,
      lead_id: OWN,
      title: 'Internal audit',
      body_markdown: 'SECRET DRAFT',
      status: 'draft',
      model: 'gemini-test',
      prompt_version: 'lead_intake_v1',
      created_at: NOW,
    },
    {
      id: '66666666-6666-4666-8666-666666666666',
      tenant_id: OTHER,
      lead_id: FOREIGN,
      title: 'Foreign',
      body_markdown: 'FOREIGN DRAFT',
      status: 'draft',
      model: null,
      prompt_version: null,
      created_at: NOW,
    },
  ]
  const activities: ActivityRecord[] = []
  const repo: InboundRepository = {
    async tenantId() { return CYTRON },
    async existsNormalized() { return false },
    async consumeRate() { return 1 },
    async insertLead() { return { id: randomUUID() } },
    async updateLead(id, tenantId, patch) {
      if (patch.email === 'taken@example.com') throw new StorageError('23505')
      const row = leads.find(item => item.id === id && item.tenant_id === tenantId)
      if (!row) throw new StorageError('missing')
      Object.assign(row, patch)
      if (patch.company) row.company = patch.company
    },
    async insertDraft() { return { id: randomUUID() } },
    async insertActivity(row) {
      const id = randomUUID()
      activities.push({ id, tenant_id: row.tenant_id, lead_id: row.lead_id, type: row.type, payload: row.payload, created_at: NOW })
      return { id }
    },
    async insertWorkflow() { return { id: randomUUID() } },
    async updateWorkflow() {},
    async listLeads() { return leads },
    async listDrafts() { return drafts },
    async getLead(id) { return leads.find(item => item.id === id) ?? null },
    async listActivities(leadId) { return activities.filter(item => item.lead_id === leadId) },
  }
  return { repo, leads, activities }
}

describe('admin audits', () => {
  it('T-11 and T-26 list only the Cytron tenant and hide the draft body', async () => {
    const { repo } = createRepo()
    const result = await listAdminAudits(repo, {}, 'admin@cytroncorporation.com')
    expect(result.status).toBe(200)
    const audits = result.body.audits as Array<Record<string, unknown>>
    expect(audits).toHaveLength(1)
    expect(audits[0]?.businessName).toBe('Acme Plumbing')
    expect(audits[0]?.score).toBe(72)
    expect(audits[0]?.fit).toBe('high')
    expect(audits[0]?.draft).toMatchObject({ title: 'Internal audit', status: 'draft' })
    expect(audits[0]?.draft).not.toHaveProperty('bodyMarkdown')
    expect(JSON.stringify(result.body)).not.toContain('SECRET DRAFT')
    expect(JSON.stringify(result.body)).not.toContain('FOREIGN DRAFT')
    expect(JSON.stringify(result.body)).not.toContain('other@example.com')
    expect(result.body.adminEmail).toBe('admin@cytroncorporation.com')
  })

  it('T-27 returns the internal draft and omits ip_hash; a foreign id is 404', async () => {
    const { repo, leads } = createRepo()
    Object.assign(leads[0] as LeadRecord, { ip_hash: '203.0.113.44' })
    const detail = await getAdminAudit(repo, OWN, 'admin@cytroncorporation.com')
    expect(detail.status).toBe(200)
    const audit = detail.body.audit as Record<string, unknown>
    expect(audit).not.toHaveProperty('ip_hash')
    expect(JSON.stringify(detail.body)).not.toContain('203.0.113.44')
    expect((audit.draft as { bodyMarkdown: string }).bodyMarkdown).toBe('SECRET DRAFT')
    const foreign = await getAdminAudit(repo, FOREIGN, 'admin@cytroncorporation.com')
    expect(foreign).toEqual({ status: 404, body: { error: 'Audit request not found' } })
    expect(await getAdminAudit(repo, 'not-a-uuid', 'admin@cytroncorporation.com')).toMatchObject({ status: 400 })
  })

  it('T-28 saves an internal note and does not describe a send', async () => {
    const { repo, activities } = createRepo()
    const patched = await patchAdminAudit(repo, OWN, { notes: 'teste QA' }, true)
    expect(patched.status).toBe(200)
    expect(activities.some(item => item.type === 'note' && JSON.stringify(item.payload) === '{"text":"teste QA"}')).toBe(true)
    expect(JSON.stringify(patched.body)).not.toContain('emailSent')
    const noted = await addAdminNote(repo, OWN, { note: 'second note' }, true)
    expect(noted.status).toBe(200)
    expect(typeof noted.body.activityId).toBe('string')
  })

  it('T-29 rejects delete and archives with PATCH', async () => {
    const { repo, leads } = createRepo()
    expect(rejectDelete()).toEqual({ status: 405, body: { error: 'Method not allowed' } })
    const archived = await patchAdminAudit(repo, OWN, { status: 'archived' }, true)
    expect(archived.status).toBe(200)
    expect(leads.find(item => item.id === OWN)?.status).toBe('archived')
    expect(leads).toHaveLength(2)
  })

  it('returns the known admin errors', async () => {
    const { repo } = createRepo()
    expect((await listAdminAudits(repo, { status: 'new' }, 'admin@cytroncorporation.com')).body).toEqual({ error: 'Unknown status' })
    const conflict = await patchAdminAudit(repo, OWN, { email: 'taken@example.com' }, true)
    expect(conflict).toEqual({ status: 409, body: { error: 'Another audit request already uses this email or business name' } })
    expect((await patchAdminAudit(repo, OWN, {}, true)).status).toBe(400)
    expect((await patchAdminAudit(repo, FOREIGN, { notes: 'nope' }, true)).status).toBe(404)
  })
})
