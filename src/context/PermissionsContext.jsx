import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { NAV_CONFIG } from '../routes/navConfig.jsx'
import { matchNavItem } from '../routes/navMatch.js'
import { CAPABILITY_KEYS } from '../data/mockPermissions.js'
import { useUsers } from '../hooks/useUsers.js'

const PermissionsContext = createContext(null)
const STORAGE_KEY = 'cx360.permissions'

// Permisos por defecto de UNA persona: todos los paneles de su rol + todas
// las capacidades habilitadas (= comportamiento actual si el Admin no toca
// Permisos). Distintas personas del mismo rol pueden luego divergir.
function defaultsForUser(user) {
  const nav = {}
  ;(NAV_CONFIG[user.role] || []).forEach((section) => {
    section.items.forEach((item) => {
      nav[item.to] = true
    })
  })
  const caps = {}
  CAPABILITY_KEYS.forEach((k) => {
    caps[k] = true
  })
  return { nav, caps }
}

// Combina lo guardado con los valores por defecto de cada usuario actual —
// si se crea una persona nueva, o gana acceso a un panel nuevo, queda
// habilitado por defecto sin perder lo que ya se configuró para los demás.
function mergeWithDefaults(saved, users) {
  const merged = {}
  users.forEach((u) => {
    const defaults = defaultsForUser(u)
    const savedUser = saved?.[u.id]
    merged[u.id] = {
      nav: { ...defaults.nav, ...(savedUser?.nav || {}) },
      caps: { ...defaults.caps, ...(savedUser?.caps || {}) },
    }
  })
  return merged
}

function loadPermissions(users) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return mergeWithDefaults(raw ? JSON.parse(raw) : {}, users)
  } catch {
    return mergeWithDefaults({}, users)
  }
}

export function PermissionsProvider({ children }) {
  const { users } = useUsers()
  const [permissions, setPermissions] = useState(() => loadPermissions(users))

  // Si la lista de usuarios cambia (se crea/edita una persona), aseguramos
  // que tenga un set de permisos vigente sin perder lo ya configurado.
  useEffect(() => {
    setPermissions((p) => mergeWithDefaults(p, users))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions))
    } catch {
      /* noop */
    }
  }, [permissions])

  const setNavEnabled = useCallback((userId, path, enabled) => {
    setPermissions((p) => ({
      ...p,
      [userId]: { ...p[userId], nav: { ...p[userId]?.nav, [path]: enabled } },
    }))
  }, [])

  const setCapability = useCallback((userId, cap, enabled) => {
    setPermissions((p) => ({
      ...p,
      [userId]: { ...p[userId], caps: { ...p[userId]?.caps, [cap]: enabled } },
    }))
  }, [])

  const resetUser = useCallback(
    (userId) => {
      const u = users.find((x) => x.id === userId)
      if (!u) return
      setPermissions((p) => ({ ...p, [userId]: defaultsForUser(u) }))
    },
    [users]
  )

  const isNavItemEnabled = useCallback(
    (userId, path) => permissions[userId]?.nav?.[path] !== false,
    [permissions]
  )

  const hasCapability = useCallback(
    (userId, cap) => permissions[userId]?.caps?.[cap] !== false,
    [permissions]
  )

  // Si la ruta actual no corresponde a ningún ítem conocido de NAV_CONFIG
  // para el rol de esa persona, se permite (solo se restringe lo que el
  // Admin puede ver/tocar en Permisos).
  const isPathAllowed = useCallback(
    (user, pathname) => {
      if (!user) return true
      const match = matchNavItem(NAV_CONFIG, user.role, pathname)
      if (!match) return true
      return isNavItemEnabled(user.id, match.to)
    },
    [isNavItemEnabled]
  )

  const value = useMemo(
    () => ({
      permissions,
      capabilityKeys: CAPABILITY_KEYS,
      setNavEnabled,
      setCapability,
      resetUser,
      isNavItemEnabled,
      hasCapability,
      isPathAllowed,
    }),
    [permissions, setNavEnabled, setCapability, resetUser, isNavItemEnabled, hasCapability, isPathAllowed]
  )

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext)
  if (!ctx) throw new Error('usePermissions debe usarse dentro de <PermissionsProvider>')
  return ctx
}
