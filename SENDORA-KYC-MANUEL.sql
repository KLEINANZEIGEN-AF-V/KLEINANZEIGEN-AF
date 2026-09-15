-- KYC manuel Sendora : demandes de vérification traitées par l'administration.
create table if not exists public.sendora_kyc_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  status text not null default 'pending' check (status in ('pending','processing','verified','rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists sendora_kyc_requests_status_idx
on public.sendora_kyc_requests(status, created_at desc);

alter table public.sendora_kyc_requests enable row level security;
revoke all on public.sendora_kyc_requests from anon, authenticated;
