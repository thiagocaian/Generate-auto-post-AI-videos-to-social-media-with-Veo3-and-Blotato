const PHONE_LIKE = /\+?\d[\d\s()-]{7,}\d/g
const EMAIL_LIKE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi

export function scrubAlertText(value: string, max = 140): string {
  return value
    .replace(/[\r\n]+/g, ' ')
    .replace(EMAIL_LIKE, '[redacted]')
    .replace(PHONE_LIKE, '[redacted]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

export function safeAdminUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return ''
    return parsed.toString()
  } catch {
    return ''
  }
}

export function buildLeadAlert(input: {
  name: string
  company: string
  fit: string | null
  score: number | null
  summary: string | null
  adminUrl: string
  qualificationFailed?: boolean
}): string {
  const name = scrubAlertText(input.name, 80) || 'Unknown'
  const company = scrubAlertText(input.company, 80) || 'Unknown'
  const summary = input.qualificationFailed
    ? 'Qualification did not finish. The lead is saved.'
    : scrubAlertText(input.summary || 'Saved for review.', 140)
  const fit = input.fit && ['high', 'medium', 'low', 'unknown'].includes(input.fit) ? input.fit : 'unknown'
  const score = input.score == null ? 'n/a' : String(input.score)
  const link = safeAdminUrl(input.adminUrl)
  const lines = [
    input.qualificationFailed ? 'Free-audit request saved' : 'New free-audit request',
    `${name} · ${company}`,
    input.qualificationFailed ? summary : `Fit ${fit} · score ${score}`,
    input.qualificationFailed ? '' : summary,
    link,
  ].filter(Boolean)
  return lines.join('\n').slice(0, 500)
}

export function auditAdminUrl(leadId: string, requestOrigin: string): string {
  const origin = requestOrigin.replace(/\/$/, '')
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  const base = origin || site || 'https://cytronai.com'
  return `${base}/admin/audits/${leadId}`
}

export async function sendTelegramMessage(text: string, options?: {
  fetchImpl?: typeof fetch
  token?: string
  chatId?: string
}): Promise<void> {
  const token = options?.token ?? process.env.TELEGRAM_BOT_TOKEN
  const chatId = options?.chatId ?? process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) throw new Error('not_configured')
  const fetchImpl = options?.fetchImpl ?? fetch
  const response = await fetchImpl(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 500),
      disable_web_page_preview: true,
    }),
  })
  if (!response.ok) throw new Error(`Telegram HTTP ${response.status}`)
}
