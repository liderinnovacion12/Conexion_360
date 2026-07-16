-- Solicitudes de permiso del personal (incapacidad, cita médica, etc.)
create table leave_requests (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid references profiles(id) on delete set null,
  employee_id  text references personnel(id) on delete cascade,
  type         text not null,           -- 'incapacidad' | 'medio_dia_votacion' | 'jurado' | 'cita_medica' | 'calamidad' | 'otro'
  other_desc   text,                    -- descripción si type = 'otro'
  observations text,
  files        jsonb not null default '[]',  -- array de paths en Storage
  status       text not null default 'pendiente',  -- 'pendiente' | 'aprobado' | 'devuelto'
  admin_comment text,
  reviewed_by  text,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);

alter table leave_requests enable row level security;

-- El empleado puede ver y crear sus propias solicitudes
create policy leave_own on leave_requests for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Admin ve y gestiona todas
create policy leave_admin on leave_requests for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Reclutamiento puede consultar (solo lectura)
create policy leave_recruitment_select on leave_requests for select
  using (exists (select 1 from profiles where id = auth.uid() and role in ('admin','recruitment')));

create index idx_leave_profile on leave_requests(profile_id);
create index idx_leave_status  on leave_requests(status);
