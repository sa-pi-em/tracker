-- Run this once in the Supabase SQL Editor for your project.
create table if not exists public.study_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.study_data enable row level security;

revoke all on table public.study_data from anon;
revoke all on table public.study_data from authenticated;
grant select, insert, update on table public.study_data to authenticated;

drop policy if exists "Users read their own study data" on public.study_data;
create policy "Users read their own study data"
  on public.study_data for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users create their own study data" on public.study_data;
create policy "Users create their own study data"
  on public.study_data for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users update their own study data" on public.study_data;
create policy "Users update their own study data"
  on public.study_data for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
