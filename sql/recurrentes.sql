-- Gastos MG - Recurrentes v1
-- Ejecutar en SQL Editor del proyecto Supabase.

create table if not exists public.recurrentes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('Ingreso', 'Gasto')),
  categoria text not null,
  monto numeric(14,2) not null check (monto > 0),
  detalle text default '',
  frecuencia text not null default 'monthly' check (frecuencia = 'monthly'),
  anchor_day integer not null check (anchor_day between 1 and 28),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create index if not exists idx_recurrentes_user_anchor
  on public.recurrentes (user_id, anchor_day asc, categoria asc);

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
