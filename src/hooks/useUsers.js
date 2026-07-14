import { useEffect, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { MOCK_USERS } from '../data/mockUsers.js'

// Cuentas de demo retiradas de la semilla (ver mockUsers.js) — se filtran
// aquí también porque este hook lee la lista persistida directamente, sin
// pasar por getAllUsers().
const RETIRED_USER_IDS = ['u-006']
const hasRetired = (list) => list.some((u) => RETIRED_USER_IDS.includes(u.id))

// Lista completa de usuarios (misma llave 'cx360.users' que lee
// findUserByCredentials en mockUsers.js) — así un usuario creado aquí puede
// iniciar sesión y aparece de inmediato en Admin > Permisos.
export function useUsers() {
  const [rawUsers, setUsers] = useLocalStorage('cx360.users', MOCK_USERS)
  // Memoizado: filtrar sin esto crea un arreglo nuevo en cada render, lo que
  // rompe la identidad de referencia que espera el useEffect de
  // PermissionsContext (dependía de `users`) y provoca un loop infinito.
  const users = useMemo(() => (hasRetired(rawUsers) ? rawUsers.filter((u) => !RETIRED_USER_IDS.includes(u.id)) : rawUsers), [rawUsers])

  // Autolimpieza: quien ya tenía una cuenta retirada guardada en su
  // navegador deja de verla también en el storage persistido, no solo en pantalla.
  useEffect(() => {
    if (hasRetired(rawUsers)) {
      setUsers((list) => list.filter((u) => !RETIRED_USER_IDS.includes(u.id)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawUsers])

  const addUser = (user) => {
    const item = { id: `u-${Date.now()}`, password: 'demo', ...user }
    setUsers((list) => [...list, item])
    return item
  }

  const updateUser = (id, patch) => {
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }

  const removeUser = (id) => {
    setUsers((list) => list.filter((u) => u.id !== id))
  }

  return { users, addUser, updateUser, removeUser }
}
