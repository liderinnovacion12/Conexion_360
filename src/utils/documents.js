// ============================================================
// Utilidades para documentos firmados (consecutivo + verificación).
// El consecutivo es secuencial y persistente (localStorage), imitando
// la numeración de un ERP. En producción esto lo entregaría el backend
// (secuencia en base de datos) para garantizar unicidad global.
// ============================================================

const KEY = 'cx360.docConsecutive'

// Lee el consecutivo actual sin incrementarlo.
export function peekConsecutive() {
  return parseInt(localStorage.getItem(KEY) || '0', 10)
}

// Reserva el siguiente consecutivo (incrementa y persiste).
export function nextConsecutive() {
  const n = peekConsecutive() + 1
  localStorage.setItem(KEY, String(n))
  return n
}

// Formato de radicado: CTA-DOC-AAAA-0001
export function formatConsecutive(n, year = new Date().getFullYear()) {
  return `CTA-DOC-${year}-${String(n).padStart(4, '0')}`
}

// Código de verificación determinístico (hash FNV-1a) del contenido firmado.
// Sirve para detectar alteraciones: si el texto o los metadatos cambian,
// el código deja de coincidir.
export function verificationCode(payload) {
  const str = JSON.stringify(payload)
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  const hex = (h >>> 0).toString(36).toUpperCase().padStart(7, '0')
  return `VC-${hex.slice(0, 8)}`
}
