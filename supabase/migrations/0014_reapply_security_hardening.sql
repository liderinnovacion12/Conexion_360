-- ============================================================
-- Solo necesario al restaurar/clonar el proyecto en un nuevo Supabase:
-- la función "Clone" de Supabase copia el esquema y los datos, pero NO
-- preserva los GRANT/REVOKE personalizados sobre funciones (vuelven al
-- default de Postgres = ejecutables por PUBLIC) ni la opción
-- `security_invoker` de las vistas. Este archivo repite el
-- endurecimiento de seguridad de 0005/0006 (más el de la función nueva
-- de notificaciones de 0011) para dejar el proyecto clonado igual de
-- seguro que el original. Verificado después con el linter de
-- seguridad de Supabase (Advisors) hasta no dejar hallazgos nuevos.
-- ============================================================

alter function set_updated_at() set search_path = public;
alter function is_admin() set search_path = public;

revoke execute on function current_role_name() from public, anon;
grant execute on function current_role_name() to authenticated;

revoke execute on function current_candidate_id() from public, anon;
grant execute on function current_candidate_id() to authenticated;

revoke execute on function current_employee_id() from public, anon;
grant execute on function current_employee_id() to authenticated;

revoke execute on function handle_new_auth_user() from public, anon, authenticated;

revoke execute on function register_candidate_profile() from public, anon;
grant execute on function register_candidate_profile() to authenticated;

-- Nueva desde 0011: tampoco debe ser invocable vía RPC, solo por el
-- trigger de `documents`.
revoke execute on function notify_on_document_upload() from public, anon, authenticated;

-- La vista de facturación debe respetar el RLS según el usuario real
-- que consulta (security_invoker), no los privilegios de quien la creó.
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
