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
    id: 'u-007',
    name: 'Patricia León',
    email: 'auditor@conexion360.co',
    password: 'demo',
    role: ROLES.AUDITOR,
    avatar: 'PL',
    area: 'Auditoría interna',
  },
  {
    id: 'u-008',
    name: 'Ricardo Vanegas',
    email: 'juridica@conexion360.co',
    password: 'demo',
    role: ROLES.LEGAL,
    avatar: 'RV',
    area: 'Jurídica / Contratos',
  },
  {
    id: 'u-009',
    name: 'Mariana Cárdenas',
    email: 'cliente@conexion360.co',
    password: 'demo',
    role: ROLES.CLIENT,
    avatar: 'MC',
    area: 'Cliente externo',
    clientCompany: 'Distribuidora Andina S.A.S.',
  },
]

// Contraseñas cambiadas por el propio usuario (prototipo: guardadas en
// localStorage, no en el arreglo estático de arriba).
const PW_OVERRIDES_KEY = 'cx360.pwOverrides'
// Lista completa de usuarios, incluidos los creados desde Gestión de
// usuarios (antes se perdían al refrescar; ahora quedan persistidos).
const USERS_KEY = 'cx360.users'

// Cuentas de demo retiradas de la semilla (p. ej. al fusionar el rol
// Contratista en Personal Activo). Quien ya tenía la lista vieja guardada en
// su navegador seguiría viéndolas duplicadas si no se filtran aquí también.
const RETIRED_USER_IDS = ['u-006']

function getPasswordOverrides() {
  try {
    return JSON.parse(localStorage.getItem(PW_OVERRIDES_KEY) || '{}')
  } catch {
    return {}
  }
}

export function setUserPassword(userId, newPassword) {
  const overrides = getPasswordOverrides()
  overrides[userId] = newPassword
  localStorage.setItem(PW_OVERRIDES_KEY, JSON.stringify(overrides))
}

// Fuente de verdad para login: la lista persistida si existe, si no la
// semilla estática. `useUsers()` (hook) escribe bajo esta misma llave.
export function getAllUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    const list = raw ? JSON.parse(raw) : MOCK_USERS
    return list.filter((u) => !RETIRED_USER_IDS.includes(u.id))
  } catch {
    return MOCK_USERS
  }
}

export const findUserByCredentials = (email, password) => {
  const user = getAllUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (!user) return undefined
  const overrides = getPasswordOverrides()
  const effectivePassword = overrides[user.id] || user.password
  return password === effectivePassword ? user : undefined
}
