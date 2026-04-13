import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'

// Vercel hobby plan: max 10s. Haiku responds in 2-3s so this is fine.

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

type MaterialItem = {
  name: string
  qty: number
  unit: string
}

type Distributor = {
  name: string
  website: string
  categories: string[]
}

// Build search URLs for each distributor based on material
function getSearchUrls(distributor: Distributor, material: string): string[] {
  const q = encodeURIComponent(material)
  const base = distributor.website.replace(/\/$/, '')

  // Bunnings has a search API
  if (base.includes('bunnings.com.au')) {
    return [
      `https://www.bunnings.com.au/search/products?q=${q}&sort=BoostOrder&page=1&pageSize=5&inStockOnly=false`,
      `https://www.bunnings.com.au/products/flooring-tiles?q=${q}`,
    ]
  }
  // Mitre 10
  if (base.includes('mitre10.com.au')) {
    return [
      `https://www.mitre10.com.au/catalogsearch/result/?q=${q}`,
      `https://www.mitre10.com.au/building-materials/flooring`,
    ]
  }
  // Paradise Timbers
  if (base.includes('paradise-timbers')) {
    return [
      `${base}/?s=${q}`,
      base,
    ]
  }
  // Generic: try search, shop, main page
  return [
    `${base}/search?q=${q}`,
    `${base}/?s=${q}`,
    `${base}/products`,
    base,
  ]
}

// Fetch a distributor's website and search for products
async function fetchDistributorProducts(distributor: Distributor, materials: MaterialItem[]): Promise<string> {
  let allContent = ''

  // Fetch search results for each material (max 3 materials to keep fast)
  for (const mat of materials.slice(0, 3)) {
    const urls = getSearchUrls(distributor, mat.name)
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/json',
          },
          signal: AbortSignal.timeout(10000),
        })
        if (res.ok) {
          const text = await res.text()
          const cleaned = text
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .substring(0, 10000)
          allContent += `\n[Search: ${mat.name}]\n${cleaned}\n`
          break
        }
      } catch {
        continue
      }
    }
  }

  return allContent || `Could not fetch ${distributor.website}`
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Action: parse free text into structured materials list
  if (body.action === 'parse') {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const aiRes = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Parse this flooring materials list into structured data. The user is a flooring installer in Gold Coast, Australia. They write in Portuguese or English.

Text: "${body.text}"

Return ONLY a JSON object:
{"materials": [{"name": "Material Name in English", "qty": 50, "unit": "m²"}]}

Valid units: m², m linear, unit, box, L, kg, roll
- "metros" or "m" for floor coverings = m²
- "metros" for rodape/skirting/profiles = m linear
- "litros" = L
- "caixas" = box
- "unidades" = unit
- Translate Portuguese material names to English (rodape = Skirting Board, cola = Adhesive, piso vinilico = Vinyl Plank, etc.)`
      }]
    })
    const text = aiRes.content[0].type === 'text' ? aiRes.content[0].text : ''
    try {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) return NextResponse.json(JSON.parse(match[0]))
    } catch {}
    return NextResponse.json({ materials: [] })
  }

  const { materials, distributors } = body as {
    materials: MaterialItem[]
    distributors: Distributor[]
  }

  if (!materials?.length || !distributors?.length) {
    return NextResponse.json({ error: 'Missing materials or distributors' }, { status: 400 })
  }

  try {

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }
  const anthropic = new Anthropic({ apiKey })

  const materialsList = materials.map(m => `- ${m.name}: ${m.qty} ${m.unit}`).join('\n')
  // Limit to 4 distributors max for speed
  const topDist = distributors.slice(0, 4)
  const distributorList = topDist.map(d => `- ${d.name} (${d.website})`).join('\n')

  const aiResponse = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are a flooring materials price calculator for Gold Coast, Queensland, Australia.

You have expert knowledge of Australian flooring material prices from major retailers and trade suppliers. Use realistic 2024-2025 Australian market prices.

MATERIALS NEEDED:
${materialsList}

DISTRIBUTORS TO COMPARE:
${distributorList}

INSTRUCTIONS:
1. For each distributor, provide realistic AUD prices for each material
2. Bunnings and Mitre 10 have public retail prices — use accurate retail pricing
3. Trade suppliers (National Flooring Distributors, Marques, MJS, Paradise Timbers) typically have 15-30% lower trade prices
4. Include the price per unit AND the total (price x quantity)
5. Prices should vary realistically between distributors (not all the same)
6. Mark prices as "estimated" source since these are market-based estimates

Return ONLY valid JSON (no markdown, no backticks):
{"results":[{"distributor":"Name","website":"https://...","items":[{"material":"Material name","unit_price":45.00,"price_unit":"per m2","qty":50,"total":2250.00,"source":"estimated","product_name":"Typical product name","url":""}],"grand_total":2250.00}],"best_option":{"distributor":"Cheapest name","total":2250.00,"savings":150.00},"notes":"Brief comparison summary"}`
    }]
  })

  const aiText = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : ''

  let parsedResults
  try {
    const jsonMatch = aiText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      parsedResults = JSON.parse(jsonMatch[0])
    }
  } catch {
    parsedResults = { error: 'Could not parse AI response', raw: aiText.substring(0, 500) }
  }

  return NextResponse.json(parsedResults || { error: 'No results' })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
