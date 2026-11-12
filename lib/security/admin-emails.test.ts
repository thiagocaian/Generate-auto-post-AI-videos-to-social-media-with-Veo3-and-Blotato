import { afterEach, describe, expect, it } from 'vitest'
import { adminEmailStatus, isCompanyAdminEmail } from '../company-admin'

const previous = process.env.ADMIN_EMAILS

afterEach(() => {
  if (previous === undefined) delete process.env.ADMIN_EMAILS
  else process.env.ADMIN_EMAILS = previous
})

describe('admin allow list (T-09, T-10)', () => {
  it('rejects a missing email and a stranger', () => {
    delete process.env.ADMIN_EMAILS
    expect(adminEmailStatus(null)).toBe(401)
    expect(adminEmailStatus(undefined)).toBe(401)
    expect(adminEmailStatus('stranger@example.com')).toBe(403)
    expect(isCompanyAdminEmail('stranger@example.com')).toBe(false)
  })

  it('allows the company admin and ADMIN_EMAILS, ignoring case and blanks', () => {
    process.env.ADMIN_EMAILS = ' qa@example.com, , Admin@Cytron.test '
    expect(adminEmailStatus('admin@cytroncorporation.com')).toBe(200)
    expect(isCompanyAdminEmail('QA@example.com')).toBe(true)
    expect(isCompanyAdminEmail('admin@cytron.test')).toBe(true)
    expect(adminEmailStatus('nope@example.com')).toBe(403)
  })
})
