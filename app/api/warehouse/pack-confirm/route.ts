import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getRequestUser } from '@/lib/auth'
import { secretsMatch } from '@/lib/ip-hash'

// Fail closed for anonymous callers when WAREHOUSE_PACK_TOKEN is missing.
// Logged-in warehouse staff (the pick page) may confirm via session.
// Do not generate or print the token — an admin must set it in Vercel.
const PackConfirmSchema = z.object({
  orderName: z.string().min(1).max(100),
  customer: z.string().min(1).max(200),
  allScanned: z.boolean(),
  itemsCount: z.number().int().nonnegative(),
  missingItems: z.array(z.string()).max(100),
  confirmedAt: z.string().datetime(),
})

async function authorized(req: NextRequest): Promise<boolean> {
  const expected = process.env.WAREHOUSE_PACK_TOKEN
  const header =
    req.headers.get('x-warehouse-token')
    ?? req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    ?? ''
  if (expected && header && secretsMatch(header, expected)) return true
  const user = await getRequestUser()
  return Boolean(user)
}

export async function POST(req: NextRequest) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
