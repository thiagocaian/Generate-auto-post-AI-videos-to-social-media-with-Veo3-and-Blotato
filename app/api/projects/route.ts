import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/auth'
import { requireClientsAdmin } from '@/lib/clients/access'

/** Active projects for warehouse scan. Cytron admins only; others get 403. */
export async function GET() {
  const auth = await requireClientsAdmin()
  if (!auth.ok) return auth.response

  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('projects')
    .select('id, name')
    .eq('status', 'active')
    .order('name')

  if (error) {
    console.error('[projects] list failed:', error.message)
    return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 })
  }

  return NextResponse.json({ projects: data ?? [] })
}
