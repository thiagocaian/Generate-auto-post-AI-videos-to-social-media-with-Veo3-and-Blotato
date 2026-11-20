import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  StorageError,
  type ActivityRecord,
  type DraftRecord,
  type InboundRepository,
  type LeadInsert,
  type LeadPatch,
  type LeadRecord,
} from './repository'

type DbError = { code?: string; message?: string } | null

const LIST_COLUMNS = [
  'id', 'tenant_id', 'name', 'email', 'phone', 'company', 'website', 'industry',
  'monthly_enquiries', 'response_process', 'preferred_date', 'preferred_time',
  'status', 'score', 'fit', 'qualification_summary', 'consent_at', 'created_at',
].join(', ')

const DETAIL_COLUMNS = `${LIST_COLUMNS}, qualification_json, consent_text`

function fail(error: DbError): never {
  throw new StorageError(error?.code || 'storage')
}

export function createClientsRepository(supabase: SupabaseClient): InboundRepository {
  let tenant: string | null = null

  async function tenantId(): Promise<string> {
    if (tenant) return tenant
    const { data, error } = await supabase.from('tenants').select('id').eq('slug', 'cytron').maybeSingle()
    if (error || !data?.id) fail(error)
    tenant = data.id as string
    return tenant
  }

  return {
    tenantId,

    async existsNormalized(column, value) {
      const current = await tenantId()
      const { data, error } = await supabase
        .from('leads')
        .select('id')
        .eq('tenant_id', current)
        .eq(column, value)
        .limit(1)
      if (error) fail(error)
      return (data?.length ?? 0) > 0
    },

    async consumeRate(key, windowStart) {
      const current = await tenantId()
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const existing = await supabase
          .from('rate_limits')
          .select('id, count')
          .eq('tenant_id', current)
          .eq('key', key)
          .eq('window_start', windowStart)
          .maybeSingle()
        if (existing.error) fail(existing.error)
        if (!existing.data) {
          const inserted = await supabase
            .from('rate_limits')
            .insert({ tenant_id: current, key, window_start: windowStart, count: 1 })
            .select('count')
            .maybeSingle()
          if (inserted.error?.code === '23505') continue
          if (inserted.error || inserted.data?.count == null) fail(inserted.error)
          return inserted.data.count as number
        }
        const next = Number(existing.data.count) + 1
        const updated = await supabase
          .from('rate_limits')
          .update({ count: next })
          .eq('id', existing.data.id)
          .eq('tenant_id', current)
          .select('count')
          .maybeSingle()
        if (updated.error || updated.data?.count == null) fail(updated.error)
        return updated.data.count as number
      }
      throw new StorageError('rate')
    },

    async insertLead(row) {
      const { email_normalized: _email, company_normalized: _company, ...stored } = row
      void _email
      void _company
      const { data, error } = await supabase.from('leads').insert(stored).select('id').maybeSingle()
      if (error || !data?.id) fail(error)
      return { id: data.id as string }
    },

    async updateLead(id, currentTenant, patch) {
      const { error } = await supabase.from('leads').update(patch).eq('id', id).eq('tenant_id', currentTenant)
      if (error) fail(error)
    },

    async insertDraft(row) {
      const { data, error } = await supabase.from('audit_drafts').insert(row).select('id').maybeSingle()
      if (error || !data?.id) fail(error)
      return { id: data.id as string }
    },

    async insertActivity(row) {
      const { data, error } = await supabase.from('activities').insert(row).select('id').maybeSingle()
      if (error || !data?.id) fail(error)
      return { id: data.id as string }
    },

    async insertWorkflow(row) {
      const { data, error } = await supabase.from('workflow_runs').insert({
        tenant_id: row.tenant_id,
        workflow: row.workflow,
        lead_id: row.lead_id,
        status: row.status,
        step: row.step,
        meta: {},
      }).select('id').maybeSingle()
      if (error || !data?.id) fail(error)
      return { id: data.id as string }
    },

    async updateWorkflow(id, currentTenant, patch) {
      const { error } = await supabase.from('workflow_runs').update({
        status: patch.status,
        step: patch.step,
        error: patch.error,
        finished_at: new Date().toISOString(),
      }).eq('id', id).eq('tenant_id', currentTenant)
      if (error) fail(error)
    },

    async listLeads() {
      const current = await tenantId()
      const { data, error } = await supabase
        .from('leads')
        .select(LIST_COLUMNS)
        .eq('tenant_id', current)
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) fail(error)
      return (data ?? []) as unknown as LeadRecord[]
    },

    async listDrafts(leadIds) {
      if (leadIds.length === 0) return []
      const current = await tenantId()
      const { data, error } = await supabase
        .from('audit_drafts')
        .select('id, tenant_id, lead_id, title, body_markdown, status, model, prompt_version, created_at')
        .eq('tenant_id', current)
        .in('lead_id', leadIds)
      if (error) fail(error)
      return (data ?? []) as unknown as DraftRecord[]
    },

    async getLead(id) {
      const current = await tenantId()
      const { data, error } = await supabase
        .from('leads')
        .select(DETAIL_COLUMNS)
        .eq('tenant_id', current)
        .eq('id', id)
        .maybeSingle()
      if (error) fail(error)
      return (data as unknown as LeadRecord | null) ?? null
    },

    async listActivities(leadId) {
      const current = await tenantId()
      const { data, error } = await supabase
        .from('activities')
        .select('id, tenant_id, lead_id, type, payload, created_at')
        .eq('tenant_id', current)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true })
      if (error) fail(error)
      return (data ?? []) as unknown as ActivityRecord[]
    },
  }
}

export type { LeadInsert, LeadPatch }
