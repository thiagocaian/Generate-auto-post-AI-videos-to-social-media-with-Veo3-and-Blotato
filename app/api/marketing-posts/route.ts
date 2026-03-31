import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

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

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET — list marketing posts for user's company, or fetch single post by id
export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()
  const { searchParams } = new URL(req.url)
  const singleId = searchParams.get('id')

  // Single post lookup (for polling)
  if (singleId) {
    const { data, error } = await admin
      .from('marketing_posts')
      .select('*')
      .eq('id', singleId)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ post: data })
  }

  const { data: member } = await admin
    .from('company_members')
    .select('companies(id)')
    .eq('user_id', user.id)
    .single()

  const companyId = (member?.companies as any)?.id
  if (!companyId) return NextResponse.json({ error: 'No company' }, { status: 404 })

  const { data, error } = await admin
    .from('marketing_posts')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also compute stats
  const total = data?.length || 0
  const published = data?.filter(p => p.status === 'published').length || 0
  const totalReach = data?.reduce((sum, p) => sum + (p.reach || 0), 0) || 0
  const totalLikes = data?.reduce((sum, p) => sum + (p.likes || 0), 0) || 0

  return NextResponse.json({
    posts: data,
    stats: { total, published, totalReach, totalLikes }
  })
}

// POST — create a new marketing post
export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()
  const body = await req.json()

  const { data: member } = await admin
    .from('company_members')
    .select('companies(id)')
    .eq('user_id', user.id)
    .single()

  const companyId = (member?.companies as any)?.id
  if (!companyId) return NextResponse.json({ error: 'No company' }, { status: 404 })

  const { data, error } = await admin.from('marketing_posts').insert({
    company_id: companyId,
    user_id: user.id,
    image_url: body.image_url || null,
    video_url: body.video_url || null,
    caption: body.caption || null,
    brief: body.brief || null,
    platform: body.platform || 'tiktok',
    status: body.status || 'pending',
    reach: body.reach || 0,
    likes: body.likes || 0,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, post: data })
}

// DELETE — delete a marketing post
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()
  const { id } = await req.json()

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await admin
    .from('marketing_posts')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
