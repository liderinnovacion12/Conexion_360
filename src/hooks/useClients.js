import { useLocalStorage } from './useLocalStorage.js'
import { CLIENTS } from '../data/mockClients.js'

export function useClients() {
  const [clients, setClients] = useLocalStorage('cx360.clients', CLIENTS)

  const addClient = (client) => {
    const item = { ...client, id: `cli-${Date.now()}` }
    setClients((list) => [item, ...list])
    return item
  }

  const updateClient = (id, patch) => {
    setClients((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  return { clients, addClient, updateClient }
}
