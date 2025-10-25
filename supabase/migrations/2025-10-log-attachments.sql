-- Add attachment to job_logs
alter table public.job_logs add column if not exists attachment_url text;

-- Update public view to expose attachment
drop view if exists public.v_public_logs;
create or replace view public.v_public_logs as
  select l.id,
         l.job_id,
         l.message,
         js.label as status,
         l.attachment_url,
         l.created_at
    from public.job_logs l
    join public.jobs j on j.id = l.job_id
    left join public.jobs_status js on js.id = l.status
   where j.share_public = true;

-- Update RPC to return attachment_url
drop function if exists public.get_public_tracking(uuid);
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
  log_attachment_url text,
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
    l.attachment_url as log_attachment_url,
    l.created_at as log_created_at
  from public.jobs j
  left join public.job_logs l on l.job_id = j.id
  left join public.jobs_status js_job on js_job.id = j.status
  left join public.jobs_status js_log on js_log.id = l.status
  where j.share_public = true and j.public_token = p_token
  order by l.created_at asc nulls last;
$$;

grant execute on function public.get_public_tracking(uuid) to anon, authenticated;

