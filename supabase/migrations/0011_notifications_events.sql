-- Notificaciones reales dirigidas por rol (además de por perfil o
-- globales) + datos para el flotante: a dónde navegar al hacer clic
-- (link) y el texto descriptivo (body).
alter table notifications add column if not exists target_role user_role;
alter table notifications add column if not exists link text;
alter table notifications add column if not exists body text;

drop policy if exists notifications_self_select on notifications;
create policy notifications_self_select on notifications
for select
using (
  profile_id = auth.uid()
  or profile_id is null
  or target_role = current_role_name()
);

-- Habilita Realtime en esta tabla para que el flotante aparezca al
-- instante (sin recargar) cuando llega una notificación nueva.
alter publication supabase_realtime add table notifications;

-- Notifica a Reclutamiento cuando un aspirante sube un documento.
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

drop trigger if exists trg_notify_document_upload on documents;
create trigger trg_notify_document_upload
after insert on documents
for each row execute function notify_on_document_upload();

-- Notifica a Reclutamiento cuando un aspirante se autoregistra (dentro
-- de la misma función de registro, ya SECURITY DEFINER).
create or replace function register_candidate_profile()
returns text
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_role user_role;
  v_existing text;
  v_email text;
  v_name text;
  v_doc text;
  v_new_id text;
begin
  if v_uid is null then
    raise exception 'No autenticado.';
  end if;

  select p.role, p.candidate_id, p.email, p.name
    into v_role, v_existing, v_email, v_name
    from profiles p where p.id = v_uid;

  if v_role is distinct from 'candidate' then
    raise exception 'Esta acción solo está disponible para aspirantes.';
  end if;

  -- Idempotente: si ya está vinculado, no hace nada y devuelve el mismo id.
  if v_existing is not null then
    return v_existing;
  end if;

  select u.raw_user_meta_data->>'doc' into v_doc from auth.users u where u.id = v_uid;

  if v_doc is null or length(trim(v_doc)) = 0 then
    raise exception 'No se encontró el número de documento del registro.';
  end if;

  insert into candidates (name, doc, email, stage, status, progress, track)
  values (coalesce(v_name, ''), v_doc, v_email, 'registro', 'pendiente', 0, 'funcionario')
  returning id into v_new_id;

  update profiles set candidate_id = v_new_id where id = v_uid;

  insert into audit_logs (actor, actor_name, role, action, target)
  values (v_uid, v_name, 'candidate', 'Se registró como aspirante', v_doc);

  insert into notifications (target_role, title, body, link, color)
  values (
    'recruitment',
    'Nuevo aspirante registrado',
    coalesce(v_name, 'Un aspirante') || ' se registró en la plataforma.',
    '/reclutamiento/pipeline',
    '#9B5DE5'
  );

  return v_new_id;
exception
  when unique_violation then
    raise exception 'Ya existe un aspirante registrado con ese número de documento.';
end;
$function$;
