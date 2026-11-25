import { createHmac, timingSafeEqual } from 'node:crypto'

/** HMAC-SHA256 of an IP. The raw address is never stored. */
export function hashIp(ip: string, secret: string): string {
  return createHmac('sha256', secret).update(ip).digest('hex')
}

export function bearerToken(header: string | null | undefined): string | null {
  if (!header) return null
  const match = /^Bearer\s+(\S+)\s*$/i.exec(header)
  return match?.[1] ?? null
}

/** Constant-time string compare. A length mismatch still visits timingSafeEqual. */
export function secretsMatch(provided: string, expected: string): boolean {
  const left = Buffer.from(provided)
  const right = Buffer.from(expected)
  if (left.length !== right.length) {
    timingSafeEqual(left, left)
    return false
  }
  return timingSafeEqual(left, right)
}
