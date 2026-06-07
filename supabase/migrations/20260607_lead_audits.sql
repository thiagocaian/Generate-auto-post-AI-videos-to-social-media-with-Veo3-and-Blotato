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

-- Index for quick lookups by email and status
create index if not exists lead_audits_email_idx  on lead_audits (email);
create index if not exists lead_audits_status_idx on lead_audits (status);
