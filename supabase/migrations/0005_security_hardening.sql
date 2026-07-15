-- ============================================================
-- Conexión 360 · Endurecimiento de seguridad
-- Aplica DESPUÉS de 0001-0004. Corrige los hallazgos del linter de
-- seguridad de Supabase (Advisors) tras crear el esquema:
--   - search_path mutable en funciones
--   - funciones SECURITY DEFINER invocables directo por anon vía RPC
--   - vista de facturación con semántica "security definer"
-- ============================================================

alter function set_updated_at() set search_path = public;
alter function is_admin() set search_path = public;

-- current_role_name/current_candidate_id/current_employee_id son
-- SECURITY DEFINER para poder leer `profiles` sin recursión de RLS.
-- Solo deben poder invocarse desde una sesión autenticada (las políticas
-- las llaman internamente); nunca desde `anon` vía RPC pública.
revoke execute on function current_role_name() from public, anon;
grant execute on function current_role_name() to authenticated;

revoke execute on function current_candidate_id() from public, anon;
grant execute on function current_candidate_id() to authenticated;

revoke execute on function current_employee_id() from public, anon;
grant execute on function current_employee_id() to authenticated;

-- handle_new_auth_user solo debe dispararse como trigger de auth.users,
-- nunca invocarse directo vía RPC.
revoke execute on function handle_new_auth_user() from public, anon, authenticated;

-- La vista de facturación debe respetar el RLS de invoices/invoice_items
-- según el usuario real que consulta (security_invoker), no los
-- privilegios de quien la creó.
drop view if exists invoices_with_totals;
create view invoices_with_totals
with (security_invoker = true)
as
select
  i.*,
  coalesce(t.subtotal, 0) as subtotal,
  round(coalesce(t.subtotal, 0) * i.tax_rate) as tax,
  coalesce(t.subtotal, 0) + round(coalesce(t.subtotal, 0) * i.tax_rate) as total
from invoices i
left join (
  select invoice_id, sum(qty * unit_price) as subtotal
  from invoice_items
  group by invoice_id
) t on t.invoice_id = i.id;
