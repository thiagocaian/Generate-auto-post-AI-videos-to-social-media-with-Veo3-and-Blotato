import { getAdminClient } from '@/lib/auth'
import { parseCreateClient, parseUpdateClient } from './schema'
import type { Client, ClientQuery, ClientStatus } from './types'
import type { StoreFailure, StoreSuccess } from './store'

type ClientRow = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  address: string | null
  status: ClientStatus
  notes: string | null
  created_at: string
  updated_at: string
}

function toClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    company: row.company ?? '',
    address: row.address ?? '',
    status: row.status,
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function matches(client: Client, query: ClientQuery): boolean {
  if (query.status && client.status !== query.status) return false
  const q = query.q?.trim().toLowerCase()
  if (!q) return true
  return [client.name, client.email, client.phone, client.company, client.address, client.notes]
    .join(' ')
    .toLowerCase()
    .includes(q)
}

export const clientsStore = {
  async list(query: ClientQuery = {}): Promise<StoreSuccess<Client[]>> {
    const admin = getAdminClient()
    const { data, error } = await admin.from('admin_clients').select('*').order('updated_at', { ascending: false })
    if (error) throw new Error(error.message)
    const clients = ((data ?? []) as ClientRow[]).map(toClient).filter(client => matches(client, query))
    return { ok: true, data: clients }
  },

  async get(id: string): Promise<StoreSuccess<Client> | StoreFailure> {
    const admin = getAdminClient()
    const { data, error } = await admin.from('admin_clients').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return { ok: false, status: 404, error: 'Client not found' }
    return { ok: true, data: toClient(data as ClientRow) }
  },

  async create(input: unknown): Promise<StoreSuccess<Client> | StoreFailure> {
    const parsed = parseCreateClient(input)
    if (!parsed.ok) return { ok: false, status: 400, error: parsed.error }
    const admin = getAdminClient()
    const { data, error } = await admin.from('admin_clients').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      company: parsed.data.company,
      address: parsed.data.address,
      status: parsed.data.status,
      notes: parsed.data.notes,
    }).select('*').single()
    if (error?.code === '23505') return { ok: false, status: 409, error: 'A client with this email already exists' }
    if (error || !data) throw new Error(error?.message || 'Could not save client')
    return { ok: true, data: toClient(data as ClientRow) }
  },

  async update(id: string, input: unknown): Promise<StoreSuccess<Client> | StoreFailure> {
    const parsed = parseUpdateClient(input)
    if (!parsed.ok) return { ok: false, status: 400, error: parsed.error }
    const admin = getAdminClient()
    const patch: Record<string, string> = { updated_at: new Date().toISOString() }
    if (parsed.data.name !== undefined) patch.name = parsed.data.name
    if (parsed.data.email !== undefined) patch.email = parsed.data.email
    if (parsed.data.phone !== undefined) patch.phone = parsed.data.phone
    if (parsed.data.company !== undefined) patch.company = parsed.data.company
    if (parsed.data.address !== undefined) patch.address = parsed.data.address
    if (parsed.data.status !== undefined) patch.status = parsed.data.status
    if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes
    const { data, error } = await admin.from('admin_clients').update(patch).eq('id', id).select('*').maybeSingle()
    if (error?.code === '23505') return { ok: false, status: 409, error: 'A client with this email already exists' }
    if (error) throw new Error(error.message)
    if (!data) return { ok: false, status: 404, error: 'Client not found' }
    return { ok: true, data: toClient(data as ClientRow) }
  },

  async remove(id: string): Promise<StoreSuccess<{ id: string }> | StoreFailure> {
    const admin = getAdminClient()
    const { data, error } = await admin.from('admin_clients').delete().eq('id', id).select('id').maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return { ok: false, status: 404, error: 'Client not found' }
    return { ok: true, data: { id } }
  },
}
