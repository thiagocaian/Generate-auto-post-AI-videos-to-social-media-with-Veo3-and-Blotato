export const CLIENT_STATUSES = ['lead', 'active', 'paused', 'archived'] as const

export type ClientStatus = (typeof CLIENT_STATUSES)[number]

export type Client = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  status: ClientStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export type ClientInput = {
  name: string
  email: string
  phone: string
  company: string
  address: string
  status: ClientStatus
  notes: string
}

export function clientToForm(client: Client): ClientInput {
  return {
    name: client.name,
    email: client.email,
    phone: client.phone,
    company: client.company,
    address: client.address,
    status: client.status,
    notes: client.notes,
  }
}

export function labelClientStatus(status: ClientStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export type ClientPatch = Partial<ClientInput>

export type ClientQuery = {
  q?: string
  status?: ClientStatus
}
