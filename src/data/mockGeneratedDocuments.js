// Documentos creados desde el Editor de documentos (no contratos) y
// enviados a una ruta de aprobación. Se referencian con
// src/data/mockApprovals.js (domain: 'document') vía `approvalRequestId`.
export const GENERATED_DOCUMENTS = []

/*
Forma de cada documento:
{
  id, title, city, content,          // HTML final del cuerpo
  status: 'pendiente' | 'aprobado' | 'rechazado',
  createdBy, createdByRole, createdAt,
  consecutive, verificationCode,
  creatorSignature,                  // { type, data }
  approvalRequestId,
}
*/
