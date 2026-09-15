-- Sendora : profil utilisateur lié à Supabase Auth
-- À exécuter dans Supabase > SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

alter table public.profiles enable row level security;

-- Recrée uniquement les politiques Sendora si elles existent déjà.
drop policy if exists "Users can read their own Sendora profile" on public.profiles;
drop policy if exists "Users can insert their own Sendora profile" on public.profiles;
drop policy if exists "Users can update their own Sendora profile" on public.profiles;

create policy "Users can read their own Sendora profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can insert their own Sendora profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update their own Sendora profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Le navigateur n'a pas besoin d'accès direct à la table des transferts.
revoke all on public.sendora_transfers from anon, authenticated;
