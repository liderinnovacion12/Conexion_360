// Contratos emitidos desde el módulo Jurídica. Se referencian con
// src/data/mockApprovals.js (domain: 'contract') vía `approvalRequestId`.
export const CONTRACTS = []

/*
Forma de cada contrato:
{
  id, templateId, templateName,
  personId, personName, personDoc, personArea,
  city, content,             // HTML final (placeholders ya reemplazados)
  status: 'pendiente' | 'aprobado' | 'rechazado',
  createdBy, createdByRole, createdAt,
  consecutive, verificationCode,
  creatorSignature,          // { type, data }
  approvalRequestId,
}
*/
