-- ============================================================
-- Enruta el paso final de la aprobación de aspirantes ('Dirección
-- General') a un Administrador. Si ya existe un aprobador para esta
-- área, no se sobreescribe (para no pisar una asignación manual).
-- ============================================================
insert into area_approvers (area, approver_profile_id)
select 'Dirección General', p.id
from profiles p
where p.role = 'admin'
order by p.created_at
limit 1
on conflict (area) do nothing;
