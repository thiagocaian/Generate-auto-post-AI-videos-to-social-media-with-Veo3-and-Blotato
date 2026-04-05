import { NextResponse } from 'next/server'

const OUTSTAND_API = 'https://api.outstand.so/v1'
const BLOTATO_API = 'https://backend.blotato.com/v2'

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    keys: {
      OUTSTAND_API_KEY: process.env.OUTSTAND_API_KEY ? `${process.env.OUTSTAND_API_KEY.substring(0, 8)}...` : 'NOT SET',
      BLOTATO_API_KEY: process.env.BLOTATO_API_KEY ? `${process.env.BLOTATO_API_KEY.substring(0, 8)}...` : 'NOT SET',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
      FAL_KEY: process.env.FAL_KEY ? 'SET' : 'NOT SET',
    },
    outstand: null,
    blotato: null,
  }

  // Test Outstand
  const outstandKey = process.env.OUTSTAND_API_KEY
  if (outstandKey) {
    try {
      const res = await fetch(`${OUTSTAND_API}/social-accounts`, {
        headers: { Authorization: `Bearer ${outstandKey}` },
      })
      const data = await res.json()
      results.outstand = {
        status: res.status,
        connected: res.ok,
        accounts: (data.data || []).map((a: { platform: string; username: string; id: string }) => ({
          platform: a.platform,
          username: a.username,
          id: a.id,
        })),
        raw: JSON.stringify(data).substring(0, 300),
      }
    } catch (err) {
      results.outstand = { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Test Blotato
  const blotaloKey = process.env.BLOTATO_API_KEY
  if (blotaloKey) {
    try {
      const res = await fetch(`${BLOTATO_API}/users/me/accounts`, {
        headers: { Authorization: `Bearer ${blotaloKey}` },
      })
      const data = await res.json()
      results.blotato = {
        status: res.status,
        connected: res.ok,
        accounts: (data.items || []).map((a: { platform: string; username: string; id: string }) => ({
          platform: a.platform,
          username: a.username,
          id: a.id,
        })),
        raw: JSON.stringify(data).substring(0, 300),
      }
    } catch (err) {
      results.blotato = { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  return NextResponse.json(results)
}
