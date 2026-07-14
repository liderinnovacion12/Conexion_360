import { useLocalStorage } from './useLocalStorage.js'
import { CONTRACTS } from '../data/mockContracts.js'

// Persistencia de contratos emitidos (mismo patrón que useApprovals/useCourses).
export function useContracts() {
  const [contracts, setContracts] = useLocalStorage('cx360.contracts', CONTRACTS)

  const addContract = (contract) => {
    const item = { ...contract, id: `ctr-${Date.now()}` }
    setContracts((list) => [item, ...list])
    return item
  }

  const updateContractStatus = (id, status) => {
    setContracts((list) => list.map((c) => (c.id === id ? { ...c, status } : c)))
  }

  return { contracts, addContract, updateContractStatus }
}
