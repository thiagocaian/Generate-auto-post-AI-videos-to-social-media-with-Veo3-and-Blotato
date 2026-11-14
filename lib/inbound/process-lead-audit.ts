import {
  LEAD_PROMPT_VERSION,
  qualificationSummary,
  type LeadQualification,
  type LeadQualifyInput,
  type QualifyResult,
} from '@/lib/gemini-lead'
import { PUBLIC_RATE_LIMIT } from '@/lib/rate-limit'
import { buildLeadAlert } from '@/lib/telegram-notify'
import {
  ALREADY_REQUESTED_CODE,
  ALREADY_REQUESTED_MESSAGE,
  findExistingAudit,
  normalizeBusinessName,
  normalizeEmail,
} from '@/lib/validation/lead-audit-limit'
import { consentGranted, createLeadAuditSchema, honeypotFilled } from '@/lib/validation/lead-audit'
import { AUDIT_CONSENT_TEXT } from './consent'
import { StorageError, rateWindowStart, type InboundRepository } from './repository'

export const INVALID_JSON = 'Invalid JSON'
export const CONSENT_REQUIRED = 'Consent is required.'
export const TOO_MANY_REQUESTS = 'Too many requests. Please try again later.'
export const SAVE_FAILED = 'Could not save your request. Please try again.'
export const SERVICE_UNAVAILABLE = 'Service unavailable'

export type LeadAuditBody =
  | { success: true; emailSent: false }
  | { error: string; code?: string }

export type LeadAuditResult = { status: number; body: LeadAuditBody }

const SUCCESS: LeadAuditBody = { success: true, emailSent: false }

type LogFn = (event: string, fields?: Record<string, string | number | boolean | null>) => void

function storageCode(error: unknown): string {
  if (error instanceof StorageError) return error.code
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') return error.code
  return 'storage'
}

function blank(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

async function safe<T>(run: () => Promise<T>, log: LogFn, event: string): Promise<T | null> {
  try {
    return await run()
  } catch (error) {
    log(event, { code: storageCode(error) })
    return null
  }
}

export async function processLeadAudit(input: {
  raw: unknown
  jsonOk: boolean
  ip: string
  userAgent: string | null
  now?: Date
  memoryAllow: (ip: string) => boolean
  repo: InboundRepository | null
  qualify: (lead: LeadQualifyInput) => Promise<QualifyResult>
  notify: (text: string) => Promise<void>
  hashIp: (ip: string) => string | null
  adminUrl: (leadId: string) => string
  model?: string | null
  log?: LogFn
}): Promise<LeadAuditResult> {
  const now = input.now ?? new Date()
  const log = input.log ?? (() => {})

  if (!input.memoryAllow(input.ip)) {
    log('rate_limited')
    return { status: 429, body: { error: TOO_MANY_REQUESTS } }
  }
  if (!input.jsonOk || !input.raw || typeof input.raw !== 'object' || Array.isArray(input.raw)) {
    log('invalid_json')
    return { status: 400, body: { error: INVALID_JSON } }
  }
  if (honeypotFilled(input.raw)) {
    log('honeypot')
    return { status: 200, body: SUCCESS }
  }
  if (!consentGranted(input.raw)) {
    log('consent_required')
    return { status: 400, body: { error: CONSENT_REQUIRED } }
  }

  const parsed = createLeadAuditSchema(now).safeParse(input.raw)
  if (!parsed.success) {
    log('validation_failed')
    return { status: 422, body: { error: parsed.error.issues[0]?.message || 'Check the form and try again.' } }
  }
  if (!input.repo) {
    log('not_configured')
    return { status: 503, body: { error: SERVICE_UNAVAILABLE } }
  }

  const data = parsed.data
  const repo = input.repo
  let tenantId: string
  try {
    tenantId = await repo.tenantId()
    const ipHash = input.hashIp(input.ip)
    if (ipHash) {
      const count = await repo.consumeRate(`ip:${ipHash}`, rateWindowStart(now))
      if (count > PUBLIC_RATE_LIMIT) {
        log('rate_limited', { code: 'durable' })
        return { status: 429, body: { error: TOO_MANY_REQUESTS } }
      }
    }
    const existing = await findExistingAudit(async (column, value) => {
      const dbColumn = column === 'business_normalized' ? 'company_normalized' : 'email_normalized'
      return repo.existsNormalized(dbColumn, value)
    }, data.email, data.businessName)
    if (existing.blocked) {
      log('duplicate_blocked')
      return { status: 409, body: { error: ALREADY_REQUESTED_MESSAGE, code: ALREADY_REQUESTED_CODE } }
    }
  } catch (error) {
    log('duplicate_check_failed', { code: storageCode(error) })
    return { status: 500, body: { error: SAVE_FAILED } }
  }

  const model = input.model?.trim() || null
  let leadId: string
  try {
    const inserted = await repo.insertLead({
      tenant_id: tenantId,
      name: data.name,
      email: data.email.trim(),
      phone: blank(data.phone),
      company: data.businessName,
      website: blank(data.website),
      industry: blank(data.industry),
      monthly_enquiries: blank(data.monthlyEnquiries),
      response_process: blank(data.responseProcess),
      preferred_date: data.preferredDate,
      preferred_time: data.preferredTime,
      source: 'site_form',
      status: 'stored',
      consent_at: now.toISOString(),
      consent_text: AUDIT_CONSENT_TEXT,
      ip_hash: input.hashIp(input.ip),
      user_agent: input.userAgent ? input.userAgent.slice(0, 300) : null,
      model,
      prompt_version: LEAD_PROMPT_VERSION,
      email_normalized: normalizeEmail(data.email),
      company_normalized: normalizeBusinessName(data.businessName),
    })
    leadId = inserted.id
  } catch (error) {
    if (storageCode(error) === '23505') {
      log('duplicate_blocked', { code: '23505' })
      return { status: 409, body: { error: ALREADY_REQUESTED_MESSAGE, code: ALREADY_REQUESTED_CODE } }
    }
    log('insert_failed', { code: storageCode(error) })
    return { status: 500, body: { error: SAVE_FAILED } }
  }

  log('insert_ok', { lead_id: leadId, status: 'stored' })
  const workflowId = await safe(() => repo.insertWorkflow({
    tenant_id: tenantId,
    lead_id: leadId,
    workflow: 'lead_intake_v1',
    status: 'stored',
    step: 'form_submit',
  }).then(row => row.id), log, 'workflow_failed')
  await safe(() => repo.insertActivity({
    tenant_id: tenantId,
    lead_id: leadId,
    type: 'form_submit',
    payload: { source: 'site_form', consent_version: '2026-11-11' },
  }), log, 'activity_failed')

  const qualifyInput: LeadQualifyInput = {
    name: data.name,
    company: data.businessName,
    industry: blank(data.industry),
    website: blank(data.website),
    monthlyEnquiries: blank(data.monthlyEnquiries),
    responseProcess: blank(data.responseProcess),
    preferredDate: data.preferredDate,
    preferredTime: data.preferredTime,
  }

  let qualification: QualifyResult
  try {
    qualification = await input.qualify(qualifyInput)
  } catch {
    qualification = { ok: false, error: 'exception' }
  }

  const link = input.adminUrl(leadId)
  if (!qualification.ok) {
    log('gemini_failed', { lead_id: leadId, code: qualification.status ?? null, step: 'gemini' })
    await safe(() => repo.insertActivity({
      tenant_id: tenantId,
      lead_id: leadId,
      type: 'qualification',
      payload: { ok: false },
    }), log, 'activity_failed')
    if (workflowId) {
      await safe(() => repo.updateWorkflow(workflowId, tenantId, {
        status: 'failed',
        step: 'gemini',
        error: qualification.error.slice(0, 200),
      }), log, 'workflow_failed')
    }
    await deliverAlert(repo, input.notify, log, {
      tenantId,
      leadId,
      workflowId,
      text: buildLeadAlert({
        name: data.name,
        company: data.businessName,
        fit: null,
        score: null,
        summary: null,
        adminUrl: link,
        qualificationFailed: true,
      }),
      keepFailureStep: 'gemini',
    })
    return { status: 200, body: SUCCESS }
  }

  const drafted = await storeDraft(repo, log, {
    tenantId,
    leadId,
    model,
    data: qualification.data,
  })
  if (!drafted) {
    if (workflowId) {
      await safe(() => repo.updateWorkflow(workflowId, tenantId, {
        status: 'failed',
        step: 'draft',
        error: 'draft_insert_failed',
      }), log, 'workflow_failed')
    }
  }

  await deliverAlert(repo, input.notify, log, {
    tenantId,
    leadId,
    workflowId: drafted ? workflowId : null,
    text: buildLeadAlert({
      name: data.name,
      company: data.businessName,
      fit: qualification.data.fit,
      score: qualification.data.score,
      summary: qualificationSummary(qualification.data),
      adminUrl: link,
    }),
    keepFailureStep: null,
  })

  return { status: 200, body: SUCCESS }
}

async function storeDraft(repo: InboundRepository, log: LogFn, input: {
  tenantId: string
  leadId: string
  model: string | null
  data: LeadQualification
}): Promise<boolean> {
  try {
    const draft = await repo.insertDraft({
      tenant_id: input.tenantId,
      lead_id: input.leadId,
      title: input.data.audit_title,
      body_markdown: input.data.audit_markdown,
      status: 'draft',
      model: input.model,
      prompt_version: LEAD_PROMPT_VERSION,
    })
    await repo.updateLead(input.leadId, input.tenantId, {
      status: 'audit_drafted',
      score: input.data.score,
      fit: input.data.fit,
      qualification_summary: qualificationSummary(input.data),
      qualification_json: input.data,
      model: input.model,
      prompt_version: LEAD_PROMPT_VERSION,
    })
    await repo.insertActivity({
      tenant_id: input.tenantId,
      lead_id: input.leadId,
      type: 'qualification',
      payload: { ok: true, fit: input.data.fit, score: input.data.score },
    })
    await repo.insertActivity({
      tenant_id: input.tenantId,
      lead_id: input.leadId,
      type: 'audit_draft',
      payload: { draft_id: draft.id, status: 'draft' },
    })
    log('draft_ok', { lead_id: input.leadId, status: 'audit_drafted' })
    return true
  } catch (error) {
    log('draft_failed', { lead_id: input.leadId, code: storageCode(error), step: 'draft' })
    return false
  }
}

async function deliverAlert(repo: InboundRepository, notify: (text: string) => Promise<void>, log: LogFn, input: {
  tenantId: string
  leadId: string
  workflowId: string | null
  text: string
  keepFailureStep: 'gemini' | null
}): Promise<void> {
  try {
    await notify(input.text)
    await safe(() => repo.insertActivity({
      tenant_id: input.tenantId,
      lead_id: input.leadId,
      type: 'telegram_alert',
      payload: { delivered: true },
    }), log, 'activity_failed')
    if (input.workflowId && !input.keepFailureStep) {
      await safe(() => repo.updateWorkflow(input.workflowId as string, input.tenantId, {
        status: 'notified',
        step: 'telegram',
        error: null,
      }), log, 'workflow_failed')
    }
  } catch {
    log('telegram_failed', { lead_id: input.leadId, step: 'telegram' })
    await safe(() => repo.insertActivity({
      tenant_id: input.tenantId,
      lead_id: input.leadId,
      type: 'telegram_alert',
      payload: { delivered: false },
    }), log, 'activity_failed')
    if (input.workflowId && !input.keepFailureStep) {
      await safe(() => repo.updateWorkflow(input.workflowId as string, input.tenantId, {
        status: 'failed',
        step: 'telegram',
        error: 'telegram_failed',
      }), log, 'workflow_failed')
    }
  }
}
