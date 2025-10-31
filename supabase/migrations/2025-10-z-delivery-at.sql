-- Optional delivery date/time for jobs
-- Adds column and exposes it in public tracking RPC

-- Add column to jobs (nullable)
alter table public.jobs add column if not exists delivery_at timestamptz null;

-- Ensure public views include the new field (safe to recreate)
drop view if exists public.v_public_job;
create or replace view public.v_public_job as
  select j.id,
         j.title,
         j.device_type,
         j.brand,
         j.model,
         j.serial,
         js.label as status,
         j.intake_date,
         j.delivery_at,
         j.created_at,
         j.updated_at
    from public.jobs j
    left join public.jobs_status js on js.id = j.status
   where j.share_public = true;

-- Update public tracking RPC to return delivery_at
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
  delivery_at timestamptz,
  log_id uuid,
  log_message text,
  log_status text,
  log_attachment_url text,
  log_created_at timestamptz,
  log_response_decision text,
  log_response_created_at timestamptz
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
    j.delivery_at,
    l.id as log_id,
    l.message as log_message,
    js_log.label as log_status,
    l.attachment_url as log_attachment_url,
    l.created_at as log_created_at,
    r.decision as log_response_decision,
    r.created_at as log_response_created_at
  from public.jobs j
  left join public.job_logs l on l.job_id = j.id
  left join public.jobs_status js_job on js_job.id = j.status
  left join public.jobs_status js_log on js_log.id = l.status
  left join public.job_extra_responses r on r.log_id = l.id
  where j.share_public = true and j.public_token = p_token
  order by l.created_at asc nulls last;
$$;

grant execute on function public.get_public_tracking(uuid) to anon, authenticated;

