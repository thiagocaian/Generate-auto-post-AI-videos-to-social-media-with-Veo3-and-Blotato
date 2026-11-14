import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { parseCreateClient, parseUpdateClient } from './schema'
import { CLIENT_STATUSES, type Client, type ClientQuery, type ClientStatus } from './types'

export type StoreFailure = { ok: false; status: number; error: string }
export type StoreSuccess<T> = { ok: true; data: T }

const SEED: Client[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Ada North',
    email: 'ada.north@example.com',
    phone: '+61 400 000 001',
    company: 'Northwind Demo Electrical',
    address: '1 Sample Circuit, Southport QLD 4215',
    status: 'active',
    notes: 'Fictional sample record. Not a real customer.',
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-02-02T00:00:00.000Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Ben Harbour',
    email: 'ben.harbour@example.com',
    phone: '+61 400 000 002',
    company: 'Harbour Sample Plumbing',
    address: '2 Example Lane, Broadbeach QLD 4218',
    status: 'lead',
    notes: 'Fictional sample record. Not a real customer.',
    createdAt: '2026-03-04T00:00:00.000Z',
    updatedAt: '2026-03-04T00:00:00.000Z',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Casey Ridge',
    email: 'casey.ridge@example.com',
    phone: '+61 400 000 003',
    company: 'Example Ridge Solar',
    address: '3 Demo Rise, Burleigh Heads QLD 4220',
    status: 'paused',
    notes: 'Fictional sample record. Not a real customer.',
    createdAt: '2026-04-11T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
  },
]

function sortClients(clients: Client[]): Client[] {
  return [...clients].sort((a, b) => {
    const byDate = b.updatedAt.localeCompare(a.updatedAt)
    if (byDate !== 0) return byDate
    return a.name.localeCompare(b.name)
  })
}

function normalizeClient(value: unknown): Client {
  if (!value || typeof value !== 'object') throw new Error('Client store is unreadable')
  const row = value as Partial<Client>
  if (typeof row.id !== 'string' || typeof row.name !== 'string' || typeof row.email !== 'string') {
    throw new Error('Client store is unreadable')
  }
  if (!row.status || !CLIENT_STATUSES.includes(row.status as ClientStatus)) {
    throw new Error('Client store is unreadable')
  }
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    company: row.company ?? '',
    address: row.address ?? '',
    status: row.status,
    notes: row.notes ?? '',
    createdAt: row.createdAt ?? '',
    updatedAt: row.updatedAt ?? '',
  }
}

function matchesQuery(client: Client, query: ClientQuery): boolean {
  if (query.status && client.status !== query.status) return false
  const q = query.q?.trim().toLowerCase()
  if (!q) return true
  const haystack = [client.name, client.email, client.phone, client.company, client.address, client.notes]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export function createClientsStore(filePath: string) {
  let chain: Promise<unknown> = Promise.resolve()

  function locked<T>(fn: () => T): Promise<T> {
    const run = chain.then(() => fn())
    chain = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }

  function ensureParent() {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
  }

  function writeAll(clients: Client[]) {
    ensureParent()
    const tmp = `${filePath}.${process.pid}.tmp`
    fs.writeFileSync(tmp, `${JSON.stringify(sortClients(clients), null, 2)}\n`, 'utf8')
    fs.renameSync(tmp, filePath)
  }

  function readAll(): Client[] {
    if (!fs.existsSync(filePath)) {
      writeAll(SEED)
      return SEED.map(client => ({ ...client }))
    }
    let raw: string
    try {
      raw = fs.readFileSync(filePath, 'utf8')
    } catch {
      throw new Error('Client store is unreadable')
    }
    try {
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) throw new Error('not an array')
      return parsed.map(normalizeClient)
    } catch {
      throw new Error('Client store is unreadable')
    }
  }

  return {
    list(query: ClientQuery = {}): Promise<StoreSuccess<Client[]>> {
      return locked(() => {
        const clients = readAll().filter(client => matchesQuery(client, query))
        return { ok: true as const, data: sortClients(clients) }
      })
    },

    get(id: string): Promise<StoreSuccess<Client> | StoreFailure> {
      return locked(() => {
        const client = readAll().find(item => item.id === id)
        if (!client) return { ok: false as const, status: 404, error: 'Client not found' }
        return { ok: true as const, data: client }
      })
    },

    create(input: unknown): Promise<StoreSuccess<Client> | StoreFailure> {
      return locked(() => {
        const parsed = parseCreateClient(input)
        if (!parsed.ok) return { ok: false as const, status: 400, error: parsed.error }
        const clients = readAll()
        if (clients.some(client => client.email === parsed.data.email)) {
          return { ok: false as const, status: 409, error: 'A client with this email already exists' }
        }
        const now = new Date().toISOString()
        const client: Client = { id: randomUUID(), ...parsed.data, createdAt: now, updatedAt: now }
        writeAll([...clients, client])
        return { ok: true as const, data: client }
      })
    },

    update(id: string, input: unknown): Promise<StoreSuccess<Client> | StoreFailure> {
      return locked(() => {
        const parsed = parseUpdateClient(input)
        if (!parsed.ok) return { ok: false as const, status: 400, error: parsed.error }
        const clients = readAll()
        const index = clients.findIndex(client => client.id === id)
        if (index === -1) return { ok: false as const, status: 404, error: 'Client not found' }
        if (
          parsed.data.email &&
          clients.some(client => client.email === parsed.data.email && client.id !== id)
        ) {
          return { ok: false as const, status: 409, error: 'A client with this email already exists' }
        }
        const next: Client = {
          ...clients[index],
          ...parsed.data,
          updatedAt: new Date().toISOString(),
        }
        const copy = [...clients]
        copy[index] = next
        writeAll(copy)
        return { ok: true as const, data: next }
      })
    },

    remove(id: string): Promise<StoreSuccess<{ id: string }> | StoreFailure> {
      return locked(() => {
        const clients = readAll()
        if (!clients.some(client => client.id === id)) {
          return { ok: false as const, status: 404, error: 'Client not found' }
        }
        writeAll(clients.filter(client => client.id !== id))
        return { ok: true as const, data: { id } }
      })
    },
  }
}

export { clientsStore } from './db'
