// ============================================================
// RBAC · Definición central de roles, etiquetas y rutas de inicio
// ============================================================

export const ROLES = {
  ADMIN: 'admin',
  FINANCE: 'finance',
  RECRUITMENT: 'recruitment',
  CANDIDATE: 'candidate',
  EMPLOYEE: 'employee',
  CONTRACTOR: 'contractor',
  AUDITOR: 'auditor',
}

// Metadatos visuales y de presentación por rol
export const ROLE_META = {
  [ROLES.ADMIN]: { label: 'Administrador General', short: 'Admin', color: '#9B5DE5', home: '/admin' },
  [ROLES.FINANCE]: { label: 'Área Financiera', short: 'Finanzas', color: '#19E3D9', home: '/finanzas' },
  [ROLES.RECRUITMENT]: { label: 'Área de Reclutamiento', short: 'Reclutamiento', color: '#00BCD4', home: '/reclutamiento' },
  [ROLES.CANDIDATE]: { label: 'Aspirante', short: 'Aspirante', color: '#2EE6A6', home: '/aspirante' },
  [ROLES.EMPLOYEE]: { label: 'Personal Activo', short: 'Personal', color: '#FFC857', home: '/personal' },
  [ROLES.CONTRACTOR]: { label: 'Contratista', short: 'Contratista', color: '#FF8FB1', home: '/contratista' },
  [ROLES.AUDITOR]: { label: 'Auditor / Consulta', short: 'Auditor', color: '#7BD0FF', home: '/auditoria' },
}

export const roleHome = (role) => ROLE_META[role]?.home || '/login'
export const roleLabel = (role) => ROLE_META[role]?.label || role
