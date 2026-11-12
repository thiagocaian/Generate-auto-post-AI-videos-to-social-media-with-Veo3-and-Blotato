// Content approval queue rules (pure). Approving never publishes: distribution runs in n8n (Blotato, dry-run by default).
export type QueueAction = 'approve' | 'reject'
export const REVIEWABLE_STATUSES = ['draft', 'pending_approval'] as const

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type QueueDecision = { id: string; action: QueueAction; note: string | null }

export function parseQueueDecision(raw: unknown): { ok: true; data: QueueDecision } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, error: 'Invalid body' }
  const { id, action, note } = raw as Record<string, unknown>
  if (typeof id !== 'string' || !UUID.test(id)) return { ok: false, error: 'Invalid id' }
  if (action !== 'approve' && action !== 'reject') return { ok: false, error: 'Invalid action' }
  if (note !== undefined && note !== null && typeof note !== 'string') return { ok: false, error: 'Invalid note' }
  const trimmed = typeof note === 'string' ? note.trim().slice(0, 1000) : ''
  return { ok: true, data: { id, action, note: trimmed || null } }
}

export function nextStatus(current: string, action: QueueAction): string | null {
  if (!(REVIEWABLE_STATUSES as readonly string[]).includes(current)) return null
  return action === 'approve' ? 'approved' : 'rejected'
}
