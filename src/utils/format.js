// Helpers de formato (es-CO)

export const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
    Number(n) || 0
  )

export const formatNumber = (n) => new Intl.NumberFormat('es-CO').format(Number(n) || 0)

export const formatDate = (d) => {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export const formatDateTime = (d) => {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

export const daysBetween = (a, b = new Date()) => {
  const d1 = new Date(a)
  const d2 = new Date(b)
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
}

// Estado documental -> variante de Badge
export const docStatusVariant = {
  pendiente: 'warning',
  'en revisión': 'info',
  aprobado: 'success',
  devuelto: 'violet',
  rechazado: 'danger',
  vencido: 'danger',
}
