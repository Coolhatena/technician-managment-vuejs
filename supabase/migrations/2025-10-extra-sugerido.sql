-- Add new status for suggested extras
insert into public.jobs_status (id, code, label)
values (7, 'extra_sugerido', 'Extra sugerido')
on conflict (id) do nothing;

-- Table to store client responses to suggested extras
create table if not exists public.job_extra_responses (
  log_id uuid primary key references public.job_logs(id) on delete cascade,
  decision text not null check (decision in ('approved','rejected')),
  created_at timestamptz not null default now()
);

-- RPC to allow public (anon) users to respond to an "Extra sugerido" log
-- Runs as definer to bypass RLS, performs its own checks using the public token
create or replace function public.respond_extra(p_token uuid, p_log_id uuid, p_decision text)
returns table (resp_log_id uuid, decision text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job_id uuid;
  v_status_id smallint;
begin
  -- Validate decision
  if p_decision not in ('approved','rejected') then
    raise exception 'Decisión inválida';
  end if;

  -- Resolve the status id for code 'extra_sugerido'
  select id into v_status_id from public.jobs_status where code = 'extra_sugerido';
  if v_status_id is null then
    raise exception 'Status extra_sugerido no existe';
  end if;

  -- Ensure the log belongs to the job with the provided public token and is of the correct status
  select j.id into v_job_id
    from public.jobs j
    join public.job_logs l on l.job_id = j.id
   where j.public_token = p_token
     and l.id = p_log_id
     and l.status = v_status_id
   limit 1;

  if v_job_id is null then
    raise exception 'Log inválido para el token proporcionado';
  end if;

  -- Insert response if not exists; if exists, return existing
  insert into public.job_extra_responses (log_id, decision)
  values (p_log_id, p_decision)
  on conflict on constraint job_extra_responses_pkey do nothing;

  return query
    select r.log_id as resp_log_id, r.decision, r.created_at
      from public.job_extra_responses r
     where r.log_id = p_log_id;
end;
$$;

grant execute on function public.respond_extra(uuid, uuid, text) to anon, authenticated;

-- Extend public tracking RPC to include extra response info
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
