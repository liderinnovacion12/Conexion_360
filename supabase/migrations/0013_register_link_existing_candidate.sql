-- Si ya existe una fila en `candidates` con el mismo documento (por
-- ejemplo, datos de referencia/semilla o un candidato precargado por
-- Reclutamiento) y todavía no está vinculada a ninguna cuenta, el
-- autoregistro se VINCULA a ella en vez de fallar por documento
-- duplicado.
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

  if v_existing is not null then
    return v_existing;
  end if;

  select u.raw_user_meta_data->>'doc' into v_doc from auth.users u where u.id = v_uid;

  if v_doc is null or length(trim(v_doc)) = 0 then
    raise exception 'No se encontró el número de documento del registro.';
  end if;

  select c.id into v_new_id
  from candidates c
  where c.doc = v_doc
    and not exists (select 1 from profiles p where p.candidate_id = c.id)
  limit 1;

  if v_new_id is null then
    insert into candidates (name, doc, email, stage, status, progress, track)
    values (coalesce(v_name, ''), v_doc, v_email, 'registro', 'pendiente', 0, 'funcionario')
    returning id into v_new_id;
  end if;

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
