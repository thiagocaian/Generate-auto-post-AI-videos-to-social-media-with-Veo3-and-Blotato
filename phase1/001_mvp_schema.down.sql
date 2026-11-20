-- =============================================================================
-- 001_mvp_schema.down.sql
-- Rollback da proposta 001_mvp_schema.sql.
-- Status: PROPOSTA. NÃO EXECUTAR neste turno.
-- =============================================================================
-- NÃO dropar public.clients (a tabela já existia antes deste MVP).
-- NÃO tocar no cytron-platform nem em public.lead_audits.
-- NÃO apagar dados de admin_clients.
-- Só é seguro se não houver leads reais que se queira conservar: este DOWN
-- apaga leads, rascunhos, activities, workflow_runs e rate_limits.
-- =============================================================================

BEGIN;

DROP FUNCTION IF EXISTS public.cytron_select_1();
DROP FUNCTION IF EXISTS public.cytron_retain_mvp_data();

DROP TABLE IF EXISTS public.rate_limits CASCADE;
DROP TABLE IF EXISTS public.workflow_runs CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.audit_drafts CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;

DROP TRIGGER IF EXISTS cytron_clients_set_updated_at ON public.clients;
DROP INDEX IF EXISTS public.clients_tenant_email_lower_uidx;
DROP INDEX IF EXISTS public.clients_tenant_id_idx;

ALTER TABLE public.clients
  DROP COLUMN IF EXISTS tenant_id;

DROP TRIGGER IF EXISTS cytron_tenants_set_updated_at ON public.tenants;
DROP TABLE IF EXISTS public.tenants CASCADE;

DROP FUNCTION IF EXISTS public.cytron_set_updated_at();

COMMIT;
