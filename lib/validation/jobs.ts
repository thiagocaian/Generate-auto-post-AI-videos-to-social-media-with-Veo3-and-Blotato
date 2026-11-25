import { z } from 'zod'
import { formatZodError } from './errors'

export const JOB_STATUSES = ['enquiry', 'quoted', 'scheduled', 'in_progress', 'completed', 'invoiced', 'paid'] as const
export const JOB_PRIORITIES = ['high', 'medium', 'low'] as const
export const SIGNATURE_TYPES = ['approval', 'completion'] as const

/**
 * Fields a caller may change on an existing job.
 * company_id, id, user_id, job_number, and timestamps are intentionally absent.
 * quote_id is set only by create (after a company check) and link_quote.
 */
export const JOB_MUTABLE_FIELDS = [
  'title',
  'description',
  'client_name',
  'client_email',
  'client_phone',
  'site_address',
  'status',
  'priority',
  'assigned_to',
  'scheduled_date',
  'scheduled_time_start',
  'scheduled_time_end',
  'estimated_hours',
  'actual_hours',
  'notes',
  'tags',
  'total_value',
  'photos_before',
  'photos_after',
  'checklist',
  'instructions',
  'admin_notes',
  'materials',
  'documents',
  'client_signature_url',
  'signature_type',
  'signed_at',
  'signer_name',
] as const

export const JOB_IMMUTABLE_FIELDS = ['company_id', 'id', 'user_id', 'job_number', 'created_at', 'updated_at'] as const

const optionalText = (max: number) => z.union([z.string().trim().max(max), z.literal(''), z.null()]).optional()
const optionalUuid = z.union([z.string().uuid(), z.literal(''), z.null()]).optional()
const urlList = z.array(z.string().url().max(2000)).max(50)

const checklistItem = z.object({
  task: z.string().trim().min(1).max(500),
  done: z.boolean(),
})

const mutableShape = {
  title: z.string().trim().min(1, 'Title is required').max(300).optional(),
  description: optionalText(5000),
  client_name: optionalText(200),
  client_email: z.union([z.literal(''), z.null(), z.string().trim().email('Enter a valid email').max(200)]).optional(),
  client_phone: optionalText(50),
  site_address: optionalText(500),
  status: z.enum(JOB_STATUSES).optional(),
  priority: z.enum(JOB_PRIORITIES).optional(),
  assigned_to: optionalText(200),
  scheduled_date: optionalText(40),
  scheduled_time_start: optionalText(20),
  scheduled_time_end: optionalText(20),
  estimated_hours: z.number().finite().nonnegative().nullable().optional(),
  actual_hours: z.number().finite().nonnegative().nullable().optional(),
  notes: optionalText(5000),
  tags: z.array(z.string().trim().max(50)).max(30).optional(),
  total_value: z.number().finite().nonnegative().nullable().optional(),
  photos_before: urlList.optional(),
  photos_after: urlList.optional(),
  checklist: z.array(checklistItem).max(100).optional(),
  instructions: optionalText(5000),
  admin_notes: optionalText(5000),
  materials: z.array(z.object({
    item: z.string().trim().max(200),
    qty: z.number().finite().nonnegative(),
    unit: z.string().trim().max(40),
  }).strict()).max(100).optional(),
  documents: z.array(z.object({
    name: z.string().trim().max(200),
    url: z.string().url().max(2000),
  }).strict()).max(50).optional(),
  client_signature_url: z.union([z.string().url().max(2000), z.null()]).optional(),
  signature_type: z.enum(SIGNATURE_TYPES).optional(),
  signed_at: z.union([z.string().datetime(), z.null()]).optional(),
  signer_name: optionalText(200),
}

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/** Copies only allowlisted job columns. Immutable keys are dropped even if present. */
export function pickJobUpdateFields(input: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {}
  for (const key of JOB_MUTABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(input, key) && input[key] !== undefined) {
      fields[key] = input[key]
    }
  }
  return fields
}

const CreateSchema = z.object({
  action: z.literal('create').optional(),
  title: z.string().trim().min(1, 'Title is required').max(300),
  description: mutableShape.description,
  client_name: mutableShape.client_name,
  client_email: mutableShape.client_email,
  client_phone: mutableShape.client_phone,
  site_address: mutableShape.site_address,
  status: mutableShape.status,
  priority: mutableShape.priority,
  assigned_to: mutableShape.assigned_to,
  quote_id: optionalUuid,
  scheduled_date: mutableShape.scheduled_date,
  scheduled_time_start: mutableShape.scheduled_time_start,
  scheduled_time_end: mutableShape.scheduled_time_end,
  estimated_hours: mutableShape.estimated_hours,
  notes: mutableShape.notes,
  tags: mutableShape.tags,
  total_value: mutableShape.total_value,
  instructions: mutableShape.instructions,
  admin_notes: mutableShape.admin_notes,
  checklist: mutableShape.checklist,
  // Sent by the jobs form and ignored. The insert list never persisted it.
  checklist_text: z.string().max(5000).optional(),
}).strict()

const UpdateSchema = z.object({
  action: z.literal('update'),
  id: z.string().uuid('Invalid id'),
  ...mutableShape,
}).strict()

const UpdateStatusSchema = z.object({
  action: z.literal('update_status'),
  id: z.string().uuid('Invalid id'),
  status: z.enum(JOB_STATUSES),
}).strict()

const LinkQuoteSchema = z.object({
  action: z.literal('link_quote'),
  id: z.string().uuid('Invalid id'),
  quote_id: z.string().uuid('Invalid quote id'),
  keep_client: z.boolean().optional(),
}).strict()

export type JobInsert = {
  title: string
  description: string | null
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  site_address: string | null
  status: (typeof JOB_STATUSES)[number]
  priority: (typeof JOB_PRIORITIES)[number]
  assigned_to: string | null
  quote_id: string | null
  scheduled_date: string | null
  scheduled_time_start: string | null
  scheduled_time_end: string | null
  estimated_hours: number | null
  notes: string | null
  tags: string[]
  total_value: number
}

export type JobCommand =
  | { action: 'create'; insert: JobInsert }
  | { action: 'update'; id: string; fields: Record<string, unknown> }
  | { action: 'update_status'; id: string; status: (typeof JOB_STATUSES)[number] }
  | { action: 'link_quote'; id: string; quote_id: string; keep_client: boolean }

export function parseJobPost(input: unknown): { ok: true; data: JobCommand } | { ok: false; error: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Invalid JSON' }
  }

  const action = (input as { action?: unknown }).action ?? 'create'

  if (action === 'create') {
    const parsed = CreateSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
    const data = parsed.data
    const quoteId = data.quote_id && data.quote_id.length > 0 ? data.quote_id : null
    return {
      ok: true,
      data: {
        action: 'create',
        insert: {
          title: data.title,
          description: emptyToNull(data.description),
          client_name: emptyToNull(data.client_name),
          client_email: emptyToNull(data.client_email),
          client_phone: emptyToNull(data.client_phone),
          site_address: emptyToNull(data.site_address),
          status: data.status ?? 'enquiry',
          priority: data.priority ?? 'medium',
          assigned_to: emptyToNull(data.assigned_to),
          quote_id: quoteId,
          scheduled_date: emptyToNull(data.scheduled_date),
          scheduled_time_start: emptyToNull(data.scheduled_time_start),
          scheduled_time_end: emptyToNull(data.scheduled_time_end),
          estimated_hours: data.estimated_hours || null,
          notes: emptyToNull(data.notes),
          tags: data.tags ?? [],
          total_value: data.total_value || 0,
        },
      },
    }
  }

  if (action === 'update') {
    const parsed = UpdateSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
    const fields = pickJobUpdateFields(parsed.data as unknown as Record<string, unknown>)
    if (Object.keys(fields).length === 0) {
      return { ok: false, error: 'Provide at least one field to update' }
    }
    return { ok: true, data: { action: 'update', id: parsed.data.id, fields } }
  }

  if (action === 'update_status') {
    const parsed = UpdateStatusSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
    return { ok: true, data: { action: 'update_status', id: parsed.data.id, status: parsed.data.status } }
  }

  if (action === 'link_quote') {
    const parsed = LinkQuoteSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
    return {
      ok: true,
      data: {
        action: 'link_quote',
        id: parsed.data.id,
        quote_id: parsed.data.quote_id,
        keep_client: parsed.data.keep_client ?? false,
      },
    }
  }

  return { ok: false, error: 'Invalid action' }
}
