-- Sendora: mise à niveau de la table existante.
-- À exécuter dans Supabase > SQL Editor avant le prochain déploiement.

alter table public.sendora_transfers
  add column if not exists kkiapay_status text,
  add column if not exists amount_xof integer not null default 0,
  add column if not exists payer_email text,
  add column if not exists kkiapay_response jsonb;

-- Ces colonnes font partie du schéma créé précédemment.
-- Si elles existent déjà, aucune modification n'est faite.
alter table public.sendora_transfers
  add column if not exists sender_name text,
  add column if not exists sender_phone text,
  add column if not exists sender_email text,
  add column if not exists exchange_rate numeric(12,4) not null default 655,
  add column if not exists payment_amount_xof integer not null default 0;

-- L'accès direct du navigateur reste bloqué.
revoke all on public.sendora_transfers from anon, authenticated;
