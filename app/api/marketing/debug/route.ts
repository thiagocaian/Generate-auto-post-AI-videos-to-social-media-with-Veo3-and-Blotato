import { NextResponse } from 'next/server'
import { getRequestUser, unauthorized, forbidden } from '@/lib/auth'

const SUPER_ADMINS = ['labofantasma@gmail.com']

const OUTSTAND_API = 'https://api.outstand.so/v1'
const BLOTATO_API = 'https://backend.blotato.com/v2'

export async function GET() {
  const user = await getRequestUser()
  if (!user) return unauthorized()
  if (!SUPER_ADMINS.includes(user.email ?? '')) return forbidden()

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    keys: {
      OUTSTAND_API_KEY: process.env.OUTSTAND_API_KEY ? 'SET' : 'NOT SET',
      BLOTATO_API_KEY: process.env.BLOTATO_API_KEY ? 'SET' : 'NOT SET',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
      FAL_KEY: process.env.FAL_KEY ? 'SET' : 'NOT SET',
    },
    outstand: null,
    blotato: null,
  }

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
      }
    } catch (err) {
      results.outstand = { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const blotaloKey = process.env.BLOTATO_API_KEY
  if (blotaloKey) {
    try {
      const res = await fetch(`${BLOTATO_API}/users/me/accounts`, {
        headers: { 'blotato-api-key': blotaloKey },
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
      }
    } catch (err) {
      results.blotato = { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  return NextResponse.json(results)
}
