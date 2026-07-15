-- ============================================================
-- Conexión 360 · Auto-registro de aspirantes
-- Aplica DESPUÉS de 0001-0005.
--
-- Permite que un aspirante se registre por su cuenta (nombre, cédula,
-- correo, contraseña propia) sin depender de que Reclutamiento lo cree
-- manualmente. El flujo real es:
--   1. Frontend llama supabase.auth.signUp({ email, password,
--      options: { data: { name, role: 'candidate', area: '...', doc } } })
--   2. El trigger handle_new_auth_user (0002) crea la fila en `profiles`
--      con role='candidate' (candidate_id todavía null).
--   3. En el primer login (o justo tras el signUp si no requiere
--      confirmación de correo), el frontend llama
--      `select register_candidate_profile()` vía RPC. Esta función crea
--      la fila en `candidates` con el doc guardado en el metadata del
--      usuario, y enlaza profiles.candidate_id.
-- ============================================================

alter table candidates add constraint candidates_doc_unique unique (doc);

create or replace function register_candidate_profile()
returns text
language plpgsql security definer set search_path = public
as $$
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

  insert into candidates (name, doc, email, stage, status, progress, track)
  values (coalesce(v_name, ''), v_doc, v_email, 'registro', 'pendiente', 0, 'funcionario')
  returning id into v_new_id;

  update profiles set candidate_id = v_new_id where id = v_uid;

  insert into audit_logs (actor, actor_name, role, action, target)
  values (v_uid, v_name, 'candidate', 'Se registró como aspirante', v_doc);

  return v_new_id;
exception
  when unique_violation then
    raise exception 'Ya existe un aspirante registrado con ese número de documento.';
end;
$$;

revoke execute on function register_candidate_profile() from public, anon;
grant execute on function register_candidate_profile() to authenticated;
