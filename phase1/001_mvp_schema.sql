-- =============================================================================
-- 001_mvp_schema.sql
-- Projeto: cytron-clients (psjovowgggbmlhrdesiy), Sydney, plano Free.
-- Status: PROPOSTA. NÃO EXECUTAR neste turno.
-- Tipo: RECOMENDAÇÃO (schema) com âncoras em FATO do catálogo lido em
--       11/11/2026 (PLAN-v1 seção D, AUDIT-PHASE0, PHASE1-MVP-PLAN).
-- Rollback: phase1/001_mvp_schema.down.sql
-- =============================================================================
-- NÃO aplicar sem: (1) OK escrito do Thiago às decisões retransmitidas;
-- (2) autorização explícita para migration no cytron-clients;
-- (3) revisão do Sentinel.
-- NÃO correr este arquivo no cytron-platform.
-- NÃO copiar as 3 linhas de cytron-platform.admin_clients.
-- NÃO dropar public.clients.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Função de updated_at
-- Nome próprio (cytron_*) para não colidir com um trigger já documentado no
-- CRUD de clients (PLAN-v1: o brief cita um trigger de updated_at — FATO do
-- brief, não inspecionado nome a nome neste turno). Dois triggers que só
-- escrevem now() em updated_at são inofensivos.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cytron_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- public.tenants
-- RECOMENDAÇÃO: um tenant por cliente pagante no futuro; o MVP semeia só a
-- Cytron (slug = 'cytron') e grava esse tenant_id em todas as linhas.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS cytron_tenants_set_updated_at ON public.tenants;
CREATE TRIGGER cytron_tenants_set_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.cytron_set_updated_at();

INSERT INTO public.tenants (slug, name, status)
VALUES ('cytron', 'Cytron AI Solutions', 'active')
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- public.clients (JÁ EXISTE — FATO, PLAN-v1 seção D)
-- Colunas atuais: id, name, email, phone, company, notes, status, created_at,
-- updated_at, archived_at. 0 linhas na leitura de 11/11/2026. Sem tenant_id.
-- Backfill é vazio; por isso o NOT NULL depois do UPDATE é seguro no estado
-- inspecionado (PRESSUPOSTO: continua vazia na hora de aplicar).
-- -----------------------------------------------------------------------------
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);

UPDATE public.clients
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'cytron')
WHERE tenant_id IS NULL;

ALTER TABLE public.clients
  ALTER COLUMN tenant_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS clients_tenant_id_idx
  ON public.clients (tenant_id);

-- Índice por tenant + email em minúsculas.
-- RECOMENDAÇÃO: se o CRUD já tiver um UNIQUE global em lower(email), o
-- implementador deve listar os índices (\d public.clients) antes de aplicar.
-- Um UNIQUE global impediria o mesmo email em dois tenants futuros; neste MVP
-- há um só tenant, então os dois podem coexistir. Não dropar índice alheio.
CREATE UNIQUE INDEX IF NOT EXISTS clients_tenant_email_lower_uidx
  ON public.clients (tenant_id, lower(email))
  WHERE email IS NOT NULL AND length(trim(email)) > 0;

DROP TRIGGER IF EXISTS cytron_clients_set_updated_at ON public.clients;
CREATE TRIGGER cytron_clients_set_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.cytron_set_updated_at();

-- -----------------------------------------------------------------------------
-- public.leads
-- Colunas alinhadas ao PLAN-v1 seção D + campos do formulário atual
-- (FATO do LeadAuditSchema em app/api/lead-audit/route.ts na branch
-- cursor/cytronai-audit-booking-1b52): industry, monthlyEnquiries,
-- responseProcess, preferredDate, preferredTime, businessName → company.
-- email_normalized / company_normalized repetem a normalização de
-- lib/validation/lead-audit-limit.ts (FATO) para manter o 409
-- "uma auditoria grátis por email OU empresa".
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  email text NOT NULL CHECK (length(trim(email)) > 0),
  phone text,
  company text NOT NULL CHECK (length(trim(company)) > 0),
  website text,
  message text,
  industry text,
  monthly_enquiries text,
  response_process text,
  preferred_date date,
  preferred_time text,
  source text NOT NULL DEFAULT 'site_form',
  status text NOT NULL DEFAULT 'stored' CHECK (
    status IN (
      'received',
      'stored',
      'qualified',
      'disqualified',
      'audit_drafted',
      'awaiting_approval',
      'contacted',
      'converted',
      'archived'
    )
  ),
  score integer CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  fit text CHECK (fit IS NULL OR fit IN ('high', 'medium', 'low', 'unknown')),
  qualification_summary text,
  qualification_json jsonb,
  consent_at timestamptz NOT NULL,
  consent_text text NOT NULL,
  ip_hash text,
  user_agent text,
  converted_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  model text,
  prompt_version text,
  email_normalized text GENERATED ALWAYS AS (lower(btrim(email))) STORED,
  company_normalized text GENERATED ALWAYS AS (
    btrim(regexp_replace(lower(company), '[^a-z0-9]+', ' ', 'g'))
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS leads_tenant_email_normalized_uidx
  ON public.leads (tenant_id, email_normalized);

CREATE UNIQUE INDEX IF NOT EXISTS leads_tenant_company_normalized_uidx
  ON public.leads (tenant_id, company_normalized)
  WHERE company_normalized <> '';

CREATE INDEX IF NOT EXISTS leads_tenant_id_idx
  ON public.leads (tenant_id);

CREATE INDEX IF NOT EXISTS leads_tenant_status_created_idx
  ON public.leads (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS leads_converted_client_id_idx
  ON public.leads (converted_client_id)
  WHERE converted_client_id IS NOT NULL;

DROP TRIGGER IF EXISTS cytron_leads_set_updated_at ON public.leads;
CREATE TRIGGER cytron_leads_set_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.cytron_set_updated_at();

-- -----------------------------------------------------------------------------
-- public.audit_drafts
-- status inicial sempre 'draft'. Sem transição para 'sent' neste MVP
-- (decisão retransmitida: sem email automático ao lead).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title text,
  body_markdown text,
  status text NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'approved', 'rejected', 'sent')
  ),
  model text,
  prompt_version text,
  approved_by text,
  approved_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_drafts_tenant_id_idx
  ON public.audit_drafts (tenant_id);

CREATE INDEX IF NOT EXISTS audit_drafts_lead_id_idx
  ON public.audit_drafts (lead_id);

CREATE INDEX IF NOT EXISTS audit_drafts_tenant_status_idx
  ON public.audit_drafts (tenant_id, status);

DROP TRIGGER IF EXISTS cytron_audit_drafts_set_updated_at ON public.audit_drafts;
CREATE TRIGGER cytron_audit_drafts_set_updated_at
  BEFORE UPDATE ON public.audit_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.cytron_set_updated_at();

-- -----------------------------------------------------------------------------
-- public.activities — trilha imutável (sem UPDATE/DELETE na API).
-- Sem trigger de updated_at: a linha não deve mudar.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (
    type IN (
      'form_submit',
      'qualification',
      'telegram_alert',
      'audit_draft',
      'note',
      'status_change',
      'email_draft'
    )
  ),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activities_tenant_lead_idx
  ON public.activities (tenant_id, lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS activities_tenant_type_idx
  ON public.activities (tenant_id, type);

-- -----------------------------------------------------------------------------
-- public.workflow_runs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  workflow text NOT NULL DEFAULT 'lead_intake_v1',
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (
    status IN (
      'received',
      'stored',
      'qualified',
      'drafted',
      'notified',
      'failed',
      'completed'
    )
  ),
  step text,
  error text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workflow_runs_tenant_id_idx
  ON public.workflow_runs (tenant_id);

CREATE INDEX IF NOT EXISTS workflow_runs_lead_id_idx
  ON public.workflow_runs (lead_id);

CREATE INDEX IF NOT EXISTS workflow_runs_tenant_status_idx
  ON public.workflow_runs (tenant_id, status, started_at DESC);

DROP TRIGGER IF EXISTS cytron_workflow_runs_set_updated_at ON public.workflow_runs;
CREATE TRIGGER cytron_workflow_runs_set_updated_at
  BEFORE UPDATE ON public.workflow_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.cytron_set_updated_at();

-- -----------------------------------------------------------------------------
-- public.rate_limits
-- Complementa o limiter em memória (FATO: 3 pedidos/hora/IP, zera no cold
-- start — lib/rate-limit.ts + comentário em route.ts).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  key text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 1 CHECK (count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, key, window_start)
);

CREATE INDEX IF NOT EXISTS rate_limits_window_start_idx
  ON public.rate_limits (window_start);

DROP TRIGGER IF EXISTS cytron_rate_limits_set_updated_at ON public.rate_limits;
CREATE TRIGGER cytron_rate_limits_set_updated_at
  BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.cytron_set_updated_at();

-- -----------------------------------------------------------------------------
-- Keep-alive: SEM tabela keepalive_pings.
-- RECOMENDAÇÃO (justificativa em PHASE1-MVP-PLAN.md seção "Keep-alive"):
-- o ping diário é um SELECT 1 / SELECT now() sem escrita. Uma tabela de pings
-- cresceria no Free (500 MB) sem benefício para a regra de pausa do Supabase
-- ("algumas requisições de utilizador por dia"). Evidência fica nos logs da
-- Vercel / GitHub Actions; falha = o próprio SELECT falhar, e aí alerta no
-- Telegram sem PII.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- Retenção no plano Free (500 MB de base de dados — FATO,
-- https://supabase.com/pricing , citado em PLAN-v1 / AUDIT-PHASE0).
-- Política (RECOMENDAÇÃO):
--   * rate_limits: apagar janelas com mais de 7 dias.
--   * leads, audit_drafts, activities: NÃO apagar automaticamente
--     (registo comercial / consentimento). Apagar só dados de teste se o
--     Thiago pedir (T-33).
--   * workflow_runs: manter 180 dias; o resto pode ser arquivado depois,
--     fora deste MVP.
--   * PRESSUPOSTO de volume: dezenas a poucas centenas de leads/mês cabem
--     folgadamente em 500 MB (cada lead + rascunho + activities ≈ poucos KB).
--   * Monitorizar o uso no painel do Supabase. Esta função NÃO corre no
--     keep-alive (o keep-alive não escreve). QA ou um operador autorizado
--     pode chamá-la via service role.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cytron_retain_mvp_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  deleted_rl integer;
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < now() - interval '7 days';
  GET DIAGNOSTICS deleted_rl = ROW_COUNT;
  RETURN jsonb_build_object(
    'rate_limits_deleted', deleted_rl,
    'leads_untouched', true,
    'audit_drafts_untouched', true
  );
END;
$$;

-- -----------------------------------------------------------------------------
-- No-write keep-alive probe. This is SELECT 1, not a log table.
-- There is no keepalive_pings table: a ping row would grow the Free database
-- without helping Supabase's pause rule. The Next.js cron calls this function.
-- cytron-platform does not receive this migration. If the function is missing
-- there, PostgREST still has to ask Postgres, which is enough to see a pause.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cytron_select_1()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 1;
$$;

-- -----------------------------------------------------------------------------
-- RLS: ligado, SEM policies para anon nem authenticated.
-- O browser nunca fala com o cytron-clients (PLAN-v1). Acesso só com
-- service_role no servidor Next.js (bypassa RLS no Supabase).
-- FORCE não é aplicado: o owner do SQL editor precisa conseguir administrar.
-- -----------------------------------------------------------------------------
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Nenhuma CREATE POLICY neste arquivo. De propósito.

-- -----------------------------------------------------------------------------
-- Grants: revogar browser; confirmar service_role.
-- -----------------------------------------------------------------------------
REVOKE ALL ON TABLE public.tenants FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.clients FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.leads FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.audit_drafts FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.activities FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.workflow_runs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.rate_limits FROM PUBLIC, anon, authenticated;

GRANT ALL ON TABLE public.tenants TO service_role;
GRANT ALL ON TABLE public.clients TO service_role;
GRANT ALL ON TABLE public.leads TO service_role;
GRANT ALL ON TABLE public.audit_drafts TO service_role;
GRANT ALL ON TABLE public.activities TO service_role;
GRANT ALL ON TABLE public.workflow_runs TO service_role;
GRANT ALL ON TABLE public.rate_limits TO service_role;

REVOKE ALL ON FUNCTION public.cytron_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cytron_retain_mvp_data() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cytron_select_1() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cytron_set_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.cytron_retain_mvp_data() TO service_role;
GRANT EXECUTE ON FUNCTION public.cytron_select_1() TO service_role;

COMMIT;
