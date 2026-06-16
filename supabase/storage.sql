-- Storage bucket for selfie/photo confirmations.
-- Run once in: SQL Editor → New query → paste → Run. Safe to re-run.

insert into storage.buckets (id, name, public)
values ('confirmations', 'confirmations', false)
on conflict (id) do nothing;

-- Files are stored under "<couple_id>/<filename>" so a couple can only touch their own.
drop policy if exists "couple upload confirmations" on storage.objects;
create policy "couple upload confirmations" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'confirmations'
    and (storage.foldername(name))[1] = public.my_couple_id()::text
  );

drop policy if exists "couple read confirmations" on storage.objects;
create policy "couple read confirmations" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'confirmations'
    and (storage.foldername(name))[1] = public.my_couple_id()::text
  );
