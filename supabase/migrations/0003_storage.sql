-- ============================================================
-- Conexión 360 · Storage (buckets + políticas)
-- Aplica DESPUÉS de 0001 y 0002.
--
-- Buckets PRIVADOS (nada de acceso público): los documentos de
-- aspirantes/personal son datos personales confidenciales. Todo acceso
-- pasa por RLS + URLs firmadas generadas desde la app autenticada.
--
-- Convención de rutas (coincide con docPath()/evidencePath() en
-- src/services/supabaseClient.js):
--   documentos/{candidateId}/{tipo}/v{version}.pdf
--   media/evidencias/{courseId}/{userId}/{timestamp}.jpg
-- ============================================================

insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Bucket "documentos"
-- ------------------------------------------------------------
create policy documentos_owner_select on storage.objects for select
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = public.current_candidate_id()
  );

create policy documentos_owner_insert on storage.objects for insert
  with check (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = public.current_candidate_id()
  );

create policy documentos_staff_all on storage.objects for all
  using (
    bucket_id = 'documentos'
    and public.current_role_name() in ('admin', 'recruitment')
  )
  with check (
    bucket_id = 'documentos'
    and public.current_role_name() in ('admin', 'recruitment')
  );

create policy documentos_readonly_roles on storage.objects for select
  using (
    bucket_id = 'documentos'
    and public.current_role_name() in ('legal', 'auditor')
  );

-- ------------------------------------------------------------
-- Bucket "media" (evidencia de webcam en cursos)
-- ------------------------------------------------------------
create policy media_owner_select on storage.objects for select
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[3] = auth.uid()::text
  );

create policy media_owner_insert on storage.objects for insert
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[3] = auth.uid()::text
  );

create policy media_staff_all on storage.objects for all
  using (
    bucket_id = 'media'
    and public.current_role_name() in ('admin', 'recruitment')
  )
  with check (
    bucket_id = 'media'
    and public.current_role_name() in ('admin', 'recruitment')
  );
