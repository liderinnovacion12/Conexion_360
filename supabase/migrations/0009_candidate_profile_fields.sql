-- ============================================================
-- Conexión 360 · Campos de datos personales del aspirante
-- El formulario "Mis datos personales" (CandidateProfile.jsx) pedía
-- tipo/número de documento, fecha de nacimiento, género, estado civil,
-- dirección, departamento y nivel educativo — campos que no estaban en
-- el esquema original (solo tenía los relevantes al pipeline).
-- Aplica DESPUÉS de 0001-0008.
-- ============================================================

alter table candidates add column if not exists doc_type text default 'Cédula de ciudadanía';
alter table candidates add column if not exists birth_date date;
alter table candidates add column if not exists gender text;
alter table candidates add column if not exists marital_status text;
alter table candidates add column if not exists address text;
alter table candidates add column if not exists department text;
alter table candidates add column if not exists education_level text;
