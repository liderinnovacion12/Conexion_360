import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { CANDIDATES } from '../data/mockCandidates.js'
import { USE_SUPABASE, listCandidates, createCandidate as apiCreateCandidate, updateCandidate as apiUpdateCandidate } from '../services/api.js'

// Aspirantes / pipeline de reclutamiento.
// Modo Supabase: lee/escribe en la tabla `candidates` real.
// Modo mock: mismo comportamiento original, persistido en localStorage.
export function useCandidates() {
  const [mockCandidates, setMockCandidates] = useLocalStorage('cx360.candidates', CANDIDATES)
  const [remote, setRemote] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    listCandidates()
      .then((data) => setRemote(data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const candidates = USE_SUPABASE ? remote : mockCandidates

  const addCandidate = async (payload) => {
    if (USE_SUPABASE) {
      const item = await apiCreateCandidate(payload)
      setRemote((list) => [item, ...list])
      return item
    }
    const item = {
      ...payload,
      id: `c-${Date.now()}`,
      stage: 'registro',
      status: 'pendiente',
      progress: 5,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setMockCandidates((list) => [item, ...list])
    return item
  }

  const updateCandidate = async (id, patch) => {
    if (USE_SUPABASE) {
      const updated = await apiUpdateCandidate(id, patch)
      setRemote((list) => list.map((c) => (c.id === id ? updated : c)))
      return updated
    }
    setMockCandidates((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    return { ...candidates.find((c) => c.id === id), ...patch }
  }

  const moveStage = (id, stage) => updateCandidate(id, { stage })

  return { candidates, loading, addCandidate, updateCandidate, moveStage, reload }
}
