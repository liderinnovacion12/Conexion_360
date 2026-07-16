import { useState } from 'react'
import { Eye, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'
import DataTable from '../ui/DataTable.jsx'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import { Field, Textarea } from '../ui/Form.jsx'
import { AlertBanner, EmptyState } from '../ui/Feedback.jsx'
import SignaturePicker from './SignaturePicker.jsx'
import SignatureSeal from './SignatureSeal.jsx'
import ReAuthModal from './ReAuthModal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { usePermissions } from '../../context/PermissionsContext.jsx'
import { useApprovals } from '../../hooks/useApprovals.js'
import { useMySignatures } from '../../hooks/useMySignatures.js'
import { ROLES } from '../../utils/roles.js'
import { nextConsecutive, verificationCode } from '../../utils/documents.js'
import { formatDateTime } from '../../utils/format.js'

const STATUS_VARIANT = { pendiente: 'warning', aprobado: 'success', rechazado: 'danger' }

// Bandeja de aprobación reutilizable por cualquier dominio (contratos,
// documentos...). El documento se enruta por una CADENA de personas, una a
// la vez — cada firma exige re-autenticación (usuario y clave) antes de
// estampar el sello, para evitar falsificaciones.
export default function ApprovalQueue({ domain, renderPreview, onApproved, onRejected, rejectLabel = 'Rechazar', rejectConfirmMessage }) {
  const { user } = useAuth()
  const { hasCapability } = usePermissions()
  const canApproveDocs = hasCapability(user?.id, 'canApprove')
  const { approvals, approve, reject, currentStep, currentStepIndex } = useApprovals()
  const [library, setLibrary] = useMySignatures()
  const [active, setActive] = useState(null)
  const [signature, setSignature] = useState(null)
  const [comment, setComment] = useState('')
  const [reAuthFor, setReAuthFor] = useState(null) // 'approve' | 'reject' | null

  const isAdmin = user?.role === ROLES.ADMIN
  // Muestra la aprobación si: es admin, o el usuario tiene algún paso pendiente en la cadena
  const items = approvals.filter(
    (a) => a.domain === domain && (
      isAdmin ||
      a.chain.some((s) => s.assignedToId === user?.id && s.status === 'pendiente') ||
      a.chain.some((s) => s.assignedToId === user?.id)  // también ver las ya decididas
    )
  )

  // Es "su turno" si tiene algún paso PENDIENTE en la cadena (soporta paralelos)
  const myTurn = (item) => item.chain.some((s) => s.assignedToId === user?.id && s.status === 'pendiente')

  const open = (item) => {
    setActive(item)
    setSignature(null)
    setComment('')
  }
  const closeReview = () => {
    setActive(null)
    setReAuthFor(null)
  }

  const doApprove = async () => {
    const consecutive = nextConsecutive()
    const date = new Date().toISOString()
    const code = verificationCode({ approvalId: active.id, signerName: user.name, consecutive, date })
    // Pasar userId para que el hook encuentre el paso correcto en cadenas paralelas
    const myStep = active.chain.find((s) => s.assignedToId === user?.id && s.status === 'pendiente') || currentStep(active)
    const isFullyApproved = await approve(
      active.id,
      { consecutive, date, code, signature, signerName: user.name, signerRole: myStep?.assignedToRole || 'Aprobador' },
      comment,
      user?.id,
    )
    if (isFullyApproved) onApproved?.(active)
    closeReview()
  }

  const doReject = async () => {
    await reject(active.id, comment)
    onRejected?.(active, comment)
    closeReview()
  }

  const columns = [
    { key: 'title', header: 'Documento', strong: true },
    { key: 'requestedBy', header: 'Solicitado por' },
    { key: 'area', header: 'Área', render: (a) => <Badge variant="neutral">{a.area}</Badge> },
    {
      key: 'progress', header: 'Turno', sortable: false, render: (a) => {
        const step = currentStep(a)
        if (a.status === 'aprobado') return <span className="dim">Completo</span>
        if (a.status === 'rechazado') return <span className="dim">—</span>
        const doneCount = a.chain.filter((s) => s.status === 'aprobado').length
        return <span className="card-sub">{doneCount}/{a.chain.length} · {step?.assignedToName}</span>
      },
    },
    { key: 'requestedAt', header: 'Fecha', sortValue: (a) => new Date(a.requestedAt).getTime(), render: (a) => formatDateTime(a.requestedAt) },
    { key: 'status', header: 'Estado', render: (a) => <Badge variant={STATUS_VARIANT[a.status]} dot>{a.status}</Badge> },
    {
      key: 'actions', header: '', sortable: false,
      render: (a) => (
        <Button size="sm" variant="ghost" icon={Eye} onClick={() => open(a)}>
          {a.status === 'pendiente' && myTurn(a) ? 'Revisar' : 'Ver'}
        </Button>
      ),
    },
  ]

  if (items.length === 0) {
    return <EmptyState icon={ShieldCheck} title="No hay solicitudes en esta bandeja">Aparecerán aquí cuando alguien te envíe un documento a firmar.</EmptyState>
  }

  const activeMyTurn = active && myTurn(active)

  return (
    <>
      <DataTable columns={columns} data={items} searchKeys={['title', 'requestedBy', 'area']} pageSize={8} />

      <Modal
        open={!!active}
        onClose={closeReview}
        title="Revisión de aprobación"
        width={680}
        footer={
          active?.status === 'pendiente' && activeMyTurn && (
            <>
              <Button variant="danger" icon={XCircle} disabled={!canApproveDocs} onClick={() => setReAuthFor('reject')}>{rejectLabel}</Button>
              <Button variant="primary" icon={CheckCircle2} disabled={!signature || !canApproveDocs} onClick={() => setReAuthFor('approve')} title={!canApproveDocs ? 'Sin permiso para aprobar' : undefined}>
                Aprobar y firmar
              </Button>
            </>
          )
        }
      >
        {active && (
          <div className="col gap-3">
            <div className="glass-soft" style={{ padding: 14 }}>
              <div className="stat-row"><span className="muted">Documento</span><b>{active.title}</b></div>
              <div className="stat-row"><span className="muted">Área de origen</span><b>{active.area}</b></div>
              <div className="stat-row"><span className="muted">Solicitado por</span><b>{active.requestedBy} ({active.requestedByRole})</b></div>
              <div className="stat-row"><span className="muted">Estado general</span><Badge variant={STATUS_VARIANT[active.status]} dot>{active.status}</Badge></div>
            </div>

            {renderPreview?.(active)}

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
              <div className="card-sub" style={{ marginBottom: 8 }}>Ruta de aprobación (de área en área)</div>
              <div className="timeline">
                {active.chain.map((step, i) => (
                  <div className="timeline-item" key={i} style={{ opacity: step.status === 'pendiente' && i !== active.chain.findIndex((s) => s.status === 'pendiente') ? 0.45 : 1 }}>
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

            {active.status === 'pendiente' && activeMyTurn && (
              <div>
                <div className="card-sub" style={{ marginBottom: 8 }}>Tu firma (paso actual)</div>
                <SignaturePicker library={library} setLibrary={setLibrary} active={signature} onSelect={setSignature} />
              </div>
            )}

            {active.status === 'pendiente' && !activeMyTurn && (
              <AlertBanner variant="info">Aún no es tu turno en la ruta de aprobación, o ya firmaste tu parte.</AlertBanner>
            )}

            {active.status === 'pendiente' && activeMyTurn && !canApproveDocs && (
              <AlertBanner variant="warning">Tu rol no tiene permiso para aprobar. Pide al Admin que lo habilite en Permisos.</AlertBanner>
            )}

            {active.status === 'pendiente' && activeMyTurn && (
              <Field label="Comentario (opcional)">
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Observaciones para el solicitante…" />
              </Field>
            )}
          </div>
        )}
      </Modal>

      <ReAuthModal
        open={!!reAuthFor}
        onClose={() => setReAuthFor(null)}
        actionLabel={reAuthFor === 'approve' ? 'Confirmar y firmar' : `Confirmar: ${rejectLabel.toLowerCase()}`}
        message={
          reAuthFor === 'approve'
            ? '¿Seguro que quieres firmar este documento? Reingresa tu contraseña para estampar tu firma.'
            : (rejectConfirmMessage || '¿Seguro que quieres rechazar este documento? Reingresa tu contraseña para confirmar.')
        }
        onConfirm={() => (reAuthFor === 'approve' ? doApprove() : doReject())}
        preview={
          active && reAuthFor === 'approve' ? (
            <div className="col gap-3">
              {renderPreview?.(active)}
              <div>
                <div className="card-sub" style={{ marginBottom: 6 }}>Firma de quien crea</div>
                <SignatureSeal
                  signature={active.creatorSeal?.signature}
                  signerName={active.creatorSeal?.signerName}
                  signerRole={active.creatorSeal?.signerRole}
                  signed={active.creatorSeal}
                />
              </div>
              {active.chain.map((step, i) => (
                <div key={i}>
                  <div className="card-sub" style={{ marginBottom: 6 }}>
                    {step.assignedToName} {step.status === 'aprobado' ? '(firmado)' : step.assignedToId === user?.id ? '(tu firma, ahora)' : '(pendiente)'}
                  </div>
                  <SignatureSeal
                    signature={step.status === 'aprobado' ? step.seal?.signature : (step.assignedToId === user?.id ? signature : null)}
                    signerName={step.assignedToName}
                    signerRole={step.assignedToRole}
                    signed={step.status === 'aprobado' ? step.seal : null}
                  />
                </div>
              ))}
            </div>
          ) : null
        }
      />
    </>
  )
}
