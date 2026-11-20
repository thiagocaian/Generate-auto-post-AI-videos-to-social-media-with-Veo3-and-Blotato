import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { companyRecordFilters, scopedRowMissing } from '@/lib/security/company-scope'
import { parseUuid } from '@/lib/validation/ids'

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

async function requireCompanyId(userId: string): Promise<
  | { ok: true; admin: ReturnType<typeof getAdmin>; companyId: string }
  | { ok: false; response: NextResponse }
> {
  const admin = getAdmin()
  const { data: member } = await admin
    .from('company_members')
    .select('companies(id)')
    .eq('user_id', userId)
    .single()

  const companyId = (member?.companies as { id?: string } | null)?.id
  if (typeof companyId !== 'string' || companyId.length === 0) {
    return { ok: false, response: NextResponse.json({ error: 'No company' }, { status: 404 }) }
  }
  return { ok: true, admin, companyId }
}

// GET — list marketing posts for user's company, or fetch single post by id
export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const scope = await requireCompanyId(user.id)
  if (!scope.ok) return scope.response
  const { admin, companyId } = scope

  const singleId = new URL(req.url).searchParams.get('id')

  // Single post lookup (for polling). Missing or another company's post is 404.
  if (singleId) {
    const id = parseUuid(singleId)
    if (!id.ok) return NextResponse.json({ error: id.error }, { status: 400 })

    const record = companyRecordFilters(companyId, id.id)
    const { data, error } = await admin
      .from('marketing_posts')
      .select('*')
      .eq('id', record.id)
      .eq('company_id', record.company_id)
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (scopedRowMissing(data)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ post: data })
  }

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

  const body = await req.json()

  const scope = await requireCompanyId(user.id)
  if (!scope.ok) return scope.response

  const { data, error } = await scope.admin.from('marketing_posts').insert({
    company_id: scope.companyId,
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

// DELETE — delete a marketing post owned by the caller's company
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const raw = await req.json().catch(() => null)
  const id = parseUuid(raw && typeof raw === 'object' ? (raw as { id?: unknown }).id : undefined)
  if (!id.ok) return NextResponse.json({ error: id.error }, { status: 400 })

  const scope = await requireCompanyId(user.id)
  if (!scope.ok) return scope.response

  const record = companyRecordFilters(scope.companyId, id.id)
  const { data, error } = await scope.admin
    .from('marketing_posts')
    .delete()
    .eq('id', record.id)
    .eq('company_id', record.company_id)
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (scopedRowMissing(data)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
