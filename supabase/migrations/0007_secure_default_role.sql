-- ============================================================
-- Conexión 360 · El trigger de auto-creación de perfil ya NO confía en
-- el rol que venga en el metadata del usuario (podía ser manipulado por
-- cualquiera que llamara directo a la API pública de signUp con la
-- anon key, pidiendo rol 'admin'). Ahora SIEMPRE crea el perfil como
-- 'candidate' — el único rol que el auto-registro público debe poder
-- crear. Cualquier otro rol (finance, recruitment, legal, employee,
-- client, auditor, admin) se asigna después, explícitamente, con la
-- service role key (ver scripts/seed-supabase-users.mjs), nunca desde
-- el cliente.
-- Aplica DESPUÉS de 0001-0006.
-- ============================================================

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
    'candidate',
    coalesce(new.raw_user_meta_data->>'avatar', upper(left(new.email, 2))),
    new.raw_user_meta_data->>'area'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
