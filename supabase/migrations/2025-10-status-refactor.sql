-- Drop dependent views before altering columns
drop view if exists public.v_public_logs;
drop view if exists public.v_public_job;
drop function if exists public.get_public_tracking(uuid);

-- Create status lookup table
create table if not exists public.jobs_status (
  id smallint primary key,
  code text not null unique,
  label text not null
);

-- Seed default statuses (keep labels equal to codes for now)
insert into public.jobs_status (id, code, label) values
  (1, 'received',       'received'),
  (2, 'in_progress',    'in_progress'),
  (3, 'waiting_parts',  'waiting_parts'),
  (4, 'repaired',       'repaired'),
  (5, 'delivered',      'delivered'),
  (6, 'canceled',       'canceled')
on conflict (id) do nothing;

-- Safer two-step migration (no subquery in USING)
-- 1) add new column
alter table public.jobs add column if not exists status_new smallint;
-- 2) fill from lookup
update public.jobs j
   set status_new = js.id
  from public.jobs_status js
 where js.code = j.status;
-- 3) drop old check constraint (from original schema)
alter table public.jobs drop constraint if exists jobs_status_check;
-- 4) drop old column and rename
alter table public.jobs drop column if exists status;
alter table public.jobs rename column status_new to status;
-- 5) defaults, not null and FK
alter table public.jobs alter column status set default 1;
-- if some rows ended null for any reason, set to 1
update public.jobs set status = 1 where status is null;
alter table public.jobs alter column status set not null;
alter table public.jobs add constraint jobs_status_fk foreign key (status) references public.jobs_status(id);

-- Migrate job_logs.status to smallint FK (nullable)
alter table public.job_logs add column if not exists status_new smallint;
update public.job_logs l
   set status_new = js.id
  from public.jobs_status js
 where js.code = l.status;
alter table public.job_logs drop constraint if exists job_logs_status_check;
alter table public.job_logs drop column if exists status;
alter table public.job_logs rename column status_new to status;
alter table public.job_logs add constraint job_logs_status_fk foreign key (status) references public.jobs_status(id);

-- Update public views to expose status label (text)
create or replace view public.v_public_job as
  select j.id,
         j.title,
         j.device_type,
         j.brand,
         j.model,
         j.serial,
         js.label as status,
         j.intake_date,
         j.created_at,
         j.updated_at
    from public.jobs j
    left join public.jobs_status js on js.id = j.status
   where j.share_public = true;

create or replace view public.v_public_logs as
  select l.id,
         l.job_id,
         l.message,
         js.label as status,
         l.created_at
    from public.job_logs l
    join public.jobs j on j.id = l.job_id
    left join public.jobs_status js on js.id = l.status
   where j.share_public = true;

-- Update RPC to return status label instead of numeric id
create or replace function public.get_public_tracking(p_token uuid)
returns table (
  job_id uuid,
  title text,
  device_type text,
  brand text,
  model text,
  serial text,
  status text,
  intake_date date,
  log_id uuid,
  log_message text,
  log_status text,
  log_created_at timestamptz
) language sql security definer as $$
  select
    j.id as job_id,
    j.title,
    j.device_type,
    j.brand,
    j.model,
    j.serial,
    js_job.label as status,
    j.intake_date,
    l.id as log_id,
    l.message as log_message,
    js_log.label as log_status,
    l.created_at as log_created_at
  from public.jobs j
  left join public.job_logs l on l.job_id = j.id
  left join public.jobs_status js_job on js_job.id = j.status
  left join public.jobs_status js_log on js_log.id = l.status
  where j.share_public = true and j.public_token = p_token
  order by l.created_at asc nulls last;
$$;

grant execute on function public.get_public_tracking(uuid) to anon, authenticated;
