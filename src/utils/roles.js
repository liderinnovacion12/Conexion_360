// ============================================================
// RBAC · Definición central de roles, etiquetas y rutas de inicio
// ============================================================

export const ROLES = {
  ADMIN: 'admin',
  FINANCE: 'finance',
  RECRUITMENT: 'recruitment',
  LEGAL: 'legal',
  CANDIDATE: 'candidate',
  EMPLOYEE: 'employee',
  CLIENT: 'client',
  AUDITOR: 'auditor',
}

// Metadatos visuales y de presentación por rol
export const ROLE_META = {
  [ROLES.ADMIN]: { label: 'Administrador General', short: 'Admin', color: '#9B5DE5', home: '/admin' },
  [ROLES.FINANCE]: { label: 'Área Financiera', short: 'Finanzas', color: '#19E3D9', home: '/finanzas' },
  [ROLES.RECRUITMENT]: { label: 'Área de Reclutamiento', short: 'Reclutamiento', color: '#00BCD4', home: '/reclutamiento' },
  [ROLES.LEGAL]: { label: 'Área Jurídica', short: 'Jurídica', color: '#E63946', home: '/juridica' },
  [ROLES.CANDIDATE]: { label: 'Aspirante', short: 'Aspirante', color: '#2EE6A6', home: '/aspirante' },
  [ROLES.EMPLOYEE]: { label: 'Personal Activo', short: 'Personal', color: '#FFC857', home: '/personal' },
  [ROLES.CLIENT]: { label: 'Cliente', short: 'Cliente', color: '#FF8FB1', home: '/cliente' },
  [ROLES.AUDITOR]: { label: 'Auditor / Consulta', short: 'Auditor', color: '#7BD0FF', home: '/auditoria' },
}

export const roleHome = (role) => ROLE_META[role]?.home || '/login'
export const roleLabel = (role) => ROLE_META[role]?.label || role
