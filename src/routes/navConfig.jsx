import {
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  GraduationCap,
  KanbanSquare,
  UserPlus,
  ClipboardCheck,
  ShieldCheck,
  Settings,
  FileSignature,
  FolderOpen,
  Briefcase,
  BadgeCheck,
  ScrollText,
  BarChart3,
  Scale,
  Gavel,
  CheckSquare,
  Lock,
  Building2,
  Receipt,
  UsersRound,
  ListChecks,
  Activity,
  Store,
} from 'lucide-react'
import { ROLES } from '../utils/roles.js'

// Estructura de navegación por rol. Cada rol ve únicamente sus rutas.
// `section` agrupa los enlaces en el sidebar.
export const NAV_CONFIG = {
  [ROLES.ADMIN]: [
    { section: 'General', items: [
      { to: '/admin', label: 'Panel ejecutivo', icon: LayoutDashboard, end: true },
      { to: '/admin/usuarios', label: 'Gestión de usuarios', icon: Users },
    ]},
    { section: 'Operación', items: [
      { to: '/admin/reclutamiento', label: 'Reclutamiento', icon: KanbanSquare },
      { to: '/admin/nomina', label: 'Nómina y personal', icon: Wallet },
      { to: '/admin/documentos', label: 'Documentos', icon: FolderOpen },
      { to: '/admin/editor-documentos', label: 'Editor de documentos', icon: FileSignature },
      { to: '/admin/documentos-por-firmar', label: 'Documentos por firmar', icon: CheckSquare },
      { to: '/admin/actividades', label: 'Mis actividades', icon: Activity },
      { to: '/admin/cursos', label: 'Cursos', icon: GraduationCap },
      { to: '/admin/solicitudes-clientes', label: 'Solicitudes de clientes', icon: Store },
    ]},
    { section: 'Sistema', items: [
      { to: '/admin/actividades-sistema', label: 'Actividades del sistema', icon: Activity },
      { to: '/admin/auditoria', label: 'Auditoría', icon: ScrollText },
      { to: '/admin/permisos', label: 'Permisos', icon: Lock },
      { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
    ]},
  ],

  [ROLES.FINANCE]: [
    { section: 'Financiera', items: [
      { to: '/finanzas', label: 'Tablero', icon: LayoutDashboard, end: true },
      { to: '/finanzas/personal', label: 'Registro de personal', icon: Users },
      { to: '/finanzas/nomina', label: 'Analítica de nómina', icon: BarChart3 },
      { to: '/finanzas/certificados', label: 'Certificados laborales', icon: FileSignature },
      { to: '/finanzas/editor-documentos', label: 'Editor de documentos', icon: FileSignature },
      { to: '/finanzas/documentos-por-firmar', label: 'Documentos por firmar', icon: CheckSquare },
      { to: '/finanzas/actividades', label: 'Actividades', icon: Activity },
    ]},
    { section: 'Facturación', items: [
      { to: '/finanzas/clientes', label: 'Clientes', icon: Building2 },
      { to: '/finanzas/facturacion', label: 'Facturación electrónica', icon: Receipt },
    ]},
  ],

  [ROLES.RECRUITMENT]: [
    { section: 'Reclutamiento', items: [
      { to: '/reclutamiento', label: 'Tablero', icon: LayoutDashboard, end: true },
      { to: '/reclutamiento/pipeline', label: 'Pipeline', icon: KanbanSquare },
      { to: '/reclutamiento/aspirantes', label: 'Aspirantes (contratistas y funcionarios)', icon: UserPlus },
      { to: '/reclutamiento/grupos', label: 'Grupos de aspirantes', icon: UsersRound },
      { to: '/reclutamiento/formularios', label: 'Constructor de formularios', icon: ListChecks },
      { to: '/reclutamiento/documentos', label: 'Revisión documental', icon: ClipboardCheck },
      { to: '/reclutamiento/editor-documentos', label: 'Editor de documentos', icon: FileSignature },
      { to: '/reclutamiento/aprobaciones', label: 'Aprobar contratos', icon: CheckSquare },
      { to: '/reclutamiento/documentos-por-firmar', label: 'Documentos por firmar', icon: CheckSquare },
      { to: '/reclutamiento/actividades', label: 'Actividades', icon: Activity },
      { to: '/reclutamiento/cursos', label: 'Cursos y evaluaciones', icon: GraduationCap },
    ]},
  ],

  [ROLES.LEGAL]: [
    { section: 'Jurídica', items: [
      { to: '/juridica', label: 'Tablero', icon: LayoutDashboard, end: true },
      { to: '/juridica/plantillas', label: 'Plantillas de contrato', icon: Scale },
      { to: '/juridica/contratos', label: 'Emitir contratos', icon: Gavel },
      { to: '/juridica/editor-documentos', label: 'Editor de documentos', icon: FileSignature },
      { to: '/juridica/aprobaciones', label: 'Aprobaciones de contratos', icon: CheckSquare },
      { to: '/juridica/documentos-por-firmar', label: 'Documentos por firmar', icon: CheckSquare },
      { to: '/juridica/actividades', label: 'Actividades', icon: Activity },
      { to: '/juridica/aspirantes', label: 'Datos de aspirantes', icon: UserPlus },
    ]},
  ],

  [ROLES.CANDIDATE]: [
    { section: 'Mi proceso', items: [
      { to: '/aspirante', label: 'Inicio', icon: LayoutDashboard, end: true },
      { to: '/aspirante/perfil', label: 'Mis datos', icon: Users },
      { to: '/aspirante/documentos', label: 'Mis documentos', icon: FileText },
      { to: '/aspirante/autorizacion', label: 'Autorización de datos', icon: FileSignature },
      { to: '/aspirante/cursos', label: 'Cursos asignados', icon: GraduationCap },
    ]},
  ],

  [ROLES.EMPLOYEE]: [
    { section: 'Mi espacio', items: [
      { to: '/personal', label: 'Inicio', icon: LayoutDashboard, end: true },
      { to: '/personal/perfil', label: 'Mi información', icon: Users },
      { to: '/personal/contrato', label: 'Mi contrato', icon: Briefcase },
      { to: '/personal/documentos', label: 'Mis documentos', icon: FileText },
      { to: '/personal/certificados', label: 'Certificados', icon: BadgeCheck },
    ]},
  ],

  [ROLES.CLIENT]: [
    { section: 'Conexión 360', items: [
      { to: '/cliente', label: 'Servicios', icon: Store, end: true },
      { to: '/cliente/solicitudes', label: 'Mis solicitudes', icon: ListChecks },
    ]},
  ],

  [ROLES.AUDITOR]: [
    { section: 'Consulta', items: [
      { to: '/auditoria', label: 'Tablero analítico', icon: LayoutDashboard, end: true },
      { to: '/auditoria/registros', label: 'Registros de auditoría', icon: ScrollText },
      { to: '/auditoria/cumplimiento', label: 'Cumplimiento documental', icon: ShieldCheck },
    ]},
  ],
}
