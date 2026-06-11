-- Enable Supabase Realtime on the tables the app subscribes to.
-- Run once in: SQL Editor → New query → paste → Run. Safe to re-run.

do $$ begin
  alter publication supabase_realtime add table public.nudges;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.doses;
exception when duplicate_object then null; end $$;
