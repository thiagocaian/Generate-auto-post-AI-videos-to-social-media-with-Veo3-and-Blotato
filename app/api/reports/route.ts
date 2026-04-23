import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function GET(req: NextRequest) {
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
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: member } = await admin
    .from('company_members')
    .select('role, companies(id, name)')
    .eq('user_id', user.id)
    .single()

  if (!member?.companies) return NextResponse.json({ error: 'No company' }, { status: 404 })
  const company = member.companies as unknown as { id: string; name: string }

  const period = req.nextUrl.searchParams.get('period') || 'month'
  const now = new Date()
  let fromDate: Date
  if (period === 'week') {
    fromDate = new Date(now); fromDate.setDate(now.getDate() - 7)
  } else if (period === 'quarter') {
    fromDate = new Date(now); fromDate.setMonth(now.getMonth() - 3)
  } else {
    fromDate = new Date(now); fromDate.setMonth(now.getMonth() - 1)
  }
  const fromISO = fromDate.toISOString()

  const [jobsRes, invoicesRes, quotesRes, postsRes, warehouseRes] = await Promise.all([
    admin.from('jobs').select('id, status, total_value, created_at').eq('company_id', company.id).gte('created_at', fromISO),
    admin.from('invoices').select('id, status, total, paid_at, created_at').eq('company_id', company.id).gte('created_at', fromISO),
    admin.from('quotes').select('id, status, total, created_at').eq('company_id', company.id).gte('created_at', fromISO),
    admin.from('marketing_posts').select('id, platform, status, reach, likes, created_at').eq('company_id', company.id).gte('created_at', fromISO),
    admin.from('warehouse_items').select('id, name, sku, category, current_stock, minimum_stock, unit_cost, location').eq('company_id', company.id),
  ])

  const jobs = jobsRes.data || []
  const invoices = invoicesRes.data || []
  const quotes = quotesRes.data || []
  const posts = postsRes.data || []
  const warehouseItems = warehouseRes.data || []

  const lowStock = warehouseItems.filter(i => i.current_stock <= i.minimum_stock)
  const byCategory = warehouseItems.reduce((acc: Record<string, number>, i) => {
    acc[i.category] = (acc[i.category] || 0) + (i.current_stock * (i.unit_cost || 0))
    return acc
  }, {})

  const inventory = {
    totalItems: warehouseItems.length,
    totalValue: warehouseItems.reduce((s, i) => s + (i.current_stock * (i.unit_cost || 0)), 0),
    lowStockCount: lowStock.length,
    lowStockItems: lowStock.map(i => ({ name: i.name, sku: i.sku, current: i.current_stock, minimum: i.minimum_stock, location: i.location })),
    byCategory: Object.entries(byCategory).map(([cat, val]) => ({ category: cat, value: val as number })).sort((a, b) => b.value - a.value),
    healthScore: warehouseItems.length > 0 ? Math.round(((warehouseItems.length - lowStock.length) / warehouseItems.length) * 100) : 100,
  }

  const stats = {
    jobs: {
      total: jobs.length,
      active: jobs.filter(j => j.status === 'active').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      pipelineValue: jobs.reduce((s, j) => s + (j.total_value || 0), 0),
    },
    invoices: {
      total: invoices.length,
      totalBilled: invoices.reduce((s, i) => s + (i.total || 0), 0),
      totalPaid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0),
      outstanding: invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.total || 0), 0),
    },
    quotes: {
      total: quotes.length,
      approved: quotes.filter(q => q.status === 'approved').length,
      totalValue: quotes.reduce((s, q) => s + (q.total || 0), 0),
      conversionRate: quotes.length > 0 ? Math.round((quotes.filter(q => q.status === 'approved').length / quotes.length) * 100) : 0,
    },
    marketing: {
      total: posts.length,
      published: posts.filter(p => p.status === 'published').length,
      totalReach: posts.reduce((s, p) => s + (p.reach || 0), 0),
      totalLikes: posts.reduce((s, p) => s + (p.likes || 0), 0),
    },
  }

  // AI insights via Claude
  let aiInsights: string | null = null
  let aiPowered = false
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `You are a business analyst for ${company.name}. Analyze this business + inventory data for the last ${period} and return exactly 3 concise, actionable insights as a JSON array of strings. Even if values are zero, provide useful advice. Include inventory insights if stock is low. Data: ${JSON.stringify({ ...stats, inventory })}. Return ONLY a valid JSON array: ["insight1","insight2","insight3"]`
        }]
      })
      const raw = (msg.content[0] as { text: string }).text.trim()
      const match = raw.match(/\[[\s\S]*\]/)
      if (match) { aiInsights = match[0]; aiPowered = true }
    } catch {
      aiInsights = null
    }
  }

  return NextResponse.json({ stats, inventory, aiInsights, aiPowered, period, company: company.name })
}
