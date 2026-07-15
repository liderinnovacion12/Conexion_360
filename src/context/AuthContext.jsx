import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { findUserByCredentials, setUserPassword } from '../data/mockUsers.js'
import { supabase, DATA_MODE, isSupabaseConfigured } from '../services/supabaseClient.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'cx360.session'
const SESSION_TIMEOUT_MIN = Number(import.meta.env.VITE_SESSION_TIMEOUT_MIN || 30)

// true  -> lee/escribe en Supabase Auth + tabla `profiles`
// false -> comportamiento original con MOCK_USERS + localStorage
const USE_SUPABASE = DATA_MODE === 'supabase' && isSupabaseConfigured()

// DATA_MODE pide Supabase pero faltan VITE_SUPABASE_URL/ANON_KEY en el build
// (típico: variables no configuradas en Vercel). Sin este chequeo, login()
// caía en silencio al modo mock y mostraba "Credenciales inválidas" para
// cualquier usuario real, ocultando la verdadera causa.
const SUPABASE_MISCONFIGURED = DATA_MODE === 'supabase' && !isSupabaseConfigured()
if (SUPABASE_MISCONFIGURED) {
  console.error(
    '[Conexión 360] VITE_DATA_MODE=supabase pero faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en este build. ' +
      'Configura esas variables en Vercel (Project Settings > Environment Variables) y vuelve a hacer Redeploy.'
  )
}

// Convierte una fila de `profiles` (snake_case) a la forma que ya espera
// el resto de la app (camelCase, igual que los objetos de mockUsers.js).
function profileToSessionUser(profile) {
  if (!profile) return null
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    avatar: profile.avatar,
    area: profile.area,
    candidateId: profile.candidate_id || undefined,
    employeeId: profile.employee_id || undefined,
    clientCompany: profile.client_company || undefined,
  }
}

async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error

  // El perfil fue eliminado por un administrador pero el usuario de Auth sigue
  // existiendo. Cerramos sesión y lanzamos un error legible.
  if (!data) {
    await supabase.auth.signOut()
    throw new Error('Tu cuenta fue eliminada. Regístrate de nuevo para continuar.')
  }

  // Aspirante recién auto-registrado: todavía no tiene fila en `candidates`
  // ni profiles.candidate_id. La función RPC `register_candidate_profile`
  // la crea y la enlaza. Es idempotente.
  if (data.role === 'candidate' && !data.candidate_id) {
    const { error: rpcError } = await supabase.rpc('register_candidate_profile')
    if (!rpcError) {
      const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (refreshed) return profileToSessionUser(refreshed)
    }
  }

  return profileToSessionUser(data)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const timer = useRef(null)

  // Restaurar sesión al cargar la app.
  useEffect(() => {
    let active = true

    async function restore() {
      if (USE_SUPABASE) {
        const { data } = await supabase.auth.getSession()
        const session = data?.session
        if (session?.user) {
          try {
            const profileUser = await fetchProfile(session.user.id)
            if (active) setUser(profileUser)
          } catch {
            if (active) setUser(null)
          }
        }
      } else {
        // Igual que en modo Supabase: no restaurar una sesión anterior al
        // abrir/recargar la app, siempre debe pedirse login de nuevo.
        localStorage.removeItem(STORAGE_KEY)
      }
      if (active) setLoading(false)
    }

    restore()

    // En modo Supabase, mantenemos la sesión sincronizada ante refresh de
    // token o cierre de sesión desde otra pestaña.
    let subscription
    if (USE_SUPABASE) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session?.user) {
          if (active) setUser(null)
          return
        }
        try {
          const profileUser = await fetchProfile(session.user.id)
          if (active) setUser(profileUser)
        } catch {
          if (active) setUser(null)
        }
      })
      subscription = data?.subscription
    }

    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  const logout = useCallback(() => {
    if (USE_SUPABASE) {
      supabase.auth.signOut()
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setUser(null)
  }, [])

  // Cierre de sesión automático por inactividad (igual en ambos modos).
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
    if (SUPABASE_MISCONFIGURED) {
      throw new Error(
        'Supabase no está configurado en este despliegue (faltan variables de entorno). Contacta al administrador.'
      )
    }
    if (USE_SUPABASE) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.')
      const profileUser = await fetchProfile(data.user.id)
      setUser(profileUser)
      return profileUser
    }

    // Modo mock (sin backend): igual que el prototipo original.
    await new Promise((r) => setTimeout(r, 450))
    const found = findUserByCredentials(email, password)
    if (!found) throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.')
    const session = { ...found }
    delete session.password
    setUser(session)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    return session
  }, [])

  // Auto-registro de aspirantes (ver src/pages/Register.jsx). Solo
  // disponible en modo Supabase real: crea la cuenta en Auth con la
  // contraseña que la persona eligió; el trigger handle_new_auth_user
  // crea su `profiles` (role: candidate) y, en el primer login (o de
  // inmediato si el proyecto no exige confirmar el correo),
  // `register_candidate_profile()` crea su fila en `candidates` y la
  // enlaza. Ver fetchProfile() más arriba.
  const register = useCallback(async ({ name, doc, email, password }) => {
    if (!USE_SUPABASE) {
      throw new Error('El registro de aspirantes requiere el backend de Supabase conectado.')
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'candidate', area: 'Proceso de selección', doc } },
    })

    // Supabase devuelve un usuario "fantasma" (identities vacío) cuando el
    // correo ya existe en auth.users. En ese caso reenviamos el correo de
    // confirmación para que la persona pueda activar su cuenta de nuevo.
    if (!error && data.user && data.user.identities && data.user.identities.length === 0) {
      await supabase.auth.resend({ type: 'signup', email })
      return { needsEmailConfirmation: true }
    }

    if (error) {
      // Si el mensaje indica que el usuario ya existe con cuenta activa,
      // lo comunicamos claramente en lugar del mensaje técnico de Supabase.
      const msg = error.message?.toLowerCase() || ''
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        throw new Error('Ya existe una cuenta activa con ese correo. Intenta iniciar sesión o usa otro correo.')
      }
      throw error
    }

    if (data.session && data.user) {
      const profileUser = await fetchProfile(data.user.id)
      setUser(profileUser)
      return { needsEmailConfirmation: false }
    }
    return { needsEmailConfirmation: true }
  }, [])

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!user) throw new Error('No hay una sesión activa.')
      if (!newPassword || newPassword.length < 4) {
        throw new Error('La nueva contraseña debe tener al menos 4 caracteres.')
      }

      if (USE_SUPABASE) {
        // Reautentica con la contraseña actual antes de cambiarla.
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        })
        if (reauthError) throw new Error('La contraseña actual no es correcta.')
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) throw error
        return
      }

      const check = findUserByCredentials(user.email, currentPassword)
      if (!check || check.id !== user.id) throw new Error('La contraseña actual no es correcta.')
      setUserPassword(user.id, newPassword)
    },
    [user]
  )

  const value = { user, loading, login, logout, register, changePassword, isAuthenticated: !!user }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
