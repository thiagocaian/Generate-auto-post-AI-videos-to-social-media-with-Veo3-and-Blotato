-- 2026-11-13_security.sql — cytron-platform (awjagykdhrroeonewwgx)
-- Auditoria 2026-11-13: job_stats invoker, projects sem SELECT global,
-- revoga TRUNCATE/TRIGGER/REFERENCES restantes, aperta admin_clients,
-- search_path do trigger, MIME do bucket marketing-uploads.
-- Não adiciona company_id em projects (sem mudança quebrável de schema).
-- get_user_company_id: REVOKE EXECUTE de anon/PUBLIC; permanece em authenticated
-- (nenhuma página pública consulta companies/warehouse_* com a chave anon).
-- Rollback: 2026-11-13_security_rollback.sql
-- Snapshot: before_*.txt/json neste diretório.

-- 1) job_stats: security_invoker + só SELECT autenticado
drop view if exists public.job_stats;
create view public.job_stats
with (security_invoker = true) as
  select
    j.company_id,
    count(*) as total_jobs,
    count(*) filter (where j.status::text = 'enquiry') as enquiries,
    count(*) filter (where j.status::text = 'scheduled') as scheduled,
    count(*) filter (where j.status::text = 'in_progress') as in_progress,
    count(*) filter (where j.status::text = 'completed') as completed,
    count(*) filter (where j.status::text = any (array['invoiced'::text, 'paid'::text])) as invoiced,
    coalesce(sum(j.total_value), 0) as pipeline_value
  from public.jobs j
  group by j.company_id;

revoke all on table public.job_stats from public, anon, authenticated;
grant select on table public.job_stats to authenticated;

-- 2) projects: tira o USING (true). Sem company_id e sem ligação
--    work_orders/compliance, a leitura no browser passará a ir por
--    /api/projects (service role, só admin Cytron). RLS nega o resto.
drop policy if exists projects_select_authenticated on public.projects;

-- 3) TRUNCATE/TRIGGER/REFERENCES ignoram RLS — revogar em todas as tabelas/views públicas
revoke truncate, trigger, references on
  public.admin_clients,
  public.companies,
  public.company_members,
  public.compliance_reports,
  public.demo_requests,
  public.distributors,
  public.early_access_leads,
  public.invoices,
  public.job_stats,
  public.jobs,
  public.lead_audits,
  public.marketing_posts,
  public.material_searches,
  public.projects,
  public.purchase_orders,
  public.quotes,
  public.subcontractors,
  public.warehouse_items,
  public.warehouse_transactions,
  public.work_orders
from public, anon, authenticated;

-- 4) admin_clients: só service_role (RLS já sem policy)
revoke all on table public.admin_clients from public, anon, authenticated;

-- 5) get_user_company_id: tira EXECUTE de anon/PUBLIC; authenticated continua
--    (policies de empresa de usuários logados dependem disso)
revoke execute on function public.get_user_company_id() from public, anon;
grant execute on function public.get_user_company_id() to authenticated;

-- 6) trigger helper: search_path fixo; EXECUTE público desnecessário
alter function public.update_updated_at_column() set search_path = '';
revoke execute on function public.update_updated_at_column() from public, anon, authenticated;

-- 7) marketing-uploads: MIME + tamanho (permanece público — o app usa getPublicUrl)
update storage.buckets
   set file_size_limit = 10485760,
       allowed_mime_types = array[
         'image/jpeg','image/png','image/webp','image/gif',
         'video/mp4','video/webm','video/quicktime'
       ]
 where id = 'marketing-uploads';
