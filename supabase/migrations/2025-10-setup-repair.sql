-- tables
create table public.jobs (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  customer_name text not null,
  customer_phone text,
  device_type   text not null,
  brand         text,
  model         text,
  serial        text,
  intake_date   date not null default current_date,
  status        text not null default 'received' check (status in ('received','in_progress','waiting_parts','repaired','delivered','canceled')),
  notes         text,
  assigned_to   uuid not null references auth.users(id) on delete cascade,
  share_public  boolean not null default true,
  public_token  uuid not null default gen_random_uuid(), -- para tracking público
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.job_logs (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid not null references public.jobs(id) on delete cascade,
  message     text not null,
  status      text check (status in ('received','in_progress','waiting_parts','repaired','delivered','canceled')),
  created_by  uuid not null references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- simple storage bucket for attachments (optional)
-- run separately if using Storage:
-- select storage.create_bucket('job-attachments', true);

-- indexes
create index on public.jobs (assigned_to);
create index on public.jobs (public_token);
create index on public.job_logs (job_id);
create index on public.job_logs (created_at);

-- triggers
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger jobs_touch_upd before update on public.jobs
for each row execute function public.touch_updated_at();

-- RLS
alter table public.jobs enable row level security;
alter table public.job_logs enable row level security;

-- Policies: usuarios autenticados solo ven/gestionan sus propios jobs
create policy "jobs select own" on public.jobs
for select using (assigned_to = auth.uid());

create policy "jobs crud own" on public.jobs
for all using (assigned_to = auth.uid())
with check (assigned_to = auth.uid());

-- Logs: visibles si pertenecen a un job propio
create policy "logs select by owner" on public.job_logs
for select using (
  exists(select 1 from public.jobs j where j.id = job_logs.job_id and j.assigned_to = auth.uid())
);

create policy "logs insert by owner" on public.job_logs
for insert with check (
  exists(select 1 from public.jobs j where j.id = job_logs.job_id and j.assigned_to = auth.uid())
  and created_by = auth.uid()
);

-- Vista pública: acceso anónimo por token cuando share_public = true
-- Creamos vistas seguras para el frontend público
create or replace view public.v_public_job as
  select id, title, device_type, brand, model, serial, status, intake_date, created_at, updated_at
  from public.jobs
  where share_public = true;

create or replace view public.v_public_logs as
  select l.id, l.job_id, l.message, l.status, l.created_at
  from public.job_logs l
  join public.jobs j on j.id = l.job_id
  where j.share_public = true;

-- Policies de lectura pública por token (usando anon key)
create policy "public job by token" on public.jobs
for select using (share_public = true);

create policy "public logs by token" on public.job_logs
for select using (
  exists(select 1 from public.jobs j where j.id = job_logs.job_id and j.share_public = true)
);

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
    j.id, j.title, j.device_type, j.brand, j.model, j.serial, j.status, j.intake_date,
    l.id, l.message, l.status, l.created_at
  from public.jobs j
  left join public.job_logs l on l.job_id = j.id
  where j.share_public = true and j.public_token = p_token
  order by l.created_at asc nulls last;
$$;

-- Policy para RPC con anon: permitir execute a public
grant execute on function public.get_public_tracking(uuid) to anon, authenticated;

-- opcional: sin usuarios, porque vienen de auth. Inserta un job de demo atado a auth.uid() cuando pruebe en local.

