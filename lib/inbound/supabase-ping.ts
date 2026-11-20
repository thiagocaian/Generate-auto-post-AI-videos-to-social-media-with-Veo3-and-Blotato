export type PingState = 'ok' | 'error' | 'paused'

/**
 * No-write database probe.
 * Calls public.cytron_select_1(), which is `SELECT 1`, when that function exists
 * (cytron-clients after the MVP migration). cytron-platform is not migrated.
 * A PostgREST "function not found" response still means Postgres answered.
 * A paused Free project fails before that, and is reported as paused.
 * Nothing is inserted.
 */
export async function pingSupabase(url: string | undefined, serviceKey: string | undefined, fetchImpl: typeof fetch = fetch): Promise<PingState> {
  if (!url || !serviceKey) return 'error'
  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/rpc/cytron_select_1`
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      redirect: 'manual',
      cache: 'no-store',
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: '{}',
      signal: AbortSignal.timeout(8_000),
    })
    if (response.status >= 300 && response.status < 400) return 'error'
    const snippet = (await response.text()).slice(0, 400)
    if (/paus|inactive/i.test(snippet)) return 'paused'
    if (response.ok) return 'ok'
    if (response.status === 404 && /PGRST202|Could not find the function/i.test(snippet)) return 'ok'
    return 'error'
  } catch {
    return 'error'
  }
}
