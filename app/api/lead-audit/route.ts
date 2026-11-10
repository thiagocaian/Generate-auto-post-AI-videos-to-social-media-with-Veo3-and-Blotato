import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { z } from 'zod'
import { COMPANY_ADMIN_EMAILS } from '@/lib/company-admin'
import { PUBLIC_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS, clientIp, createRateLimiter } from '@/lib/rate-limit'
import {
  ALREADY_REQUESTED_CODE,
  ALREADY_REQUESTED_MESSAGE,
  findExistingAudit,
  isUniqueViolation,
  type AuditColumn,
} from '@/lib/validation/lead-audit-limit'

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
] as const

function brisbaneDate(offsetDays = 0): string {
  const shifted = new Date(Date.now() + (10 * 60 + offsetDays * 24 * 60) * 60 * 1000)
  return shifted.toISOString().slice(0, 10)
}

const LeadAuditSchema = z.object({
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
  const min = brisbaneDate(0)
  const max = brisbaneDate(14)
  if (value.preferredDate < min || value.preferredDate > max) {
    ctx.addIssue({ code: 'custom', path: ['preferredDate'], message: 'Choose a date in the next 14 days' })
  }
})

// In-memory limiter (per IP, max 3 requests per hour).
// Note: resets on cold start. Provides basic abuse prevention, not a hard guarantee.
const checkRateLimit = createRateLimiter(PUBLIC_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS)

// ─── HTML escaping (prevent HTML injection in emails) ─────────────────────────
function esc(str: string | undefined | null): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = clientIp(req.headers.get('x-forwarded-for'))
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const raw = await req.json().catch(() => null)
  if (!raw) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const parsed = LeadAuditSchema.safeParse(raw)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || 'Check the form and try again.'
    return NextResponse.json({ error: message }, { status: 422 })
  }

  const data = parsed.data

  // Save to Supabase — required. Fail hard if this doesn't work.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    console.error('[lead-audit] Missing Supabase env vars')
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const admin = createClient(supabaseUrl, serviceKey)

  // One free audit per email OR per business (normalised). Fail closed on storage errors.
  const lookup = async (column: AuditColumn, value: string) => {
    const { data: rows, error } = await admin.from('lead_audits').select('id').eq(column, value).limit(1)
    if (error) throw new Error(error.message)
    return (rows?.length ?? 0) > 0
  }
  try {
    const existing = await findExistingAudit(lookup, data.email, data.businessName)
    if (existing.blocked) {
      return NextResponse.json({ error: ALREADY_REQUESTED_MESSAGE, code: ALREADY_REQUESTED_CODE }, { status: 409 })
    }
  } catch (err) {
    console.error('[lead-audit] Duplicate check failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Could not save your request. Please try again.' }, { status: 500 })
  }

  const { error: dbError } = await admin.from('lead_audits').insert({
    name: data.name,
    business_name: data.businessName,
    email: data.email,
    phone: data.phone || null,
    industry: data.industry || null,
    website: data.website || null,
    monthly_enquiries: data.monthlyEnquiries || null,
    response_process: data.responseProcess || null,
    preferred_date: data.preferredDate,
    preferred_time: data.preferredTime,
    status: 'new',
  })

  if (isUniqueViolation(dbError)) {
    return NextResponse.json({ error: ALREADY_REQUESTED_MESSAGE, code: ALREADY_REQUESTED_CODE }, { status: 409 })
  }
  if (dbError) {
    console.error('[lead-audit] DB insert failed:', dbError.message)
    return NextResponse.json({ error: 'Could not save your request. Please try again.' }, { status: 500 })
  }

  // Send emails — best-effort. Lead is already saved; email failure is non-fatal.
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey && resendKey !== 're_CHANGE_ME') {
    const resend = new Resend(resendKey)
    const fromAddress = process.env.RESEND_FROM_ADDRESS || 'CYTRON <hello@cytronai.com>'
    const notifyAddress = process.env.CYTRON_NOTIFY_EMAIL || COMPANY_ADMIN_EMAILS[0]

    const results = await Promise.allSettled([
      resend.emails.send({
        from: fromAddress,
        to: data.email,
        subject: `Lead Audit Request Received — ${data.businessName}`,
        html: confirmationEmailHtml(data),
      }),
      resend.emails.send({
        from: fromAddress,
        to: notifyAddress,
        subject: `New Lead Audit: ${data.businessName} (${data.industry || 'Unknown industry'})`,
        html: internalNotificationHtml(data),
      }),
    ])

    // Resend returns { error } without rejecting — check both settled status and response body.
    let emailSent = true
    results.forEach((r, i) => {
      const label = i === 0 ? 'confirmation' : 'notification'
      if (r.status === 'rejected') {
        console.error(`[lead-audit] Email ${label} rejected:`, r.reason)
        if (i === 0) emailSent = false
      } else if (r.value?.error) {
        console.error(`[lead-audit] Email ${label} error:`, r.value.error)
        if (i === 0) emailSent = false
      }
    })

    return NextResponse.json({ success: true, emailSent })
  } else {
    console.warn('[lead-audit] RESEND_API_KEY not configured — emails skipped')
  }

  return NextResponse.json({ success: true, emailSent: false })
}

function confirmationEmailHtml(data: { name: string; businessName: string; preferredDate: string; preferredTime: string }) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#0a0a0a;color:#e5e5e5;padding:40px 20px;max-width:560px;margin:0 auto;">
  <div style="background:#111;border:1px solid rgba(136,108,255,0.2);border-radius:12px;padding:40px;">
    <div style="width:40px;height:40px;background:#886cff;border-radius:8px;margin-bottom:24px;display:flex;align-items:center;justify-content:center;">
      <span style="color:white;font-weight:bold;font-size:18px;">C</span>
    </div>
    <h1 style="color:#fff;font-size:22px;margin:0 0 12px 0;">We received your request, ${esc(data.name)}.</h1>
    <p style="color:#888;font-size:15px;line-height:1.6;margin:0 0 20px 0;">
      We&apos;re reviewing the request for <strong style="color:#ccc;">${esc(data.businessName)}</strong>.
      Your preferred time is <strong style="color:#ccc;">${esc(data.preferredDate)} at ${esc(data.preferredTime)}</strong>.
      We&apos;ll confirm the audit within one business day.
    </p>
    <p style="color:#888;font-size:15px;line-height:1.6;margin:0 0 28px 0;">
      In the meantime, reply to this email if you have any questions.
    </p>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:0 0 24px 0;" />
    <p style="color:#555;font-size:12px;margin:0;">
      CYTRON &middot; Gold Coast, Australia &middot;
      <a href="https://cytronai.com" style="color:#886cff;text-decoration:none;">cytronai.com</a>
    </p>
  </div>
</body>
</html>`
}

function internalNotificationHtml(data: {
  name: string
  businessName: string
  email: string
  phone?: string
  industry?: string
  website?: string
  monthlyEnquiries?: string
  responseProcess?: string
  preferredDate: string
  preferredTime: string
}) {
  const rows: [string, string][] = [
    ['Name', data.name],
    ['Business', data.businessName],
    ['Email', data.email],
    ['Phone', data.phone || '—'],
    ['Industry', data.industry || '—'],
    ['Website', data.website || '—'],
    ['Monthly enquiries', data.monthlyEnquiries || '—'],
    ['Preferred date', data.preferredDate],
    ['Preferred time', data.preferredTime],
    ['Current process', data.responseProcess || '—'],
  ]
  const tableRows = rows
    .map(([k, v]) =>
      `<tr>
        <td style="padding:8px 12px;color:#888;white-space:nowrap;vertical-align:top;">${esc(k)}</td>
        <td style="padding:8px 12px;color:#e5e5e5;">${esc(v)}</td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#0a0a0a;color:#e5e5e5;padding:40px 20px;max-width:600px;margin:0 auto;">
  <div style="background:#111;border:1px solid rgba(136,108,255,0.2);border-radius:12px;padding:32px;">
    <h2 style="color:#886cff;margin:0 0 20px 0;">New Lead Audit Request</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${tableRows}
    </table>
  </div>
</body>
</html>`
}
