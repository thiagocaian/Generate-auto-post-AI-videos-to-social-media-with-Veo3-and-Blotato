import { z } from 'zod'

export const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
] as const

/** Brisbane civil date (UTC+10, no DST). Matches the previous lead-audit route. */
export function brisbaneDay(now: Date, offsetDays = 0): string {
  const shifted = new Date(now.getTime() + (10 * 60 + offsetDays * 24 * 60) * 60 * 1000)
  return shifted.toISOString().slice(0, 10)
}

export function createLeadAuditSchema(now = new Date()) {
  const min = brisbaneDay(now, 0)
  const max = brisbaneDay(now, 14)
  return z.object({
    name: z.string().trim().min(1).max(100),
    businessName: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(200),
    phone: z.string().max(30).optional(),
    industry: z.string().max(100).optional(),
    website: z.string().url().optional().or(z.literal('')),
    monthlyEnquiries: z.string().max(50).optional(),
    responseProcess: z.string().max(1000).optional(),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date'),
    preferredTime: z.enum(TIME_SLOTS),
  }).superRefine((value, ctx) => {
    if (value.preferredDate < min || value.preferredDate > max) {
      ctx.addIssue({ code: 'custom', path: ['preferredDate'], message: 'Choose a date in the next 14 days' })
    }
  })
}

export type LeadAuditInput = z.infer<ReturnType<typeof createLeadAuditSchema>>

export function honeypotFilled(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false
  const value = (raw as Record<string, unknown>).honeypot
  if (typeof value === 'string') return value.trim().length > 0
  return value != null && value !== false
}

export function consentGranted(raw: unknown): boolean {
  return !!raw && typeof raw === 'object' && (raw as Record<string, unknown>).consent === true
}
