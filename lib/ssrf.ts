/**
 * SSRF protection — allowlist of domains the server may fetch from.
 * Add domains here as new integrations are added.
 */
const ALLOWED_DOMAINS = new Set([
  // Supabase storage
  'awjagykdhrroeonewwgx.supabase.co',
  // Social media CDNs / Blotato storage
  'backend.blotato.com',
  'storage.googleapis.com',
  'cdn.blotato.com',
  // FAL.ai video output
  'fal.media',
  'v3.fal.media',
  'storage.fal.run',
  // Ayrshare / Outstand CDNs
  'app.ayrshare.com',
])

export function isAllowedUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    // Only HTTPS
    if (url.protocol !== 'https:') return false
    // Reject private/local addresses
    const host = url.hostname.toLowerCase()
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('172.') ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) return false
    // Check against allowlist (exact match or subdomain)
    for (const allowed of Array.from(ALLOWED_DOMAINS)) {
      if (host === allowed || host.endsWith('.' + allowed)) return true
    }
    return false
  } catch {
    return false
  }
}

export function assertAllowedUrl(url: string | undefined | null, field = 'url'): void {
  if (!url || !isAllowedUrl(url)) {
    throw Object.assign(new Error(`SSRF: ${field} not in allowlist`), { status: 400 })
  }
}
