import { useState, useEffect } from 'react'
import { AREA_APPROVERS } from '../data/mockApprovals.js'
import { USE_SUPABASE, getAreaApprovers } from '../services/api.js'

// Mapa { area: userId } usado para enrutar automáticamente cada solicitud
// (contrato/documento) a quien debe aprobarla.
export function useAreaApprovers() {
  const [remoteMap, setRemoteMap] = useState({})
  const [loading, setLoading] = useState(USE_SUPABASE)

  useEffect(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    getAreaApprovers().then(setRemoteMap).finally(() => setLoading(false))
  }, [])

  return { areaApprovers: USE_SUPABASE ? remoteMap : AREA_APPROVERS, loading }
}
