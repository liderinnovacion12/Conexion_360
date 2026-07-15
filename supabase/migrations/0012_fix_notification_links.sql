-- Corrige la ruta de destino del flotante de "nuevo documento subido":
-- la revisión documental vive en /reclutamiento/documentos, no en
-- /reclutamiento/revision-documentos (error de tipeo en 0011).
create or replace function notify_on_document_upload()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cand_name text;
begin
  select name into cand_name from candidates where id = new.candidate_id;
  insert into notifications (target_role, title, body, link, color)
  values (
    'recruitment',
    'Nuevo documento subido',
    coalesce(cand_name, 'Un aspirante') || ' subió: ' || new.type,
    '/reclutamiento/documentos',
    '#19E3D9'
  );
  return new;
end;
$$;
