-- ============================================================
-- Conexión 360 · Columnas de nombre para mostrar en UI sin necesitar
-- join con `profiles` en cada consulta (mismo patrón que
-- uploaded_by_name en `documents`).
-- Aplica DESPUÉS de 0001-0007.
-- ============================================================

alter table documents add column if not exists reviewed_by_name text;
alter table contracts add column if not exists created_by_name text;
alter table generated_documents add column if not exists created_by_name text;
