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
