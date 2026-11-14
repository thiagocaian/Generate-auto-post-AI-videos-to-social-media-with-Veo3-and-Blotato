import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { hashIp } from '@/lib/ip-hash'
import { createRateLimiter, PUBLIC_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS } from '@/lib/rate-limit'
import { brisbaneDay } from '@/lib/validation/lead-audit'
import { normalizeBusinessName, normalizeEmail } from '@/lib/validation/lead-audit-limit'
import { logRoute } from './log'
import { processLeadAudit, SERVICE_UNAVAILABLE } from './process-lead-audit'
import { StorageError, type InboundRepository, type LeadInsert } from './repository'

const TENANT = '11111111-1111-4111-8111-111111111111'
const NOW = new Date('2026-11-10T02:00:00.000Z')
const IP = '203.0.113.44'

const draft = {
  score: 72,
  fit: 'high' as const,
  reasons: ['They described missed calls.'],
  questions: ['Who answers the phone?'],
  audit_title: 'Internal audit for Acme',
  audit_markdown: '## Internal\nMissed calls were stated by the lead.',
}

function payload(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Jane Smith',
    businessName: 'Acme Plumbing Pty Ltd',
    email: 'jane@acme.com.au',
    phone: '0400000000',
    industry: 'Trades',
    website: 'https://acme.example',
    monthlyEnquiries: '40',
    responseProcess: 'We miss calls while on the tools.',
    preferredDate: '2026-11-12',
    preferredTime: '10:00 AM',
    consent: true,
    honeypot: '',
    ...overrides,
  }
}

function createRepo(seedRate = 0) {
  const leads: Array<LeadInsert & { id: string; email_normalized: string; company_normalized: string; score: number | null; fit: string | null; qualification_summary: string | null; qualification_json: unknown; created_at: string; status: string }> = []
  const drafts: Array<Record<string, unknown> & { id: string }> = []
  const activities: Array<Record<string, unknown> & { id: string; type: string; lead_id: string }> = []
  const workflows: Array<Record<string, unknown> & { id: string; tenant_id: string; status: string; step: string | null; error: string | null }> = []
  const rateKeys: string[] = []
  let rate = seedRate
  let forceUnique = false

  const repo: InboundRepository = {
    async tenantId() { return TENANT },
    async existsNormalized(column, value) {
      return leads.some(lead => lead.tenant_id === TENANT && lead[column] === value)
    },
    async consumeRate(key) {
      rateKeys.push(key)
      rate += 1
      return rate
    },
    async insertLead(row) {
      if (forceUnique) throw new StorageError('23505')
      const id = randomUUID()
      leads.push({ ...row, id, score: null, fit: null, qualification_summary: null, qualification_json: null, created_at: NOW.toISOString(), status: 'stored' })
      return { id }
    },
    async updateLead(id, tenantId, patch) {
      const lead = leads.find(item => item.id === id && item.tenant_id === tenantId)
      if (!lead) throw new StorageError('missing')
      Object.assign(lead, patch)
    },
    async insertDraft(row) {
      const id = randomUUID()
      drafts.push({ ...row, id })
      return { id }
    },
    async insertActivity(row) {
      const id = randomUUID()
      activities.push({ ...row, id, lead_id: row.lead_id, type: row.type })
      return { id }
    },
    async insertWorkflow(row) {
      const id = randomUUID()
      workflows.push({ ...row, id, error: null, step: row.step, status: row.status, tenant_id: row.tenant_id })
      return { id }
    },
    async updateWorkflow(id, tenantId, patch) {
      const row = workflows.find(item => item.id === id && item.tenant_id === tenantId)
      if (!row) throw new StorageError('missing')
      Object.assign(row, patch)
    },
    async listLeads() { return [] },
    async listDrafts() { return [] },
    async getLead() { return null },
    async listActivities() { return [] },
  }

  return { repo, leads, drafts, activities, workflows, rateKeys, setForceUnique(value: boolean) { forceUnique = value } }
}

async function submit(store: ReturnType<typeof createRepo>, overrides: Record<string, unknown> = {}, extra: {
  memoryAllow?: (ip: string) => boolean
  repo?: InboundRepository | null
  qualify?: () => Promise<{ ok: false; error: string } | { ok: true; data: typeof draft }>
  notify?: (text: string) => Promise<void>
  jsonOk?: boolean
  raw?: unknown
} = {}) {
  const alerts: string[] = []
  const seen: unknown[] = []
  const logs: string[] = []
  const result = await processLeadAudit({
    raw: extra.raw === undefined ? payload(overrides) : extra.raw,
    jsonOk: extra.jsonOk ?? true,
    ip: IP,
    userAgent: 'SecretBrowser/9',
    now: NOW,
    memoryAllow: extra.memoryAllow ?? (() => true),
    repo: extra.repo === undefined ? store.repo : extra.repo,
    model: 'gemini-test',
    qualify: async lead => {
      seen.push(lead)
      if (extra.qualify) return extra.qualify()
      return { ok: true, data: draft }
    },
    notify: extra.notify ?? (async text => { alerts.push(text) }),
    hashIp: value => hashIp(value, 'test-secret'),
    adminUrl: id => `https://preview.example/admin/audits/${id}`,
    log: (event, fields) => logs.push(JSON.stringify({ event, fields })),
  })
  return { result, alerts, seen, logs }
}

describe('POST /api/lead-audit flow', () => {
  it('T-01 rejects a missing or false consent and writes nothing', async () => {
    const store = createRepo()
    for (const raw of [payload({ consent: false }), payload({ consent: undefined }), payload({ consent: 'true' })]) {
      const { result } = await submit(store, {}, { raw })
      expect(result.status).toBe(400)
      expect(result.body).toEqual({ error: 'Consent is required.' })
    }
    expect(store.leads).toHaveLength(0)
    expect(store.drafts).toHaveLength(0)
    expect(store.activities).toHaveLength(0)
  })

  it('T-02 rejects a body that is not a JSON object', async () => {
    const store = createRepo()
    const missing = await submit(store, {}, { jsonOk: false, raw: undefined })
    expect(missing.result).toEqual({ status: 400, body: { error: 'Invalid JSON' } })
    const nulled = await submit(store, {}, { raw: null })
    expect(nulled.result.status).toBe(400)
    expect(store.leads).toHaveLength(0)
  })

  it('T-03 returns 422 for an invalid email, date, or time and writes nothing', async () => {
    const store = createRepo()
    const email = await submit(store, { email: 'not-an-email' })
    const date = await submit(store, { preferredDate: '2020-01-01' })
    const time = await submit(store, { preferredTime: '7:00 AM' })
    expect(email.result.status).toBe(422)
    expect(date.result).toMatchObject({ status: 422, body: { error: 'Choose a date in the next 14 days' } })
    expect(time.result.status).toBe(422)
    expect(store.leads).toHaveLength(0)
  })

  it('T-04 accepts a filled honeypot with the public success body and writes nothing', async () => {
    const store = createRepo()
    const { result, seen } = await submit(store, { honeypot: 'http://spam.test', email: 'not-an-email', consent: false })
    expect(result).toEqual({ status: 200, body: { success: true, emailSent: false } })
    expect(store.leads).toHaveLength(0)
    expect(store.drafts).toHaveLength(0)
    expect(store.activities).toHaveLength(0)
    expect(seen).toHaveLength(0)
  })

  it('T-05 blocks the fourth request in memory and again after a cold start', async () => {
    const warm = createRepo()
    const allow = createRateLimiter(PUBLIC_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS)
    const statuses: number[] = []
    for (let i = 0; i < 4; i += 1) {
      const { result } = await submit(warm, { email: `person${i}@example.com`, businessName: `Shop ${i} Pty Ltd` }, { memoryAllow: allow })
      statuses.push(result.status)
    }
    expect(statuses.slice(0, 3)).toEqual([200, 200, 200])
    expect(statuses[3]).toBe(429)
    expect(warm.leads).toHaveLength(3)

    const cold = createRepo(3)
    const { result } = await submit(cold, { email: 'fresh@example.com', businessName: 'Fresh Shop Pty Ltd' }, { memoryAllow: () => true })
    expect(result).toEqual({ status: 429, body: { error: 'Too many requests. Please try again later.' } })
    expect(cold.leads).toHaveLength(0)
    expect(cold.rateKeys[0]?.startsWith('ip:')).toBe(true)
    expect(cold.rateKeys[0]).not.toContain(IP)
  })

  it('T-06 blocks the same email or the same normalised business', async () => {
    const store = createRepo()
    const first = await submit(store)
    const sameEmail = await submit(store, { email: ' JANE@acme.com.au ', businessName: 'Another Co' })
    expect(first.result.status).toBe(200)
    expect(sameEmail.result).toMatchObject({ status: 409, body: { code: 'already_requested' } })

    const other = createRepo()
    await submit(other, { email: 'owner@acme.com.au', businessName: 'Acme Plumbing Pty Ltd' })
    const sameBusiness = await submit(other, { email: 'boss@elsewhere.com.au', businessName: 'acme plumbing, pty. ltd.' })
    expect(sameBusiness.result.status).toBe(409)
    expect(other.leads).toHaveLength(1)
    expect(normalizeEmail(' JANE@acme.com.au ')).toBe(other.leads[0] ? normalizeEmail('jane@acme.com.au') : '')
    expect(normalizeBusinessName('acme plumbing, pty. ltd.')).toBe(normalizeBusinessName('Acme Plumbing Pty Ltd'))
  })

  it('T-15 stores an internal draft and answers without the draft or an email', async () => {
    const store = createRepo()
    const { result, alerts, seen, logs } = await submit(store)
    expect(result).toEqual({ status: 200, body: { success: true, emailSent: false } })
    expect(JSON.stringify(result.body)).not.toContain('audit_markdown')
    expect(JSON.stringify(result.body)).not.toContain('Missed calls were stated')
    expect(store.leads).toHaveLength(1)
    expect(store.leads[0]?.tenant_id).toBe(TENANT)
    expect(store.leads[0]?.status).toBe('audit_drafted')
    expect(store.leads[0]?.score).toBe(72)
    expect(store.drafts[0]).toMatchObject({ status: 'draft', tenant_id: TENANT })
    expect(store.activities.map(item => item.type).sort()).toEqual(['audit_draft', 'form_submit', 'qualification', 'telegram_alert'])
    expect(store.workflows[0]).toMatchObject({ status: 'notified', step: 'telegram' })
    expect(JSON.stringify(seen[0])).not.toContain('jane@acme.com.au')
    expect(JSON.stringify(seen[0])).not.toContain('0400000000')
    expect(alerts[0]).toContain('Jane Smith')
    expect(alerts[0]).toContain('Acme Plumbing Pty Ltd')
    expect(alerts[0]).toContain('Fit high · score 72')
    expect(alerts[0]).toContain('/admin/audits/')
    expect(alerts[0]).not.toContain('0400000000')
    expect(alerts[0]).not.toContain('jane@acme.com.au')
    expect(alerts[0]).not.toContain('on the tools')
    expect(alerts[0]).not.toContain('## Internal')
    expect(alerts[0]).not.toContain('SecretBrowser/9')
    expect(logs.join(' ')).not.toContain('jane@acme.com.au')
    expect(logs.join(' ')).not.toContain('0400000000')
    expect(logs.join(' ')).not.toContain('SecretBrowser/9')
  })

  it('T-16 keeps a stored lead when Gemini fails', async () => {
    const store = createRepo()
    const { result } = await submit(store, {}, { qualify: async () => ({ ok: false, error: 'Gemini HTTP 500' }) })
    expect(result).toEqual({ status: 200, body: { success: true, emailSent: false } })
    expect(store.leads[0]?.status).toBe('stored')
    expect(store.drafts).toHaveLength(0)
    expect(store.workflows[0]).toMatchObject({ status: 'failed', step: 'gemini' })
  })

  it('T-17 keeps the lead and the draft when Telegram fails', async () => {
    const store = createRepo()
    const { result } = await submit(store, {}, { notify: async () => { throw new Error('Telegram HTTP 500') } })
    expect(result.status).toBe(200)
    expect(store.leads[0]?.status).toBe('audit_drafted')
    expect(store.drafts[0]?.status).toBe('draft')
    expect(store.workflows[0]).toMatchObject({ status: 'failed', step: 'telegram' })
    expect(store.activities.some(item => item.type === 'telegram_alert' && JSON.stringify(item.payload) === '{"delivered":false}')).toBe(true)
  })

  it('T-30 accepts Brisbane today and today+14, and rejects the days outside that window', async () => {
    const inside = createRepo()
    const today = await submit(inside, { email: 'today@example.com', businessName: 'Today Co', preferredDate: brisbaneDay(NOW, 0) })
    const last = await submit(inside, { email: 'last@example.com', businessName: 'Last Co', preferredDate: brisbaneDay(NOW, 14) })
    expect(today.result.status).toBe(200)
    expect(last.result.status).toBe(200)

    const outside = createRepo()
    const tomorrowTooFar = await submit(outside, { preferredDate: brisbaneDay(NOW, 15) })
    const yesterday = await submit(outside, { preferredDate: brisbaneDay(NOW, -1) })
    expect(tomorrowTooFar.result.status).toBe(422)
    expect(yesterday.result.status).toBe(422)
    expect(outside.leads).toHaveLength(0)
  })

  it('T-36 stores an HMAC of the IP, never the address itself', async () => {
    const store = createRepo()
    await submit(store)
    const hash = store.leads[0]?.ip_hash
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(hash).toBe(hashIp(IP, 'test-secret'))
    expect(hash).not.toContain(IP)
    expect(store.leads[0]?.user_agent).toBe('SecretBrowser/9')
  })

  it('returns 503 when the clients project is not configured and 409 on a unique race', async () => {
    const store = createRepo()
    const missing = await submit(store, {}, { repo: null })
    expect(missing.result).toEqual({ status: 503, body: { error: SERVICE_UNAVAILABLE } })
    expect(store.leads).toHaveLength(0)

    store.setForceUnique(true)
    const raced = await submit(store, { email: 'race@example.com', businessName: 'Race Co' })
    expect(raced.result.status).toBe(409)
  })

  it('drops unsafe log fields (T-37)', () => {
    const lines: string[] = []
    const original = console.info
    console.info = (...args: unknown[]) => { lines.push(args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ')) }
    logRoute('[lead-audit]', 'insert_ok', { lead_id: 'abc', email: 'jane@acme.com.au', phone: '0400000000', token: 'secret' })
    console.info = original
    expect(lines[0]).toContain('insert_ok')
    expect(lines[0]).toContain('abc')
    expect(lines[0]).not.toContain('jane@acme.com.au')
    expect(lines[0]).not.toContain('0400000000')
    expect(lines[0]).not.toContain('secret')
  })
})
