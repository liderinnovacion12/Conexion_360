import { useMemo, useState } from 'react'
import { Plus, Trash2, Users, UsersRound, ListChecks, Send } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { ProgressBar } from '../../components/ui/Badge.jsx'
import { Field, Input } from '../../components/ui/Form.jsx'
import { AlertBanner, EmptyState } from '../../components/ui/Feedback.jsx'
import SignaturePicker from '../../components/feature/SignaturePicker.jsx'
import SignatureSeal from '../../components/feature/SignatureSeal.jsx'
import ReAuthModal from '../../components/feature/ReAuthModal.jsx'
import { stageLabel } from '../../data/pipeline.js'
import { STATUS_VARIANT } from '../../data/mockCandidates.js'
import { nextConsecutive, verificationCode } from '../../utils/documents.js'
import { useCandidateGroups } from '../../hooks/useCandidateGroups.js'
import { useCandidates } from '../../hooks/useCandidates.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { usePermissions } from '../../context/PermissionsContext.jsx'
import { useMySignatures } from '../../hooks/useMySignatures.js'
import { useApprovals } from '../../hooks/useApprovals.js'
import { useUsers } from '../../hooks/useUsers.js'
import { useAreaApprovers } from '../../hooks/useAreaApprovers.js'
import { ROLES } from '../../utils/roles.js'

const COLORS = ['#19E3D9', '#9B5DE5', '#FFC857', '#2EE6A6', '#FF8FB1', '#7BD0FF']
const APR_VARIANT = { pendiente: 'warning', aprobado: 'success', rechazado: 'danger' }

export default function CandidateGroups() {
  const { groups, addGroup, removeGroup, candidatesInGroup, isMember, toggleMembership } = useCandidateGroups()
  const { candidates: CANDIDATES } = useCandidates()
  const { user } = useAuth()
  const isRecruitment = user?.role === ROLES.RECRUITMENT
  const { hasCapability } = usePermissions()
  const canSignApproval = hasCapability(user?.id, 'canSign')
  const [library, setLibrary] = useMySignatures()
  const { approvals, submitForApproval, listByDomain } = useApprovals()
  const { users } = useUsers()
  const { areaApprovers: AREA_APPROVERS } = useAreaApprovers()

  const [name, setName] = useState('')
  const [assignFor, setAssignFor] = useState(null)
  const [viewFor, setViewFor] = useState(null) // grupo cuya lista de integrantes se está viendo
  const [approving, setApproving] = useState(null) // aspirante activo en el modal de preaprobación
  const [signature, setSignature] = useState(null)
  const [confirmSend, setConfirmSend] = useState(false)
  const [sendError, setSendError] = useState('')

  const candidateApprovals = useMemo(() => listByDomain('candidate'), [approvals])
  const approvalFor = (candidateId) => candidateApprovals.find((a) => a.refId === candidateId)

  const create = async () => {
    if (!name.trim()) return
    await addGroup(name.trim(), COLORS[groups.length % COLORS.length])
    setName('')
  }

  const membersOf = (groupId) => {
    const ids = candidatesInGroup(groupId)
    return CANDIDATES.filter((c) => ids.includes(c.id))
  }

  const openApprove = (c) => {
    setApproving(c)
    setSignature(null)
    setSendError('')
  }
  const closeApprove = () => {
    setApproving(null)
    setSignature(null)
    setConfirmSend(false)
    setSendError('')
  }

  const sendToApproval = async () => {
    if (!approving || !signature) return
    setConfirmSend(false)
    try {
      const consecutive = nextConsecutive()
      const date = new Date().toISOString()
      const code = verificationCode({ candidateId: approving.id, signerName: user.name, consecutive, date })
      const creatorSeal = { consecutive, date, code, signature, signerName: user.name, signerRole: 'Reclutamiento' }

      const approverId = AREA_APPROVERS['Dirección General']
      const approver = users.find((u) => u.id === approverId)

      await submitForApproval({
        domain: 'candidate',
        refId: approving.id,
        title: `Aprobación de aspirante — ${approving.name}`,
        area: 'Talento Humano',
        requestedById: user.id,
        requestedBy: user.name,
        requestedByRole: 'Reclutamiento',
        creatorSeal,
        chain: [{ id: approverId, name: approver?.name || 'Administrador', role: 'Administrador', area: 'Dirección General' }],
      })

      closeApprove()
    } catch (err) {
      setSendError(err?.message || 'No se pudo enviar el aspirante a aprobación. Intenta de nuevo.')
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Grupos de aspirantes"
        subtitle="Crea grupos libres (ej. Abogados, Ingenieros) y asigna candidatos cuando quieras."
      />

      <Card title="Nuevo grupo" className="anim-up" style={{ marginBottom: 18 }}>
        <div className="row gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del grupo, ej: Abogados" onKeyDown={(e) => e.key === 'Enter' && create()} />
          <Button variant="primary" icon={Plus} onClick={create}>Crear grupo</Button>
        </div>
      </Card>

      {groups.length === 0 ? (
        <Card><EmptyState icon={UsersRound} title="Aún no hay grupos">Crea el primero arriba.</EmptyState></Card>
      ) : (
        <div className="grid grid-3 stagger">
          {groups.map((g) => {
            const members = candidatesInGroup(g.id)
            return (
              <Card key={g.id}>
                <div className="row between" style={{ marginBottom: 10 }}>
                  <span className="row gap-2" style={{ fontWeight: 600 }}>
                    <span className="dot" style={{ background: g.color, color: g.color, width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }} />
                    {g.name}
                  </span>
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => removeGroup(g.id)} />
                </div>
                <div className="row gap-2" style={{ marginBottom: 12 }}>
                  <Users size={15} className="dim" />
                  <span className="card-sub">{members.length} aspirante(s)</span>
                </div>
                <div className="col gap-2">
                  <Button size="sm" variant="ghost" className="full" icon={ListChecks} onClick={() => setViewFor(g)}>Ver integrantes</Button>
                  <Button size="sm" variant="ghost" className="full" onClick={() => setAssignFor(g)}>Gestionar aspirantes</Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={!!assignFor}
        onClose={() => setAssignFor(null)}
        title={`Aspirantes en: ${assignFor?.name || ''}`}
        footer={<Button variant="primary" onClick={() => setAssignFor(null)}>Listo</Button>}
      >
        <div className="col gap-2">
          <p className="card-sub">Marca los aspirantes que pertenecen a este grupo.</p>
          {CANDIDATES.map((c) => (
            <label key={c.id} className="stat-row" style={{ cursor: 'pointer' }}>
              <span className="row gap-2">
                <div className="avatar avatar--sm">{c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
                {c.name}
              </span>
              <input
                type="checkbox"
                checked={assignFor ? isMember(c.id, assignFor.id) : false}
                onChange={() => toggleMembership(c.id, assignFor.id)}
              />
            </label>
          ))}
        </div>
      </Modal>

      <Modal
        open={!!viewFor}
        onClose={() => setViewFor(null)}
        title={`Integrantes de: ${viewFor?.name || ''}`}
        width={640}
        footer={<Button variant="primary" onClick={() => setViewFor(null)}>Cerrar</Button>}
      >
        <div className="col gap-3">
          {viewFor && membersOf(viewFor.id).length === 0 ? (
            <EmptyState icon={Users} title="Este grupo no tiene integrantes todavía">
              Usa "Gestionar aspirantes" para agregar personas.
            </EmptyState>
          ) : (
            viewFor && membersOf(viewFor.id).map((c) => {
              const a = approvalFor(c.id)
              return (
                <div key={c.id} className="glass-soft" style={{ padding: 14 }}>
                  <div className="row between" style={{ marginBottom: 8 }}>
                    <span className="row gap-2">
                      <div className="avatar avatar--sm">{c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div className="card-sub">{c.position || '—'} · {stageLabel(c.stage)}</div>
                      </div>
                    </span>
                    <Badge variant={STATUS_VARIANT[c.status]} dot>{c.status}</Badge>
                  </div>
                  <div className="row gap-2" style={{ marginBottom: 10 }}>
                    <div style={{ flex: 1 }}><ProgressBar value={c.progress} /></div>
                    <span className="card-sub">{c.progress}%</span>
                  </div>
                  <div className="row between">
                    {a ? (
                      <Badge variant={APR_VARIANT[a.status]} dot>
                        {a.status === 'pendiente' ? 'Pendiente Admin' : a.status === 'rechazado' ? 'Devuelto por Admin' : a.status}
                      </Badge>
                    ) : (
                      <span className="dim">Sin preaprobar</span>
                    )}
                    {isRecruitment && (!a || a.status === 'rechazado') && (
                      <Button size="sm" variant="ghost" icon={Send} onClick={() => openApprove(c)}>
                        {a ? 'Volver a enviar' : 'Preaprobar'}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Modal>

      <Modal
        open={!!approving}
        onClose={closeApprove}
        title="Preaprobar aspirante"
        footer={
          <>
            <Button variant="ghost" onClick={closeApprove}>Cancelar</Button>
            <Button
              variant="violet"
              icon={Send}
              disabled={!signature || !canSignApproval}
              onClick={() => setConfirmSend(true)}
              title={!canSignApproval ? 'Sin permiso para firmar' : undefined}
            >
              Firmar y enviar a Admin
            </Button>
          </>
        }
      >
        {approving && (
          <div className="col gap-3">
            <div className="glass-soft" style={{ padding: 14 }}>
              <div className="stat-row"><span className="muted">Aspirante</span><b>{approving.name}</b></div>
              <div className="stat-row"><span className="muted">Documento</span><b>{approving.doc || '—'}</b></div>
              <div className="stat-row"><span className="muted">Cargo</span><b>{approving.position || '—'}</b></div>
              <div className="stat-row"><span className="muted">Etapa</span><Badge variant="info">{stageLabel(approving.stage)}</Badge></div>
            </div>
            <AlertBanner variant="info">
              Al firmar, este aspirante se envía a <b>Administración</b> para su aprobación final. Cuando el
              Administrador apruebe, al aspirante le llegará un correo indicando que su proceso fue aprobado.
            </AlertBanner>
            {approvalFor(approving.id)?.status === 'rechazado' && (
              <AlertBanner variant="warning" title="Devuelto por Administración">
                {approvalFor(approving.id)?.chain?.[0]?.comment || 'No se dejó un comentario.'}
              </AlertBanner>
            )}
            {!canSignApproval && (
              <AlertBanner variant="warning">Tu rol no tiene permiso para firmar. Pide al Admin que lo habilite en Permisos.</AlertBanner>
            )}
            {sendError && <AlertBanner variant="danger">{sendError}</AlertBanner>}
            <div>
              <div className="card-sub" style={{ marginBottom: 8 }}>Tu firma</div>
              <SignaturePicker library={library} setLibrary={setLibrary} active={signature} onSelect={setSignature} />
            </div>
          </div>
        )}
      </Modal>

      <ReAuthModal
        open={confirmSend}
        onClose={() => setConfirmSend(false)}
        actionLabel="Confirmar y firmar"
        message="¿Seguro que quieres preaprobar este aspirante y enviarlo a Administración? Reingresa tu contraseña para estampar tu firma."
        onConfirm={sendToApproval}
        preview={
          approving && (
            <div className="col gap-3">
              <b style={{ display: 'block', fontSize: '0.9rem' }}>{approving.name} — {approving.position || 'Aspirante'}</b>
              <SignatureSeal signature={signature} signerName={user?.name} signerRole="Reclutamiento" signed={null} />
            </div>
          )
        }
      />
    </div>
  )
}
