import { describe, expect, it, vi } from 'vitest'
import { parseQualification, qualifyLeadWithGemini, type LeadQualifyInput } from '../gemini-lead'

const input: LeadQualifyInput = {
  name: 'Jane Smith',
  company: 'Acme Plumbing',
  industry: 'Trades',
  website: 'https://acme.example',
  monthlyEnquiries: '40',
  responseProcess: 'We miss calls while on the tools.',
  preferredDate: '2026-11-12',
  preferredTime: '10:00 AM',
}

const draft = {
  score: 72,
  fit: 'high',
  reasons: ['They described missed calls.'],
  questions: ['Who answers the phone?'],
  audit_title: 'Internal audit',
  audit_markdown: 'Missed calls were stated.',
}

function okBody() {
  return JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(draft) }] } }] })
}

describe('Gemini qualification (T-18)', () => {
  it('does not call the network when the model or key is missing', async () => {
    const fetchImpl = vi.fn()
    const result = await qualifyLeadWithGemini(input, { apiKey: '', model: 'gemini-test', fetchImpl })
    expect(result).toEqual({ ok: false, error: 'not_configured' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('parses strict JSON and rounds a fractional score', () => {
    const parsed = parseQualification(JSON.stringify({ ...draft, score: 72.4 }))
    expect(parsed.ok).toBe(true)
    if (parsed.ok) expect(parsed.data.score).toBe(72)
    expect(parseQualification('{"score":150,"fit":"high","reasons":[],"questions":[],"audit_title":"T","audit_markdown":"M"}').ok).toBe(false)
  })

  it('does not retry a 400 or a 403', async () => {
    for (const status of [400, 403]) {
      const fetchImpl = vi.fn(async () => new Response('no', { status }))
      const sleep = vi.fn(async () => {})
      const result = await qualifyLeadWithGemini(input, { apiKey: 'secret-key', model: 'gemini-test', fetchImpl: fetchImpl as typeof fetch, sleep })
      expect(result.ok).toBe(false)
      expect(fetchImpl).toHaveBeenCalledTimes(1)
      expect(sleep).not.toHaveBeenCalled()
    }
  })

  it('retries 429 and 503 with waits of 1s, 4s and 16s, and keeps the key out of the URL', async () => {
    const sleeps: number[] = []
    const urls: string[] = []
    let calls = 0
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      calls += 1
      urls.push(String(url))
      const headers = new Headers(init.headers)
      expect(headers.get('x-goog-api-key')).toBe('secret-key')
      expect(String(url)).not.toContain('secret-key')
      expect(String(init.body)).not.toContain('jane@')
      expect(String(init.body)).not.toContain('0400')
      if (calls < 4) return new Response('busy', { status: calls === 1 ? 429 : 503 })
      return new Response(okBody(), { status: 200, headers: { 'content-type': 'application/json' } })
    })
    const result = await qualifyLeadWithGemini(input, {
      apiKey: 'secret-key',
      model: 'gemini-test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      sleep: async ms => { sleeps.push(ms) },
    })
    expect(result.ok).toBe(true)
    expect(sleeps).toEqual([1000, 4000, 16000])
    expect(urls).toHaveLength(4)
    expect(urls[0]).toContain('/models/gemini-test:generateContent')
  })

  it('stops after three retries when every attempt is a 500', async () => {
    const fetchImpl = vi.fn(async () => new Response('down', { status: 500 }))
    const result = await qualifyLeadWithGemini(input, {
      apiKey: 'secret-key',
      model: 'gemini-test',
      fetchImpl: fetchImpl as typeof fetch,
      sleep: async () => {},
    })
    expect(result).toMatchObject({ ok: false, status: 500 })
    expect(fetchImpl).toHaveBeenCalledTimes(4)
  })
})
