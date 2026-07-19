import { useState, useEffect, useCallback } from 'react'
import { USE_SUPABASE } from '../services/api.js'
import { supabase } from '../services/supabaseClient.js'

const STORAGE_KEY = 'cx360.internalChat'

function loadMock() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}
function saveMock(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }

// ── Supabase ──────────────────────────────────────────────────────────────────
const fromRow = (r) => ({
  id:         r.id,
  channelId:  r.channel_id,
  fromId:     r.from_id,
  fromName:   r.from_name,
  fromRole:   r.from_role,
  content:    r.content,
  createdAt:  r.created_at,
})

async function sbList(channelId) {
  const { data, error } = await supabase
    .from('internal_chat_messages')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true })
    .limit(200)
  if (error) throw new Error(error.message)
  return data.map(fromRow)
}

async function sbSend({ channelId, fromId, fromName, fromRole, content }) {
  const { data, error } = await supabase
    .from('internal_chat_messages')
    .insert({ channel_id: channelId, from_id: fromId, from_name: fromName, from_role: fromRole, content })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return fromRow(data)
}

// ── Hook ──────────────────────────────────────────────────────────────────────
// channelId: 'general' | 'dm:{userId}:{userId}' (siempre ordenados)
export function useInternalChat(channelId) {
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (USE_SUPABASE) {
        setMessages(await sbList(channelId))
      } else {
        setMessages(loadMock().filter((m) => m.channelId === channelId))
      }
    } catch { setMessages([]) }
    finally { setLoading(false) }
  }, [channelId])

  useEffect(() => { load() }, [load])

  // Suscripción en tiempo real (solo Supabase)
  useEffect(() => {
    if (!USE_SUPABASE) return
    const sub = supabase
      .channel(`chat:${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'internal_chat_messages',
        filter: `channel_id=eq.${channelId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, fromRow(payload.new)])
      })
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [channelId])

  const send = async ({ fromId, fromName, fromRole, content }) => {
    const msg = {
      id:        Date.now().toString(),
      channelId,
      fromId,
      fromName,
      fromRole,
      content,
      createdAt: new Date().toISOString(),
    }
    if (USE_SUPABASE) {
      const created = await sbSend({ channelId, fromId, fromName, fromRole, content })
      setMessages((prev) => [...prev, created])
      return created
    }
    const all = loadMock()
    saveMock([...all, msg])
    setMessages((prev) => [...prev, msg])
    return msg
  }

  return { messages, loading, reload: load, send }
}

// Genera el channelId para un DM entre dos usuarios (orden canónico)
export function dmChannelId(idA, idB) {
  return `dm:${[idA, idB].sort().join(':')}`
}
