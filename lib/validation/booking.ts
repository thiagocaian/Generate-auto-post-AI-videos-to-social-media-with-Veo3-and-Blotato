import { z } from 'zod'
import { formatZodError } from './errors'

const optionalText = (max: number) => z.union([z.string().trim().max(max), z.literal('')]).optional()

export const BookingSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().trim().email('Enter a valid email').max(200),
  phone: optionalText(40),
  business_name: optionalText(200),
  business_type: optionalText(100),
  preferred_date: optionalText(20),
  preferred_time: optionalText(20),
  message: optionalText(2000),
}).strict()

export type BookingInput = {
  name: string
  email: string
  phone: string | null
  business_name: string | null
  business_type: string | null
  preferred_date: string | null
  preferred_time: string | null
  message: string | null
}

function emptyToNull(value: string | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function parseBooking(input: unknown): { ok: true; data: BookingInput } | { ok: false; error: string } {
  const parsed = BookingSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) }
  const data = parsed.data
  return {
    ok: true,
    data: {
      name: data.name,
      email: data.email,
      phone: emptyToNull(data.phone),
      business_name: emptyToNull(data.business_name),
      business_type: emptyToNull(data.business_type),
      preferred_date: emptyToNull(data.preferred_date),
      preferred_time: emptyToNull(data.preferred_time),
      message: emptyToNull(data.message),
    },
  }
}
