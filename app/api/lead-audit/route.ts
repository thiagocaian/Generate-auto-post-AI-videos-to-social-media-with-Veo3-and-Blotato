import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { z } from 'zod'

const LeadAuditSchema = z.object({
  name: z.string().min(1).max(100),
  businessName: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  industry: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  monthlyEnquiries: z.string().max(50).optional(),
  responseProcess: z.string().max(1000).optional(),
})

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null)
  if (!raw) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const parsed = LeadAuditSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const data = parsed.data

  // Save to Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseUrl && serviceKey) {
    const admin = createClient(supabaseUrl, serviceKey)
    await admin.from('lead_audits').insert({
      name: data.name,
      business_name: data.businessName,
      email: data.email,
      phone: data.phone || null,
      industry: data.industry || null,
      website: data.website || null,
      monthly_enquiries: data.monthlyEnquiries || null,
      response_process: data.responseProcess || null,
      status: 'new',
    })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const resend = new Resend(resendKey)
    const fromAddress = process.env.RESEND_FROM_ADDRESS || 'CYTRON <hello@cytronai.com>'
    const notifyAddress = process.env.CYTRON_NOTIFY_EMAIL || 'labofantasma@gmail.com'

    await Promise.allSettled([
      // Confirmation to the lead
      resend.emails.send({
        from: fromAddress,
        to: data.email,
        subject: `Lead Audit Request Received — ${data.businessName}`,
        html: confirmationEmailHtml(data),
      }),
      // Internal notification
      resend.emails.send({
        from: fromAddress,
        to: notifyAddress,
        subject: `New Lead Audit: ${data.businessName} (${data.industry || 'Unknown industry'})`,
        html: internalNotificationHtml(data),
      }),
    ])
  }

  return NextResponse.json({ success: true })
}

function confirmationEmailHtml(data: { name: string; businessName: string; email: string; monthlyEnquiries?: string }) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#0a0a0a;color:#e5e5e5;padding:40px 20px;max-width:560px;margin:0 auto;">
  <div style="background:#111;border:1px solid rgba(136,108,255,0.2);border-radius:12px;padding:40px;">
    <div style="width:40px;height:40px;background:#886cff;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:24px;">
      <span style="color:white;font-weight:bold;font-size:18px;">C</span>
    </div>
    <h1 style="color:#fff;font-size:24px;margin:0 0 8px 0;">We received your request, ${data.name}.</h1>
    <p style="color:#888;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
      We&apos;re reviewing the lead flow for <strong style="color:#ccc;">${data.businessName}</strong> and will send you a personalised audit report within 24 hours.
    </p>
    <p style="color:#888;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
      Want to talk sooner? Book a time at your convenience:
    </p>
    <a href="https://cal.com/cytron" style="display:inline-block;background:#886cff;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:32px;">
      Book a Call →
    </a>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:0 0 24px 0;" />
    <p style="color:#555;font-size:12px;margin:0;">
      CYTRON · Gold Coast, Australia · <a href="https://cytronai.com" style="color:#886cff;text-decoration:none;">cytronai.com</a>
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
}) {
  const rows = [
    ['Name', data.name],
    ['Business', data.businessName],
    ['Email', data.email],
    ['Phone', data.phone || '—'],
    ['Industry', data.industry || '—'],
    ['Website', data.website || '—'],
    ['Monthly enquiries', data.monthlyEnquiries || '—'],
    ['Current process', data.responseProcess || '—'],
  ]
  const tableRows = rows.map(([k, v]) =>
    `<tr><td style="padding:8px 12px;color:#888;white-space:nowrap;">${k}</td><td style="padding:8px 12px;color:#e5e5e5;">${v}</td></tr>`
  ).join('')
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
