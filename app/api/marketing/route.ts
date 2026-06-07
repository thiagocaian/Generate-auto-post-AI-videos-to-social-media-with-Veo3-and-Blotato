import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getRequestUser, unauthorized } from '@/lib/auth'

const TriggerSchema = z.object({
  brief: z.string().min(1).max(2000).optional(),
  platform: z.string().max(50).optional(),
  imageUrl: z.string().url().optional(),
}).passthrough()

export async function POST(req: NextRequest) {
  const user = await getRequestUser()
  if (!user) return unauthorized()

  const raw = await req.json()
  const parsed = TriggerSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const webhookUrl = process.env.N8N_WAREHOUSE_WEBHOOK
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'content_engine', user_id: user.id, ...parsed.data }),
      })
    } catch {
      // webhook failure is non-critical
    }
  }

  return NextResponse.json({ success: true })
}
