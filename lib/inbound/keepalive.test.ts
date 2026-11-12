import { describe, expect, it, vi } from 'vitest'
import { buildKeepaliveAlert, runKeepalive } from './keepalive'
import { pingSupabase } from './supabase-ping'

const NOW = new Date('2026-11-11T20:00:00.000Z')

describe('supabase keep-alive', () => {
  it('T-13 rejects a missing secret, a missing header, and the wrong bearer', async () => {
    const ping = vi.fn(async () => 'ok' as const)
    const alert = vi.fn(async () => {})
    expect((await runKeepalive({ authorization: null, secret: undefined, ping, alert })).status).toBe(401)
    expect((await runKeepalive({ authorization: 'Bearer secret', secret: '', ping, alert })).status).toBe(401)
    expect((await runKeepalive({ authorization: null, secret: 'secret', ping, alert })).body).toEqual({ error: 'Unauthorized' })
    expect((await runKeepalive({ authorization: 'Bearer wrong', secret: 'secret', ping, alert })).status).toBe(401)
    expect(ping).not.toHaveBeenCalled()
    expect(alert).not.toHaveBeenCalled()
  })

  it('T-20 and T-22 return 200 with wrote false and do not alert when both projects answer', async () => {
    const alert = vi.fn(async () => {})
    const result = await runKeepalive({
      authorization: 'Bearer secret',
      secret: 'secret',
      now: NOW,
      ping: async () => 'ok',
      alert,
    })
    expect(result).toEqual({
      status: 200,
      body: { ok: true, wrote: false, projects: { 'cytron-platform': 'ok', 'cytron-clients': 'ok' } },
    })
    expect(alert).not.toHaveBeenCalled()
  })

  it('T-21 returns 503 and alerts with the project name when one probe looks paused', async () => {
    const alerts: string[] = []
    const result = await runKeepalive({
      authorization: 'Bearer secret',
      secret: 'secret',
      now: NOW,
      ping: async project => (project === 'cytron-clients' ? 'paused' : 'ok'),
      alert: async text => { alerts.push(text) },
    })
    expect(result.status).toBe(503)
    expect(result.body).toMatchObject({
      ok: false,
      wrote: false,
      alerted: true,
      projects: { 'cytron-platform': 'ok', 'cytron-clients': 'paused' },
    })
    expect(alerts[0]).toContain('cytron-clients: paused')
    expect(alerts[0]).toContain(NOW.toISOString())
    expect(alerts[0]).not.toMatch(/@/)
    expect(alerts[0]).not.toContain('Bearer')
    expect(buildKeepaliveAlert({ 'cytron-platform': 'error', 'cytron-clients': 'ok' }, NOW)).toContain('cytron-platform: error')
  })

  it('probes with SELECT 1 and never sends the service key in the URL', async () => {
    const calls: Array<{ url: string; method: string; body: string }> = []
    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), method: init?.method ?? 'GET', body: String(init?.body ?? '') })
      expect(String(url)).not.toContain('service-key')
      return new Response('1', { status: 200 })
    })
    expect(await pingSupabase('https://clients.example', 'service-key', fetchImpl as typeof fetch)).toBe('ok')
    expect(calls[0]?.url).toBe('https://clients.example/rest/v1/rpc/cytron_select_1')
    expect(calls[0]?.method).toBe('POST')
    expect(calls[0]?.body).toBe('{}')

    const missing = vi.fn(async () => new Response(JSON.stringify({ code: 'PGRST202', message: 'Could not find the function public.cytron_select_1' }), { status: 404 }))
    expect(await pingSupabase('https://platform.example', 'service-key', missing as typeof fetch)).toBe('ok')

    const paused = vi.fn(async () => new Response(JSON.stringify({ message: 'Project is paused' }), { status: 503 }))
    expect(await pingSupabase('https://clients.example', 'service-key', paused as typeof fetch)).toBe('paused')
    expect(await pingSupabase(undefined, 'service-key', fetchImpl as typeof fetch)).toBe('error')
    expect(await pingSupabase('https://clients.example', 'service-key', (async () => { throw new Error('down') }) as typeof fetch)).toBe('error')
  })
})
