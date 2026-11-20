import assert from 'node:assert/strict'
import { describe, test } from 'vitest'
import { parseBooking } from './booking'
import { parseEarlyAccess } from './early-access'
import { parseInvoicePost } from './invoices'
import { parseMaterialsPost, parseMaterialsSearch } from './materials'
import { parseQuoteCreate } from './quotes'

const ID = '11111111-1111-4111-8111-111111111111'

describe('quote validation', () => {
  test('accepts a quote and rejects company_id', () => {
    const ok = parseQuoteCreate({
      client_name: 'Ada',
      project_name: 'Level 2 fitout',
      items: [{ description: 'Cable', qty: 10, unit: 'm', unitPrice: 4, total: 40 }],
      subtotal: 40,
      gst: 4,
      total: 44,
    })
    assert.equal(ok.ok, true)
    if (!ok.ok) return
    assert.equal(ok.data.status, 'draft')
    assert.equal(ok.data.client_name, 'Ada')

    const rejected = parseQuoteCreate({ client_name: 'Ada', company_id: 'other-company' })
    assert.equal(rejected.ok, false)
    if (rejected.ok) return
    assert.match(rejected.error, /company_id/)
  })

  test('rejects a missing client name', () => {
    const parsed = parseQuoteCreate({ client_name: '' })
    assert.equal(parsed.ok, false)
    if (parsed.ok) return
    assert.match(parsed.error, /Client name is required/)
  })
})

describe('invoice validation', () => {
  test('accepts the invoice actions the app sends', () => {
    const payment = parseInvoicePost({ action: 'record_payment', id: ID, amount: 150, method: 'card' })
    assert.equal(payment.ok, true)
    if (!payment.ok) return
    assert.equal(payment.data.action, 'record_payment')

    const fromJob = parseInvoicePost({ action: 'create_from_job', job_id: ID })
    assert.equal(fromJob.ok, true)

    const send = parseInvoicePost({ action: 'send', id: ID })
    assert.equal(send.ok, true)
  })

  test('rejects a create that names another company', () => {
    const parsed = parseInvoicePost({
      action: 'create',
      client_name: 'Ada',
      company_id: 'other-company',
      subtotal: 10,
    })
    assert.equal(parsed.ok, false)
    if (parsed.ok) return
    assert.match(parsed.error, /company_id/)
  })

  test('rejects a payment without an amount', () => {
    const parsed = parseInvoicePost({ action: 'record_payment', id: ID, method: 'card' })
    assert.equal(parsed.ok, false)
    if (parsed.ok) return
    assert.match(parsed.error, /amount/)
  })
})

describe('booking and early access validation', () => {
  test('accepts the booking form and clears empty optional fields', () => {
    const parsed = parseBooking({
      name: 'Ada',
      email: 'ada@example.com',
      phone: '',
      business_name: '',
      business_type: '',
      preferred_date: '',
      preferred_time: '',
      message: '',
    })
    assert.equal(parsed.ok, true)
    if (!parsed.ok) return
    assert.equal(parsed.data.name, 'Ada')
    assert.equal(parsed.data.phone, null)
    assert.equal(parsed.data.preferred_date, null)
  })

  test('rejects a booking without a name or a valid email', () => {
    const missing = parseBooking({ name: '', email: 'ada@example.com' })
    assert.equal(missing.ok, false)
    if (missing.ok) return
    assert.match(missing.error, /Name is required/)

    const email = parseBooking({ name: 'Ada', email: 'not-an-email' })
    assert.equal(email.ok, false)
    if (email.ok) return
    assert.match(email.error, /email/i)
  })

  test('normalises early-access emails and rejects junk', () => {
    const parsed = parseEarlyAccess({ email: 'Ada@Example.com' })
    assert.equal(parsed.ok, true)
    if (!parsed.ok) return
    assert.equal(parsed.data.email, 'ada@example.com')

    const rejected = parseEarlyAccess({ email: 'not-an-email' })
    assert.equal(rejected.ok, false)
    if (rejected.ok) return
    assert.match(rejected.error, /Invalid email/)
  })
})

describe('materials validation', () => {
  test('accepts distributor, purchase-order, and search payloads', () => {
    const seed = parseMaterialsPost({ action: 'seed_distributors' })
    assert.equal(seed.ok, true)

    const update = parseMaterialsPost({ action: 'update_distributor', id: ID, active: false })
    assert.equal(update.ok, true)

    const po = parseMaterialsPost({
      action: 'create_po',
      distributor_name: 'Bunnings',
      distributor_website: 'https://www.bunnings.com.au',
      items: [{ material: 'Cable', qty: 2, total: 20 }],
      total: 20,
      specialty: 'electrical',
    })
    assert.equal(po.ok, true)

    const search = parseMaterialsSearch({
      materials: [{ name: 'Cable', qty: 2, unit: 'm' }],
      distributors: [{ name: 'Bunnings', website: 'https://www.bunnings.com.au', categories: ['cable'] }],
      specialty: 'electrical',
    })
    assert.equal(search.ok, true)

    const parsed = parseMaterialsSearch({ action: 'parse', text: '10m cable', specialty: 'electrical' })
    assert.equal(parsed.ok, true)
  })

  test('rejects an unknown action and a distributor id that is not a uuid', () => {
    const action = parseMaterialsPost({ action: 'drop_table' })
    assert.equal(action.ok, false)

    const id = parseMaterialsPost({ action: 'delete_distributor', id: '1' })
    assert.equal(id.ok, false)
    if (id.ok) return
    assert.match(id.error, /Invalid id/)
  })
})
