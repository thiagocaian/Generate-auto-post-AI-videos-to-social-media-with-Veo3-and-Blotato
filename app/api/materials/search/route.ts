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

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY missing' }, { status: 500 })

    const body = await req.json()
    const anthropic = new Anthropic({ apiKey })

    // === PARSE free text into structured list ===
    if (body.action === 'parse') {
      const aiRes = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Parse this flooring materials list. User is a flooring installer in Gold Coast AU. Input may be Portuguese or English.

Text: "${body.text}"

Return ONLY JSON: {"materials":[{"name":"English Name","qty":50,"unit":"m²"}]}
Units: m², m linear, unit, box, L, kg, roll. Translate PT to EN (rodape=Skirting Board, cola=Adhesive, piso vinilico=Vinyl Plank).`
        }]
      })
      const text = aiRes.content[0].type === 'text' ? aiRes.content[0].text : ''
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try { return NextResponse.json(JSON.parse(match[0])) } catch {}
      }
      return NextResponse.json({ materials: [] })
    }

    // === SEARCH prices across distributors ===
    const { materials, distributors } = body
    if (!materials?.length || !distributors?.length) {
      return NextResponse.json({ error: 'Missing materials or distributors' }, { status: 400 })
    }

    const materialsList = materials.map((m: any) => `- ${m.name}: ${m.qty} ${m.unit}`).join('\n')
    const distList = distributors.slice(0, 4).map((d: any) => `- ${d.name} (${d.website})`).join('\n')

    const aiRes = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are a flooring materials price calculator for Gold Coast, QLD, Australia. Use realistic 2024-2025 AUD market prices.

MATERIALS:
${materialsList}

DISTRIBUTORS:
${distList}

Rules: Bunnings/Mitre10 = retail prices. Trade suppliers = 15-30% cheaper. Prices must vary between distributors.

Return ONLY valid JSON (no markdown):
{"results":[{"distributor":"Name","website":"url","items":[{"material":"Name","unit_price":45,"price_unit":"per m2","qty":50,"total":2250,"source":"estimated","product_name":"Product","url":""}],"grand_total":2250}],"best_option":{"distributor":"Cheapest","total":2250,"savings":150},"notes":"Summary"}`
      }]
    })

    const aiText = aiRes.content[0].type === 'text' ? aiRes.content[0].text : ''
    const jsonMatch = aiText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try { return NextResponse.json(JSON.parse(jsonMatch[0])) } catch {}
    }
    return NextResponse.json({ error: 'Could not parse AI response', raw: aiText.substring(0, 300) })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error', stack: err.stack?.substring(0, 200) }, { status: 500 })
  }
}
