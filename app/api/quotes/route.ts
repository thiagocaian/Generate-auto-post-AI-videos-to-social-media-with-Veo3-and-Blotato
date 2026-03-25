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

// GET — list quotes for user's company
export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()

  const { data: member } = await admin
    .from('company_members')
    .select('companies(id)')
    .eq('user_id', user.id)
    .single()

  const companyId = (member?.companies as any)?.id
  if (!companyId) return NextResponse.json({ error: 'No company' }, { status: 404 })

  const { data, error } = await admin
    .from('quotes')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ quotes: data })
}

// POST — create a new quote
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

  // Auto-generate quote number
  const { count } = await admin
    .from('quotes')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)

  const quoteNumber = `QT-${String(1001 + (count || 0)).padStart(4, '0')}`

  const { data, error } = await admin.from('quotes').insert({
    company_id: companyId,
    user_id: user.id,
    quote_number: quoteNumber,
    client_name: body.client_name,
    project_name: body.project_name,
    items: body.items || [],
    subtotal: body.subtotal || 0,
    gst: body.gst || 0,
    total: body.total || 0,
    status: body.status || 'draft',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, quote: data })
}

// DELETE — delete a quote
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()
  const { id } = await req.json()

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await admin
    .from('quotes')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
