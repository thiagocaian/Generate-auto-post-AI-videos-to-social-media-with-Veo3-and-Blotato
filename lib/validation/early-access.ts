import { z } from 'zod'
import { formatZodError } from './errors'

export const EarlyAccessSchema = z.object({
  email: z.string().trim().email('Invalid email').max(200),
}).strict()

export function parseEarlyAccess(input: unknown): { ok: true; data: { email: string } } | { ok: false; error: string } {
  const parsed = EarlyAccessSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
  return { ok: true, data: { email: parsed.data.email.toLowerCase() } }
}
