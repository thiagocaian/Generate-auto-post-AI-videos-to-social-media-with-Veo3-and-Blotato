import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const BLOTATO_API = 'https://backend.blotato.com/v2'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAuthUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// GET — fetch connected accounts from Blotato
export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blotaloKey = process.env.BLOTATO_API_KEY
  if (!blotaloKey) {
    return NextResponse.json({ error: 'BLOTATO_API_KEY not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(`${BLOTATO_API}/users/me/accounts`, {
      headers: { 'blotato-api-key': blotaloKey },
    })
    const data = await res.json()
    const accounts = (data.items || []) as Array<{ id: string; platform: string; username: string }>

    // Map to platform status — 9 social networks
    const platforms = [
      { key: 'instagram', name: 'Instagram', color: '#E4405F' },
      { key: 'tiktok', name: 'TikTok', color: '#000000' },
      { key: 'facebook', name: 'Facebook', color: '#1877F2' },
      { key: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
      { key: 'youtube', name: 'YouTube', color: '#FF0000' },
      { key: 'twitter', name: 'X (Twitter)', color: '#000000' },
      { key: 'pinterest', name: 'Pinterest', color: '#E60023' },
      { key: 'threads', name: 'Threads', color: '#000000' },
      { key: 'gmb', name: 'Google Business', color: '#4285F4' },
    ].map(p => {
      const account = accounts.find(a => a.platform?.toLowerCase() === p.key)
      return {
        ...p,
        connected: !!account,
        username: account?.username || null,
        accountId: account?.id || null,
      }
    })

    return NextResponse.json({ platforms, raw_accounts: accounts })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch accounts' }, { status: 500 })
  }
}

// POST — save connection request from client
export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if (body.action === 'request_connection') {
    const admin = getAdmin()

    // Get user's company
    const { data: member } = await admin
      .from('company_members')
      .select('company_id, companies(name)')
      .eq('user_id', user.id)
      .single()

    // Save the request (use a simple table or just log it)
    // For now, save to a 'connection_requests' concept via marketing_posts table
    // In production, this would be its own table + email notification
    const { error } = await admin
      .from('material_searches')
      .insert({
        company_id: member?.company_id,
        items: [{ platform: body.platform, handle: body.handle, requested_by: user.email, requested_at: new Date().toISOString() }],
        results: [],
        best_distributor: `CONNECTION_REQUEST: ${body.platform}`,
        best_total: 0,
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, message: `Connection request for ${body.platform} @${body.handle} saved` })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
