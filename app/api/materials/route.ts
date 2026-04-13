import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Vercel hobby plan: max 10s

/*
-- Purchase Orders table (run once in Supabase SQL editor):
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid,
  created_at timestamptz DEFAULT now(),
  distributor_name text NOT NULL,
  distributor_website text,
  items jsonb NOT NULL DEFAULT '[]',
  total numeric DEFAULT 0,
  status text DEFAULT 'draft',
  specialty text DEFAULT 'flooring',
  notes text
);
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY purchase_orders_all ON purchase_orders FOR ALL USING (true) WITH CHECK (true);
*/

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

// GET — list searches + distributors + recent_materials + purchase_orders
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

  const [searchesRes, distributorsRes, posRes] = await Promise.all([
    admin
      .from('material_searches')
      .select('*')
      .eq('company_id', member.company_id)
      .order('created_at', { ascending: false })
      .limit(20),
    admin
      .from('distributors')
      .select('*')
      .eq('company_id', member.company_id),
    admin
      .from('purchase_orders')
      .select('*')
      .eq('company_id', member.company_id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  // Feature 1: Extract unique material names from past searches
  const recentMaterials: string[] = []
  const seen = new Set<string>()
  for (const search of (searchesRes.data || [])) {
    const items = search.items as Array<{ name: string; qty: number; unit: string }>
    if (Array.isArray(items)) {
      for (const item of items) {
        const key = item.name?.toLowerCase().trim()
        if (key && !seen.has(key)) {
          seen.add(key)
          recentMaterials.push(item.name)
        }
      }
    }
  }

  return NextResponse.json({
    searches: searchesRes.data || [],
    distributors: distributorsRes.data || [],
    recent_materials: recentMaterials.slice(0, 20),
    purchase_orders: posRes.data || [],
  })
}

// POST — save a search result, manage distributors, manage POs
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

  // === Save Search ===
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

  // === Seed Distributors ===
  if (body.action === 'seed_distributors') {
    await admin.from('distributors').delete().eq('company_id', member.company_id)

    const distributors = [
      { company_id: member.company_id, name: 'Bunnings Burleigh Waters', website: 'https://www.bunnings.com.au/products/flooring-tiles', phone: '(07) 5522 7200', location: 'Burleigh Waters QLD', categories: ['vinyl', 'timber', 'laminate', 'underlay', 'adhesive', 'skirting', 'trim'], active: true },
      { company_id: member.company_id, name: 'Mitre 10', website: 'https://www.mitre10.com.au/building-materials/flooring', phone: '', location: 'Gold Coast QLD', categories: ['vinyl', 'underlay', 'adhesive', 'skirting', 'trim', 'timber'], active: true },
      { company_id: member.company_id, name: 'Paradise Timbers', website: 'https://paradise-timbers.com.au', phone: '', location: 'Gold Coast QLD', categories: ['timber', 'engineered_timber', 'bamboo', 'laminate', 'accessories'], active: true },
      { company_id: member.company_id, name: 'National Flooring Distributors', website: 'https://nationalflooringdistributors.com.au', phone: '(07) 3806 2666', location: 'Ormeau QLD', categories: ['vinyl', 'hybrid', 'timber', 'carpet_tile', 'laminate', 'underlay'], active: true },
      { company_id: member.company_id, name: 'Marques Flooring', website: 'https://marquesflooring.com.au', phone: '', location: 'Gold Coast', categories: ['timber', 'engineered_timber', 'laminate', 'tools', 'accessories'], active: true },
      { company_id: member.company_id, name: 'MJS Floorcoverings', website: 'https://mjsfloorcoverings.com.au', phone: '(07) 5586 9800', location: 'Burleigh Heads QLD', categories: ['vinyl', 'carpet', 'adhesives', 'underlay', 'tools'], active: true },
      { company_id: member.company_id, name: 'Intafloors', website: 'https://intafloors.com.au', phone: '', location: 'Molendinar QLD', categories: ['adhesives', 'tools', 'accessories', 'underlay'], active: true },
    ]

    const { error } = await admin
      .from('distributors')
      .upsert(distributors, { onConflict: 'name,company_id', ignoreDuplicates: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, count: distributors.length })
  }

  // === Feature 2: Add Distributor ===
  if (body.action === 'add_distributor') {
    const { data, error } = await admin
      .from('distributors')
      .insert({
        company_id: member.company_id,
        name: body.name,
        website: body.website || '',
        phone: body.phone || '',
        location: body.location || '',
        categories: body.categories || [],
        active: true,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ distributor: data })
  }

  // === Feature 2: Update Distributor ===
  if (body.action === 'update_distributor') {
    const updates: Record<string, unknown> = {}
    if (body.name !== undefined) updates.name = body.name
    if (body.website !== undefined) updates.website = body.website
    if (body.phone !== undefined) updates.phone = body.phone
    if (body.location !== undefined) updates.location = body.location
    if (body.categories !== undefined) updates.categories = body.categories
    if (body.active !== undefined) updates.active = body.active

    const { data, error } = await admin
      .from('distributors')
      .update(updates)
      .eq('id', body.id)
      .eq('company_id', member.company_id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ distributor: data })
  }

  // === Feature 2: Delete Distributor ===
  if (body.action === 'delete_distributor') {
    const { error } = await admin
      .from('distributors')
      .delete()
      .eq('id', body.id)
      .eq('company_id', member.company_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // === Feature 3: Create Purchase Order ===
  if (body.action === 'create_po') {
    const { data, error } = await admin
      .from('purchase_orders')
      .insert({
        company_id: member.company_id,
        distributor_name: body.distributor_name,
        distributor_website: body.distributor_website || '',
        items: body.items || [],
        total: body.total || 0,
        status: 'draft',
        specialty: body.specialty || 'flooring',
        notes: body.notes || '',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ purchase_order: data })
  }

  // === Feature 3: List Purchase Orders ===
  if (body.action === 'list_pos') {
    const { data, error } = await admin
      .from('purchase_orders')
      .select('*')
      .eq('company_id', member.company_id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ purchase_orders: data })
  }

  // === Feature 3: Update PO Status ===
  if (body.action === 'update_po_status') {
    const updates: Record<string, unknown> = {}
    if (body.status) updates.status = body.status
    if (body.notes !== undefined) updates.notes = body.notes

    const { data, error } = await admin
      .from('purchase_orders')
      .update(updates)
      .eq('id', body.id)
      .eq('company_id', member.company_id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ purchase_order: data })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
