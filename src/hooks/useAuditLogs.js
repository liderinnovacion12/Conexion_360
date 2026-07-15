import { useState, useEffect, useCallback } from 'react'
import { AUDIT_LOGS } from '../data/mockAudit.js'
import { USE_SUPABASE, listAuditLogs } from '../services/api.js'

// Bitácora de auditoría — solo lectura desde la UI (los registros se
// generan automáticamente al usar la app). En modo mock se muestran los
// datos de ejemplo estáticos.
export function useAuditLogs() {
  const [remoteLogs, setRemoteLogs] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    listAuditLogs().then(setRemoteLogs).finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  const logs = USE_SUPABASE ? remoteLogs : AUDIT_LOGS

  return { logs, loading, reload }
}
