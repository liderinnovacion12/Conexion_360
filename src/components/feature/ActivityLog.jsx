import { useState } from 'react'
import { Eye, Activity } from 'lucide-react'
import DataTable from '../ui/DataTable.jsx'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import { EmptyState } from '../ui/Feedback.jsx'
import SignatureSeal from './SignatureSeal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApprovals } from '../../hooks/useApprovals.js'
import { useGeneratedDocuments } from '../../hooks/useGeneratedDocuments.js'
import { useContracts } from '../../hooks/useContracts.js'
import { formatDateTime } from '../../utils/format.js'

const STATUS_VARIANT = { pendiente: 'warning', aprobado: 'success', rechazado: 'danger' }
const DOMAIN_LABEL = { document: 'Documento', contract: 'Contrato' }

// Panel de actividades: lo que YO envié a firma/aprobación y su estado
// (scope="mine"), o —para Admin— TODA la actividad del sistema (scope="all",
// vista de supervisión). Es de solo lectura: quien envió el documento
// solo puede monitorear su avance, no firmar desde aquí (eso ocurre en
// "Documentos por firmar" / "Aprobar contratos", donde le corresponde al
// destinatario de cada paso).
export default function ActivityLog({ scope = 'mine' }) {
  const { user } = useAuth()
  const { approvals, listMine, currentStep } = useApprovals()
  const { documents } = useGeneratedDocuments()
  const { contracts } = useContracts()
  const [active, setActive] = useState(null)

  const items = scope === 'all' ? approvals : listMine(user.id)

  const resolveContent = (item) => {
    if (item.domain === 'document') return documents.find((d) => d.id === item.refId)
    if (item.domain === 'contract') return contracts.find((c) => c.id === item.refId)
    return null
  }

  const columns = [
    { key: 'title', header: 'Título', strong: true },
    { key: 'domain', header: 'Tipo', render: (a) => <Badge variant="neutral">{DOMAIN_LABEL[a.domain] || a.domain}</Badge> },
    { key: 'area', header: 'Área', render: (a) => <Badge variant="neutral">{a.area}</Badge> },
    ...(scope === 'all' ? [{ key: 'requestedBy', header: 'Enviado por' }] : []),
    {
      key: 'progress',
      header: 'Progreso',
      sortable: false,
      render: (a) => {
        if (a.status === 'aprobado') return <span className="dim">Completo</span>
        if (a.status === 'rechazado') return <span className="dim">Rechazado</span>
        const step = currentStep(a)
        const doneCount = a.chain.filter((s) => s.status === 'aprobado').length
        return <span className="card-sub">{doneCount}/{a.chain.length} · turno de {step?.assignedToName}</span>
      },
    },
    { key: 'requestedAt', header: 'Enviado', sortValue: (a) => new Date(a.requestedAt).getTime(), render: (a) => formatDateTime(a.requestedAt) },
    { key: 'status', header: 'Estado', render: (a) => <Badge variant={STATUS_VARIANT[a.status]} dot>{a.status}</Badge> },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (a) => <Button size="sm" variant="ghost" icon={Eye} onClick={() => setActive(a)}>Ver</Button>,
    },
  ]

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title={scope === 'all' ? 'Aún no hay actividad en el sistema' : 'Aún no has enviado nada a firma'}
      >
        {scope === 'all'
          ? 'Aquí aparecerá cada documento o contrato que cualquier persona envíe a firma, de cualquier área.'
          : 'Cuando envíes un documento o contrato a firma, aparecerá aquí con su estado y avance.'}
      </EmptyState>
    )
  }

  const content = active && resolveContent(active)

  return (
    <>
      <DataTable columns={columns} data={items} searchKeys={['title', 'requestedBy', 'area']} pageSize={8} />

      <Modal open={!!active} onClose={() => setActive(null)} title="Detalle de la actividad" width={680}>
        {active && (
          <div className="col gap-3">
            <div className="glass-soft" style={{ padding: 14 }}>
              <div className="stat-row"><span className="muted">Título</span><b>{active.title}</b></div>
              <div className="stat-row"><span className="muted">Área</span><b>{active.area}</b></div>
              <div className="stat-row"><span className="muted">Enviado por</span><b>{active.requestedBy} ({active.requestedByRole})</b></div>
              <div className="stat-row"><span className="muted">Fecha de envío</span><b>{formatDateTime(active.requestedAt)}</b></div>
              <div className="stat-row"><span className="muted">Estado general</span><Badge variant={STATUS_VARIANT[active.status]} dot>{active.status}</Badge></div>
            </div>

            {content && (
              <div className="glass-soft" style={{ padding: 14, maxHeight: 220, overflow: 'auto' }}>
                <b style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem' }}>{content.title || content.templateName}</b>
                <div dangerouslySetInnerHTML={{ __html: content.content }} style={{ fontSize: '0.85rem' }} />
              </div>
            )}

            <div>
              <div className="card-sub" style={{ marginBottom: 8 }}>Firma de quien crea</div>
              <SignatureSeal
                signature={active.creatorSeal?.signature}
                signerName={active.creatorSeal?.signerName}
                signerRole={active.creatorSeal?.signerRole}
                signed={active.creatorSeal}
              />
            </div>

            <div>
              <div className="card-sub" style={{ marginBottom: 8 }}>Ruta de firma (de área en área)</div>
              <div className="timeline">
                {active.chain.map((step, i) => (
                  <div className="timeline-item" key={i}>
                    <div className="row between" style={{ alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{step.assignedToName}</div>
                        <small>{step.assignedToRole} · {step.area}</small>
                      </div>
                      <Badge variant={STATUS_VARIANT[step.status]} dot>{step.status}</Badge>
                    </div>
                    {step.status === 'aprobado' && step.decidedAt && (
                      <small style={{ display: 'block', marginTop: 2 }}>Firmado el {formatDateTime(step.decidedAt)}</small>
                    )}
                    {step.comment && <p className="card-sub" style={{ marginTop: 4 }}>"{step.comment}"</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
