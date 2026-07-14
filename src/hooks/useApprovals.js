import { useLocalStorage } from './useLocalStorage.js'
import { APPROVALS } from '../data/mockApprovals.js'

// Cola de aprobación genérica compartida por todos los dominios (contratos,
// documentos...). Cada solicitud puede enrutarse por una CADENA de personas
// (una o varias, en orden) — "de área en área". Solo a quien le toca el paso
// actual puede actuar; cada firma exige re-autenticación (ver ReAuthModal).
export function useApprovals() {
  const [approvals, setApprovals] = useLocalStorage('cx360.approvals', APPROVALS)

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
  const submitForApproval = ({ domain, refId, title, area, requestedById, requestedBy, requestedByRole, creatorSeal, chain }) => {
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
    setApprovals((list) => [item, ...list])
    return item
  }

  const listPendingForApprover = (userId) =>
    approvals.filter((a) => currentStep(a)?.assignedToId === userId)

  const listByDomain = (domain) => approvals.filter((a) => a.domain === domain)

  const listMine = (userId) => approvals.filter((a) => a.requestedById === userId)

  // Aprueba el paso ACTUAL de la cadena; si era el último, el documento
  // queda aprobado por completo. Si no, avanza al siguiente firmante.
  const approve = (id, seal, comment = '') => {
    setApprovals((list) =>
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

  const reject = (id, comment = '') => {
    setApprovals((list) =>
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

  return { approvals, submitForApproval, listPendingForApprover, listByDomain, listMine, approve, reject, currentStep, currentStepIndex }
}
