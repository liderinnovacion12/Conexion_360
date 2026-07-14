// ============================================================
// Cola de aprobación genérica, reutilizable por cualquier dominio
// (contratos, documentos...). Cada solicitud puede enrutarse por una
// CADENA de personas (una o varias, en orden — "de área en área").
// ============================================================

// Líder/aprobador SUGERIDO por área (solo para pre-llenar el primer paso
// de la cadena; el creador puede elegir a cualquier persona activa).
// Referencia los `id` de src/data/mockUsers.js.
export const AREA_APPROVERS = {
  'Jurídica / Contratos': 'u-008',
  'Financiera / Nómina': 'u-002',
  'Talento Humano': 'u-003',
  'Dirección General': 'u-001',
}

// Semilla vacía: las solicitudes reales se van creando desde cada módulo.
export const APPROVALS = []

/*
Forma de cada solicitud:
{
  id, domain: 'contract' | 'document',
  refId, title, area,
  requestedById, requestedBy, requestedByRole, requestedAt,
  creatorSeal: { consecutive, code, date, signature, signerName, signerRole },
  chain: [
    { assignedToId, assignedToName, assignedToRole, area,
      status: 'pendiente' | 'aprobado' | 'rechazado',
      seal: { consecutive, code, date, signature, signerName, signerRole } | null,
      decidedAt, comment },
    ...
  ],
  status: 'pendiente' | 'aprobado' | 'rechazado', // pendiente hasta que se decida el último paso
}
*/
