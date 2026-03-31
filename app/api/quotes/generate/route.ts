import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  // Auth check
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

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const body = await req.json()
  const { projectType, floorArea, clientName, projectName } = body

  if (!projectType || !floorArea) {
    return NextResponse.json({ error: 'projectType and floorArea required' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey })

  const prompt = `You are an expert electrical contracting estimator for the Australian market. Generate a detailed itemized quote for an electrical installation project.

Project Details:
- Client: ${clientName || 'Client'}
- Project: ${projectName || 'Electrical Installation'}
- Type: ${projectType} (residential/commercial/industrial)
- Floor Area: ${floorArea} sqm

Generate a JSON response with this exact structure (no markdown, just raw JSON):
{
  "items": [
    {
      "category": "string (one of: Design, Switchgear, Cabling, Lighting, Power, Safety, Compliance, Labour, Infrastructure, Management)",
      "description": "string (specific item description)",
      "unit": "string (m, un, hr, lot, etc)",
      "qty": number,
      "unitPrice": number (AUD),
      "total": number (qty * unitPrice)
    }
  ],
  "subtotal": number,
  "gst": number (10% of subtotal),
  "total": number (subtotal + gst),
  "estimatedDays": number (working days),
  "notes": "string (any important assumptions or exclusions)"
}

Generate 10-15 realistic line items appropriate for a ${projectType} project of ${floorArea}sqm. Use realistic Australian market prices. Include items from at least 6 different categories.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    const quote = JSON.parse(jsonMatch[0])
    return NextResponse.json({ success: true, quote })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
