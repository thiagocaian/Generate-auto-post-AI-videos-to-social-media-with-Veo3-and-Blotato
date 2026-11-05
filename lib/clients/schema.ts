import { z } from 'zod'
import { CLIENT_STATUSES, type ClientInput, type ClientPatch, type ClientQuery } from './types'

const phone = z
  .string()
  .trim()
  .max(40)
  .regex(/^[0-9+().\-\s]*$/, 'Phone can only contain digits, spaces, and + ( ) . -')

const clientFields = {
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Enter a valid email').max(200),
  phone: phone.optional().default(''),
  company: z.string().trim().max(160).optional().default(''),
  status: z.enum(CLIENT_STATUSES).optional().default('lead'),
  notes: z.string().trim().max(2000).optional().default(''),
}

export const CreateClientSchema = z.object(clientFields).strict()

export const UpdateClientSchema = z
  .object({
    name: clientFields.name.optional(),
    email: clientFields.email.optional(),
    phone: phone.optional(),
    company: z.string().trim().max(160).optional(),
    status: z.enum(CLIENT_STATUSES).optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .strict()
  .refine(value => Object.keys(value).length > 0, { message: 'Provide at least one field to update' })

export const ClientQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: z.enum(CLIENT_STATUSES).optional(),
})

export function formatZodError(error: z.ZodError): string {
  const issue = error.issues[0]
  if (!issue) return 'Invalid client'
  const path = issue.path.join('.')
  return path ? `${path}: ${issue.message}` : issue.message
}

export function parseCreateClient(input: unknown): { ok: true; data: ClientInput } | { ok: false; error: string } {
  const parsed = CreateClientSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
  return { ok: true, data: normalizeEmail(parsed.data) }
}

export function parseUpdateClient(input: unknown): { ok: true; data: ClientPatch } | { ok: false; error: string } {
  const parsed = UpdateClientSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
  return { ok: true, data: parsed.data.email ? { ...parsed.data, email: parsed.data.email.toLowerCase() } : parsed.data }
}

export function parseClientQuery(input: unknown): { ok: true; data: ClientQuery } | { ok: false; error: string } {
  const parsed = ClientQuerySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
  return { ok: true, data: parsed.data }
}

function normalizeEmail(input: ClientInput): ClientInput {
  return { ...input, email: input.email.toLowerCase() }
}
