import { z } from 'zod'

export const LEAD_PROMPT_VERSION = 'lead_intake_v1'

const RETRY_DELAYS_MS = [1000, 4000, 16000]
const MAX_ATTEMPTS = 1 + RETRY_DELAYS_MS.length

const FitSchema = z.enum(['high', 'medium', 'low', 'unknown'])

const QualificationSchema = z.object({
  score: z.number().min(0).max(100),
  fit: FitSchema,
  reasons: z.array(z.string()).max(12),
  questions: z.array(z.string()).max(12),
  audit_title: z.string().trim().min(1).max(200),
  audit_markdown: z.string().trim().min(1).max(20000),
})

export type LeadQualification = z.infer<typeof QualificationSchema>

export type LeadQualifyInput = {
  name: string
  company: string
  industry: string | null
  website: string | null
  monthlyEnquiries: string | null
  responseProcess: string | null
  preferredDate: string
  preferredTime: string
}

export type QualifyResult =
  | { ok: true; data: LeadQualification }
  | { ok: false; error: string; status?: number }

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    score: { type: 'INTEGER' },
    fit: { type: 'STRING', enum: ['high', 'medium', 'low', 'unknown'] },
    reasons: { type: 'ARRAY', items: { type: 'STRING' } },
    questions: { type: 'ARRAY', items: { type: 'STRING' } },
    audit_title: { type: 'STRING' },
    audit_markdown: { type: 'STRING' },
  },
  required: ['score', 'fit', 'reasons', 'questions', 'audit_title', 'audit_markdown'],
}

const SYSTEM_RULES = [
  'You qualify an inbound free-audit request for Cytron, an Australian automation studio.',
  'Return only JSON that matches the schema.',
  'Do not invent metrics, customers, revenue, headcount, or pains the lead did not state.',
  'If the submission is too thin to judge, set fit to "unknown" and say what is missing.',
  'audit_markdown is an internal draft for Cytron staff. It is not a message to send to the lead.',
  `prompt_version: ${LEAD_PROMPT_VERSION}`,
].join('\n')

function clip(value: string, max: number): string {
  return value.trim().slice(0, max)
}

export function parseQualification(payload: unknown): QualifyResult {
  let parsed: unknown
  try {
    parsed = typeof payload === 'string' ? JSON.parse(payload) : payload
  } catch {
    return { ok: false, error: 'invalid_json' }
  }
  const result = QualificationSchema.safeParse({
    ...(parsed && typeof parsed === 'object' ? parsed as object : {}),
    score: parsed && typeof parsed === 'object' && 'score' in parsed
      ? Math.round(Number((parsed as { score: unknown }).score))
      : undefined,
  })
  if (!result.success) return { ok: false, error: 'invalid_json' }
  return {
    ok: true,
    data: {
      ...result.data,
      score: Math.round(result.data.score),
      reasons: result.data.reasons.map(item => clip(item, 500)).filter(Boolean).slice(0, 8),
      questions: result.data.questions.map(item => clip(item, 500)).filter(Boolean).slice(0, 8),
      audit_title: clip(result.data.audit_title, 200),
      audit_markdown: clip(result.data.audit_markdown, 20000),
    },
  }
}

function candidateText(body: unknown): string {
  if (!body || typeof body !== 'object') return ''
  const candidates = (body as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates
  return candidates?.[0]?.content?.parts?.map(part => part.text ?? '').join('') ?? ''
}

function shouldRetry(status: number): boolean {
  return status === 408 || status === 429 || status >= 500
}

export async function qualifyLeadWithGemini(input: LeadQualifyInput, options: {
  apiKey: string | undefined
  model: string | undefined
  fetchImpl?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  timeoutMs?: number
}): Promise<QualifyResult> {
  const apiKey = options.apiKey?.trim()
  const model = options.model?.trim()
  if (!apiKey || !model) return { ok: false, error: 'not_configured' }

  const fetchImpl = options.fetchImpl ?? fetch
  const sleep = options.sleep ?? ((ms: number) => new Promise(resolve => setTimeout(resolve, ms)))
  const timeoutMs = options.timeoutMs ?? 20_000
  let lastStatus = 0

  const lead = {
    name: input.name,
    company: input.company,
    industry: input.industry,
    website: input.website,
    monthlyEnquiries: input.monthlyEnquiries,
    responseProcess: input.responseProcess,
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    prompt_version: LEAD_PROMPT_VERSION,
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    if (attempt > 1) await sleep(RETRY_DELAYS_MS[attempt - 2] ?? 16_000)
    try {
      const response = await fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_RULES }] },
            contents: [{ role: 'user', parts: [{ text: JSON.stringify(lead) }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
              responseSchema: RESPONSE_SCHEMA,
            },
          }),
          signal: AbortSignal.timeout(timeoutMs),
        },
      )
      if (shouldRetry(response.status)) {
        lastStatus = response.status
        continue
      }
      if (!response.ok) return { ok: false, error: `Gemini HTTP ${response.status}`, status: response.status }
      const body = await response.json().catch(() => null)
      const parsed = parseQualification(candidateText(body))
      if (!parsed.ok) return parsed
      return parsed
    } catch {
      lastStatus = 0
    }
  }

  return { ok: false, error: lastStatus ? `Gemini HTTP ${lastStatus}` : 'network', status: lastStatus || undefined }
}

export function qualificationSummary(data: LeadQualification): string {
  const line = data.reasons.map(reason => reason.replace(/[\r\n]+/g, ' ').trim()).filter(Boolean).join(' ')
  return (line || 'Internal draft ready.').slice(0, 500)
}
