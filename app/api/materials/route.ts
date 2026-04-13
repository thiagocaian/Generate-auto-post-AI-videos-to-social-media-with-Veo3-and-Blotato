import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Vercel hobby plan: max 10s

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

// GET — list searches + distributors
export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()
  const { data: member } = await admin
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const [searchesRes, distributorsRes] = await Promise.all([
    admin
      .from('material_searches')
      .select('*')
      .eq('company_id', member.company_id)
      .order('created_at', { ascending: false })
      .limit(20),
    admin
      .from('distributors')
      .select('*')
      .eq('company_id', member.company_id)
      .eq('active', true)
  ])

  return NextResponse.json({
    searches: searchesRes.data || [],
    distributors: distributorsRes.data || [],
  })
}

// POST — save a search result
export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()
  const { data: member } = await admin
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()

  if (body.action === 'save_search') {
    const { data, error } = await admin
      .from('material_searches')
      .insert({
        company_id: member.company_id,
        items: body.items,
        results: body.results,
        best_distributor: body.best_distributor,
        best_total: body.best_total,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ search: data })
  }

  if (body.action === 'seed_distributors') {
    // First delete existing distributors for this company to refresh
    await admin.from('distributors').delete().eq('company_id', member.company_id)

    const distributors = [
      // Distributors with PUBLIC PRICES (best for agent)
      { company_id: member.company_id, name: 'Bunnings Burleigh Waters', website: 'https://www.bunnings.com.au/products/flooring-tiles', phone: '(07) 5522 7200', location: 'Burleigh Waters QLD', categories: ['vinyl', 'timber', 'laminate', 'underlay', 'adhesive', 'skirting', 'trim'], active: true },
      { company_id: member.company_id, name: 'Mitre 10', website: 'https://www.mitre10.com.au/building-materials/flooring', phone: '', location: 'Gold Coast QLD', categories: ['vinyl', 'underlay', 'adhesive', 'skirting', 'trim', 'timber'], active: true },
      { company_id: member.company_id, name: 'Paradise Timbers', website: 'https://paradise-timbers.com.au', phone: '', location: 'Gold Coast QLD', categories: ['timber', 'engineered_timber', 'bamboo', 'laminate', 'accessories'], active: true },
      // Trade/wholesale distributors
      { company_id: member.company_id, name: 'National Flooring Distributors', website: 'https://nationalflooringdistributors.com.au', phone: '(07) 3806 2666', location: 'Ormeau QLD', categories: ['vinyl', 'hybrid', 'timber', 'carpet_tile', 'laminate', 'underlay'], active: true },
      { company_id: member.company_id, name: 'Marques Flooring', website: 'https://marquesflooring.com.au', phone: '', location: 'Gold Coast', categories: ['timber', 'engineered_timber', 'laminate', 'tools', 'accessories'], active: true },
      { company_id: member.company_id, name: 'MJS Floorcoverings', website: 'https://mjsfloorcoverings.com.au', phone: '(07) 5586 9800', location: 'Burleigh Heads QLD', categories: ['vinyl', 'carpet', 'adhesives', 'underlay', 'tools'], active: true },
      { company_id: member.company_id, name: 'Intafloors', website: 'https://intafloors.com.au', phone: '', location: 'Molendinar QLD', categories: ['adhesives', 'tools', 'accessories', 'underlay'], active: true },
    ]

    const { data, error } = await admin
      .from('distributors')
      .upsert(distributors, { onConflict: 'name,company_id', ignoreDuplicates: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, count: distributors.length })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
