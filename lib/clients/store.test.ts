import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { createClientsStore } from './store'

function tempStore() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'admin-clients-'))
  return createClientsStore(path.join(dir, 'clients.json'))
}

test('seeds fictional clients and filters them', async () => {
  const store = tempStore()
  const all = await store.list()
  assert.equal(all.ok, true)
  if (!all.ok) return
  assert.equal(all.data.length, 3)
  assert.ok(all.data.every(client => client.email.endsWith('@example.com')))

  const leads = await store.list({ status: 'lead' })
  assert.equal(leads.ok, true)
  if (!leads.ok) return
  assert.deepEqual(leads.data.map(client => client.name), ['Ben Harbour'])

  const search = await store.list({ q: 'northwind' })
  assert.equal(search.ok, true)
  if (!search.ok) return
  assert.equal(search.data.length, 1)
  assert.equal(search.data[0].company, 'Northwind Demo Electrical')
})

test('creates, updates, and deletes a client', async () => {
  const store = tempStore()
  const created = await store.create({
    name: '  Demo Person  ',
    email: 'Demo.Person@Example.com',
    phone: '+61 400 000 099',
    company: 'Sample Co',
    status: 'active',
    notes: 'Fictional',
  })
  assert.equal(created.ok, true)
  if (!created.ok) return
  assert.equal(created.data.email, 'demo.person@example.com')
  assert.equal(created.data.name, 'Demo Person')

  const duplicate = await store.create({
    name: 'Other',
    email: 'demo.person@example.com',
  })
  assert.equal(duplicate.ok, false)
  if (duplicate.ok) return
  assert.equal(duplicate.status, 409)

  const updated = await store.update(created.data.id, { status: 'archived', notes: 'Closed sample' })
  assert.equal(updated.ok, true)
  if (!updated.ok) return
  assert.equal(updated.data.status, 'archived')
  assert.equal(updated.data.name, 'Demo Person')

  const removed = await store.remove(created.data.id)
  assert.equal(removed.ok, true)
  const missing = await store.get(created.data.id)
  assert.equal(missing.ok, false)
  if (missing.ok) return
  assert.equal(missing.status, 404)
})

test('rejects invalid writes', async () => {
  const store = tempStore()
  const created = await store.create({ name: '', email: 'not-an-email' })
  assert.equal(created.ok, false)
  if (created.ok) return
  assert.equal(created.status, 400)

  const updated = await store.update('11111111-1111-4111-8111-111111111111', {})
  assert.equal(updated.ok, false)
  if (updated.ok) return
  assert.equal(updated.status, 400)
})
