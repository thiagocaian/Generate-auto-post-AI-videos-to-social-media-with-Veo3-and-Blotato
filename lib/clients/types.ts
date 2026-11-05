export const CLIENT_STATUSES = ['lead', 'active', 'paused', 'archived'] as const

export type ClientStatus = (typeof CLIENT_STATUSES)[number]

export type Client = {
  id: string
  name: string
  email: string
  phone: string
  company: string
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
  status: ClientStatus
  notes: string
}

export type ClientPatch = Partial<ClientInput>

export type ClientQuery = {
  q?: string
  status?: ClientStatus
}
