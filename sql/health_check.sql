-- Gastos MG - Security Health Check (Supabase)
-- Run this in Supabase SQL Editor.
-- It validates RLS and policy posture for public.movimientos.

with
params as (
  select 'public'::text as schema_name, 'movimientos'::text as table_name
),
tbl as (
  select
    n.nspname as schema_name,
    c.relname as table_name,
    c.relrowsecurity as rls_enabled,
    c.relforcerowsecurity as force_rls
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  join params p on p.schema_name = n.nspname and p.table_name = c.relname
),
policy_data as (
  select
    p.schemaname,
    p.tablename,
    p.policyname,
    p.cmd,
    coalesce(p.qual::text, '') as qual_txt,
    coalesce(p.with_check::text, '') as with_check_txt
  from pg_policies p
  join params x on x.schema_name = p.schemaname and x.table_name = p.tablename
),
required_policies as (
  select unnest(array[
    'movimientos_select_own',
    'movimientos_insert_own',
    'movimientos_update_own',
    'movimientos_delete_own'
  ]) as policyname
),
checks as (
  select
    1 as ord,
    'table_exists' as check_name,
    case when exists(select 1 from tbl) then 'PASS' else 'FAIL' end as status,
    case when exists(select 1 from tbl)
      then 'Table public.movimientos exists.'
      else 'Table public.movimientos not found.'
    end as details

  union all

  select
    2,
    'rls_enabled',
    case when exists(select 1 from tbl where rls_enabled) then 'PASS' else 'FAIL' end,
    case when exists(select 1 from tbl where rls_enabled)
      then 'RLS is enabled.'
      else 'RLS is NOT enabled.'
    end

  union all

  select
    3,
    'required_policies_present',
    case
      when (select count(*) from policy_data) >= 4
       and not exists(
         select 1
         from required_policies rp
         left join policy_data pd on pd.policyname = rp.policyname
         where pd.policyname is null
       )
      then 'PASS'
      else 'FAIL'
    end,
    'Expected policies: movimientos_select_own, movimientos_insert_own, movimientos_update_own, movimientos_delete_own.'

  union all

  select
    4,
    'policy_uses_auth_uid',
    case
      when exists(select 1 from policy_data)
       and not exists(
         select 1
         from policy_data
         where (qual_txt || ' ' || with_check_txt) not ilike '%auth.uid()%'
           and policyname like 'movimientos\_%\_own' escape '\'
       )
      then 'PASS'
      else 'WARN'
    end,
    'WARN means one or more *_own policies may not reference auth.uid(). Review policy SQL text.'

  union all

  select
    5,
    'anon_table_privileges',
    case
      when has_table_privilege('anon', 'public.movimientos', 'select')
        or has_table_privilege('anon', 'public.movimientos', 'insert')
        or has_table_privilege('anon', 'public.movimientos', 'update')
        or has_table_privilege('anon', 'public.movimientos', 'delete')
      then 'INFO'
      else 'INFO'
    end,
    case
      when has_table_privilege('anon', 'public.movimientos', 'select')
        or has_table_privilege('anon', 'public.movimientos', 'insert')
        or has_table_privilege('anon', 'public.movimientos', 'update')
        or has_table_privilege('anon', 'public.movimientos', 'delete')
      then 'anon has table privileges (normal in Supabase when RLS is active).'
      else 'anon has limited table privileges.'
    end
)
select check_name, status, details
from checks
order by ord;
