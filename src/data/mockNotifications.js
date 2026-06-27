import { ROLES } from '../utils/roles.js'

export const NOTIFICATIONS = {
  default: [
    { id: 1, title: 'Bienvenido a Conexión 360', time: 'Hace 2 h', color: '#19E3D9', read: false },
  ],
  [ROLES.ADMIN]: [
    { id: 1, title: '3 documentos llevan más de 5 días sin aprobar', time: 'Hace 25 min', color: '#FF5D73', read: false },
    { id: 2, title: 'Nuevo aspirante creado: Camila Restrepo', time: 'Hace 1 h', color: '#19E3D9', read: false },
    { id: 3, title: 'Nómina de junio lista para revisión', time: 'Hace 3 h', color: '#9B5DE5', read: false },
    { id: 4, title: '2 certificados de seguridad social próximos a vencer', time: 'Ayer', color: '#FFC857', read: true },
  ],
  [ROLES.FINANCE]: [
    { id: 1, title: 'Nómina de junio lista para cierre', time: 'Hace 1 h', color: '#19E3D9', read: false },
    { id: 2, title: 'Solicitud de certificado laboral: María Gómez', time: 'Hace 4 h', color: '#9B5DE5', read: false },
    { id: 3, title: 'Contrato de Jorge Salazar vence en 12 días', time: 'Ayer', color: '#FFC857', read: true },
  ],
  [ROLES.RECRUITMENT]: [
    { id: 1, title: 'Andrés Pérez subió 2 nuevos documentos', time: 'Hace 15 min', color: '#19E3D9', read: false },
    { id: 2, title: 'Camila Restrepo completó el curso de inducción', time: 'Hace 2 h', color: '#2EE6A6', read: false },
    { id: 3, title: '4 documentos pendientes de revisión', time: 'Hace 5 h', color: '#FFC857', read: true },
  ],
  [ROLES.CANDIDATE]: [
    { id: 1, title: 'Tu hoja de vida fue aprobada', time: 'Hace 30 min', color: '#2EE6A6', read: false },
    { id: 2, title: 'Documento devuelto: Certificado académico', time: 'Hace 3 h', color: '#9B5DE5', read: false },
    { id: 3, title: 'Tienes un curso asignado: Inducción HSE', time: 'Ayer', color: '#19E3D9', read: true },
  ],
  [ROLES.EMPLOYEE]: [
    { id: 1, title: 'Tu certificado laboral está disponible', time: 'Hace 1 h', color: '#2EE6A6', read: false },
    { id: 2, title: 'Recuerda actualizar tu EPS', time: 'Ayer', color: '#FFC857', read: true },
  ],
  [ROLES.CONTRACTOR]: [
    { id: 1, title: 'Tu contrato vence en 12 días', time: 'Hace 2 h', color: '#FFC857', read: false },
    { id: 2, title: 'Cuenta de cobro de junio aprobada', time: 'Ayer', color: '#2EE6A6', read: true },
  ],
  [ROLES.AUDITOR]: [
    { id: 1, title: 'Nuevo reporte de cumplimiento disponible', time: 'Hace 1 h', color: '#19E3D9', read: false },
    { id: 2, title: '5 documentos vencidos detectados', time: 'Hace 4 h', color: '#FF5D73', read: true },
  ],
}
