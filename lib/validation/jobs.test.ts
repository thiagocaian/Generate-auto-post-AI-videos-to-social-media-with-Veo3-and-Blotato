import assert from 'node:assert/strict'
import { describe, test } from 'vitest'
import { JOB_IMMUTABLE_FIELDS, parseJobPost, pickJobUpdateFields } from './jobs'

const JOB_ID = '11111111-1111-4111-8111-111111111111'

describe('job update allowlist', () => {
  test('drops company, identity, and timestamp fields', () => {
    const fields = pickJobUpdateFields({
      id: JOB_ID,
      action: 'update',
      company_id: 'other-company',
      user_id: 'someone-else',
      job_number: 'JOB-9999',
      created_at: '2000-01-01T00:00:00.000Z',
      updated_at: '2000-01-01T00:00:00.000Z',
      title: 'Rewire switchboard',
      status: 'paid',
      photos_before: ['https://example.com/before.jpg'],
    })

    assert.deepEqual(fields, {
      title: 'Rewire switchboard',
      status: 'paid',
      photos_before: ['https://example.com/before.jpg'],
    })
    for (const key of JOB_IMMUTABLE_FIELDS) {
      assert.equal(Object.hasOwn(fields, key), false)
    }
  })

  test('the update parser rejects immutable keys instead of writing them', () => {
    const parsed = parseJobPost({
      action: 'update',
      id: JOB_ID,
      title: 'Rewire switchboard',
      company_id: 'other-company',
      created_at: '2000-01-01T00:00:00.000Z',
    })
    assert.equal(parsed.ok, false)
    if (parsed.ok) return
    assert.match(parsed.error, /company_id/)
  })

  test('an update only returns allowlisted columns', () => {
    const parsed = parseJobPost({
      action: 'update',
      id: JOB_ID,
      actual_hours: 3.5,
      photos_after: ['https://example.com/after.jpg'],
      checklist: [{ task: 'Isolate power', done: true }],
      client_signature_url: 'https://example.com/sign.png',
      signature_type: 'completion',
      signed_at: '2026-11-10T08:00:00.000Z',
      signer_name: 'Ada',
    })
    assert.equal(parsed.ok, true)
    if (!parsed.ok || parsed.data.action !== 'update') return
    assert.equal(parsed.data.id, JOB_ID)
    assert.deepEqual(Object.keys(parsed.data.fields).sort(), [
      'actual_hours',
      'checklist',
      'client_signature_url',
      'photos_after',
      'signature_type',
      'signed_at',
      'signer_name',
    ])
    for (const key of ['company_id', 'id', 'user_id', 'job_number', 'created_at', 'updated_at']) {
      assert.equal(Object.hasOwn(parsed.data.fields, key), false)
    }
  })

  test('an update with no editable field is rejected', () => {
    const parsed = parseJobPost({ action: 'update', id: JOB_ID })
    assert.equal(parsed.ok, false)
    if (parsed.ok) return
    assert.match(parsed.error, /at least one field/)
  })
})

describe('job create validation', () => {
  test('accepts the jobs form payload and never returns company_id', () => {
    const parsed = parseJobPost({
      action: 'create',
      title: 'Switchboard upgrade',
      client_name: 'Northwind',
      client_email: '',
      client_phone: '',
      site_address: '',
      assigned_to: '',
      priority: 'medium',
      scheduled_date: '',
      estimated_hours: null,
      description: '',
      instructions: null,
      admin_notes: null,
      checklist_text: 'Isolate power',
      checklist: [],
    })
    assert.equal(parsed.ok, true)
    if (!parsed.ok || parsed.data.action !== 'create') return
    assert.equal(parsed.data.insert.title, 'Switchboard upgrade')
    assert.equal(parsed.data.insert.client_name, 'Northwind')
    assert.equal(parsed.data.insert.description, null)
    assert.equal(parsed.data.insert.status, 'enquiry')
    assert.equal(Object.hasOwn(parsed.data.insert, 'company_id'), false)
    assert.equal(Object.hasOwn(parsed.data.insert, 'checklist_text'), false)
  })

  test('rejects a create that tries to set company_id', () => {
    const parsed = parseJobPost({
      action: 'create',
      title: 'Switchboard upgrade',
      company_id: 'other-company',
    })
    assert.equal(parsed.ok, false)
    if (parsed.ok) return
    assert.match(parsed.error, /company_id/)
  })

  test('requires a title', () => {
    const parsed = parseJobPost({ action: 'create', title: '  ' })
    assert.equal(parsed.ok, false)
    if (parsed.ok) return
    assert.match(parsed.error, /Title is required/)
  })
})
