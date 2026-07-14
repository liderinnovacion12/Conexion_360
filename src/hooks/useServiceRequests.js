import { useLocalStorage } from './useLocalStorage.js'
import { SERVICE_REQUESTS } from '../data/mockServiceRequests.js'

// Persistencia de solicitudes de servicio enviadas desde la vitrina de
// Cliente (mismo patrón que useClients/useContracts).
export function useServiceRequests() {
  const [requests, setRequests] = useLocalStorage('cx360.serviceRequests', SERVICE_REQUESTS)

  const addRequest = (request) => {
    const item = { ...request, id: `req-${Date.now()}`, createdAt: new Date().toISOString(), status: 'pendiente' }
    setRequests((list) => [item, ...list])
    return item
  }

  const updateStatus = (id, status) => {
    setRequests((list) => list.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  const listMine = (userId) => requests.filter((r) => r.requestedById === userId)

  return { requests, addRequest, updateStatus, listMine }
}
