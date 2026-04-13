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
    const distributors = [
      { company_id: member.company_id, name: 'National Flooring Distributors', website: 'https://nationalflooringdistributors.com.au', phone: '(07) 3806 2666', location: 'Ormeau QLD', categories: ['vinyl', 'hybrid', 'timber', 'carpet_tile', 'laminate', 'underlay'], active: true },
      { company_id: member.company_id, name: 'Marques Flooring', website: 'https://marquesflooring.com.au', phone: '', location: 'Gold Coast', categories: ['timber', 'engineered_timber', 'laminate', 'tools', 'accessories'], active: true },
      { company_id: member.company_id, name: 'MJS Floorcoverings', website: 'https://mjsfloorcoverings.com.au', phone: '(07) 5586 9800', location: 'Burleigh Heads QLD', categories: ['vinyl', 'carpet', 'adhesives', 'underlay', 'tools'], active: true },
      { company_id: member.company_id, name: 'Premium Floors', website: 'https://premiumfloors.com.au', phone: '', location: 'Brisbane QLD', categories: ['timber', 'laminate', 'hybrid', 'vinyl', 'bamboo', 'cork'], active: true },
      { company_id: member.company_id, name: 'Intafloors', website: 'https://intafloors.com.au', phone: '', location: 'Molendinar QLD', categories: ['adhesives', 'tools', 'accessories', 'underlay'], active: true },
      { company_id: member.company_id, name: 'Floor Trade Supplies', website: 'https://www.floortrade.au', phone: '(07) 5523 0061', location: 'Tweed Heads South NSW', categories: ['timber', 'bamboo', 'cork', 'tools', 'adhesives'], active: true },
      { company_id: member.company_id, name: 'Floorworld Gold Coast', website: 'https://www.floorworld.com.au', phone: '(07) 3482 2998', location: 'Gold Coast QLD', categories: ['carpet', 'timber', 'laminate', 'vinyl', 'hybrid', 'underlay'], active: true },
    ]

    const { data, error } = await admin
      .from('distributors')
      .upsert(distributors, { onConflict: 'name,company_id', ignoreDuplicates: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, count: distributors.length })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
