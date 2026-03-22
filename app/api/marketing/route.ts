import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const webhookUrl = process.env.N8N_WAREHOUSE_WEBHOOK

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'content_engine', ...body }),
      })
    } catch {
      // webhook failure is non-critical
    }
  }

  return NextResponse.json({ success: true })
}
