// Endpoint serverless (Vercel) — elimina un usuario completamente:
// borra su fila en `profiles` Y su cuenta en Supabase Auth.
// Así la persona puede re-registrarse desde cero y recibir el correo
// de confirmación como si fuera la primera vez.
//
// VARIABLES DE ENTORNO NECESARIAS EN VERCEL (sin prefijo VITE_):
//   SUPABASE_URL              = https://tu-proyecto.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY = service role key de Supabase
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
  if (!token) return res.status(401).json({ error: 'Falta el token de autorización.' })

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: callerData, error: callerErr } = await admin.auth.getUser(token)
  if (callerErr || !callerData?.user) {
    return res.status(401).json({ error: 'Sesión inválida o expirada.' })
  }

  const { data: callerProfile, error: profErr } = await admin
    .from('profiles').select('role').eq('id', callerData.user.id).single()
  if (profErr || callerProfile?.role !== 'admin') {
    return res.status(403).json({ error: 'Solo un Administrador puede realizar esta acción.' })
  }

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  const { userId } = body || {}
  if (!userId) return res.status(400).json({ error: 'Falta userId.' })

  // No permitir que el admin se borre a sí mismo
  if (userId === callerData.user.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta.' })
  }

  // 1. Borrar perfil (CASCADE en BD borrará candidates/notifications vinculados si aplica)
  await admin.from('profiles').delete().eq('id', userId)

  // 2. Borrar el auth user — esto libera el correo para re-registro
  const { error: deleteErr } = await admin.auth.admin.deleteUser(userId)
  if (deleteErr) {
    return res.status(400).json({ error: deleteErr.message })
  }

  return res.status(200).json({ success: true })
}
