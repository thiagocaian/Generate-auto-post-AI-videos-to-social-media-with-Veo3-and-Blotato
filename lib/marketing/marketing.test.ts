import { describe, expect, it, vi } from 'vitest'
import { attributionFromLocation, sanitizeAttribution } from './attribution-shared'
import { nextStatus, parseQueueDecision } from './queue'

vi.mock('server-only', () => ({}))

describe('attribution', () => {
  const now = new Date('2026-11-13T00:00:00Z')
  it('captures UTM params and strips the query from the landing path', () => {
    const a = attributionFromLocation('https://cytronai.com/trades?utm_source=TikTok&utm_medium=social&utm_campaign=mkt_20261113_x&foo=1', '', now)
    expect(a).toEqual({ utm_source: 'tiktok', utm_medium: 'social', utm_campaign: 'mkt_20261113_x', landing_path: '/trades', first_seen_at: now.toISOString() })
  })
  it('keeps only the origin of an external referrer and ignores same-site referrers', () => {
    expect(attributionFromLocation('https://cytronai.com/', 'https://www.google.com/search?q=secret', now)?.referrer).toBe('https://www.google.com')
    expect(attributionFromLocation('https://cytronai.com/', 'https://cytronai.com/pricing', now)).toBeNull()
  })
  it('rejects junk and unknown keys', () => {
    expect(sanitizeAttribution({ utm_source: '<script>', evil: 'x' })).toBeNull()
    expect(sanitizeAttribution('x')).toBeNull()
    expect(sanitizeAttribution({ utm_source: 'a'.repeat(500) })?.utm_source?.length).toBe(120)
    expect(sanitizeAttribution({ utm_campaign: 'ok', landing_path: 'https://evil.com' })).toEqual({ utm_campaign: 'ok' })
  })
})

describe('splitAttribution / recordLeadAttribution', async () => {
  const { splitAttribution, recordLeadAttribution } = await import('./attribution')
  it('removes attribution from the body so strict schemas still pass', () => {
    const { body, attribution } = splitAttribution({ name: 'A', attribution: { utm_source: 'ig' } })
    expect(body).toEqual({ name: 'A' })
    expect(attribution).toEqual({ utm_source: 'ig' })
  })
  it('writes one row and never throws', async () => {
    const rows: Record<string, unknown>[] = []
    expect(await recordLeadAttribution('demo_requests', 'id-1', { utm_source: 'ig' }, async r => { rows.push(r); return { error: null } })).toBe(true)
    expect(rows[0]).toMatchObject({ lead_table: 'demo_requests', lead_id: 'id-1', utm_source: 'ig', company_id: '4a617a32-8493-4bd1-a9ab-12f5edf2055a' })
    expect(await recordLeadAttribution('demo_requests', 'id-1', { utm_source: 'ig' }, async () => { throw new Error('db down') })).toBe(false)
    expect(await recordLeadAttribution('demo_requests', null, { utm_source: 'ig' }, async () => ({ error: null }))).toBe(false)
    expect(await recordLeadAttribution('demo_requests', 'id', null, async () => ({ error: null }))).toBe(false)
  })
})

describe('approval queue', () => {
  const id = '11111111-2222-4333-8444-555555555555'
  it('validates decisions', () => {
    expect(parseQueueDecision({ id, action: 'approve' })).toEqual({ ok: true, data: { id, action: 'approve', note: null } })
    expect(parseQueueDecision({ id: 'x', action: 'approve' }).ok).toBe(false)
    expect(parseQueueDecision({ id, action: 'publish' }).ok).toBe(false)
  })
  it('only moves draft/pending items', () => {
    expect(nextStatus('pending_approval', 'approve')).toBe('approved')
    expect(nextStatus('draft', 'reject')).toBe('rejected')
    expect(nextStatus('published', 'approve')).toBeNull()
  })
})
