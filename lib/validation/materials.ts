import { z } from 'zod'
import { formatZodError } from './errors'

const SPECIALTIES = ['flooring', 'electrical', 'plumbing', 'hvac', 'general'] as const
const PO_STATUSES = ['draft', 'sent', 'confirmed', 'received'] as const

const optionalText = (max: number) => z.union([z.string().trim().max(max), z.literal('')]).optional()

const materialItem = z.object({
  name: z.string().trim().min(1, 'Material name is required').max(200),
  qty: z.number().finite().nonnegative(),
  unit: z.string().trim().max(40),
}).strict()

const looseRecord = z.record(z.string(), z.unknown())

const SaveSearchSchema = z.object({
  action: z.literal('save_search'),
  items: z.array(materialItem).max(100),
  results: z.array(looseRecord).max(30),
  best_distributor: z.union([z.string().trim().max(200), z.null()]).optional(),
  best_total: z.union([z.number().finite().nonnegative(), z.null()]).optional(),
}).strict()

const SeedSchema = z.object({
  action: z.literal('seed_distributors'),
}).strict()

const AddDistributorSchema = z.object({
  action: z.literal('add_distributor'),
  name: z.string().trim().min(1, 'Name is required').max(200),
  website: optionalText(500),
  phone: optionalText(40),
  location: optionalText(200),
  categories: z.array(z.string().trim().max(50)).max(40).optional(),
}).strict()

const UpdateDistributorSchema = z.object({
  action: z.literal('update_distributor'),
  id: z.string().uuid('Invalid id'),
  name: z.string().trim().min(1).max(200).optional(),
  website: optionalText(500),
  phone: optionalText(40),
  location: optionalText(200),
  categories: z.array(z.string().trim().max(50)).max(40).optional(),
  active: z.boolean().optional(),
}).strict().refine(
  value => value.name !== undefined || value.website !== undefined || value.phone !== undefined
    || value.location !== undefined || value.categories !== undefined || value.active !== undefined,
  { message: 'Provide at least one field to update' },
)

const DeleteDistributorSchema = z.object({
  action: z.literal('delete_distributor'),
  id: z.string().uuid('Invalid id'),
}).strict()

const CreatePoSchema = z.object({
  action: z.literal('create_po'),
  distributor_name: z.string().trim().min(1, 'Distributor name is required').max(200),
  distributor_website: optionalText(500),
  items: z.array(looseRecord).max(200).optional(),
  total: z.number().finite().nonnegative().optional(),
  specialty: z.enum(SPECIALTIES).optional(),
  notes: optionalText(2000),
}).strict()

const ListPosSchema = z.object({
  action: z.literal('list_pos'),
}).strict()

const UpdatePoSchema = z.object({
  action: z.literal('update_po_status'),
  id: z.string().uuid('Invalid id'),
  status: z.enum(PO_STATUSES).optional(),
  notes: optionalText(2000),
}).strict().refine(
  value => value.status !== undefined || value.notes !== undefined,
  { message: 'Provide a status or notes' },
)

const MaterialsPostSchema = z.discriminatedUnion('action', [
  SaveSearchSchema,
  SeedSchema,
  AddDistributorSchema,
  UpdateDistributorSchema,
  DeleteDistributorSchema,
  CreatePoSchema,
  ListPosSchema,
  UpdatePoSchema,
])

export type MaterialsCommand = z.infer<typeof MaterialsPostSchema>

export function parseMaterialsPost(input: unknown): { ok: true; data: MaterialsCommand } | { ok: false; error: string } {
  const parsed = MaterialsPostSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
  return { ok: true, data: parsed.data }
}

const ParseSearchSchema = z.object({
  action: z.literal('parse'),
  text: z.string().trim().min(1, 'Text is required').max(4000),
  specialty: z.enum(SPECIALTIES).optional(),
}).strict()

const PriceSearchSchema = z.object({
  materials: z.array(z.object({
    name: z.string().trim().min(1).max(200),
    qty: z.number().finite().positive(),
    unit: z.string().trim().max(40),
  }).strict()).min(1, 'Add at least one material').max(100),
  distributors: z.array(z.object({
    name: z.string().trim().min(1).max(200),
    website: z.union([z.string().max(500), z.null()]).optional(),
    categories: z.union([z.array(z.string().max(50)).max(40), z.null()]).optional(),
  }).strict()).min(1, 'Add at least one distributor').max(20),
  specialty: z.enum(SPECIALTIES).optional(),
}).strict()

export type MaterialsSearchCommand =
  | { kind: 'parse'; text: string; specialty?: (typeof SPECIALTIES)[number] }
  | {
      kind: 'search'
      materials: { name: string; qty: number; unit: string }[]
      distributors: { name: string; website?: string | null; categories?: string[] | null }[]
      specialty?: (typeof SPECIALTIES)[number]
    }

export function parseMaterialsSearch(input: unknown): { ok: true; data: MaterialsSearchCommand } | { ok: false; error: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Invalid JSON' }
  }
  if ((input as { action?: unknown }).action === 'parse') {
    const parsed = ParseSearchSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
    return { ok: true, data: { kind: 'parse', text: parsed.data.text, specialty: parsed.data.specialty } }
  }
  const parsed = PriceSearchSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
  return {
    ok: true,
    data: {
      kind: 'search',
      materials: parsed.data.materials,
      distributors: parsed.data.distributors,
      specialty: parsed.data.specialty,
    },
  }
}
