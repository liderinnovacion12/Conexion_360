// ============================================================
// Endpoint serverless (Vercel) — envía el correo de "proceso aprobado"
// a un aspirante cuando el Administrador da la aprobación final.
//
// Igual que api/admin-update-user.js: valida que quien llama esté
// autenticado y sea Administrador (contra la tabla `profiles`, nunca
// contra el cuerpo de la solicitud) antes de hacer nada. La API key de
// Resend vive SOLO aquí, nunca en el navegador.
//
// VARIABLES DE ENTORNO NECESARIAS EN VERCEL (Project Settings >
// Environment Variables), NO como VITE_*:
//   SUPABASE_URL              = https://tu-proyecto.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY = tu service role key (secreta)
//   RESEND_API_KEY            = tu API key de resend.com (secreta)
//   RESEND_FROM (opcional)    = remitente verificado, ej:
//                               "Conexión 360 <notificaciones@tudominio.co>"
//                               Si no lo configuras, usa el remitente de
//                               pruebas de Resend (onboarding@resend.dev),
//                               válido solo para probar, no para producción real.
// ============================================================
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM = process.env.RESEND_FROM || 'Conexión 360 <onboarding@resend.dev>'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido.' })
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Falta configurar SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el servidor.' })
  }
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'Falta configurar RESEND_API_KEY en el servidor.' })
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Falta el token de autorización.' })
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: callerData, error: callerErr } = await admin.auth.getUser(token)
  if (callerErr || !callerData?.user) {
    return res.status(401).json({ error: 'Sesión inválida o expirada.' })
  }

  const { data: callerProfile, error: profErr } = await admin
    .from('profiles')
    .select('role')
    .eq('id', callerData.user.id)
    .single()

  if (profErr || callerProfile?.role !== 'admin') {
    return res.status(403).json({ error: 'Solo un Administrador puede realizar esta acción.' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  const { email, name } = body || {}
  if (!email) {
    return res.status(400).json({ error: 'Falta el correo del aspirante.' })
  }

  const firstName = (name || '').trim().split(' ')[0] || ''

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a2e;">
      <h2 style="color: #19151f;">¡Buenas noticias${firstName ? ', ' + firstName : ''}!</h2>
      <p>Tu proceso en <b>Conexión 360</b> ha sido aprobado.</p>
      <p style="color: #666; font-size: 0.9rem;">Ingresa a la plataforma para ver el detalle y los próximos pasos.</p>
    </div>
  `

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [email],
      subject: 'Tu proceso ha sido aprobado — Conexión 360',
      html,
    }),
  })

  const result = await resp.json().catch(() => ({}))
  if (!resp.ok) {
    return res.status(400).json({ error: result.message || 'No se pudo enviar el correo.' })
  }

  return res.status(200).json({ success: true, id: result.id })
}
