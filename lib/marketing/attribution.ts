import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { sanitizeAttribution, type Attribution } from './attribution-shared'

export type LeadTable = 'demo_requests' | 'lead_audits' | 'early_access_leads'

/** Cytron's own company row in cytron-platform (marketing engine owner). Override with MKT_COMPANY_ID. */
export const CYTRON_COMPANY_ID = '4a617a32-8493-4bd1-a9ab-12f5edf2055a'

/** Splits the optional `attribution` field off a request body so strict schemas still validate the rest. */
export function splitAttribution(raw: unknown): { body: unknown; attribution: Attribution | null } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { body: raw, attribution: null }
  const { attribution, ...rest } = raw as Record<string, unknown>
  return { body: rest, attribution: sanitizeAttribution(attribution) }
}

type Inserter = (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>

function defaultInserter(): Inserter | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return async row => {
    const { error } = await client.from('mkt_lead_attribution').upsert(row, { onConflict: 'lead_table,lead_id', ignoreDuplicates: true })
    return { error }
  }
}

/** Best effort: never throws and never blocks the lead. Writes to cytron-platform.mkt_lead_attribution. */
export async function recordLeadAttribution(
  leadTable: LeadTable,
  leadId: string | null | undefined,
  attribution: Attribution | null,
  insert: Inserter | null = defaultInserter(),
): Promise<boolean> {
  if (!leadId || !attribution || !insert) return false
  try {
    const { error } = await insert({
      company_id: process.env.MKT_COMPANY_ID || CYTRON_COMPANY_ID,
      lead_table: leadTable,
      lead_id: leadId,
      utm_source: attribution.utm_source ?? null,
      utm_medium: attribution.utm_medium ?? null,
      utm_campaign: attribution.utm_campaign ?? null,
      utm_content: attribution.utm_content ?? null,
      utm_term: attribution.utm_term ?? null,
      referrer: attribution.referrer ?? null,
      landing_path: attribution.landing_path ?? null,
      first_seen_at: attribution.first_seen_at ?? null,
    })
    if (error) {
      console.error('[attribution] insert failed:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.error('[attribution] insert threw:', e instanceof Error ? e.message : 'unknown')
    return false
  }
}
