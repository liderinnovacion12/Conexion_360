// ============================================================
// Capacidades disponibles para el control de permisos por usuario.
// Los valores por defecto (todo habilitado) se generan por persona en
// src/context/PermissionsContext.jsx, a partir de su rol.
// ============================================================

export const CAPABILITY_KEYS = ['canViewDashboard', 'canGenerateDocuments', 'canSign', 'canApprove', 'canChangePassword']

export const CAPABILITY_LABELS = {
  canViewDashboard: 'Ver el tablero (dashboard) de su área',
  canGenerateDocuments: 'Generar documentos (editor / emitir contratos)',
  canSign: 'Firmar los documentos que genera',
  canApprove: 'Aprobar documentos y contratos (líder de área)',
  canChangePassword: 'Cambiar su propia contraseña',
}
