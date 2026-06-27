// ============================================================
// Capa de servicios. Hoy retorna datos mock; mañana cada función
// puede apuntar a Supabase, una API REST/GraphQL u Odoo sin tocar
// los componentes que la consumen.
// ============================================================
import { PERSONNEL } from '../data/mockPersonnel.js'
import { CANDIDATES } from '../data/mockCandidates.js'
import { DOCUMENTS } from '../data/mockDocuments.js'
import { COURSES, COURSE_PROGRESS } from '../data/mockCourses.js'
import { DATA_MODE } from './supabaseClient.js'

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

export const api = {
  mode: DATA_MODE,

  async getPersonnel() {
    await delay()
    return PERSONNEL
  },
  async getCandidates() {
    await delay()
    return CANDIDATES
  },
  async getCandidate(id) {
    await delay()
    return CANDIDATES.find((c) => c.id === id) || null
  },
  async getDocuments(candidateId) {
    await delay()
    return candidateId ? DOCUMENTS.filter((d) => d.candidateId === candidateId) : DOCUMENTS
  },
  async getCourses() {
    await delay()
    return COURSES
  },
  async getCourseProgress(candidateId) {
    await delay()
    return candidateId ? COURSE_PROGRESS.filter((p) => p.candidateId === candidateId) : COURSE_PROGRESS
  },
}

// ---- Integración futura: asistente IA (Anthropic) ----
// La clave NUNCA debe vivir en el cliente. Llamar siempre vía backend / edge function.
export async function askAssistant(/* prompt */) {
  // Ejemplo de contrato esperado del endpoint del servidor:
  // return fetch('/api/assistant', { method: 'POST', body: JSON.stringify({ prompt }) }).then(r => r.json())
  return { message: 'Integración del asistente IA pendiente de configurar en el backend.' }
}
