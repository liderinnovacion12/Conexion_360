import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { NOTIFICATIONS as MOCK_NOTIFICATIONS } from '../data/mockNotifications.js'
import { USE_SUPABASE, listNotifications, markNotificationRead } from '../services/api.js'
import { supabase } from '../services/supabaseClient.js'

const rowToItem = (r) => ({
  id: r.id,
  title: r.title,
  body: r.body,
  link: r.link,
  color: r.color,
  read: r.read,
  createdAt: r.created_at,
})

// ------------------------------------------------------------------
// Canal de Realtime COMPARTIDO a nivel de módulo. Varios componentes
// (Topbar, el flotante, etc.) usan este hook a la vez — si cada uno
// abriera su propio `supabase.channel('notifications-<id>')` con el
// mismo nombre, Supabase lanza "cannot add postgres_changes callbacks
// ... after subscribe()" porque el canal ya existe. En vez de eso, se
// abre UN solo canal por usuario y cada instancia del hook se suscribe
// como "listener" en memoria.
// ------------------------------------------------------------------
let sharedChannel = null
let sharedUserId = null
const listeners = new Set()

function ensureSharedChannel(userId) {
  if (!supabase || !userId) return
  if (sharedChannel && sharedUserId === userId) return // ya está abierto para este usuario
  if (sharedChannel) {
    supabase.removeChannel(sharedChannel)
    sharedChannel = null
  }
  sharedUserId = userId
  sharedChannel = supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      (payload) => {
        listeners.forEach((fn) => fn(payload.new))
      }
    )
    .subscribe()
}

// Notificaciones reales (Supabase): se cargan al entrar y además se
// escuchan EN VIVO por Realtime — así, cuando un aspirante sube un
// documento o se autoregistra, a Reclutamiento le aparece de inmediato
// el flotante, sin recargar la página.
export function useNotifications() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(USE_SUPABASE)
  const seenIds = useRef(new Set())

  const reload = useCallback(() => {
    if (!USE_SUPABASE || !user) return
    setLoading(true)
    listNotifications()
      .then((list) => {
        list.forEach((n) => seenIds.current.add(n.id))
        setItems(list)
      })
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => { reload() }, [reload])

  // RLS ya limita lo que este usuario puede leer, pero igual se valida
  // en el cliente (mi perfil, global, o mi rol) antes de mostrar el flotante.
  useEffect(() => {
    if (!USE_SUPABASE || !user?.id) return

    ensureSharedChannel(user.id)

    const onEvent = (r) => {
      const forMe = r.profile_id === user.id || r.profile_id === null || r.target_role === user.role
      if (!forMe || seenIds.current.has(r.id)) return
      seenIds.current.add(r.id)
      const item = rowToItem(r)
      setItems((list) => [item, ...list])
      setToast(item)
    }

    listeners.add(onEvent)
    return () => listeners.delete(onEvent)
  }, [user?.id, user?.role])

  const markRead = async (id) => {
    if (!USE_SUPABASE) return
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try {
      await markNotificationRead(id)
    } catch {
      // No es crítico si falla.
    }
  }

  // Marca todas las notificaciones no leídas como leídas de una vez
  // (se llama al abrir el panel para que el puntico desaparezca).
  const markAllRead = useCallback(async () => {
    if (!USE_SUPABASE) return
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return
    setItems((list) => list.map((n) => ({ ...n, read: true })))
    try {
      await Promise.all(unreadIds.map((id) => markNotificationRead(id)))
    } catch {
      // No es crítico.
    }
  }, [items])

  const dismissToast = () => setToast(null)

  // Modo mock: mismo comportamiento estático de siempre, sin flotante
  // (no hay eventos reales que disparar).
  const mockItems = !USE_SUPABASE
    ? (NOTIFICATIONS_FOR(user?.role) || [])
    : []

  const list = USE_SUPABASE ? items : mockItems
  const unreadCount = list.filter((n) => !n.read).length

  return { notifications: list, unreadCount, loading, toast, dismissToast, markRead, markAllRead, reload }
}

function NOTIFICATIONS_FOR(role) {
  return MOCK_NOTIFICATIONS[role] || MOCK_NOTIFICATIONS.default
}
