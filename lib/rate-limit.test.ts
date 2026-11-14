import { describe, expect, it } from 'vitest'
import { clientIp, requestIp } from '@/lib/rate-limit'
import { publicSignupEnabled, PASSWORD_MIN_LENGTH } from '@/lib/auth-flags'

describe('requestIp', () => {
  it('prefers x-vercel-forwarded-for over x-forwarded-for', () => {
    const headers = new Headers({
      'x-forwarded-for': '1.1.1.1, 2.2.2.2',
      'x-vercel-forwarded-for': '9.9.9.9',
    })
    expect(requestIp(headers)).toBe('9.9.9.9')
  })

  it('falls back to x-real-ip, then the last x-forwarded-for hop', () => {
    expect(requestIp(new Headers({ 'x-real-ip': '8.8.8.8' }))).toBe('8.8.8.8')
    expect(requestIp(new Headers({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' }))).toBe('2.2.2.2')
  })

  it('keeps clientIp first-hop behaviour for existing callers', () => {
    expect(clientIp('1.1.1.1, 2.2.2.2')).toBe('1.1.1.1')
    expect(clientIp(null)).toBe('unknown')
  })
})

describe('auth flags', () => {
  it('defaults to invite-only and requires 12-character passwords', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(12)
    const previous = process.env.ALLOW_PUBLIC_SIGNUP
    delete process.env.ALLOW_PUBLIC_SIGNUP
    expect(publicSignupEnabled()).toBe(false)
    process.env.ALLOW_PUBLIC_SIGNUP = 'true'
    expect(publicSignupEnabled()).toBe(true)
    process.env.ALLOW_PUBLIC_SIGNUP = 'yes'
    expect(publicSignupEnabled()).toBe(false)
    if (previous === undefined) delete process.env.ALLOW_PUBLIC_SIGNUP
    else process.env.ALLOW_PUBLIC_SIGNUP = previous
  })
})
