// Shared (client + server) attribution shape. First-touch UTM captured on the public site.
export const ATTRIBUTION_STORAGE_KEY = 'cytron_attr_v1'
export const ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
export type UtmKey = (typeof UTM_KEYS)[number]

export type Attribution = Partial<Record<UtmKey, string>> & {
  referrer?: string
  landing_path?: string
  first_seen_at?: string
}

const MAX = 200
const SAFE = /^[\w .:/@+\-%~,]*$/

function clean(value: unknown, max = MAX): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim().slice(0, max)
  if (!trimmed || !SAFE.test(trimmed)) return undefined
  return trimmed
}

/** Whitelists and length-limits an untrusted attribution object. Returns null when nothing useful is left. */
export function sanitizeAttribution(raw: unknown): Attribution | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const input = raw as Record<string, unknown>
  const out: Attribution = {}
  for (const key of UTM_KEYS) {
    const v = clean(input[key], 120)
    if (v) out[key] = v.toLowerCase()
  }
  // Keep only the referrer origin (never its path or query).
  if (typeof input.referrer === 'string' && /^https?:\/\//i.test(input.referrer.trim())) {
    try { out.referrer = clean(new URL(input.referrer.trim()).origin, 200) } catch { /* ignore */ }
    if (!out.referrer) delete out.referrer
  }
  const landing = clean(input.landing_path, 200)
  if (landing && landing.startsWith('/')) out.landing_path = landing.split('?')[0]
  const seen = clean(input.first_seen_at, 40)
  if (seen && !Number.isNaN(Date.parse(seen))) out.first_seen_at = new Date(seen).toISOString()
  const hasUtm = UTM_KEYS.some(k => out[k])
  if (!hasUtm && !out.referrer) return null
  return out
}

/** Builds attribution from a landing URL + document.referrer. Pure, for tests and the client capture. */
export function attributionFromLocation(href: string, referrer: string, now: Date): Attribution | null {
  let url: URL
  try { url = new URL(href) } catch { return null }
  const raw: Record<string, string> = {}
  for (const key of UTM_KEYS) {
    const v = url.searchParams.get(key)
    if (v) raw[key] = v
  }
  let ref = ''
  if (referrer) {
    try { if (new URL(referrer).host !== url.host) ref = referrer } catch { /* ignore */ }
  }
  if (!Object.keys(raw).length && !ref) return null
  return sanitizeAttribution({ ...raw, referrer: ref || undefined, landing_path: url.pathname, first_seen_at: now.toISOString() })
}
