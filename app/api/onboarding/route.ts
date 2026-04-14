import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
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

    // Verify authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { businessName, trade, location } = await request.json()

    if (!businessName || !businessName.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    // Generate slug from business name
    const slug = businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60)

    // Use service role to bypass RLS for creating company and member
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if user already has a company
    const { data: existingMember } = await adminClient
      .from('company_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'User already belongs to a company' }, { status: 409 })
    }

    // Check if slug already exists, append random suffix if so
    let finalSlug = slug
    const { data: existingSlug } = await adminClient
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingSlug) {
      finalSlug = `${slug}-${Math.random().toString(36).substring(2, 6)}`
    }

    // Calculate trial end date (30 days from now)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 30)

    // Create the company
    const { data: company, error: companyError } = await adminClient
      .from('companies')
      .insert({
        name: businessName.trim(),
        slug: finalSlug,
        plan: 'starter',
        plan_status: 'trial',
        trade: trade || null,
        location: location || null,
        trial_ends_at: trialEndsAt.toISOString(),
        primary_color: '#886cff',
      })
      .select()
      .single()

    if (companyError) {
      console.error('Company creation error:', companyError)
      return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
    }

    // Create the company member (owner)
    const { error: memberError } = await adminClient
      .from('company_members')
      .insert({
        company_id: company.id,
        user_id: user.id,
        role: 'owner',
      })

    if (memberError) {
      console.error('Member creation error:', memberError)
      // Rollback: delete the company if member creation fails
      await adminClient.from('companies').delete().eq('id', company.id)
      return NextResponse.json({ error: 'Failed to set up account' }, { status: 500 })
    }

    // Update user metadata with full name if available
    if (user.user_metadata?.full_name) {
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          company_id: company.id,
          onboarded: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
      },
    })
  } catch (err) {
    console.error('Onboarding error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
