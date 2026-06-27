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
      { to: '/admin/cursos', label: 'Cursos', icon: GraduationCap },
    ]},
    { section: 'Sistema', items: [
      { to: '/admin/auditoria', label: 'Auditoría', icon: ScrollText },
      { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
    ]},
  ],

  [ROLES.FINANCE]: [
    { section: 'Financiera', items: [
      { to: '/finanzas', label: 'Tablero', icon: LayoutDashboard, end: true },
      { to: '/finanzas/personal', label: 'Registro de personal', icon: Users },
      { to: '/finanzas/nomina', label: 'Analítica de nómina', icon: BarChart3 },
      { to: '/finanzas/certificados', label: 'Certificados laborales', icon: FileSignature },
    ]},
  ],

  [ROLES.RECRUITMENT]: [
    { section: 'Reclutamiento', items: [
      { to: '/reclutamiento', label: 'Tablero', icon: LayoutDashboard, end: true },
      { to: '/reclutamiento/pipeline', label: 'Pipeline', icon: KanbanSquare },
      { to: '/reclutamiento/aspirantes', label: 'Aspirantes', icon: UserPlus },
      { to: '/reclutamiento/documentos', label: 'Revisión documental', icon: ClipboardCheck },
      { to: '/reclutamiento/cursos', label: 'Cursos y evaluaciones', icon: GraduationCap },
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
      { to: '/personal/documentos', label: 'Mis documentos', icon: FileText },
      { to: '/personal/certificados', label: 'Certificados', icon: BadgeCheck },
    ]},
  ],

  [ROLES.CONTRACTOR]: [
    { section: 'Contratista', items: [
      { to: '/contratista', label: 'Inicio', icon: LayoutDashboard, end: true },
      { to: '/contratista/contrato', label: 'Mi contrato', icon: Briefcase },
      { to: '/contratista/documentos', label: 'Mis documentos', icon: FileText },
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
