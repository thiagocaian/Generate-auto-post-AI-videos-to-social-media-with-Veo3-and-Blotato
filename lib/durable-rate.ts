import 'server-only'
import { NextResponse } from 'next/server'
import { clientsSupabaseConfigured, getClientsSupabase } from '@/lib/clients-supabase'
import { createClientsRepository } from '@/lib/inbound/clients-repository'
import { rateWindowStart } from '@/lib/inbound/repository'
import {
  AI_RATE_LIMIT,
  AUTH_RATE_LIMIT,
  PUBLIC_RATE_LIMIT,
  PUBLIC_RATE_WINDOW_MS,
  UPLOAD_RATE_LIMIT,
  createRateLimiter,
} from '@/lib/rate-limit'

const memoryPublic = createRateLimiter(PUBLIC_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS)
const memoryAuth = createRateLimiter(AUTH_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS)
const memoryAi = createRateLimiter(AI_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS)
const memoryUpload = createRateLimiter(UPLOAD_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS)

export function tooManyRequests() {
  return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
}

async function consumeDurable(key: string, limit: number): Promise<boolean> {
  if (!clientsSupabaseConfigured()) return true
  try {
    const count = await createClientsRepository(getClientsSupabase()).consumeRate(
      key,
      rateWindowStart(new Date()),
    )
    return count <= limit
  } catch {
    // Clients DB unreachable: do not open a hole across instances.
    return false
  }
}

export async function allowPublicRate(ip: string): Promise<boolean> {
  if (!memoryPublic(ip)) return false
  return consumeDurable(`ip:${ip}:public`, PUBLIC_RATE_LIMIT)
}

export async function allowAuthRate(ip: string): Promise<boolean> {
  if (!memoryAuth(ip)) return false
  return consumeDurable(`ip:${ip}:auth`, AUTH_RATE_LIMIT)
}

export async function allowAiRate(userId: string, ip: string): Promise<boolean> {
  if (!memoryAi(`user:${userId}`) || !memoryAi(`ip:${ip}:ai`)) return false
  const userOk = await consumeDurable(`user:${userId}:ai`, AI_RATE_LIMIT)
  if (!userOk) return false
  return consumeDurable(`ip:${ip}:ai`, AI_RATE_LIMIT)
}

export async function allowUploadRate(userId: string, ip: string): Promise<boolean> {
  if (!memoryUpload(`user:${userId}`) || !memoryUpload(`ip:${ip}:upload`)) return false
  const userOk = await consumeDurable(`user:${userId}:upload`, UPLOAD_RATE_LIMIT)
  if (!userOk) return false
  return consumeDurable(`ip:${ip}:upload`, UPLOAD_RATE_LIMIT)
}
