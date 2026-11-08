import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireClientsAdmin } from '@/lib/clients/access'
import { clientsStore } from '@/lib/clients/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = { params: { id: string } }

function failure(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

function parseId(id: string) {
  const parsed = z.string().uuid().safeParse(id)
  return parsed.success ? parsed.data : null
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const auth = await requireClientsAdmin()
  if (!auth.ok) return auth.response
  const id = parseId(params.id)
  if (!id) return failure(400, 'Invalid client id')

  try {
    const result = await clientsStore.get(id)
    if (!result.ok) return failure(result.status, result.error)
    return NextResponse.json({ client: result.data })
  } catch {
    return failure(500, 'Client store is unreadable')
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const auth = await requireClientsAdmin()
  if (!auth.ok) return auth.response
  const id = parseId(params.id)
  if (!id) return failure(400, 'Invalid client id')

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return failure(400, 'Invalid JSON')
  }

  try {
    const result = await clientsStore.update(id, body)
    if (!result.ok) return failure(result.status, result.error)
    return NextResponse.json({ client: result.data })
  } catch {
    return failure(500, 'Client store is unreadable')
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const auth = await requireClientsAdmin()
  if (!auth.ok) return auth.response
  const id = parseId(params.id)
  if (!id) return failure(400, 'Invalid client id')

  try {
    const result = await clientsStore.remove(id)
    if (!result.ok) return failure(result.status, result.error)
    return NextResponse.json({ ok: true, id: result.data.id })
  } catch {
    return failure(500, 'Client store is unreadable')
  }
}
