// ============================================================
// Endpoint serverless (Vercel) — único lugar del proyecto donde se usa
// la service role key de Supabase. NUNCA se expone al navegador: vive
// solo aquí, en el servidor, como variable de entorno.
//
// Permite que un Administrador cambie el correo o la contraseña de
// OTRA cuenta desde Admin → Gestión de usuarios. Se necesita este
// endpoint porque esa operación requiere la API de administración de
// Supabase Auth, que solo funciona con la service role key.
//
// Seguridad: antes de tocar nada, este endpoint valida el token de
// quien llama contra Supabase Auth, y confirma en la tabla `profiles`
// que esa persona tiene rol 'admin' — nunca confía en un rol que venga
// del propio cuerpo de la solicitud.
//
// VARIABLES DE ENTORNO NECESARIAS EN VERCEL (Project Settings → Environment
// Variables), NO como VITE_*, para que nunca se incluyan en el bundle
// del navegador:
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

  // 1) ¿Quién llama? Se valida el token contra Supabase Auth.
  const { data: callerData, error: callerErr } = await admin.auth.getUser(token)
  if (callerErr || !callerData?.user) {
    return res.status(401).json({ error: 'Sesión inválida o expirada.' })
  }

  // 2) ¿Es Administrador de verdad? Se confirma en la tabla `profiles`,
  // nunca en algo que venga del cuerpo de la solicitud.
  const { data: callerProfile, error: profErr } = await admin
    .from('profiles')
    .select('role')
    .eq('id', callerData.user.id)
    .single()

  if (profErr || callerProfile?.role !== 'admin') {
    return res.status(403).json({ error: 'Solo un Administrador puede realizar esta acción.' })
  }

  // 3) Validar la entrada.
  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  const { userId, email, password } = body || {}

  if (!userId || (!email && !password)) {
    return res.status(400).json({ error: 'Falta userId y al menos uno de email/password.' })
  }
  if (password && password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' })
  }

  // 4) Aplicar el cambio con privilegios de administrador.
  const attrs = {}
  if (email) {
    attrs.email = email
    attrs.email_confirm = true // el Admin confirma el correo de una vez, sin correo de verificación
  }
  if (password) attrs.password = password

  const { data: updated, error: updateErr } = await admin.auth.admin.updateUserById(userId, attrs)
  if (updateErr) {
    return res.status(400).json({ error: updateErr.message })
  }

  // Mantener sincronizado el correo "de caché" en profiles.
  if (email) {
    await admin.from('profiles').update({ email }).eq('id', userId)
  }

  return res.status(200).json({ success: true, id: updated.user.id, email: updated.user.email })
}
