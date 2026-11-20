import { bearerToken, secretsMatch } from '@/lib/ip-hash'
import type { PingState } from './supabase-ping'

export type KeepaliveProject = 'cytron-platform' | 'cytron-clients'

export function buildKeepaliveAlert(projects: Record<KeepaliveProject, PingState>, now: Date): string {
  return [
    'Supabase keep-alive',
    `cytron-platform: ${projects['cytron-platform']}`,
    `cytron-clients: ${projects['cytron-clients']}`,
    now.toISOString(),
    'One project looks paused or did not answer.',
  ].join('\n')
}

export async function runKeepalive(input: {
  authorization: string | null
  secret: string | undefined
  now?: Date
  ping: (project: KeepaliveProject) => Promise<PingState>
  alert: (text: string) => Promise<void>
}): Promise<{ status: number; body: Record<string, unknown> }> {
  const provided = bearerToken(input.authorization)
  if (!input.secret || !provided || !secretsMatch(provided, input.secret)) {
    return { status: 401, body: { error: 'Unauthorized' } }
  }

  const now = input.now ?? new Date()
  const [platform, clients] = await Promise.all([
    input.ping('cytron-platform'),
    input.ping('cytron-clients'),
  ])
  const projects = { 'cytron-platform': platform, 'cytron-clients': clients }
  if (platform === 'ok' && clients === 'ok') {
    return { status: 200, body: { ok: true, projects, wrote: false } }
  }

  let alerted = false
  try {
    await input.alert(buildKeepaliveAlert(projects, now))
    alerted = true
  } catch {
    alerted = false
  }
  return { status: 503, body: { ok: false, projects, wrote: false, alerted } }
}
