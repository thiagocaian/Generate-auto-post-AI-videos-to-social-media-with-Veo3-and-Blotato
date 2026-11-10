-- One free audit per email OR per business name.
-- Additive only: two generated columns plus two unique indexes.
-- The unique indexes fail to build if duplicates already exist; at the time of writing
-- lead_audits had no duplicate normalised emails or business names.
-- Keep the expressions in sync with lib/validation/lead-audit-limit.ts.

alter table lead_audits
  add column if not exists email_normalized text
    generated always as (lower(btrim(email))) stored,
  add column if not exists business_normalized text
    generated always as (btrim(regexp_replace(lower(business_name), '[^a-z0-9]+', ' ', 'g'))) stored;

create unique index if not exists lead_audits_email_normalized_key
  on lead_audits (email_normalized);

create unique index if not exists lead_audits_business_normalized_key
  on lead_audits (business_normalized)
  where business_normalized <> '';
