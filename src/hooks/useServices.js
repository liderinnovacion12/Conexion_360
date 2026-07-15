import { useState, useEffect } from 'react'
import { SERVICES } from '../data/mockServices.js'
import { USE_SUPABASE, listServices } from '../services/api.js'

// Catálogo de servicios de la vitrina (Cliente > Servicios) — solo lectura.
export function useServices() {
  const [remoteServices, setRemoteServices] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  useEffect(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    listServices().then(setRemoteServices).finally(() => setLoading(false))
  }, [])

  return { services: USE_SUPABASE ? remoteServices : SERVICES, loading }
}
