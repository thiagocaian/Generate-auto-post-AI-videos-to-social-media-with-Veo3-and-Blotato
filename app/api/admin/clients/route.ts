import { NextRequest, NextResponse } from 'next/server'
import { requireClientsAdmin } from '@/lib/clients/access'
import { parseClientQuery } from '@/lib/clients/schema'
import { clientsStore } from '@/lib/clients/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function failure(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

export async function GET(req: NextRequest) {
  const auth = await requireClientsAdmin()
  if (!auth.ok) return auth.response

  const parsed = parseClientQuery({
    q: req.nextUrl.searchParams.get('q') ?? undefined,
    status: req.nextUrl.searchParams.get('status') ?? undefined,
  })
  if (!parsed.ok) return failure(400, parsed.error)

  try {
    const result = await clientsStore.list(parsed.data)
    return NextResponse.json({ clients: result.data, adminEmail: auth.email })
  } catch {
    return failure(500, 'Client store is unreadable')
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireClientsAdmin()
  if (!auth.ok) return auth.response

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return failure(400, 'Invalid JSON')
  }

  try {
    const result = await clientsStore.create(body)
    if (!result.ok) return failure(result.status, result.error)
    return NextResponse.json({ client: result.data }, { status: 201 })
  } catch {
    return failure(500, 'Client store is unreadable')
  }
}
