import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { PERSONNEL } from '../data/mockPersonnel.js'
import { USE_SUPABASE, listPersonnel, createPersonnel as apiCreatePersonnel, updatePersonnel as apiUpdatePersonnel } from '../services/api.js'

// Personal / nómina (módulo financiero + autoservicio de Personal Activo).
export function usePersonnel() {
  const [mockPersonnel, setMockPersonnel] = useLocalStorage('cx360.personnel', PERSONNEL)
  const [remote, setRemote] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    listPersonnel()
      .then((data) => setRemote(data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const personnel = USE_SUPABASE ? remote : mockPersonnel

  const addPersonnel = async (payload) => {
    if (USE_SUPABASE) {
      const item = await apiCreatePersonnel(payload)
      setRemote((list) => [item, ...list])
      return item
    }
    const item = { ...payload, id: `p-${Date.now()}` }
    setMockPersonnel((list) => [item, ...list])
    return item
  }

  const updatePersonnel = async (id, patch) => {
    if (USE_SUPABASE) {
      const updated = await apiUpdatePersonnel(id, patch)
      setRemote((list) => list.map((p) => (p.id === id ? updated : p)))
      return updated
    }
    setMockPersonnel((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    return { ...personnel.find((p) => p.id === id), ...patch }
  }

  return { personnel, loading, addPersonnel, updatePersonnel, reload }
}
