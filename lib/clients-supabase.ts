import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export class ClientsSupabaseConfigError extends Error {
  constructor() {
    super('Missing clients Supabase configuration')
    this.name = 'ClientsSupabaseConfigError'
  }
}

export function clientsSupabaseConfigured(): boolean {
  return Boolean(process.env.CLIENTS_SUPABASE_URL && process.env.CLIENTS_SUPABASE_SERVICE_ROLE_KEY)
}

/** Service-role client for cytron-clients. Never import this from a client component. */
export function getClientsSupabase(): SupabaseClient {
  const url = process.env.CLIENTS_SUPABASE_URL
  const key = process.env.CLIENTS_SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new ClientsSupabaseConfigError()
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
