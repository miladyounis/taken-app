-- taken? — Phase 1 schema
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run (uses if-not-exists / create-or-replace where possible).

-- ============================================================
-- Tables
-- ============================================================

-- A couple = the link between the two partners.
create table if not exists public.couples (
  id          uuid primary key default gen_random_uuid(),
  invite_code text unique not null,
  created_at  timestamptz not null default now()
);

-- One profile per authenticated user. Holds their push token + which couple they belong to.
create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  display_name    text,
  expo_push_token text,
  couple_id       uuid references public.couples (id) on delete set null,
  created_at      timestamptz not null default now()
);

-- Every nudge one partner sends the other.
create table if not exists public.nudges (
  id           uuid primary key default gen_random_uuid(),
  couple_id    uuid not null references public.couples (id) on delete cascade,
  from_user    uuid not null references public.profiles (id) on delete cascade,
  to_user      uuid not null references public.profiles (id) on delete cascade,
  message      text,
  media_url    text,
  media_type   text,          -- 'image' | 'audio' | null
  sound        text,
  created_at   timestamptz not null default now(),
  opened_at    timestamptz
);

-- The confirmation log: "she took it". Drives streaks + the reply nudge.
create table if not exists public.doses (
  id                 uuid primary key default gen_random_uuid(),
  couple_id          uuid not null references public.couples (id) on delete cascade,
  user_id            uuid not null references public.profiles (id) on delete cascade,
  nudge_id           uuid references public.nudges (id) on delete set null,
  label              text,
  taken_at           timestamptz not null default now(),
  confirm_type       text,      -- 'swipe' | 'selfie' | 'voice'
  confirm_media_url  text
);

-- ============================================================
-- Helper: the caller's couple_id (used by RLS policies)
-- ============================================================
create or replace function public.my_couple_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select couple_id from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- Pairing RPCs
-- ============================================================

-- Create a couple and join it. Returns the invite code to share.
create or replace function public.create_couple()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
  new_id   uuid;
begin
  new_code := upper(substr(md5(random()::text), 1, 6));
  insert into public.couples (invite_code) values (new_code) returning id into new_id;
  update public.profiles set couple_id = new_id where id = auth.uid();
  return new_code;
end;
$$;

-- Join an existing couple by its invite code.
create or replace function public.join_couple(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
begin
  select id into target from public.couples where invite_code = upper(code);
  if target is null then
    raise exception 'No couple found for that code';
  end if;
  update public.profiles set couple_id = target where id = auth.uid();
  return target;
end;
$$;

-- ============================================================
-- Auto-create a profile row when a user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.couples  enable row level security;
alter table public.nudges   enable row level security;
alter table public.doses    enable row level security;

-- profiles: you can read anyone in your couple; you can edit only yourself.
drop policy if exists "read own couple profiles" on public.profiles;
create policy "read own couple profiles" on public.profiles
  for select using (id = auth.uid() or couple_id = public.my_couple_id());

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (id = auth.uid());

-- couples: members can read their own couple.
drop policy if exists "read own couple" on public.couples;
create policy "read own couple" on public.couples
  for select using (id = public.my_couple_id());

-- nudges: read/insert within your couple.
drop policy if exists "read couple nudges" on public.nudges;
create policy "read couple nudges" on public.nudges
  for select using (couple_id = public.my_couple_id());

drop policy if exists "send couple nudges" on public.nudges;
create policy "send couple nudges" on public.nudges
  for insert with check (couple_id = public.my_couple_id() and from_user = auth.uid());

-- doses: read/insert within your couple.
drop policy if exists "read couple doses" on public.doses;
create policy "read couple doses" on public.doses
  for select using (couple_id = public.my_couple_id());

drop policy if exists "log couple doses" on public.doses;
create policy "log couple doses" on public.doses
  for insert with check (couple_id = public.my_couple_id() and user_id = auth.uid());
