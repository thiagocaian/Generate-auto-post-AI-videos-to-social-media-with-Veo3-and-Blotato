-- early_access_leads is written only by the API, using the service role.
-- The service role bypasses RLS, so it does not need a permissive policy.
-- The original "Service role full access" policy used USING (true) WITH CHECK (true),
-- which also granted anon and authenticated clients full access.
-- Drop that policy and deny those roles explicitly.
--
-- Requires the table from supabase/early_access_leads.sql.
-- Do not re-run that older script after this migration: it would recreate the open policy.

alter table early_access_leads enable row level security;

drop policy if exists "Service role full access" on early_access_leads;

drop policy if exists "early_access_leads_no_public_select" on early_access_leads;
create policy "early_access_leads_no_public_select"
  on early_access_leads for select
  using (false);

drop policy if exists "early_access_leads_no_public_insert" on early_access_leads;
create policy "early_access_leads_no_public_insert"
  on early_access_leads for insert
  with check (false);

drop policy if exists "early_access_leads_no_public_update" on early_access_leads;
create policy "early_access_leads_no_public_update"
  on early_access_leads for update
  using (false);

drop policy if exists "early_access_leads_no_public_delete" on early_access_leads;
create policy "early_access_leads_no_public_delete"
  on early_access_leads for delete
  using (false);
