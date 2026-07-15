// ============================================================
// Punto de integración con Supabase.
//
// DATA_MODE controla el comportamiento de toda la app:
//   'mock'     -> datos de ejemplo en memoria/localStorage (sin backend)
//   'supabase' -> lee/escribe en el proyecto Supabase real (ver
//                 supabase/migrations/ y scripts/seed-supabase-users.mjs)
// ============================================================
import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'mock'

export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

// Cliente único de Supabase. Solo se instancia si hay credenciales — en
// modo 'mock' (o si falta configurar el .env) queda en null y ningún
// código debería llamarlo directamente sin pasar antes por
// `isSupabaseConfigured()` / revisar `DATA_MODE`.
// persistSession: false a propósito — cada vez que se abre/recarga la
// app debe mostrarse el login (correo y contraseña), nunca restaurar
// automáticamente una sesión anterior ni entrar directo a un área.
export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null

// Estructura de buckets esperada en Supabase Storage.
export const STORAGE_BUCKETS = {
  documentos: import.meta.env.VITE_SUPABASE_DOCS_BUCKET || 'documentos',
  media: import.meta.env.VITE_SUPABASE_MEDIA_BUCKET || 'media',
}

// Convención de rutas para almacenamiento seguro por candidato.
//   documentos/{candidateId}/{tipo}/{version}.pdf
//   media/evidencias/{courseId}/{userId}/{timestamp}.jpg
export const docPath = (candidateId, tipo, version = 1) =>
  `${candidateId}/${tipo}/v${version}.pdf`

export const evidencePath = (courseId, userId, ts) =>
  `evidencias/${courseId}/${userId}/${ts}.jpg`

// Sube un archivo al bucket de documentos y devuelve la ruta guardada
// (para poner en documents.file_path). Requiere sesión autenticada y
// que las políticas de Storage (0003_storage.sql) permitan al candidato
// escribir en su propia carpeta.
export async function uploadDocumentFile(candidateId, tipo, file, version = 1) {
  if (!supabase) throw new Error('Supabase no está configurado (VITE_SUPABASE_URL/ANON_KEY).')
  const path = docPath(candidateId, tipo, version)
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.documentos)
    .upload(path, file, { upsert: true, contentType: file.type || 'application/pdf' })
  if (error) throw error
  return path
}

// Genera una URL firmada temporal para ver/descargar un documento privado.
export async function getSignedDocumentUrl(path, expiresInSeconds = 300) {
  if (!supabase) throw new Error('Supabase no está configurado (VITE_SUPABASE_URL/ANON_KEY).')
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.documentos)
    .createSignedUrl(path, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}
