import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { item, newStock, type } = await req.json()

  // Trigger n8n webhook for low stock alert + auto purchase order
  const n8nPayload = {
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
    timestamp: new Date().toISOString()
  }

  try {
    await fetch(
      process.env.N8N_WAREHOUSE_WEBHOOK || 'https://labofantasma.app.n8n.cloud/webhook/warehouse-alert',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nPayload)
      }
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) })
  }
}
