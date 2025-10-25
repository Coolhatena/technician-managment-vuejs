-- Create public bucket for job attachments and grant access

-- Ensure RLS on storage.objects
alter table if exists storage.objects enable row level security;

-- Create bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('job-attachments', 'job-attachments', true)
on conflict (id) do update set public = excluded.public;

-- Public read for this bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'storage' and tablename = 'objects' and policyname = 'job-attachments public read'
  ) then
    create policy "job-attachments public read" on storage.objects
      for select to public
      using (bucket_id = 'job-attachments');
  end if;
end $$;

-- Authenticated users can upload into this bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'storage' and tablename = 'objects' and policyname = 'job-attachments authenticated upload'
  ) then
    create policy "job-attachments authenticated upload" on storage.objects
      for insert to authenticated
      with check (bucket_id = 'job-attachments');
  end if;
end $$;
