import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { MOCK_USERS, setUserPassword } from '../data/mockUsers.js'
import {
  USE_SUPABASE,
  listUsers,
  updateUserProfile,
  removeUserProfile,
  adminUpdateAuthUser,
} from '../services/api.js'

// Cuentas de demo retiradas de la semilla (ver mockUsers.js) — se filtran
// aquí también porque este hook lee la lista persistida directamente, sin
// pasar por getAllUsers().
const RETIRED_USER_IDS = ['u-006']
const hasRetired = (list) => list.some((u) => RETIRED_USER_IDS.includes(u.id))

// Lista completa de usuarios. En modo Supabase gestiona el PERFIL (rol,
// área, vínculos) de cuentas que ya existen en auth.users — crear una
// cuenta de acceso real requiere la service-role key (server-side, aún no
// disponible), así que `addUser` en este modo solo queda documentado como
// no soportado desde el navegador; usa el script de semilla o el flujo de
// autoregistro de aspirantes para crear cuentas nuevas.
export function useUsers() {
  const [rawUsers, setUsers] = useLocalStorage('cx360.users', MOCK_USERS)
  const [remoteUsers, setRemoteUsers] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    listUsers().then(setRemoteUsers).finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  // Memoizado: filtrar sin esto crea un arreglo nuevo en cada render, lo que
  // rompe la identidad de referencia que espera el useEffect de
  // PermissionsContext (dependía de `users`) y provoca un loop infinito.
  const users = useMemo(
    () => (USE_SUPABASE ? remoteUsers : (hasRetired(rawUsers) ? rawUsers.filter((u) => !RETIRED_USER_IDS.includes(u.id)) : rawUsers)),
    [remoteUsers, rawUsers]
  )

  // Autolimpieza (solo modo mock): quien ya tenía una cuenta retirada
  // guardada en su navegador deja de verla también en el storage persistido.
  useEffect(() => {
    if (USE_SUPABASE) return
    if (hasRetired(rawUsers)) {
      setUsers((list) => list.filter((u) => !RETIRED_USER_IDS.includes(u.id)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawUsers])

  const addUser = async (user) => {
    if (USE_SUPABASE) {
      throw new Error('Crear cuentas de acceso reales requiere un endpoint con permisos de administrador (aún no disponible). Usa el registro de aspirantes o el script de semilla.')
    }
    const item = { id: `u-${Date.now()}`, password: 'demo', ...user }
    setUsers((list) => [...list, item])
    return item
  }

  const updateUser = async (id, patch) => {
    if (USE_SUPABASE) {
      const item = await updateUserProfile(id, patch)
      setRemoteUsers((list) => list.map((u) => (u.id === id ? item : u)))
      return
    }
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }

  const removeUser = async (id) => {
    if (USE_SUPABASE) {
      await removeUserProfile(id)
      setRemoteUsers((list) => list.filter((u) => u.id !== id))
      return
    }
    setUsers((list) => list.filter((u) => u.id !== id))
  }

  // Cambiar el correo y/o la contraseña de OTRA cuenta. En modo Supabase
  // pasa por el endpoint seguro (api/admin-update-user.js) que usa la
  // service role key solo del lado del servidor. En modo mock, se
  // mantiene el comportamiento original (contraseña en localStorage).
  const adminUpdateCredentials = async (id, { email, password }) => {
    if (USE_SUPABASE) {
      await adminUpdateAuthUser({ userId: id, email, password })
      if (email) setRemoteUsers((list) => list.map((u) => (u.id === id ? { ...u, email } : u)))
      return
    }
    if (email) setUsers((list) => list.map((u) => (u.id === id ? { ...u, email } : u)))
    if (password) setUserPassword(id, password)
  }

  return { users, loading, addUser, updateUser, removeUser, adminUpdateCredentials }
}
