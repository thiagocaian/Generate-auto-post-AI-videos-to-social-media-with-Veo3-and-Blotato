// One free audit per email OR per business.
// The normalisation here must match the generated columns in
// supabase/migrations/20261110_lead_audits_one_per_customer.sql:
//   email_normalized    = lower(btrim(email))
//   business_normalized = btrim(regexp_replace(lower(business_name), '[^a-z0-9]+', ' ', 'g'))

export const ALREADY_REQUESTED_MESSAGE =
  "Looks like you've already requested your free audit — we'll be in touch. Need something else? Reply to our email."

export const ALREADY_REQUESTED_CODE = 'already_requested'

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Lowercase, then collapse every run of spaces/punctuation into one space. "Maco Electrics Pty. Ltd." → "maco electrics pty ltd" */
export function normalizeBusinessName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export type AuditColumn = 'email_normalized' | 'business_normalized'
/** Returns whether a lead_audits row exists with column = value. Throws on storage errors. */
export type AuditLookup = (column: AuditColumn, value: string) => Promise<boolean>

export type ExistingAudit = { blocked: false } | { blocked: true; by: 'email' | 'business' }

export async function findExistingAudit(lookup: AuditLookup, email: string, businessName: string): Promise<ExistingAudit> {
  const e = normalizeEmail(email)
  const b = normalizeBusinessName(businessName)
  const [byEmail, byBusiness] = await Promise.all([
    e ? lookup('email_normalized', e) : Promise.resolve(false),
    b ? lookup('business_normalized', b) : Promise.resolve(false),
  ])
  if (byEmail) return { blocked: true, by: 'email' }
  if (byBusiness) return { blocked: true, by: 'business' }
  return { blocked: false }
}

/** Postgres unique_violation: a parallel request won the race against the unique index. */
export function isUniqueViolation(error: { code?: string } | null | undefined): boolean {
  return error?.code === '23505'
}
