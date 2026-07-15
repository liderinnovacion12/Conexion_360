import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { APPROVALS } from '../data/mockApprovals.js'
import {
  USE_SUPABASE,
  listApprovals,
  submitForApproval as apiSubmitForApproval,
  decideApprovalStep,
} from '../services/api.js'

// Cola de aprobación genérica compartida por todos los dominios (contratos,
// documentos...). Cada solicitud puede enrutarse por una CADENA de personas
// (una o varias, en orden) — "de área en área". Solo a quien le toca el paso
// actual puede actuar; cada firma exige re-autenticación (ver ReAuthModal).
export function useApprovals() {
  const [mockApprovals, setMockApprovals] = useLocalStorage('cx360.approvals', APPROVALS)
  const [remoteApprovals, setRemoteApprovals] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    listApprovals().then(setRemoteApprovals).finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  const approvals = USE_SUPABASE ? remoteApprovals : mockApprovals

  // Índice del paso pendiente actual (el primero sin decidir). -1 si ya
  // se decidió todo (aprobado o rechazado en algún punto de la cadena).
  const currentStepIndex = (approval) => {
    if (approval.status !== 'pendiente') return -1
    return approval.chain.findIndex((s) => s.status === 'pendiente')
  }

  const currentStep = (approval) => {
    const i = currentStepIndex(approval)
    return i === -1 ? null : approval.chain[i]
  }

  // `chain`: arreglo ordenado de personas [{ id, name, role, area }, ...]
  const submitForApproval = async ({ domain, refId, title, area, requestedById, requestedBy, requestedByRole, creatorSeal, chain }) => {
    if (USE_SUPABASE) {
      const id = await apiSubmitForApproval({ domain, refId, title, area, requestedById, requestedBy, requestedByRole, creatorSeal, chain })
      await reload()
      return { id }
    }
    const item = {
      id: `apr-${Date.now()}`,
      domain,
      refId,
      title,
      area,
      requestedById,
      requestedBy,
      requestedByRole,
      requestedAt: new Date().toISOString(),
      creatorSeal,
      chain: chain.map((p) => ({
        assignedToId: p.id,
        assignedToName: p.name,
        assignedToRole: p.role,
        area: p.area,
        status: 'pendiente',
        seal: null,
        decidedAt: null,
        comment: '',
      })),
      status: 'pendiente',
    }
    setMockApprovals((list) => [item, ...list])
    return item
  }

  const listPendingForApprover = (userId) =>
    approvals.filter((a) => currentStep(a)?.assignedToId === userId)

  const listByDomain = (domain) => approvals.filter((a) => a.domain === domain)

  const listMine = (userId) => approvals.filter((a) => a.requestedById === userId)

  // Aprueba el paso ACTUAL de la cadena; si era el último, el documento
  // queda aprobado por completo. Si no, avanza al siguiente firmante.
  const approve = async (id, seal, comment = '') => {
    if (USE_SUPABASE) {
      await decideApprovalStep(id, { decision: 'aprobado', seal, comment })
      await reload()
      return
    }
    setMockApprovals((list) =>
      list.map((a) => {
        if (a.id !== id) return a
        const idx = currentStepIndex(a)
        if (idx === -1) return a
        const chain = a.chain.map((s, i) =>
          i === idx ? { ...s, status: 'aprobado', seal, decidedAt: new Date().toISOString(), comment } : s
        )
        const isLast = idx === chain.length - 1
        return { ...a, chain, status: isLast ? 'aprobado' : 'pendiente' }
      })
    )
  }

  const reject = async (id, comment = '') => {
    if (USE_SUPABASE) {
      await decideApprovalStep(id, { decision: 'rechazado', comment })
      await reload()
      return
    }
    setMockApprovals((list) =>
      list.map((a) => {
        if (a.id !== id) return a
        const idx = currentStepIndex(a)
        if (idx === -1) return a
        const chain = a.chain.map((s, i) =>
          i === idx ? { ...s, status: 'rechazado', decidedAt: new Date().toISOString(), comment } : s
        )
        return { ...a, chain, status: 'rechazado' }
      })
    )
  }

  return { approvals, loading, submitForApproval, listPendingForApprover, listByDomain, listMine, approve, reject, currentStep, currentStepIndex }
}
