-- ============================================================
-- Conexión 360 · Funciones auxiliares + Row Level Security (RBAC)
-- Aplica DESPUÉS de 0001_schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- Funciones auxiliares (leen el perfil del usuario autenticado)
-- ------------------------------------------------------------
create or replace function current_role_name()
returns user_role
language sql stable security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function current_candidate_id()
returns text
language sql stable security definer
set search_path = public
as $$
  select candidate_id from profiles where id = auth.uid();
$$;

create or replace function current_employee_id()
returns text
language sql stable security definer
set search_path = public
as $$
  select employee_id from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean language sql stable as $$ select current_role_name() = 'admin' $$;

-- ------------------------------------------------------------
-- Trigger: crear automáticamente un `profiles` al registrar un usuario
-- en Supabase Auth. El rol/nombre reales se definen leyendo
-- `raw_user_meta_data` (pasado por el backend/admin al crear la cuenta);
-- si no vienen, cae en 'candidate' + placeholders editables luego.
-- ------------------------------------------------------------
create or replace function handle_new_auth_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into profiles (id, name, email, role, avatar, area)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'candidate'),
    coalesce(new.raw_user_meta_data->>'avatar', upper(left(new.email, 2))),
    new.raw_user_meta_data->>'area'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_handle_new_auth_user
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- ============================================================
-- Habilitar RLS en todas las tablas
-- ============================================================
alter table profiles enable row level security;
alter table personnel enable row level security;
alter table candidates enable row level security;
alter table document_types enable row level security;
alter table documents enable row level security;
alter table document_versions enable row level security;
alter table courses enable row level security;
alter table course_assignments enable row level security;
alter table course_progress enable row level security;
alter table quiz_questions enable row level security;
alter table webcam_evidence enable row level security;
alter table candidate_groups enable row level security;
alter table candidate_group_members enable row level security;
alter table form_templates enable row level security;
alter table legal_templates enable row level security;
alter table approvals enable row level security;
alter table approval_chain_steps enable row level security;
alter table contracts enable row level security;
alter table generated_documents enable row level security;
alter table clients enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table services enable row level security;
alter table service_requests enable row level security;
alter table audit_logs enable row level security;
alter table permissions enable row level security;
alter table area_approvers enable row level security;
alter table notifications enable row level security;

-- ============================================================
-- PROFILES
-- Cualquier autenticado puede leer perfiles (para mostrar nombres en
-- aprobaciones, auditoría, etc.). Solo el propio usuario o el admin
-- puede actualizar; solo el admin crea/borra perfiles de otros.
-- ============================================================
create policy profiles_select_all on profiles for select
  using (auth.uid() is not null);

create policy profiles_update_own_or_admin on profiles for update
  using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());

create policy profiles_admin_insert on profiles for insert
  with check (is_admin());

create policy profiles_admin_delete on profiles for delete
  using (is_admin());

-- ============================================================
-- PERSONNEL (nómina / personal) — Financiera y Admin gestionan;
-- el propio empleado ve su fila; auditor solo lectura.
-- ============================================================
create policy personnel_manage on personnel for all
  using (current_role_name() in ('admin', 'finance'))
  with check (current_role_name() in ('admin', 'finance'));

create policy personnel_self_select on personnel for select
  using (id = current_employee_id());

create policy personnel_auditor_select on personnel for select
  using (current_role_name() = 'auditor');

-- ============================================================
-- CANDIDATES — Reclutamiento y Admin gestionan; Jurídica lee;
-- el propio aspirante ve/edita su fila; auditor solo lectura.
-- ============================================================
create policy candidates_manage on candidates for all
  using (current_role_name() in ('admin', 'recruitment'))
  with check (current_role_name() in ('admin', 'recruitment'));

create policy candidates_legal_select on candidates for select
  using (current_role_name() = 'legal');

create policy candidates_auditor_select on candidates for select
  using (current_role_name() = 'auditor');

create policy candidates_self_select on candidates for select
  using (id = current_candidate_id());

create policy candidates_self_update on candidates for update
  using (id = current_candidate_id())
  with check (id = current_candidate_id());

-- ============================================================
-- DOCUMENT_TYPES (catálogo) — lectura para todos los autenticados,
-- solo Reclutamiento/Admin lo edita.
-- ============================================================
create policy document_types_select_all on document_types for select
  using (auth.uid() is not null);

create policy document_types_manage on document_types for all
  using (current_role_name() in ('admin', 'recruitment'))
  with check (current_role_name() in ('admin', 'recruitment'));

-- ============================================================
-- DOCUMENTS — Reclutamiento/Admin gestionan y revisan; el aspirante
-- dueño puede ver y cargar (insert) los suyos; Jurídica/Auditor leen.
-- ============================================================
create policy documents_manage on documents for all
  using (current_role_name() in ('admin', 'recruitment'))
  with check (current_role_name() in ('admin', 'recruitment'));

create policy documents_owner_select on documents for select
  using (candidate_id = current_candidate_id());

create policy documents_owner_insert on documents for insert
  with check (candidate_id = current_candidate_id());

create policy documents_read_only_roles on documents for select
  using (current_role_name() in ('legal', 'auditor'));

create policy document_versions_select on document_versions for select
  using (
    current_role_name() in ('admin', 'recruitment', 'legal', 'auditor')
    or exists (
      select 1 from documents d
      where d.id = document_versions.document_id and d.candidate_id = current_candidate_id()
    )
  );

create policy document_versions_manage on document_versions for insert
  with check (current_role_name() in ('admin', 'recruitment'));

-- ============================================================
-- CURSOS / PROGRESO / EVALUACIONES / EVIDENCIA
-- ============================================================
create policy courses_select_all on courses for select
  using (auth.uid() is not null);

create policy courses_manage on courses for all
  using (current_role_name() in ('admin', 'recruitment'))
  with check (current_role_name() in ('admin', 'recruitment'));

create policy course_assignments_manage on course_assignments for all
  using (current_role_name() in ('admin', 'recruitment'))
  with check (current_role_name() in ('admin', 'recruitment'));

create policy course_assignments_self_select on course_assignments for select
  using (candidate_id = current_candidate_id());

create policy course_progress_manage on course_progress for all
  using (current_role_name() in ('admin', 'recruitment'))
  with check (current_role_name() in ('admin', 'recruitment'));

create policy course_progress_self_select on course_progress for select
  using (candidate_id = current_candidate_id());

create policy course_progress_self_upsert on course_progress for insert
  with check (candidate_id = current_candidate_id());

create policy course_progress_self_update on course_progress for update
  using (candidate_id = current_candidate_id())
  with check (candidate_id = current_candidate_id());

create policy quiz_questions_select_all on quiz_questions for select
  using (auth.uid() is not null);

create policy quiz_questions_manage on quiz_questions for all
  using (current_role_name() in ('admin', 'recruitment'))
  with check (current_role_name() in ('admin', 'recruitment'));

create policy webcam_evidence_manage on webcam_evidence for all
  using (current_role_name() in ('admin', 'recruitment'))
  with check (current_role_name() in ('admin', 'recruitment'));

create policy webcam_evidence_self_insert on webcam_evidence for insert
  with check (candidate_id = current_candidate_id());

create policy webcam_evidence_self_select on webcam_evidence for select
  using (candidate_id = current_candidate_id());

-- ============================================================
-- GRUPOS DE ASPIRANTES
-- ============================================================
create policy candidate_groups_manage on candidate_groups for all
  using (current_role_name() in ('admin', 'recruitment'))
  with check (current_role_name() in ('admin', 'recruitment'));

create policy candidate_groups_select_all on candidate_groups for select
  using (auth.uid() is not null);

create policy candidate_group_members_manage on candidate_group_members for all
  using (current_role_name() in ('admin', 'recruitment'))
  with check (current_role_name() in ('admin', 'recruitment'));

create policy candidate_group_members_select_all on candidate_group_members for select
  using (auth.uid() is not null);

-- ============================================================
-- FORM TEMPLATES
-- ============================================================
create policy form_templates_manage on form_templates for all
  using (current_role_name() in ('admin', 'recruitment'))
  with check (current_role_name() in ('admin', 'recruitment'));

create policy form_templates_select_all on form_templates for select
  using (auth.uid() is not null);

-- ============================================================
-- LEGAL TEMPLATES / CONTRATOS / DOCUMENTOS GENERADOS / APROBACIONES
-- ============================================================
create policy legal_templates_manage on legal_templates for all
  using (current_role_name() in ('admin', 'legal'))
  with check (current_role_name() in ('admin', 'legal'));

create policy legal_templates_select_all on legal_templates for select
  using (auth.uid() is not null);

create policy contracts_manage on contracts for all
  using (current_role_name() in ('admin', 'legal', 'recruitment'))
  with check (current_role_name() in ('admin', 'legal', 'recruitment'));

create policy contracts_auditor_select on contracts for select
  using (current_role_name() = 'auditor');

create policy generated_documents_manage on generated_documents for all
  using (current_role_name() in ('admin', 'legal', 'recruitment', 'finance'))
  with check (current_role_name() in ('admin', 'legal', 'recruitment', 'finance'));

create policy approvals_manage on approvals for all
  using (current_role_name() in ('admin', 'legal', 'recruitment', 'finance'))
  with check (current_role_name() in ('admin', 'legal', 'recruitment', 'finance'));

create policy approvals_assignee_select on approvals for select
  using (
    exists (
      select 1 from approval_chain_steps s
      where s.approval_id = approvals.id and s.assigned_to = auth.uid()
    )
  );

create policy approval_chain_steps_manage on approval_chain_steps for all
  using (current_role_name() in ('admin', 'legal', 'recruitment', 'finance'))
  with check (current_role_name() in ('admin', 'legal', 'recruitment', 'finance'));

-- El asignado de un paso puede ver y decidir (aprobar/rechazar) su propio paso.
create policy approval_chain_steps_assignee_select on approval_chain_steps for select
  using (assigned_to = auth.uid());

create policy approval_chain_steps_assignee_update on approval_chain_steps for update
  using (assigned_to = auth.uid())
  with check (assigned_to = auth.uid());

-- ============================================================
-- CLIENTES / FACTURACIÓN — solo Financiera y Admin.
-- ============================================================
create policy clients_manage on clients for all
  using (current_role_name() in ('admin', 'finance'))
  with check (current_role_name() in ('admin', 'finance'));

create policy clients_auditor_select on clients for select
  using (current_role_name() = 'auditor');

create policy invoices_manage on invoices for all
  using (current_role_name() in ('admin', 'finance'))
  with check (current_role_name() in ('admin', 'finance'));

create policy invoices_auditor_select on invoices for select
  using (current_role_name() = 'auditor');

create policy invoice_items_manage on invoice_items for all
  using (current_role_name() in ('admin', 'finance'))
  with check (current_role_name() in ('admin', 'finance'));

create policy invoice_items_auditor_select on invoice_items for select
  using (current_role_name() = 'auditor');

-- ============================================================
-- VITRINA DE SERVICIOS / SOLICITUDES DE CLIENTES
-- ============================================================
create policy services_select_all on services for select
  using (auth.uid() is not null);

create policy services_manage on services for all
  using (current_role_name() = 'admin')
  with check (current_role_name() = 'admin');

create policy service_requests_manage on service_requests for all
  using (current_role_name() = 'admin')
  with check (current_role_name() = 'admin');

create policy service_requests_client_select on service_requests for select
  using (requested_by = auth.uid());

create policy service_requests_client_insert on service_requests for insert
  with check (requested_by = auth.uid() and current_role_name() = 'client');

-- ============================================================
-- AUDITORÍA — Auditor y Admin ven todo; cada rol ve solo lo propio
-- ("Mis actividades"); cualquiera autenticado puede insertar su propio
-- registro (lo hace la app tras cada acción relevante).
-- ============================================================
create policy audit_logs_admin_auditor_select on audit_logs for select
  using (current_role_name() in ('admin', 'auditor'));

create policy audit_logs_self_select on audit_logs for select
  using (actor = auth.uid());

create policy audit_logs_insert_own on audit_logs for insert
  with check (actor = auth.uid());

-- ============================================================
-- PERMISOS (RBAC granular por persona) — solo Admin gestiona;
-- cada usuario puede leer los suyos (para aplicar el filtrado en el
-- sidebar sin depender de un rol elevado).
-- ============================================================
create policy permissions_admin_manage on permissions for all
  using (is_admin())
  with check (is_admin());

create policy permissions_self_select on permissions for select
  using (profile_id = auth.uid());

create policy area_approvers_admin_manage on area_approvers for all
  using (is_admin())
  with check (is_admin());

create policy area_approvers_select_all on area_approvers for select
  using (auth.uid() is not null);

-- ============================================================
-- NOTIFICACIONES — cada usuario ve las suyas + las broadcast (profile_id
-- null); solo Admin (o la propia app vía service role) crea nuevas.
-- ============================================================
create policy notifications_self_select on notifications for select
  using (profile_id = auth.uid() or profile_id is null);

create policy notifications_self_update on notifications for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy notifications_admin_insert on notifications for insert
  with check (is_admin());
