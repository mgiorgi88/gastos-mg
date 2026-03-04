-- Gastos MG - Supabase RLS policies
-- Ejecutar en SQL Editor del proyecto Supabase.

create table if not exists public.movimientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fecha date not null,
  tipo text not null check (tipo in ('Ingreso', 'Gasto')),
  categoria text not null,
  monto numeric(14,2) not null check (monto > 0),
  detalle text default '',
  created_at timestamptz not null default now()
);

alter table public.movimientos enable row level security;

create index if not exists idx_movimientos_user_fecha
  on public.movimientos (user_id, fecha desc);

drop policy if exists movimientos_select_own on public.movimientos;
create policy movimientos_select_own
  on public.movimientos
  for select
  using (auth.uid() = user_id);

drop policy if exists movimientos_insert_own on public.movimientos;
create policy movimientos_insert_own
  on public.movimientos
  for insert
  with check (auth.uid() = user_id);

drop policy if exists movimientos_update_own on public.movimientos;
create policy movimientos_update_own
  on public.movimientos
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists movimientos_delete_own on public.movimientos;
create policy movimientos_delete_own
  on public.movimientos
  for delete
  using (auth.uid() = user_id);
