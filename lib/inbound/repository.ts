export class StorageError extends Error {
  readonly code: string
  constructor(code = 'storage') {
    super(code)
    this.name = 'StorageError'
    this.code = code
  }
}

export const LEAD_STATUSES = [
  'stored',
  'qualified',
  'disqualified',
  'audit_drafted',
  'awaiting_approval',
  'contacted',
  'converted',
  'archived',
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export type DraftStatus = 'draft' | 'approved' | 'rejected' | 'sent'

export type LeadRecord = {
  id: string
  tenant_id: string
  name: string
  email: string
  phone: string | null
  company: string
  website: string | null
  industry: string | null
  monthly_enquiries: string | null
  response_process: string | null
  preferred_date: string | null
  preferred_time: string | null
  status: string
  score: number | null
  fit: 'high' | 'medium' | 'low' | 'unknown' | null
  qualification_summary: string | null
  qualification_json: unknown | null
  consent_at: string
  consent_text: string
  created_at: string
  email_normalized?: string
  company_normalized?: string
}

export type DraftRecord = {
  id: string
  tenant_id: string
  lead_id: string
  title: string | null
  body_markdown: string | null
  status: DraftStatus
  model: string | null
  prompt_version: string | null
  created_at: string
}

export type ActivityRecord = {
  id: string
  tenant_id: string
  lead_id: string | null
  type: string
  payload: unknown
  created_at: string
}

export type WorkflowRecord = {
  id: string
  tenant_id: string
  lead_id: string | null
  status: string
  step: string | null
  error: string | null
}

export type LeadInsert = {
  tenant_id: string
  name: string
  email: string
  phone: string | null
  company: string
  website: string | null
  industry: string | null
  monthly_enquiries: string | null
  response_process: string | null
  preferred_date: string
  preferred_time: string
  source: string
  status: 'stored'
  consent_at: string
  consent_text: string
  ip_hash: string | null
  user_agent: string | null
  model: string | null
  prompt_version: string
}

export type LeadPatch = {
  status?: string
  name?: string
  company?: string
  email?: string
  phone?: string | null
  preferred_date?: string | null
  preferred_time?: string | null
  score?: number | null
  fit?: string | null
  qualification_summary?: string | null
  qualification_json?: unknown
  model?: string | null
  prompt_version?: string | null
}

export interface InboundRepository {
  tenantId(): Promise<string>
  existsNormalized(column: 'email_normalized' | 'company_normalized', value: string): Promise<boolean>
  consumeRate(key: string, windowStart: string): Promise<number>
  insertLead(row: LeadInsert & { email_normalized: string; company_normalized: string }): Promise<{ id: string }>
  updateLead(id: string, tenantId: string, patch: LeadPatch): Promise<void>
  insertDraft(row: {
    tenant_id: string
    lead_id: string
    title: string
    body_markdown: string
    status: 'draft'
    model: string | null
    prompt_version: string
  }): Promise<{ id: string }>
  insertActivity(row: { tenant_id: string; lead_id: string; type: string; payload: unknown }): Promise<{ id: string }>
  insertWorkflow(row: { tenant_id: string; lead_id: string; workflow: string; status: string; step: string }): Promise<{ id: string }>
  updateWorkflow(id: string, tenantId: string, patch: { status: string; step: string; error: string | null }): Promise<void>
  listLeads(): Promise<LeadRecord[]>
  listDrafts(leadIds: string[]): Promise<DraftRecord[]>
  getLead(id: string): Promise<LeadRecord | null>
  listActivities(leadId: string): Promise<ActivityRecord[]>
}

export function rateWindowStart(now: Date): string {
  const copy = new Date(now)
  copy.setUTCMinutes(0, 0, 0)
  return copy.toISOString()
}
