-- Lead audit requests from the CYTRON homepage
create table if not exists lead_audits (
  id                uuid default gen_random_uuid() primary key,
  created_at        timestamptz default now(),
  name              text not null,
  business_name     text not null,
  email             text not null,
  phone             text,
  industry          text,
  website           text,
  monthly_enquiries text,
  response_process  text,
  status            text default 'new',   -- new | contacted | converted | closed
  notes             text
);

-- Indexes for quick lookups
create index if not exists lead_audits_email_idx  on lead_audits (email);
create index if not exists lead_audits_status_idx on lead_audits (status);

-- RLS: enable and lock down the table.
-- The service role key bypasses RLS, so the API route can still insert.
-- No authenticated user (including anon) can read or write directly.
alter table lead_audits enable row level security;

-- Deny everything by default (no policies = no access for non-service roles)
-- Explicit deny policies make intent clear.
create policy "lead_audits_no_public_select"
  on lead_audits for select
  using (false);

create policy "lead_audits_no_public_insert"
  on lead_audits for insert
  with check (false);

create policy "lead_audits_no_public_update"
  on lead_audits for update
  using (false);

create policy "lead_audits_no_public_delete"
  on lead_audits for delete
  using (false);
