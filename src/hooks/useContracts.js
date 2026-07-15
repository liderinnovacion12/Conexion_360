import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { CONTRACTS } from '../data/mockContracts.js'
import {
  USE_SUPABASE,
  listContracts,
  createContract,
  updateContractStatus as apiUpdateContractStatus,
} from '../services/api.js'

// Persistencia de contratos emitidos (mismo patrón que useApprovals/useCourses).
export function useContracts() {
  const [mockContracts, setMockContracts] = useLocalStorage('cx360.contracts', CONTRACTS)
  const [remoteContracts, setRemoteContracts] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    listContracts().then(setRemoteContracts).finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  const contracts = USE_SUPABASE ? remoteContracts : mockContracts

  const addContract = async (contract) => {
    if (USE_SUPABASE) {
      const item = await createContract(contract)
      setRemoteContracts((list) => [item, ...list])
      return item
    }
    const item = { ...contract, id: `ctr-${Date.now()}` }
    setMockContracts((list) => [item, ...list])
    return item
  }

  const updateContractStatus = async (id, status) => {
    if (USE_SUPABASE) {
      await apiUpdateContractStatus(id, status)
      setRemoteContracts((list) => list.map((c) => (c.id === id ? { ...c, status } : c)))
      return
    }
    setMockContracts((list) => list.map((c) => (c.id === id ? { ...c, status } : c)))
  }

  return { contracts, loading, addContract, updateContractStatus }
}
