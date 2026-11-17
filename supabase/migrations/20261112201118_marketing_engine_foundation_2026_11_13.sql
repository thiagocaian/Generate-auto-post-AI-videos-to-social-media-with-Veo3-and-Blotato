-- marketing_engine_foundation_2026_11_13
-- Aditivo: só cria tabelas novas mkt_*. Não altera tabelas, dados ou policies existentes.
-- Escrita: só service_role (n8n / API do servidor). Leitura: membros da empresa (authenticated).

create table public.mkt_content_ideas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  source text not null check (source in ('google_trends','reddit','youtube','hacker_news','google_news','manual','competitor','other')),
  source_url text,
  title text not null check (char_length(title) <= 500),
  summary text,
  keywords text[] not null default '{}',
  language text not null default 'en',
  region text,
  score numeric(6,2) not null default 0,
  status text not null default 'new' check (status in ('new','selected','used','discarded')),
  dedupe_key text not null,
  raw jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, dedupe_key)
);

create table public.mkt_content_pieces (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  idea_id uuid references public.mkt_content_ideas(id) on delete set null,
  marketing_post_id uuid references public.marketing_posts(id) on delete set null,
  format text not null default 'short_video' check (format in ('short_video','image','carousel','text','story','article')),
  title text,
  hook text,
  script text,
  caption text,
  hashtags text[] not null default '{}',
  cta text,
  target_platforms text[] not null default '{}',
  platform_variants jsonb not null default '{}'::jsonb,
  media_urls text[] not null default '{}',
  utm_campaign text,
  status text not null default 'draft' check (status in ('draft','pending_approval','approved','scheduled','published','rejected','failed')),
  scheduled_for timestamptz,
  published_at timestamptz,
  generator text,
  generator_meta jsonb not null default '{}'::jsonb,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mkt_approvals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  piece_id uuid not null references public.mkt_content_pieces(id) on delete cascade,
  action text not null check (action in ('submitted','approved','rejected','regenerate_copy','regenerate_media','edited')),
  channel text not null default 'telegram' check (channel in ('telegram','web','api','system')),
  actor text,
  note text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.mkt_distribution_jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  piece_id uuid not null references public.mkt_content_pieces(id) on delete cascade,
  provider text not null default 'blotato' check (provider in ('blotato','outstand','ayrshare')),
  is_fallback boolean not null default false,
  platform text not null,
  account_id text,
  dry_run boolean not null default true,
  status text not null default 'queued' check (status in ('queued','dry_run','submitted','scheduled','published','failed','cancelled')),
  provider_post_id text,
  public_url text,
  scheduled_for timestamptz,
  request jsonb not null default '{}'::jsonb,
  response jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mkt_post_metrics (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  distribution_job_id uuid not null references public.mkt_distribution_jobs(id) on delete cascade,
  captured_at timestamptz not null default now(),
  impressions integer, reach integer, views integer, likes integer, comments integer,
  shares integer, saves integer, clicks integer, followers_gained integer,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.mkt_lead_attribution (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_table text not null check (lead_table in ('demo_requests','lead_audits','early_access_leads','other')),
  lead_id uuid not null,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  referrer text, landing_path text, first_seen_at timestamptz,
  piece_id uuid references public.mkt_content_pieces(id) on delete set null,
  distribution_job_id uuid references public.mkt_distribution_jobs(id) on delete set null,
  converted boolean not null default false,
  deal_value numeric(12,2),
  created_at timestamptz not null default now(),
  unique (lead_table, lead_id)
);

create table public.mkt_weekly_insights (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  kind text not null default 'weekly' check (kind in ('weekly','morning_page')),
  summary text,
  stats jsonb not null default '{}'::jsonb,
  top_pieces jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  next_week_plan jsonb not null default '[]'::jsonb,
  generator text,
  created_at timestamptz not null default now(),
  unique (company_id, kind, period_start)
);

create index mkt_content_ideas_company_status_idx on public.mkt_content_ideas (company_id, status, score desc);
create index mkt_content_pieces_company_status_idx on public.mkt_content_pieces (company_id, status, created_at desc);
create index mkt_content_pieces_idea_idx on public.mkt_content_pieces (idea_id);
create index mkt_content_pieces_post_idx on public.mkt_content_pieces (marketing_post_id);
create index mkt_approvals_piece_idx on public.mkt_approvals (piece_id, created_at desc);
create index mkt_approvals_company_idx on public.mkt_approvals (company_id);
create index mkt_distribution_jobs_piece_idx on public.mkt_distribution_jobs (piece_id);
create index mkt_distribution_jobs_company_idx on public.mkt_distribution_jobs (company_id, status);
create index mkt_post_metrics_job_idx on public.mkt_post_metrics (distribution_job_id, captured_at desc);
create index mkt_post_metrics_company_idx on public.mkt_post_metrics (company_id);
create index mkt_lead_attribution_company_idx on public.mkt_lead_attribution (company_id, utm_campaign);
create index mkt_lead_attribution_piece_idx on public.mkt_lead_attribution (piece_id);
create index mkt_lead_attribution_job_idx on public.mkt_lead_attribution (distribution_job_id);

create trigger mkt_content_ideas_updated_at before update on public.mkt_content_ideas for each row execute function public.update_updated_at_column();
create trigger mkt_content_pieces_updated_at before update on public.mkt_content_pieces for each row execute function public.update_updated_at_column();
create trigger mkt_distribution_jobs_updated_at before update on public.mkt_distribution_jobs for each row execute function public.update_updated_at_column();

do $$
declare t text;
begin
  foreach t in array array['mkt_content_ideas','mkt_content_pieces','mkt_approvals','mkt_distribution_jobs','mkt_post_metrics','mkt_lead_attribution','mkt_weekly_insights'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated, public', t);
    execute format('grant select on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format($p$create policy %I on public.%I for select to authenticated using (company_id in (select cm.company_id from public.company_members cm where cm.user_id = (select auth.uid())))$p$, t||'_member_select', t);
  end loop;
end $$;

-- Fila de aprovação (security_invoker: respeita o RLS de quem consulta)
create view public.mkt_approval_queue with (security_invoker = true) as
select p.id, p.company_id, p.status, p.format, p.title, p.hook, p.caption, p.target_platforms,
       p.media_urls, p.scheduled_for, p.created_at, i.title as idea_title, i.source as idea_source, i.score as idea_score
from public.mkt_content_pieces p
left join public.mkt_content_ideas i on i.id = p.idea_id
where p.status in ('draft','pending_approval');
revoke all on public.mkt_approval_queue from anon, public;
grant select on public.mkt_approval_queue to authenticated, service_role;
