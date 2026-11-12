import assert from 'node:assert/strict'
import { afterAll, beforeEach, describe, test, vi, type MockInstance } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as bookingPost } from '../app/api/booking/route'
import { POST as earlyAccessPost } from '../app/api/early-access/route'
import { POST as leadAuditPost } from '../app/api/lead-audit/route'
import { escapeHtml, renderNotificationHtml } from './notify'

const { send, db } = vi.hoisted(() => ({
  send: vi.fn(),
  db: {
    error: null as { message: string; code?: string } | null,
    data: null as Record<string, unknown> | null,
  },
}))

vi.mock('server-only', () => ({}))

vi.mock('resend', () => ({
  Resend: class Resend {
    emails = { send }
  },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      insert: () => {
        const result = { data: db.data, error: db.error }
        return Object.assign(Promise.resolve(result), {
          select: () => ({
            single: () => Promise.resolve(result),
          }),
        })
      },
    }),
  }),
}))

const ENV_KEYS = [
  'RESEND_API_KEY',
  'RESEND_FROM_ADDRESS',
  'CYTRON_NOTIFY_EMAIL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'N8N_DEMO_WEBHOOK',
] as const

const previousEnv = Object.fromEntries(ENV_KEYS.map(key => [key, process.env[key]]))

let consoleError: MockInstance | undefined = undefined
let consoleWarn: MockInstance | undefined = undefined
let ip = 0
function nextIp() {
  ip += 1
  return `198.51.100.${ip}`
}

function postJson(url: string, body: unknown) {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': nextIp(),
    },
    body: JSON.stringify(body),
  })
}

function brisbaneDate(offsetDays = 0): string {
  const shifted = new Date(Date.now() + (10 * 60 + offsetDays * 24 * 60) * 60 * 1000)
  return shifted.toISOString().slice(0, 10)
}

const bookingBody = {
  name: 'Ada',
  email: 'ada@example.com',
  phone: '0400000000',
  business_name: 'Northwind',
  business_type: 'Electrical',
  preferred_date: '2026-11-12',
  preferred_time: '9:00 AM',
  message: 'Please call after 10.',
}

beforeEach(() => {
  send.mockReset()
  send.mockResolvedValue({ data: { id: 'email_1' }, error: null })
  db.error = null
  db.data = { id: 'row-1', created_at: '2026-11-10T01:02:03.000Z' }
  process.env.RESEND_API_KEY = 're_test_key'
  process.env.RESEND_FROM_ADDRESS = 'CYTRON <hello@cytronai.com>'
  process.env.CYTRON_NOTIFY_EMAIL = 'notify@example.com'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'
  delete process.env.N8N_DEMO_WEBHOOK
  consoleError?.mockRestore()
  consoleWarn?.mockRestore()
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterAll(() => {
  vi.restoreAllMocks()
  for (const key of ENV_KEYS) {
    const value = previousEnv[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

describe('escapeHtml', () => {
  test('escapes characters that would break out of HTML', () => {
    assert.equal(
      escapeHtml(`<img src="x" onerror='alert(1)'> & co`),
      '&lt;img src=&quot;x&quot; onerror=&#x27;alert(1)&#x27;&gt; &amp; co',
    )
    assert.equal(escapeHtml(null), '')
    assert.equal(escapeHtml(undefined), '')
    assert.equal(escapeHtml(''), '')
  })

  test('escapes row values in the notification table', () => {
    const html = renderNotificationHtml('New demo booking', [
      ['Name', '<script>alert(1)</script>'],
      ['Business', `Tom & "Jerry"'s`],
    ])
    assert.equal(html.includes('<script>'), false)
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
    assert.match(html, /Tom &amp; &quot;Jerry&quot;&#x27;s/)
    assert.match(html, /New demo booking/)
  })
})

describe('booking notifications', () => {
  test('sends an internal email after a successful insert', async () => {
    const res = await bookingPost(postJson('http://localhost/api/booking', bookingBody))
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.success, true)
    assert.equal(body.booking.id, 'row-1')

    assert.equal(send.mock.calls.length, 1)
    const payload = send.mock.calls[0][0]
    assert.equal(payload.from, 'CYTRON <hello@cytronai.com>')
    assert.equal(payload.to, 'notify@example.com')
    assert.equal(payload.replyTo, 'ada@example.com')
    assert.equal(payload.subject, 'New demo booking: Ada / Northwind')
    assert.match(payload.html, /Ada/)
    assert.match(payload.html, /ada@example.com/)
    assert.match(payload.html, /0400000000/)
    assert.match(payload.html, /Northwind/)
    assert.match(payload.html, /Electrical/)
    assert.match(payload.html, /2026-11-12/)
    assert.match(payload.html, /9:00 AM/)
    assert.match(payload.html, /Please call after 10\./)
    assert.match(payload.html, /2026-11-10T01:02:03\.000Z/)
  })

  test('uses the name alone when no company was submitted', async () => {
    const res = await bookingPost(postJson('http://localhost/api/booking', {
      ...bookingBody,
      business_name: '',
    }))
    assert.equal(res.status, 200)
    assert.equal(send.mock.calls[0][0].subject, 'New demo booking: Ada')
    assert.match(send.mock.calls[0][0].html, /—/)
  })

  test('does not send when the insert fails', async () => {
    db.error = { message: 'connection refused' }
    const res = await bookingPost(postJson('http://localhost/api/booking', bookingBody))
    assert.equal(res.status, 500)
    assert.equal((await res.json()).error, 'Failed to save the request. Please try again.')
    assert.equal(send.mock.calls.length, 0)
  })

  test('still succeeds when Resend throws', async () => {
    send.mockRejectedValue(new Error('resend down'))
    const res = await bookingPost(postJson('http://localhost/api/booking', bookingBody))
    assert.equal(res.status, 200)
    assert.equal((await res.json()).success, true)
    assert.ok(consoleError?.mock.calls.some(call => String(call[0]).includes('Email notification rejected')))
  })

  test('still succeeds when Resend returns an error payload', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'invalid from', name: 'validation_error', statusCode: 422 } })
    const res = await bookingPost(postJson('http://localhost/api/booking', bookingBody))
    assert.equal(res.status, 200)
    assert.equal((await res.json()).success, true)
    assert.ok(consoleError?.mock.calls.some(call => String(call[0]).includes('Email notification error')))
  })

  test('escapes user-supplied fields in the HTML', async () => {
    const hostile = {
      ...bookingBody,
      name: '<script>alert(1)</script>',
      business_name: `Tom & "Jerry"'s`,
      message: '<img src=x onerror=alert(1)>',
    }
    const res = await bookingPost(postJson('http://localhost/api/booking', hostile))
    assert.equal(res.status, 200)
    const html = send.mock.calls[0][0].html as string
    assert.equal(html.includes('<script>'), false)
    assert.equal(html.includes('<img'), false)
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
    assert.match(html, /Tom &amp; &quot;Jerry&quot;&#x27;s/)
    assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/)
    assert.equal(send.mock.calls[0][0].subject, `New demo booking: <script>alert(1)</script> / Tom & "Jerry"'s`)
  })

  test('skips mail when Resend is not configured and still saves the booking', async () => {
    process.env.RESEND_API_KEY = 're_CHANGE_ME'
    const res = await bookingPost(postJson('http://localhost/api/booking', bookingBody))
    assert.equal(res.status, 200)
    assert.equal((await res.json()).success, true)
    assert.equal(send.mock.calls.length, 0)
    assert.ok(consoleWarn?.mock.calls.some(call => String(call[0]).includes('RESEND_API_KEY not configured')))
  })

  test('falls back to the company admin address', async () => {
    delete process.env.CYTRON_NOTIFY_EMAIL
    delete process.env.RESEND_FROM_ADDRESS
    const res = await bookingPost(postJson('http://localhost/api/booking', bookingBody))
    assert.equal(res.status, 200)
    assert.equal(send.mock.calls[0][0].to, 'admin@cytroncorporation.com')
    assert.equal(send.mock.calls[0][0].from, 'CYTRON <hello@cytronai.com>')
  })

  test('does not send when validation fails', async () => {
    const res = await bookingPost(postJson('http://localhost/api/booking', { name: '', email: 'ada@example.com' }))
    assert.equal(res.status, 400)
    assert.equal(send.mock.calls.length, 0)
  })
})

describe('early-access notifications', () => {
  test('sends an internal email for a new signup', async () => {
    const res = await earlyAccessPost(postJson('http://localhost/api/early-access', { email: 'Ada@Example.com' }))
    assert.equal(res.status, 200)
    assert.deepEqual(await res.json(), { success: true })
    assert.equal(send.mock.calls.length, 1)
    const payload = send.mock.calls[0][0]
    assert.equal(payload.to, 'notify@example.com')
    assert.equal(payload.replyTo, 'ada@example.com')
    assert.equal(payload.subject, 'New early-access signup: ada@example.com')
    assert.match(payload.html, /ada@example.com/)
    assert.match(payload.html, /landing_page/)
    assert.match(payload.html, /\d{4}-\d{2}-\d{2}T/)
  })

  test('accepts a duplicate email without sending another email', async () => {
    db.error = { code: '23505', message: 'duplicate key value violates unique constraint "early_access_leads_email_key"' }
    const res = await earlyAccessPost(postJson('http://localhost/api/early-access', { email: 'ada@example.com' }))
    assert.equal(res.status, 200)
    assert.deepEqual(await res.json(), { success: true })
    assert.equal(send.mock.calls.length, 0)
    assert.equal(consoleError?.mock.calls.length, 0)
  })

  test('does not send when the insert fails', async () => {
    db.error = { message: 'db down' }
    const res = await earlyAccessPost(postJson('http://localhost/api/early-access', { email: 'ada@example.com' }))
    assert.equal(res.status, 500)
    assert.equal((await res.json()).error, 'Failed to register. Please try again.')
    assert.equal(send.mock.calls.length, 0)
  })

  test('still succeeds when Resend throws', async () => {
    send.mockRejectedValue(new Error('resend down'))
    const res = await earlyAccessPost(postJson('http://localhost/api/early-access', { email: 'ada@example.com' }))
    assert.equal(res.status, 200)
    assert.deepEqual(await res.json(), { success: true })
    assert.ok(consoleError?.mock.calls.some(call => String(call[0]).includes('Email notification rejected')))
  })

  test('escapes the submitted email in the HTML', async () => {
    const html = renderNotificationHtml('New early-access signup', [
      ['Email', `ada+<tag>@example.com`],
      ['Submitted', '2026-11-10T01:02:03.000Z'],
    ])
    assert.equal(html.includes('<tag>'), false)
    assert.match(html, /ada\+&lt;tag&gt;@example.com/)
  })
})

describe('lead-audit notifications', () => {
  function auditBody(overrides: Record<string, unknown> = {}) {
    return {
      name: 'Ada',
      businessName: 'Northwind',
      email: 'ada@example.com',
      industry: 'Electrical',
      preferredDate: brisbaneDate(1),
      preferredTime: '9:00 AM',
      consent: true,
      honeypot: '',
      ...overrides,
    }
  }

  test('does not email the lead even when Resend is configured', async () => {
    const res = await leadAuditPost(postJson('http://localhost/api/lead-audit', auditBody()))
    assert.equal(res.status, 503)
    assert.deepEqual(await res.json(), { error: 'Service unavailable' })
    assert.equal(send.mock.calls.length, 0)
  })

  test('does not email the lead when the honeypot is filled', async () => {
    const res = await leadAuditPost(postJson('http://localhost/api/lead-audit', auditBody({
      honeypot: 'http://spam.test',
      name: '<script>alert(1)</script>',
    })))
    assert.equal(res.status, 200)
    assert.deepEqual(await res.json(), { success: true, emailSent: false })
    assert.equal(send.mock.calls.length, 0)
  })

  test('does not email the lead when consent is missing', async () => {
    const res = await leadAuditPost(postJson('http://localhost/api/lead-audit', auditBody({ consent: false })))
    assert.equal(res.status, 400)
    assert.equal(send.mock.calls.length, 0)
  })

  test('does not email the lead when the Resend key is missing', async () => {
    delete process.env.RESEND_API_KEY
    const res = await leadAuditPost(postJson('http://localhost/api/lead-audit', auditBody()))
    assert.equal(res.status, 503)
    assert.equal(send.mock.calls.length, 0)
  })
})
