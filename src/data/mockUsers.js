import { ROLES } from '../utils/roles.js'

// Cuentas de demostración. En producción esto lo gestiona Supabase Auth
// (la metadata de rol vive en user_metadata / tabla `profiles`).
export const MOCK_USERS = [
  {
    id: 'u-001',
    name: 'Laura Mendoza',
    email: 'admin@conexion360.co',
    password: 'demo',
    role: ROLES.ADMIN,
    avatar: 'LM',
    area: 'Dirección General',
  },
  {
    id: 'u-002',
    name: 'Carlos Ríos',
    email: 'finanzas@conexion360.co',
    password: 'demo',
    role: ROLES.FINANCE,
    avatar: 'CR',
    area: 'Financiera / Nómina',
  },
  {
    id: 'u-003',
    name: 'Daniela Ortiz',
    email: 'reclutamiento@conexion360.co',
    password: 'demo',
    role: ROLES.RECRUITMENT,
    avatar: 'DO',
    area: 'Talento Humano',
  },
  {
    id: 'u-004',
    name: 'Andrés Pérez',
    email: 'aspirante@conexion360.co',
    password: 'demo',
    role: ROLES.CANDIDATE,
    avatar: 'AP',
    area: 'Proceso de selección',
    candidateId: 'c-101',
  },
  {
    id: 'u-005',
    name: 'María Gómez',
    email: 'personal@conexion360.co',
    password: 'demo',
    role: ROLES.EMPLOYEE,
    avatar: 'MG',
    area: 'Operaciones',
    employeeId: 'p-001',
  },
  {
    id: 'u-006',
    name: 'Jorge Salazar',
    email: 'contratista@conexion360.co',
    password: 'demo',
    role: ROLES.CONTRACTOR,
    avatar: 'JS',
    area: 'Prestación de servicios',
    employeeId: 'p-014',
  },
  {
    id: 'u-007',
    name: 'Patricia León',
    email: 'auditor@conexion360.co',
    password: 'demo',
    role: ROLES.AUDITOR,
    avatar: 'PL',
    area: 'Auditoría interna',
  },
]

export const findUserByCredentials = (email, password) =>
  MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  )
