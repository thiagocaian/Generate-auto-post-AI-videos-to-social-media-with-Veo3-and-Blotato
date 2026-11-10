import { z } from 'zod'
import { formatZodError } from './errors'

const QUOTE_STATUSES = ['draft', 'sent', 'approved', 'rejected', 'expired'] as const

const QuoteItemSchema = z.object({
  category: z.string().trim().max(100).optional(),
  description: z.string().trim().max(500).optional(),
  unit: z.string().trim().max(40).optional(),
  qty: z.number().finite().nonnegative().optional(),
  unitPrice: z.number().finite().nonnegative().optional(),
  total: z.number().finite().optional(),
}).strict()

export const CreateQuoteSchema = z.object({
  client_name: z.string().trim().min(1, 'Client name is required').max(200),
  project_name: z.union([z.string().trim().max(200), z.literal('')]).optional(),
  items: z.array(QuoteItemSchema).max(100).optional().default([]),
  subtotal: z.number().finite().nonnegative().optional().default(0),
  gst: z.number().finite().nonnegative().optional().default(0),
  total: z.number().finite().nonnegative().optional().default(0),
  status: z.enum(QUOTE_STATUSES).optional().default('draft'),
}).strict()

export type QuoteInput = z.infer<typeof CreateQuoteSchema>

export function parseQuoteCreate(input: unknown): { ok: true; data: QuoteInput } | { ok: false; error: string } {
  const parsed = CreateQuoteSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
  return {
    ok: true,
    data: {
      ...parsed.data,
      project_name: parsed.data.project_name?.trim() ? parsed.data.project_name.trim() : undefined,
    },
  }
}
