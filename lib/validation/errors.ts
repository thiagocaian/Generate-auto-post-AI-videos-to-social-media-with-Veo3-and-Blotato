import { z } from 'zod'

export function formatZodError(error: z.ZodError): string {
  const issue = error.issues[0]
  if (!issue) return 'Invalid input'
  const path = issue.path.join('.')
  return path ? `${path}: ${issue.message}` : issue.message
}

export function parseWith<T>(
  schema: z.ZodType<T>,
  input: unknown,
): { ok: true; data: T } | { ok: false; error: string } {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
  return { ok: true, data: parsed.data }
}
