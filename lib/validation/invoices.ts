import { z } from 'zod'
import { formatZodError } from './errors'

const optionalText = (max: number) => z.union([z.string().trim().max(max), z.literal(''), z.null()]).optional()
const optionalUuid = z.union([z.string().uuid(), z.literal(''), z.null()]).optional()
const optionalEmail = z.union([z.literal(''), z.null(), z.string().trim().email('Enter a valid email').max(200)]).optional()

const CreateSchema = z.object({
  action: z.literal('create').optional(),
  client_name: z.string().trim().min(1, 'Client name is required').max(200),
  client_email: optionalEmail,
  client_address: optionalText(500),
  job_id: optionalUuid,
  quote_id: optionalUuid,
  items: z.array(z.record(z.string(), z.unknown())).max(100).optional(),
  subtotal: z.number().finite().nonnegative().optional(),
  tax_rate: z.number().finite().min(0).max(100).optional(),
  due_date: optionalText(40),
  notes: optionalText(2000),
}).strict()

const CreateFromJobSchema = z.object({
  action: z.literal('create_from_job'),
  job_id: z.string().uuid('Invalid job id'),
}).strict()

const RecordPaymentSchema = z.object({
  action: z.literal('record_payment'),
  id: z.string().uuid('Invalid id'),
  amount: z.number().finite().nonnegative(),
  method: z.union([z.string().trim().max(50), z.literal(''), z.null()]).optional(),
}).strict()

const SendSchema = z.object({
  action: z.literal('send'),
  id: z.string().uuid('Invalid id'),
}).strict()

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export type InvoiceCommand =
  | {
      action: 'create'
      client_name: string
      client_email: string | null
      client_address: string | null
      job_id: string | null
      quote_id: string | null
      items: Record<string, unknown>[]
      subtotal: number
      tax_rate: number
      due_date: string | null
      notes: string | null
    }
  | { action: 'create_from_job'; job_id: string }
  | { action: 'record_payment'; id: string; amount: number; method: string | null }
  | { action: 'send'; id: string }

export function parseInvoicePost(input: unknown): { ok: true; data: InvoiceCommand } | { ok: false; error: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Invalid JSON' }
  }

  const action = (input as { action?: unknown }).action ?? 'create'

  if (action === 'create') {
    const parsed = CreateSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
    const data = parsed.data
    return {
      ok: true,
      data: {
        action: 'create',
        client_name: data.client_name,
        client_email: emptyToNull(data.client_email),
        client_address: emptyToNull(data.client_address),
        job_id: data.job_id && data.job_id.length > 0 ? data.job_id : null,
        quote_id: data.quote_id && data.quote_id.length > 0 ? data.quote_id : null,
        items: data.items ?? [],
        subtotal: data.subtotal || 0,
        tax_rate: data.tax_rate ?? 10,
        due_date: emptyToNull(data.due_date),
        notes: emptyToNull(data.notes),
      },
    }
  }

  if (action === 'create_from_job') {
    const parsed = CreateFromJobSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
    return { ok: true, data: { action: 'create_from_job', job_id: parsed.data.job_id } }
  }

  if (action === 'record_payment') {
    const parsed = RecordPaymentSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
    return {
      ok: true,
      data: {
        action: 'record_payment',
        id: parsed.data.id,
        amount: parsed.data.amount,
        method: emptyToNull(parsed.data.method),
      },
    }
  }

  if (action === 'send') {
    const parsed = SendSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
    return { ok: true, data: { action: 'send', id: parsed.data.id } }
  }

  return { ok: false, error: 'Invalid action' }
}
