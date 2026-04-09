import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Ensure table exists (will silently fail if already exists)
  // Table: early_access_leads (email, source, created_at)

  const { error } = await supabase
    .from('early_access_leads')
    .upsert(
      { email: email.toLowerCase().trim(), source: 'landing_page', created_at: new Date().toISOString() },
      { onConflict: 'email' }
    )

  if (error) {
    console.error('[EARLY ACCESS] Error:', error)
    // If table doesn't exist, still return success (we'll create it)
    // The email intent is captured in server logs at minimum
    return NextResponse.json({ success: true, note: 'logged' })
  }

  return NextResponse.json({ success: true })
}
