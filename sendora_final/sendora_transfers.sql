-- Sendora / Supabase
-- Table des transferts confirmés par KKiaPay.
-- Exécuter ce script dans Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.sendora_transfers (
  id uuid primary key default gen_random_uuid(),
  kkiapay_transaction_id text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  kkiapay_status text,
  amount_xof integer not null default 0,
  amount_eur numeric(12,2) not null default 0,
  fee_eur numeric(12,2) not null default 0,
  received_xof integer not null default 0,
  send_country text not null,
  receive_country text not null,
  beneficiary_name text not null,
  beneficiary_phone text not null,
  delivery_method text not null,
  payer_email text,
  kkiapay_response jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sendora_transfers_created_at_idx
  on public.sendora_transfers (created_at desc);

create index if not exists sendora_transfers_status_idx
  on public.sendora_transfers (status);

alter table public.sendora_transfers enable row level security;

-- Le navigateur n’a aucun droit direct d’écriture.
-- L’API Next.js utilise la clé service_role côté serveur.
revoke all on public.sendora_transfers from anon, authenticated;

-- IMPORTANT : ne jamais exposer la clé service_role dans le navigateur.
