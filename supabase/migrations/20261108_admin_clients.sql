create table if not exists admin_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null default '',
  company text not null default '',
  address text not null default '',
  status text not null default 'lead' check (status in ('lead', 'active', 'paused', 'archived')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table admin_clients enable row level security;
