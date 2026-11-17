'use client'
import { ATTRIBUTION_STORAGE_KEY, ATTRIBUTION_TTL_MS, attributionFromLocation, sanitizeAttribution, type Attribution } from './attribution-shared'

/** Saves first-touch attribution (30 days). A new visit with UTM params replaces an expired one only. */
export function captureAttribution(): void {
  try {
    const current = readAttribution()
    if (current) return
    const attr = attributionFromLocation(window.location.href, document.referrer, new Date())
    if (attr) window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attr))
  } catch { /* storage blocked: ignore */ }
}

export function readAttribution(): Attribution | null {
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY)
    if (!raw) return null
    const attr = sanitizeAttribution(JSON.parse(raw))
    if (!attr) return null
    const seen = attr.first_seen_at ? Date.parse(attr.first_seen_at) : 0
    if (!seen || Date.now() - seen > ATTRIBUTION_TTL_MS) {
      window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY)
      return null
    }
    return attr
  } catch {
    return null
  }
}
