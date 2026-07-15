import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { SERVICE_REQUESTS } from '../data/mockServiceRequests.js'
import {
  USE_SUPABASE,
  listServiceRequests,
  createServiceRequest,
  updateServiceRequestStatus,
} from '../services/api.js'

// Persistencia de solicitudes de servicio enviadas desde la vitrina de
// Cliente (mismo patrón que useClients/useContracts).
export function useServiceRequests() {
  const [mockRequests, setMockRequests] = useLocalStorage('cx360.serviceRequests', SERVICE_REQUESTS)
  const [remoteRequests, setRemoteRequests] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    listServiceRequests().then(setRemoteRequests).finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  const requests = USE_SUPABASE ? remoteRequests : mockRequests

  const addRequest = async (request) => {
    if (USE_SUPABASE) {
      const { id } = await createServiceRequest(request)
      const item = { ...request, id, createdAt: new Date().toISOString(), status: 'pendiente' }
      setRemoteRequests((list) => [item, ...list])
      return item
    }
    const item = { ...request, id: `req-${Date.now()}`, createdAt: new Date().toISOString(), status: 'pendiente' }
    setMockRequests((list) => [item, ...list])
    return item
  }

  const updateStatus = async (id, status) => {
    if (USE_SUPABASE) {
      await updateServiceRequestStatus(id, status)
      setRemoteRequests((list) => list.map((r) => (r.id === id ? { ...r, status } : r)))
      return
    }
    setMockRequests((list) => list.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  const listMine = (userId) => requests.filter((r) => r.requestedById === userId)

  return { requests, loading, addRequest, updateStatus, listMine }
}
