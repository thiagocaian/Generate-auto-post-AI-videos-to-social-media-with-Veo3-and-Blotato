import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const BLOTATO_API = 'https://backend.blotato.com/v2'

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

    // Map to platform status
    const platforms = [
      { key: 'instagram', name: 'Instagram', icon: 'camera', color: '#E4405F' },
      { key: 'tiktok', name: 'TikTok', icon: 'music', color: '#000000' },
      { key: 'facebook', name: 'Facebook', icon: 'facebook', color: '#1877F2' },
      { key: 'linkedin', name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2' },
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
