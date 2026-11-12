import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const root = path.resolve(__dirname, '../..')

function read(relative: string) {
  return fs.readFileSync(path.join(root, relative), 'utf8')
}

function stripComments(sql: string) {
  return sql.replace(/--.*$/gm, '')
}

const SECRET_NAMES = [
  'CLIENTS_SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'TELEGRAM_BOT_TOKEN',
  'CRON_SECRET',
  'IP_HASH_SECRET',
]

describe('phase 1 contracts', () => {
  it('T-07 keeps Resend off the lead path', () => {
    const files = [
      'app/api/lead-audit/route.ts',
      'lib/inbound/process-lead-audit.ts',
      'lib/gemini-lead.ts',
      'lib/telegram-notify.ts',
      'app/api/admin/audits/route.ts',
      'app/api/admin/audits/[id]/route.ts',
      'app/api/admin/audits/[id]/note/route.ts',
    ]
    for (const file of files) {
      const source = read(file)
      expect(source, file).not.toMatch(/from ['"]resend['"]/)
      expect(source, file).not.toMatch(/emails\.send/)
      expect(source, file).not.toMatch(/RESEND_API_KEY/)
      expect(source, file).not.toMatch(/to:\s*data\.email/)
    }
  })

  it('T-08 keeps service secrets out of client modules', () => {
    const clientFiles = [
      'components/marketing/audit-form.tsx',
      'components/marketing/contact-page.tsx',
      'app/admin/audits/page.tsx',
      'app/admin/audits/[id]/page.tsx',
      'lib/inbound/consent.ts',
    ]
    for (const file of clientFiles) {
      const source = read(file)
      for (const name of SECRET_NAMES) expect(source, file).not.toContain(name)
    }
    const server = read('lib/clients-supabase.ts')
    expect(server).toContain("import 'server-only'")
    expect(server).toContain('CLIENTS_SUPABASE_URL')
    expect(server).toContain('CLIENTS_SUPABASE_SERVICE_ROLE_KEY')
  })

  it('T-12 enables RLS, revokes anon and authenticated, and creates no policy', () => {
    const sql = stripComments(read('phase1/001_mvp_schema.sql')).toLowerCase()
    expect(sql).toContain('enable row level security')
    expect(sql).toContain('revoke all on table')
    expect(sql).toContain('anon, authenticated')
    expect(sql).not.toContain('create policy')
    expect(sql).not.toContain('keepalive_pings')
    expect(sql).toContain('select 1')
    expect(read('supabase/migrations/20261111120000_mvp_inbound_tenant.sql')).toBe(read('phase1/001_mvp_schema.sql'))
  })

  it('T-14 keeps the public form on the site API', () => {
    const form = read('components/marketing/audit-form.tsx')
    expect(form).toContain('"/api/lead-audit"')
    expect(form).not.toContain('supabase.co')
    expect(form).toContain('honeypot')
    expect(form).toContain('consent: true')
  })

  it('T-23 keeps a single daily Hobby cron', () => {
    const config = JSON.parse(read('vercel.json')) as { crons: Array<{ path: string; schedule: string }> }
    expect(config.crons).toHaveLength(1)
    expect(config.crons[0]).toEqual({ path: '/api/internal/supabase-keepalive', schedule: '0 20 * * *' })
    expect(config.crons[0]?.schedule).not.toBe('0 * * * *')
    expect(config.crons[0]?.schedule.includes('*/')).toBe(false)
  })

  it('T-24 keeps the Actions fallback daily and quiet', () => {
    const yaml = read('.github/workflows/supabase-keepalive.yml')
    expect(yaml).toContain("cron: '30 21 * * *'")
    expect(yaml).toContain('secrets.CRON_SECRET')
    expect(yaml).toContain('secrets.KEEPALIVE_URL')
    expect(yaml).toContain('contents: read')
    expect(yaml).not.toMatch(/echo .*(CRON_SECRET|KEEPALIVE_URL|Authorization)/)
    expect(yaml).not.toContain('0 * * * *')
  })

  it('T-31 exposes only POST for lead-audit and GET for keep-alive', async () => {
    const lead = await import('@/app/api/lead-audit/route')
    const keep = await import('@/app/api/internal/supabase-keepalive/route')
    expect(Object.keys(lead).sort()).toEqual(['GET', 'POST', 'dynamic', 'runtime'])
    const leadGet = lead.GET()
    expect(leadGet.status).toBe(405)
    expect(await leadGet.text()).toBe('')
    const keepPost = keep.POST()
    expect(keepPost.status).toBe(405)
    expect(keep.GET).toBeTypeOf('function')
  })

  it('T-32 does not touch n8n from the new routes', () => {
    expect(read('app/api/lead-audit/route.ts')).not.toContain('n8n')
    expect(read('app/api/internal/supabase-keepalive/route.ts')).not.toContain('n8n')
    expect(fs.existsSync(path.join(root, 'n8n-workflows/warehouse-alert-workflow.json'))).toBe(true)
  })

  it('T-35 keeps the down migration from dropping clients or the platform project', () => {
    const down = read('phase1/001_mvp_schema.down.sql')
    const executable = stripComments(down).toLowerCase()
    expect(executable).not.toContain('cytron-platform')
    expect(executable).not.toMatch(/drop table[^;]*\bclients\b/)
    expect(down.toLowerCase()).toContain('drop column if exists tenant_id')
    expect(down.toLowerCase()).toContain('drop function if exists public.cytron_select_1')
    expect(executable).not.toContain('lead_audits')
  })
})
