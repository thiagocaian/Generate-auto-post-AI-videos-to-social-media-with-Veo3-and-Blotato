import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'

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
      model: 'claude-sonnet-4-20250514',
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

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Fetch content from all distributors in parallel
  const fetchResults = await Promise.allSettled(
    distributors.map(async (dist) => {
      const content = await fetchDistributorProducts(dist, materials)
      return { distributor: dist.name, website: dist.website, content }
    })
  )

  const distributorData = fetchResults
    .filter((r): r is PromiseFulfilledResult<{ distributor: string; website: string; content: string }> => r.status === 'fulfilled')
    .map(r => r.value)

  // Use Claude AI to analyze all distributor data and find prices
  const materialsList = materials.map(m => `- ${m.name}: ${m.qty} ${m.unit}`).join('\n')

  const distributorContext = distributorData.map(d =>
    `=== ${d.distributor} (${d.website}) ===\n${d.content.substring(0, 8000)}`
  ).join('\n\n')

  const aiResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are a flooring materials price research agent for Gold Coast, Australia.

I need you to find prices for these materials from flooring distributors:

MATERIALS NEEDED:
${materialsList}

DISTRIBUTOR WEBSITE DATA:
${distributorContext}

IMPORTANT INSTRUCTIONS:
1. Search the website content for each material or similar products
2. Extract any prices you find (per m², per linear metre, per unit, per litre, etc.)
3. If a price is not found on the website, estimate a realistic Australian market price based on your knowledge of Gold Coast flooring trade prices. Mark estimated prices with "est."
4. All prices must be in AUD
5. Calculate the total for each material (price × quantity)

Return ONLY a valid JSON object in this exact format:
{
  "results": [
    {
      "distributor": "Distributor Name",
      "website": "https://...",
      "items": [
        {
          "material": "Material name",
          "unit_price": 45.00,
          "price_unit": "per m²",
          "qty": 50,
          "total": 2250.00,
          "source": "website" or "estimated",
          "product_name": "Matched product name if found",
          "url": "direct product URL if available"
        }
      ],
      "grand_total": 2250.00
    }
  ],
  "best_option": {
    "distributor": "Name of cheapest distributor",
    "total": 2250.00,
    "savings": 150.00
  },
  "notes": "Brief summary of findings"
}`
    }]
  })

  const aiText = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : ''

  // Extract JSON from AI response
  let parsedResults
  try {
    const jsonMatch = aiText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      parsedResults = JSON.parse(jsonMatch[0])
    }
  } catch {
    // If JSON parsing fails, return raw AI response
    parsedResults = { raw: aiText, error: 'Could not parse AI response' }
  }

  return NextResponse.json(parsedResults)
}
