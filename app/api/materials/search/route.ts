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

// Fetch a distributor's website and search for products
async function fetchDistributorProducts(distributor: Distributor, materials: MaterialItem[]): Promise<string> {
  const materialNames = materials.map(m => m.name).join(', ')

  // Try to fetch the distributor's product/search page
  const urls = [
    `${distributor.website}/products`,
    `${distributor.website}/shop`,
    `${distributor.website}/collections`,
    distributor.website,
  ]

  let pageContent = ''
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CYTRON Materials Agent)' },
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) {
        const html = await res.text()
        // Strip scripts/styles, keep text content
        pageContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .substring(0, 15000) // Limit to 15k chars for AI
        break
      }
    } catch {
      continue
    }
  }

  return pageContent || `Could not fetch ${distributor.website}`
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
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
