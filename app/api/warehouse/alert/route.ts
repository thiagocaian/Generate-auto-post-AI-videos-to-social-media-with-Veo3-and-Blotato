import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getRequestUser, unauthorized } from '@/lib/auth'

const AlertSchema = z.object({
  type: z.string().min(1).max(50),
  item: z.object({
    id: z.string(),
    name: z.string().max(200),
    sku: z.string().max(100),
    minimum_stock: z.number().nonnegative(),
    unit: z.string().max(20),
    unit_cost: z.number().nonnegative(),
    location: z.string().max(200).optional().nullable(),
    supplier_id: z.string().optional().nullable(),
  }),
  newStock: z.number().nonnegative(),
})

export async function POST(req: NextRequest) {
  const user = await getRequestUser()
  if (!user) return unauthorized()

  const raw = await req.json()
  const parsed = AlertSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }
  const { item, newStock, type } = parsed.data

  const webhookUrl = process.env.N8N_WAREHOUSE_WEBHOOK
  if (!webhookUrl) {
    return NextResponse.json({ success: false, error: 'Warehouse webhook not configured' }, { status: 500 })
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        item_id: item.id,
        item_name: item.name,
        item_sku: item.sku,
        current_stock: newStock,
        minimum_stock: item.minimum_stock,
        unit: item.unit,
        unit_cost: item.unit_cost,
        location: item.location,
        supplier_id: item.supplier_id,
        timestamp: new Date().toISOString(),
      }),
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 502 })
  }
}
