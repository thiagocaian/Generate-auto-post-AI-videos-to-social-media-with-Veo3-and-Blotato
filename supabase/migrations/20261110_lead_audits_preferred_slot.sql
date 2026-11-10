-- The lead-audit API and the admin audit desk already write these columns.
-- preferred_date is a calendar date (YYYY-MM-DD).
-- preferred_time is a display label such as '9:00 AM', not a SQL time.
-- Nullable so rows created before this migration stay valid.
-- Idempotent: safe to run more than once. Do not edit older lead_audits migrations.

alter table lead_audits
  add column if not exists preferred_date date,
  add column if not exists preferred_time text;
