const SAFE_FIELDS = new Set(['lead_id', 'status', 'step', 'code', 'duration_ms', 'project', 'reason', 'attempt'])

/** Route logs. Unknown fields are dropped so email, phone, IP, and tokens cannot slip in. */
export function logRoute(prefix: string, event: string, fields?: Record<string, unknown>) {
  const safe: Record<string, string | number | boolean | null> = {}
  for (const [key, value] of Object.entries(fields ?? {})) {
    if (!SAFE_FIELDS.has(key)) continue
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
      safe[key] = value
    }
  }
  console.info(`${prefix} ${event}`, safe)
}
