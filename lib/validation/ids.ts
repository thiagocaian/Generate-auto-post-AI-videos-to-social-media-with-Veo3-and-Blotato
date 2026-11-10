import { z } from 'zod'

export function parseUuid(value: unknown, invalidMessage = 'Invalid id'): { ok: true; id: string } | { ok: false; error: string } {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { ok: false, error: 'Missing id' }
  }
  const parsed = z.string().uuid(invalidMessage).safeParse(value)
  if (!parsed.success) return { ok: false, error: invalidMessage }
  return { ok: true, id: parsed.data }
}
