import { Resend } from 'resend'
import { COMPANY_ADMIN_EMAILS } from '@/lib/company-admin'

const UNCONFIGURED_RESEND_KEY = 're_CHANGE_ME'
const DEFAULT_FROM_ADDRESS = 'CYTRON <hello@cytronai.com>'

export type Mailer = {
  resend: Resend
  fromAddress: string
  notifyAddress: string
}

/**
 * Resend client plus the from / internal notify addresses.
 * Returns null when the key is missing or still the placeholder, matching lead-audit.
 */
export function getMailer(): Mailer | null {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey || resendKey === UNCONFIGURED_RESEND_KEY) return null
  return {
    resend: new Resend(resendKey),
    fromAddress: process.env.RESEND_FROM_ADDRESS || DEFAULT_FROM_ADDRESS,
    notifyAddress: process.env.CYTRON_NOTIFY_EMAIL || COMPANY_ADMIN_EMAILS[0],
  }
}

/** Escape user-supplied text before it is interpolated into email HTML. */
export function escapeHtml(str: string | undefined | null): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export function renderNotificationHtml(title: string, rows: ReadonlyArray<readonly [string, string]>): string {
  const tableRows = rows
    .map(([label, value]) =>
      `<tr>
        <td style="padding:8px 12px;color:#888;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;color:#e5e5e5;">${escapeHtml(value)}</td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#0a0a0a;color:#e5e5e5;padding:40px 20px;max-width:600px;margin:0 auto;">
  <div style="background:#111;border:1px solid rgba(136,108,255,0.2);border-radius:12px;padding:32px;">
    <h2 style="color:#886cff;margin:0 0 20px 0;">${escapeHtml(title)}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${tableRows}
    </table>
  </div>
</body>
</html>`
}

/**
 * Internal notification. Never throws: the lead is already saved, so a mail
 * failure is logged and the HTTP request still succeeds.
 */
export async function sendInternalNotification(params: {
  label: string
  subject: string
  html: string
  replyTo: string
}): Promise<void> {
  try {
    const mailer = getMailer()
    if (!mailer) {
      console.warn(`[${params.label}] RESEND_API_KEY not configured — emails skipped`)
      return
    }

    const result = await mailer.resend.emails.send({
      from: mailer.fromAddress,
      to: mailer.notifyAddress,
      replyTo: params.replyTo,
      subject: params.subject,
      html: params.html,
    })
    if (result.error) {
      console.error(`[${params.label}] Email notification error:`, result.error)
    }
  } catch (error) {
    console.error(`[${params.label}] Email notification rejected:`, error)
  }
}
