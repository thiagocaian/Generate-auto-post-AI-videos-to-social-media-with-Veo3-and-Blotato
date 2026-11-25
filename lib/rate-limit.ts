// Simple in-memory rate limiter (per key).
// Note: resets on cold start. Provides basic abuse prevention, not a hard guarantee.

type Bucket = { count: number; resetAt: number }

export function createRateLimiter(limit: number, windowMs: number) {
  const rateMap = new Map<string, Bucket>()

  return function checkRateLimit(key: string): boolean {
    const now = Date.now()
    const entry = rateMap.get(key)
    if (!entry || now > entry.resetAt) {
      rateMap.set(key, { count: 1, resetAt: now + windowMs })
      return true
    }
    if (entry.count >= limit) return false
    entry.count += 1
    return true
  }
}

export const PUBLIC_RATE_LIMIT = 3
export const PUBLIC_RATE_WINDOW_MS = 60 * 60 * 1000

export function clientIp(forwardedFor: string | null): string {
  return forwardedFor?.split(',')[0]?.trim() ?? 'unknown'
}


/** Trusted client IP on Vercel. Prefers platform headers over the first X-Forwarded-For hop. */
export function requestIp(headers: Headers): string {
  const vercel = headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
  if (vercel) return vercel
  const real = headers.get('x-real-ip')?.trim()
  if (real) return real
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const parts = forwarded.split(',').map(part => part.trim()).filter(Boolean)
    if (parts.length > 0) return parts[parts.length - 1]
  }
  return 'unknown'
}

export const AUTH_RATE_LIMIT = 10
export const AI_RATE_LIMIT = 10
export const UPLOAD_RATE_LIMIT = 20
