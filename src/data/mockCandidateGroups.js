// Grupos libres de aspirantes (ej. Abogados, Ingenieros...). El reclutador
// los crea cuando quiera y asigna candidatos — relación muchos a muchos.
export const GROUPS = [
  { id: 'grp-abogados', name: 'Abogados', color: '#9B5DE5', createdAt: '2025-05-10' },
  { id: 'grp-ingenieros', name: 'Ingenieros', color: '#19E3D9', createdAt: '2025-05-12' },
  { id: 'grp-operativo', name: 'Personal Operativo', color: '#FFC857', createdAt: '2025-05-15' },
]

// Mapa candidato ↔ grupo (muchos a muchos).
export const CANDIDATE_GROUP_MAP = [
  { candidateId: 'c-104', groupId: 'grp-abogados' },
  { candidateId: 'c-110', groupId: 'grp-abogados' },
  { candidateId: 'c-102', groupId: 'grp-ingenieros' },
  { candidateId: 'c-109', groupId: 'grp-ingenieros' },
  { candidateId: 'c-101', groupId: 'grp-operativo' },
  { candidateId: 'c-103', groupId: 'grp-operativo' },
  { candidateId: 'c-105', groupId: 'grp-operativo' },
  { candidateId: 'c-107', groupId: 'grp-operativo' },
  { candidateId: 'c-111', groupId: 'grp-operativo' },
]
