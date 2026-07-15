-- ============================================================
-- Conexión 360 · Esquema inicial de base de datos (Supabase/Postgres)
-- Cubre los módulos: usuarios/roles, reclutamiento (aspirantes, pipeline,
-- documentos, cursos, grupos, formularios), jurídica (contratos,
-- plantillas, aprobaciones), financiera (personal/nómina, clientes,
-- facturación), portal cliente (servicios, solicitudes), auditoría y
-- permisos.
--
-- Cómo aplicar:
--   - Supabase Dashboard → SQL Editor → pegar y ejecutar cada archivo en
--     orden (0001, 0002, 0003), o
--   - Supabase CLI: `supabase db push` con estos archivos en supabase/migrations/
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
create type user_role as enum (
  'admin', 'finance', 'recruitment', 'legal', 'candidate', 'employee', 'client', 'auditor'
);

create type candidate_track as enum ('funcionario', 'contratista');

create type candidate_status as enum ('pendiente', 'aprobado', 'rechazado', 'contratado');

create type pipeline_stage as enum (
  'registro', 'doc_pendientes', 'doc_revision', 'doc_devueltos', 'doc_aprobados',
  'curso_asignado', 'curso_completado', 'eval_aprobada', 'apto', 'contratado', 'rechazado'
);

create type document_status as enum ('pendiente', 'aprobado', 'rechazado', 'devuelto', 'vencido');

create type document_visibility as enum ('interno', 'ambos');

create type contract_type as enum ('Indefinido', 'Fijo', 'Obra labor', 'Prestación de servicios');

create type payroll_state as enum ('Activo', 'Inactivo', 'Suspendido');

create type invoice_status as enum ('borrador', 'emitida', 'pagada', 'vencida', 'anulada');

create type approval_domain as enum ('contract', 'document');

create type approval_status as enum ('pendiente', 'aprobado', 'rechazado');

create type service_request_status as enum ('pendiente', 'en gestión', 'atendida', 'cerrada');

create type client_status as enum ('Activo', 'Inactivo');

create type course_type as enum ('video', 'pdf');

-- ------------------------------------------------------------
-- Trigger genérico para updated_at
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------
-- PROFILES (1 fila por usuario de auth.users, con su rol)
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role user_role not null,
  avatar text,
  area text,
  candidate_id text,     -- FK diferida (candidates aún no existe); se añade abajo
  employee_id text,      -- FK diferida (personnel aún no existe); se añade abajo
  client_company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- PERSONNEL (nómina / personal activo, módulo financiero)
-- ------------------------------------------------------------
create table personnel (
  id text primary key default gen_random_uuid()::text,
  doc text not null,
  name text not null,
  position text,
  contract contract_type not null default 'Indefinido',
  salary numeric(14,2),
  state payroll_state not null default 'Activo',
  start_date date,
  end_date date,
  area text,
  profile_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_personnel_updated_at before update on personnel
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- CANDIDATES (aspirantes / pipeline de reclutamiento)
-- ------------------------------------------------------------
create table candidates (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  doc text,
  email text,
  phone text,
  position text,
  stage pipeline_stage not null default 'registro',
  status candidate_status not null default 'pendiente',
  progress int not null default 0 check (progress between 0 and 100),
  city text,
  track candidate_track not null default 'funcionario',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_candidates_updated_at before update on candidates
  for each row execute function set_updated_at();

-- Ahora sí se pueden añadir las FK diferidas de profiles:
alter table profiles
  add constraint fk_profiles_candidate foreign key (candidate_id) references candidates(id) on delete set null,
  add constraint fk_profiles_employee foreign key (employee_id) references personnel(id) on delete set null;

-- ------------------------------------------------------------
-- DOCUMENTOS (catálogo de tipos + cargas + versiones)
-- ------------------------------------------------------------
create table document_types (
  key text primary key,
  label text not null,
  required boolean not null default false
);

create table documents (
  id text primary key default gen_random_uuid()::text,
  candidate_id text not null references candidates(id) on delete cascade,
  type text not null,
  status document_status not null default 'pendiente',
  required boolean not null default false,
  visibility document_visibility not null default 'interno',
  uploaded_by uuid references profiles(id) on delete set null,
  uploaded_by_name text,
  uploaded_at timestamptz not null default now(),
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  comment text,
  version int not null default 1,
  expires date,
  file_path text, -- ruta en el bucket 'documentos' (ver 0003_storage.sql)
  created_at timestamptz not null default now()
);
create index idx_documents_candidate on documents(candidate_id);

create table document_versions (
  id bigserial primary key,
  document_id text not null references documents(id) on delete cascade,
  version int not null,
  uploaded_at timestamptz not null default now(),
  action text,
  by_profile_id uuid references profiles(id) on delete set null,
  by_name text
);
create index idx_document_versions_document on document_versions(document_id);

-- ------------------------------------------------------------
-- CURSOS, PROGRESO, EVALUACIONES Y EVIDENCIA WEBCAM
-- ------------------------------------------------------------
create table courses (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  type course_type not null default 'pdf',
  duration text,
  description text,
  pass_score int not null default 70,
  created_at timestamptz not null default now()
);

create table course_assignments (
  id bigserial primary key,
  course_id text not null references courses(id) on delete cascade,
  candidate_id text not null references candidates(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (course_id, candidate_id)
);

create table course_progress (
  id bigserial primary key,
  course_id text not null references courses(id) on delete cascade,
  candidate_id text not null references candidates(id) on delete cascade,
  progress int not null default 0 check (progress between 0 and 100),
  score int,
  status text not null default 'en curso',
  updated_at timestamptz not null default now(),
  unique (course_id, candidate_id)
);
create trigger trg_course_progress_updated_at before update on course_progress
  for each row execute function set_updated_at();

create table quiz_questions (
  id text primary key default gen_random_uuid()::text,
  course_id text references courses(id) on delete cascade,
  type text not null, -- 'multiple' | 'boolean' | 'open'
  question text not null,
  options jsonb,   -- array de opciones (tipo 'multiple')
  answer jsonb,    -- índice, boolean o null (abierta)
  created_at timestamptz not null default now()
);

create table webcam_evidence (
  id text primary key default gen_random_uuid()::text,
  candidate_id text not null references candidates(id) on delete cascade,
  course_id text references courses(id) on delete set null,
  profile_id uuid references profiles(id) on delete set null,
  storage_path text,
  captured_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- GRUPOS DE ASPIRANTES (muchos a muchos)
-- ------------------------------------------------------------
create table candidate_groups (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  color text,
  created_at timestamptz not null default now()
);

create table candidate_group_members (
  candidate_id text references candidates(id) on delete cascade,
  group_id text references candidate_groups(id) on delete cascade,
  primary key (candidate_id, group_id)
);

-- ------------------------------------------------------------
-- PLANTILLAS DE FORMULARIO (requisitos documentales por vía/grupo)
-- ------------------------------------------------------------
create table form_templates (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  track candidate_track,
  group_id text references candidate_groups(id) on delete cascade,
  fields jsonb not null default '[]', -- [{key,label,type,required,options?}]
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PLANTILLAS LEGALES Y CONTRATOS
-- ------------------------------------------------------------
create table legal_templates (
  id text primary key default gen_random_uuid()::text,
  key text unique not null,
  category text not null,
  name text not null,
  placeholders jsonb not null default '[]',
  body text not null,
  created_at timestamptz not null default now()
);

-- Cola de aprobación genérica (contratos y documentos generados).
create table approvals (
  id text primary key default gen_random_uuid()::text,
  domain approval_domain not null,
  ref_id text,             -- id del contrato o documento generado
  title text,
  area text,
  requested_by uuid references profiles(id) on delete set null,
  requested_by_name text,
  requested_by_role user_role,
  requested_at timestamptz not null default now(),
  creator_seal jsonb,       -- { consecutive, code, date, signature, signerName, signerRole }
  status approval_status not null default 'pendiente'
);

create table approval_chain_steps (
  id bigserial primary key,
  approval_id text not null references approvals(id) on delete cascade,
  step_order int not null,
  assigned_to uuid references profiles(id) on delete set null,
  assigned_to_name text,
  assigned_to_role user_role,
  area text,
  status approval_status not null default 'pendiente',
  seal jsonb,
  decided_at timestamptz,
  comment text,
  unique (approval_id, step_order)
);

create table contracts (
  id text primary key default gen_random_uuid()::text,
  template_id text references legal_templates(id) on delete set null,
  template_name text,
  person_id text,           -- puede ser candidates.id o personnel.id (sin FK estricta)
  person_name text,
  person_doc text,
  person_area text,
  city text,
  content text not null,    -- HTML final con placeholders reemplazados
  status approval_status not null default 'pendiente',
  created_by uuid references profiles(id) on delete set null,
  created_by_role user_role,
  created_at timestamptz not null default now(),
  consecutive text,
  verification_code text,
  creator_signature jsonb,
  approval_request_id text references approvals(id) on delete set null
);

create table generated_documents (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  city text,
  content text not null,
  status approval_status not null default 'pendiente',
  created_by uuid references profiles(id) on delete set null,
  created_by_role user_role,
  created_at timestamptz not null default now(),
  consecutive text,
  verification_code text,
  creator_signature jsonb,
  approval_request_id text references approvals(id) on delete set null
);

-- ------------------------------------------------------------
-- CLIENTES Y FACTURACIÓN (módulo financiero tipo ERP)
-- ------------------------------------------------------------
create table clients (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  nit text,
  contact_name text,
  email text,
  phone text,
  address text,
  city text,
  status client_status not null default 'Activo',
  created_at timestamptz not null default now()
);

create table invoices (
  id text primary key default gen_random_uuid()::text,
  number text unique not null,
  client_id text references clients(id) on delete restrict,
  issue_date date not null,
  due_date date,
  status invoice_status not null default 'borrador',
  notes text,
  tax_rate numeric(5,4) not null default 0.19,
  created_at timestamptz not null default now()
);

create table invoice_items (
  id bigserial primary key,
  invoice_id text not null references invoices(id) on delete cascade,
  description text not null,
  qty numeric(12,2) not null default 1,
  unit_price numeric(14,2) not null default 0
);
create index idx_invoice_items_invoice on invoice_items(invoice_id);

-- Vista con subtotal/impuesto/total calculados (igual que calc() en el mock).
create view invoices_with_totals as
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

-- ------------------------------------------------------------
-- VITRINA DE SERVICIOS Y SOLICITUDES DE CLIENTES
-- ------------------------------------------------------------
create table services (
  id text primary key default gen_random_uuid()::text,
  icon text,
  category text not null,
  name text not null,
  tagline text,
  description text,
  highlight boolean not null default false
);

create table service_requests (
  id text primary key default gen_random_uuid()::text,
  service_id text references services(id) on delete set null,
  service_name text,
  requested_by uuid references profiles(id) on delete set null,
  requested_by_name text,
  company text,
  message text,
  created_at timestamptz not null default now(),
  status service_request_status not null default 'pendiente'
);

-- ------------------------------------------------------------
-- AUDITORÍA, PERMISOS Y NOTIFICACIONES
-- ------------------------------------------------------------
create table audit_logs (
  id text primary key default gen_random_uuid()::text,
  actor uuid references profiles(id) on delete set null,
  actor_name text,
  role text,
  action text not null,
  target text,
  ts timestamptz not null default now(),
  ip text
);
create index idx_audit_logs_ts on audit_logs(ts desc);

create table permissions (
  profile_id uuid primary key references profiles(id) on delete cascade,
  nav jsonb not null default '{}',   -- { "/ruta": true|false }
  caps jsonb not null default '{}',  -- { canViewDashboard: true, ... }
  updated_at timestamptz not null default now()
);
create trigger trg_permissions_updated_at before update on permissions
  for each row execute function set_updated_at();

create table area_approvers (
  area text primary key,
  approver_profile_id uuid references profiles(id) on delete set null
);

create table notifications (
  id bigserial primary key,
  profile_id uuid references profiles(id) on delete cascade, -- null = broadcast a todos
  title text not null,
  color text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_profile on notifications(profile_id);

-- ------------------------------------------------------------
-- Índices adicionales útiles para filtros frecuentes en la app
-- ------------------------------------------------------------
create index idx_candidates_stage on candidates(stage);
create index idx_candidates_track on candidates(track);
create index idx_personnel_state on personnel(state);
create index idx_invoices_status on invoices(status);
create index idx_invoices_client on invoices(client_id);
create index idx_service_requests_status on service_requests(status);
create index idx_approvals_status on approvals(status);
create index idx_contracts_status on contracts(status);
