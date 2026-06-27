// ============================================================
// Punto de integración con Supabase.
// El prototipo funciona con datos mock; cuando se definan las
// variables de entorno y se instale @supabase/supabase-js, este
// cliente queda listo para usarse.
//
//   npm install @supabase/supabase-js
//
// import { createClient } from '@supabase/supabase-js'
// export const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_ANON_KEY
// )
// ============================================================

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'mock'

export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

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
