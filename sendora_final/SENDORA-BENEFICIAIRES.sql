create table if not exists public.sendora_beneficiaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  delivery_method text not null default 'Mobile Money',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sendora_beneficiaries_user_id_idx
on public.sendora_beneficiaries(user_id, created_at desc);

alter table public.sendora_beneficiaries enable row level security;

revoke all on public.sendora_beneficiaries from anon;
grant select, insert, update, delete on public.sendora_beneficiaries to authenticated;

drop policy if exists "Users can read their own Sendora beneficiaries" on public.sendora_beneficiaries;
drop policy if exists "Users can insert their own Sendora beneficiaries" on public.sendora_beneficiaries;
drop policy if exists "Users can update their own Sendora beneficiaries" on public.sendora_beneficiaries;
drop policy if exists "Users can delete their own Sendora beneficiaries" on public.sendora_beneficiaries;

create policy "Users can read their own Sendora beneficiaries"
on public.sendora_beneficiaries for select
using (auth.uid() = user_id);

create policy "Users can insert their own Sendora beneficiaries"
on public.sendora_beneficiaries for insert
with check (auth.uid() = user_id);

create policy "Users can update their own Sendora beneficiaries"
on public.sendora_beneficiaries for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own Sendora beneficiaries"
on public.sendora_beneficiaries for delete
using (auth.uid() = user_id);
