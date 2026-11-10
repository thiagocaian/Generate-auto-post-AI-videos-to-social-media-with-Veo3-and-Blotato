/**
 * Filters for a service-role read, update, or delete.
 * Both keys are required so a query cannot be scoped to an id alone.
 * A miss (no row) must be returned as 404 — that covers another company's row
 * and a row that does not exist, without saying which.
 */
export function companyRecordFilters(companyId: string, id: string): { id: string; company_id: string } {
  if (typeof companyId !== 'string' || companyId.length === 0) {
    throw new Error('companyId is required')
  }
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('id is required')
  }
  return { id, company_id: companyId }
}

/** True when a company-scoped PostgREST result matched no row. */
export function scopedRowMissing(data: unknown): boolean {
  if (data == null) return true
  if (Array.isArray(data)) return data.length === 0
  return false
}
