import { NextRequest, NextResponse } from 'next/server'
import { requestIp } from '@/lib/rate-limit'
import { allowAuthRate, tooManyRequests } from '@/lib/durable-rate'

/** Pre-check before client-side GoTrue login / password reset. */
export async function POST(req: NextRequest) {
  const ip = requestIp(req.headers)
  if (!(await allowAuthRate(ip))) return tooManyRequests()
  return NextResponse.json({ ok: true })
}
