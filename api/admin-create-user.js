// ============================================================
// Endpoint serverless (Vercel) — crea una cuenta de aspirante directamente
// desde el perfil de Reclutamiento, sin necesidad de que la persona use el
// flujo de autoregistro ni un código de acceso.
//
// Seguridad: valida el token del llamador contra Supabase Auth y confirma
// que su rol en `profiles` sea 'admin' o 'recruitment'. El correo se marca
// como confirmado de inmediato (email_confirm: true) para que el aspirante
// pueda ingresar sin pasos adicionales.
//
// VARIABLES DE ENTORNO NECESARIAS EN VERCEL (no como VITE_*):
//   SUPABASE_URL              = https://tu-proyecto.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY = tu service role key (secreta)
// ============================================================
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido.' })
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Falta configurar SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el servidor.' })
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Falta el token de autorización.' })
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // 1) Validar quién llama.
  const { data: callerData, error: callerErr } = await admin.auth.getUser(token)
  if (callerErr || !callerData?.user) {
    return res.status(401).json({ error: 'Sesión inválida o expirada.' })
  }

  // 2) Confirmar que el rol sea admin o recruitment.
  const { data: callerProfile, error: profErr } = await admin
    .from('profiles')
    .select('role')
    .eq('id', callerData.user.id)
    .single()

  if (profErr || !['admin', 'recruitment'].includes(callerProfile?.role)) {
    return res.status(403).json({ error: 'Solo Administrador o Reclutamiento pueden crear cuentas de aspirantes.' })
  }

  // 3) Validar entrada.
  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  const { name, email, password } = body || {}

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Se requieren nombre, correo y contraseña.' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' })
  }

  // 4) Crear el usuario en Supabase Auth.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createErr) {
    return res.status(400).json({ error: createErr.message })
  }

  // 5) Insertar el perfil con role='candidate'.
  const { error: profileErr } = await admin.from('profiles').insert({
    id: created.user.id,
    name,
    email,
    role: 'candidate',
  })

  if (profileErr) {
    // Rollback: eliminar el auth user si el perfil falló.
    await admin.auth.admin.deleteUser(created.user.id)
    return res.status(500).json({ error: 'No se pudo crear el perfil: ' + profileErr.message })
  }

  return res.status(200).json({ success: true, id: created.user.id, email: created.user.email })
}
