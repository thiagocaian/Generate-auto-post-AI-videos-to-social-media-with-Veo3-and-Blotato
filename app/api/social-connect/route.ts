import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const AYRSHARE_API = 'https://app.ayrshare.com/api'

// GET — List connected social accounts
export async function GET(req: NextRequest) {
  const apiKey = process.env.AYRSHARE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Ayrshare API key not configured' }, { status: 500 })

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll(c) { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Get user profile from Ayrshare
    const res = await fetch(`${AYRSHARE_API}/user`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    const data = await res.json()

    // Extract connected platforms
    const activePlatforms = data.activeSocialAccounts || []

    return NextResponse.json({
      connected: activePlatforms,
      displayNames: data.displayNames || {},
    })
  } catch (err) {
    console.error('[SOCIAL-CONNECT] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

// POST — Generate link for connecting a social account
export async function POST(req: NextRequest) {
  const apiKey = process.env.AYRSHARE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Ayrshare API key not configured' }, { status: 500 })

  const { platform } = await req.json()

  if (!platform) {
    return NextResponse.json({ error: 'Platform required' }, { status: 400 })
  }

  try {
    // Generate social account connect link via Ayrshare
    const res = await fetch(`${AYRSHARE_API}/profiles/generateJWT`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: process.env.NEXT_PUBLIC_SITE_URL || 'https://cytronai.com',
        privateKey: apiKey,
        profileKey: '', // Main account
      }),
    })
    const data = await res.json()

    if (data.url) {
      return NextResponse.json({ connectUrl: data.url })
    }

    // Fallback: Direct Ayrshare dashboard link
    return NextResponse.json({
      connectUrl: 'https://app.ayrshare.com/dashboard/social-accounts',
      note: 'Connect your accounts via Ayrshare dashboard',
    })
  } catch (err) {
    console.error('[SOCIAL-CONNECT] Error generating link:', err)
    return NextResponse.json({
      connectUrl: 'https://app.ayrshare.com/dashboard/social-accounts',
      note: 'Connect your accounts via Ayrshare dashboard',
    })
  }
}
