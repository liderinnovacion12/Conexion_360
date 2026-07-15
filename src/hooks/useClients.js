import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { CLIENTS } from '../data/mockClients.js'
import { USE_SUPABASE, listClients, createClient as apiCreateClient, updateClient as apiUpdateClient } from '../services/api.js'

export function useClients() {
  const [mockClients, setMockClients] = useLocalStorage('cx360.clients', CLIENTS)
  const [remoteClients, setRemoteClients] = useState([])

  useEffect(() => {
    if (USE_SUPABASE) listClients().then(setRemoteClients).catch(() => {})
  }, [])

  const clients = USE_SUPABASE ? remoteClients : mockClients

  const addClient = async (client) => {
    if (USE_SUPABASE) {
      const item = await apiCreateClient(client)
      setRemoteClients((list) => [item, ...list])
      return item
    }
    const item = { ...client, id: `cli-${Date.now()}` }
    setMockClients((list) => [item, ...list])
    return item
  }

  const updateClient = async (id, patch) => {
    if (USE_SUPABASE) {
      await apiUpdateClient(id, patch)
      setRemoteClients((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)))
      return
    }
    setMockClients((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  return { clients, addClient, updateClient }
}
