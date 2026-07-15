// Endpoint serverless (Vercel) — envía el correo de "proceso aprobado"
// usando Nodemailer con Gmail (sin Resend).
//
// VARIABLES DE ENTORNO EN VERCEL (sin prefijo VITE_):
//   SUPABASE_URL              = https://tu-proyecto.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY = service role key de Supabase
//   GMAIL_USER                = tucorreo@gmail.com
//   GMAIL_APP_PASSWORD        = contraseña de aplicación de Gmail (16 chars)
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido.' })
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Falta configurar SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el servidor.' })
  }
  if (!GMAIL_USER || !GMAIL_PASS) {
    return res.status(500).json({ error: 'Falta configurar GMAIL_USER / GMAIL_APP_PASSWORD en el servidor.' })
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
  if (!email) return res.status(400).json({ error: 'Falta el correo del aspirante.' })

  const firstName = (name || '').trim().split(' ')[0] || ''

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a2e;">
      <h2 style="color: #19151f;">¡Buenas noticias${firstName ? ', ' + firstName : ''}!</h2>
      <p>Tu proceso en <b>Conexión 360</b> ha sido aprobado.</p>
      <p style="color: #666; font-size: 0.9rem;">Ingresa a la plataforma para ver el detalle y los próximos pasos.</p>
    </div>
  `

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  })

  await transporter.sendMail({
    from: `"Conexión 360" <${GMAIL_USER}>`,
    to: email,
    subject: 'Tu proceso ha sido aprobado — Conexión 360',
    html,
  })

  return res.status(200).json({ success: true })
}
