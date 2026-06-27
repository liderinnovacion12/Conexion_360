import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { findUserByCredentials } from '../data/mockUsers.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'cx360.session'
const SESSION_TIMEOUT_MIN = Number(import.meta.env.VITE_SESSION_TIMEOUT_MIN || 30)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const timer = useRef(null)

  // Restaurar sesión persistida (simulación; en producción => Supabase session)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {
      /* noop */
    }
    setLoading(false)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Cierre de sesión automático por inactividad
  const resetIdleTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    if (!user) return
    timer.current = setTimeout(() => logout(), SESSION_TIMEOUT_MIN * 60 * 1000)
  }, [user, logout])

  useEffect(() => {
    if (!user) return
    const events = ['mousemove', 'keydown', 'click', 'scroll']
    events.forEach((e) => window.addEventListener(e, resetIdleTimer))
    resetIdleTimer()
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer))
      if (timer.current) clearTimeout(timer.current)
    }
  }, [user, resetIdleTimer])

  const login = useCallback(async ({ email, password }) => {
    // Punto de integración: aquí se llamaría supabase.auth.signInWithPassword
    await new Promise((r) => setTimeout(r, 450))
    const found = findUserByCredentials(email, password)
    if (!found) throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.')
    const session = { ...found }
    delete session.password
    setUser(session)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    return session
  }, [])

  const value = { user, loading, login, logout, isAuthenticated: !!user }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
