import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
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

async function callOpenAI(prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY missing' }, { status: 500 })
    }

    const body = await req.json()

    // === PARSE free text into structured list ===
    if (body.action === 'parse') {
      const text = await callOpenAI(`Parse this flooring materials list. User is a flooring installer in Gold Coast AU. Input may be Portuguese or English.

Text: "${body.text}"

Return ONLY JSON: {"materials":[{"name":"English Name","qty":50,"unit":"m²"}]}
Units: m², m linear, unit, box, L, kg, roll. Translate PT to EN (rodape=Skirting Board, cola=Adhesive, piso vinilico=Vinyl Plank).`)

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

    const aiText = await callOpenAI(`You are a flooring materials price calculator for Gold Coast, QLD, Australia. Use realistic 2024-2025 AUD market prices.

MATERIALS:
${materialsList}

DISTRIBUTORS:
${distList}

Rules: Bunnings/Mitre10 = retail prices. Trade suppliers = 15-30% cheaper. Prices must vary realistically between distributors.

Return ONLY valid JSON (no markdown, no backticks):
{"results":[{"distributor":"Name","website":"url","items":[{"material":"Name","unit_price":45,"price_unit":"per m2","qty":50,"total":2250,"source":"estimated","product_name":"Product","url":""}],"grand_total":2250}],"best_option":{"distributor":"Cheapest","total":2250,"savings":150},"notes":"Summary"}`)

    const jsonMatch = aiText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try { return NextResponse.json(JSON.parse(jsonMatch[0])) } catch {}
    }
    return NextResponse.json({ error: 'Could not parse AI response', raw: aiText.substring(0, 300) })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
