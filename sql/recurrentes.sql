-- Gastos MG - Movimientos programados
-- Ejecutar en SQL Editor del proyecto Supabase.

create table if not exists public.recurrentes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('Ingreso', 'Gasto')),
  categoria text not null,
  monto numeric(14,2) not null check (monto > 0),
  detalle text default '',
  frecuencia text not null default 'monthly',
  anchor_day integer not null default 1 check (anchor_day between 1 and 28),
  start_date date,
  end_date date,
  repeat_count integer,
  activo boolean not null default true,
  auto_generate boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recurrentes
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists repeat_count integer,
  add column if not exists auto_generate boolean not null default true;

update public.recurrentes
set start_date = make_date(
  extract(year from current_date)::int,
  extract(month from current_date)::int,
  least(greatest(coalesce(anchor_day, 1), 1), 28)
)
where start_date is null;

alter table public.recurrentes
  alter column start_date set not null;

alter table public.recurrentes
  drop constraint if exists recurrentes_frecuencia_check;

alter table public.recurrentes
  add constraint recurrentes_frecuencia_check
  check (frecuencia in ('daily', 'weekly', 'monthly', 'yearly'));

alter table public.recurrentes
  drop constraint if exists recurrentes_repeat_count_check;

alter table public.recurrentes
  add constraint recurrentes_repeat_count_check
  check (repeat_count is null or repeat_count > 0);

create or replace function public.set_recurrentes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists recurrentes_set_updated_at on public.recurrentes;
create trigger recurrentes_set_updated_at
before update on public.recurrentes
for each row
execute function public.set_recurrentes_updated_at();

alter table public.recurrentes enable row level security;

create index if not exists idx_recurrentes_user_schedule
  on public.recurrentes (user_id, start_date asc, categoria asc);

drop policy if exists recurrentes_select_own on public.recurrentes;
create policy recurrentes_select_own
  on public.recurrentes
  for select
  using (auth.uid() = user_id);

drop policy if exists recurrentes_insert_own on public.recurrentes;
create policy recurrentes_insert_own
  on public.recurrentes
  for insert
  with check (auth.uid() = user_id);

drop policy if exists recurrentes_update_own on public.recurrentes;
create policy recurrentes_update_own
  on public.recurrentes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists recurrentes_delete_own on public.recurrentes;
create policy recurrentes_delete_own
  on public.recurrentes
  for delete
  using (auth.uid() = user_id);
