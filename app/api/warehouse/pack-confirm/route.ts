import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Called from /warehouse/pick (public page — no user session on scanner devices).
// Protected by Zod validation. The n8n webhook itself has its own auth.
const PackConfirmSchema = z.object({
  orderName: z.string().min(1).max(100),
  customer: z.string().min(1).max(200),
  allScanned: z.boolean(),
  itemsCount: z.number().int().nonnegative(),
  missingItems: z.array(z.string()).max(100),
  confirmedAt: z.string().datetime(),
})

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.N8N_PACK_CONFIRM_WEBHOOK
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Pack-confirm webhook not configured' }, { status: 500 })
  }

  const raw = await req.json()
  const parsed = PackConfirmSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Webhook delivery failed' }, { status: 502 })
  }
}
