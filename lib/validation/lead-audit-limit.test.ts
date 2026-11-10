import { describe, expect, it } from 'vitest'
import {
  ALREADY_REQUESTED_MESSAGE,
  findExistingAudit,
  isUniqueViolation,
  normalizeBusinessName,
  normalizeEmail,
  type AuditColumn,
} from './lead-audit-limit'

function store(rows: { email: string; business: string }[]) {
  const calls: [AuditColumn, string][] = []
  const lookup = async (column: AuditColumn, value: string) => {
    calls.push([column, value])
    return rows.some((r) =>
      column === 'email_normalized' ? normalizeEmail(r.email) === value : normalizeBusinessName(r.business) === value
    )
  }
  return { lookup, calls }
}

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Jane.Doe@Acme.COM.au ')).toBe('jane.doe@acme.com.au')
  })
})

describe('normalizeBusinessName', () => {
  it('lowercases and collapses spaces and punctuation', () => {
    expect(normalizeBusinessName('  Maco   Electrics Pty. Ltd. ')).toBe('maco electrics pty ltd')
    expect(normalizeBusinessName("Sam's Plumbing & Gas")).toBe('sam s plumbing gas')
    expect(normalizeBusinessName('MACO-ELECTRICS')).toBe(normalizeBusinessName('maco electrics'))
  })
  it('returns an empty string for punctuation-only names', () => {
    expect(normalizeBusinessName(' --- ')).toBe('')
  })
})

describe('findExistingAudit', () => {
  const rows = [{ email: 'jane@acme.com.au', business: 'Acme Plumbing Pty Ltd' }]

  it('allows a new email and a new business', async () => {
    const { lookup } = store(rows)
    expect(await findExistingAudit(lookup, 'sam@other.com.au', 'Other Electrics')).toEqual({ blocked: false })
  })

  it('blocks the same email, regardless of case and spaces', async () => {
    const { lookup } = store(rows)
    expect(await findExistingAudit(lookup, ' JANE@acme.com.au ', 'Brand New Co')).toEqual({ blocked: true, by: 'email' })
  })

  it('blocks the same business under a different email', async () => {
    const { lookup } = store(rows)
    expect(await findExistingAudit(lookup, 'boss@acme.com.au', 'acme plumbing, pty. ltd.')).toEqual({ blocked: true, by: 'business' })
  })

  it('queries with normalised values and skips an empty business name', async () => {
    const { lookup, calls } = store([])
    await findExistingAudit(lookup, 'A@B.CO', '...')
    expect(calls).toEqual([['email_normalized', 'a@b.co']])
  })

  it('propagates storage errors so the route can fail closed', async () => {
    const failing = async () => { throw new Error('db down') }
    await expect(findExistingAudit(failing, 'a@b.co', 'x')).rejects.toThrow('db down')
  })
})

describe('isUniqueViolation', () => {
  it('detects Postgres 23505 only', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true)
    expect(isUniqueViolation({ code: '42P01' })).toBe(false)
    expect(isUniqueViolation(null)).toBe(false)
  })
  it('has a friendly message', () => {
    expect(ALREADY_REQUESTED_MESSAGE).toMatch(/already requested your free audit/)
  })
})
