import { useMemo, useState } from 'react'
import { UserPlus, Mail, Check, X, ShieldCheck, Send } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { ProgressBar } from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { AlertBanner, Tabs } from '../../components/ui/Feedback.jsx'
import SignaturePicker from '../../components/feature/SignaturePicker.jsx'
import SignatureSeal from '../../components/feature/SignatureSeal.jsx'
import ReAuthModal from '../../components/feature/ReAuthModal.jsx'
import { STATUS_VARIANT } from '../../data/mockCandidates.js'
import { stageLabel } from '../../data/pipeline.js'
import { formatDate, formatDateTime, toNameCase } from '../../utils/format.js'
import { exportToCSV } from '../../utils/pdf.js'
import { nextConsecutive, verificationCode } from '../../utils/documents.js'
import { useCandidateGroups } from '../../hooks/useCandidateGroups.js'
import { useTracks } from '../../hooks/useTracks.js'
import { useCandidates } from '../../hooks/useCandidates.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { USE_SUPABASE, adminCreateUser } from '../../services/api.js'
import { usePermissions } from '../../context/PermissionsContext.jsx'
import { useMySignatures } from '../../hooks/useMySignatures.js'
import { useApprovals } from '../../hooks/useApprovals.js'
import { useUsers } from '../../hooks/useUsers.js'
import { useAreaApprovers } from '../../hooks/useAreaApprovers.js'
import { ROLES } from '../../utils/roles.js'

const NEW_TRACK_VALUE = '__new_track__'

const APR_VARIANT = { pendiente: 'warning', aprobado: 'success', rechazado: 'danger' }

export default function CandidatesAdmin() {
  const { candidates: rows, addCandidate } = useCandidates()
  const { user } = useAuth()
  const { hasCapability } = usePermissions()
  const canSignApproval = hasCapability(user?.id, 'canSign')
  const [library, setLibrary] = useMySignatures()
  const { approvals, submitForApproval, listByDomain } = useApprovals()
  const { users } = useUsers()
  const { areaApprovers: AREA_APPROVERS } = useAreaApprovers()

  const [track, setTrack] = useState('todos')
  const [open, setOpen] = useState(false)
  const [created, setCreated] = useState(null)
  const [form, setForm] = useState({ name: '', doc: '', email: '', phone: '', position: '', city: '', track: 'funcionario' })
  const [newTrackName, setNewTrackName] = useState('')
  const { groupsForCandidate } = useCandidateGroups()
  const { tracks, addTrack, trackLabel } = useTracks()

  const [profileOpen, setProfileOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '' })
  const [profileCreated, setProfileCreated] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  const createProfile = async () => {
    if (!profileForm.name || !profileForm.email || !profileForm.password) return
    if (profileForm.password.length < 8) {
      setProfileError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setProfileError('')
    setProfileLoading(true)
    try {
      if (USE_SUPABASE) {
        await adminCreateUser({ name: toNameCase(profileForm.name), email: profileForm.email, password: profileForm.password })
      }
      setProfileCreated({ email: profileForm.email, password: profileForm.password })
      setProfileForm({ name: '', email: '', password: '' })
    } catch (err) {
      setProfileError(err?.message || 'No se pudo crear la cuenta.')
    } finally {
      setProfileLoading(false)
    }
  }

  const closeProfile = () => {
    setProfileOpen(false)
    setProfileCreated(null)
    setProfileError('')
    setProfileForm({ name: '', email: '', password: '' })
  }

  const [approving, setApproving] = useState(null) // candidato activo en el modal
  const [signature, setSignature] = useState(null)
  const [confirmSend, setConfirmSend] = useState(false)
  const [sendError, setSendError] = useState('')

  const candidateApprovals = useMemo(() => listByDomain('candidate'), [approvals])
  const approvalFor = (candidateId) => candidateApprovals.find((a) => a.refId === candidateId)

  const confirmNewTrack = () => {
    if (!newTrackName.trim()) return
    const createdTrack = addTrack(newTrackName.trim())
    if (createdTrack) setForm((f) => ({ ...f, track: createdTrack.id }))
    setNewTrackName('')
  }

  const create = async () => {
    if (!form.name || !form.email || form.track === NEW_TRACK_VALUE) return
    await addCandidate({ ...form, name: toNameCase(form.name) })
    setCreated({ email: form.email, password: 'Temp#2025' })
    setForm({ name: '', doc: '', email: '', phone: '', position: '', city: '', track: 'funcionario' })
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
      const adminUser = users.find((u) => u.id === approverId) || users.find((u) => u.role === ROLES.ADMIN)
      const legalUser = users.find((u) => u.role === ROLES.LEGAL)

      // Cadena paralela (stepOrder: 0 para ambos): cualquiera puede aprobar primero
      const chain = [
        { id: adminUser?.id || approverId, name: adminUser?.name || 'Administrador', role: 'Administrador', area: 'Dirección General', stepOrder: 0 },
        ...(legalUser ? [{ id: legalUser.id, name: legalUser.name, role: 'Jurídica', area: 'Jurídica', stepOrder: 0 }] : []),
      ]

      await submitForApproval({
        domain: 'candidate',
        refId: approving.id,
        title: `Aprobación de aspirante — ${approving.name}`,
        area: 'Talento Humano',
        requestedById: user.id,
        requestedBy: user.name,
        requestedByRole: 'Reclutamiento',
        creatorSeal,
        chain,
      })

      closeApprove()
    } catch (err) {
      setSendError(err?.message || 'No se pudo enviar el aspirante a aprobación. Intenta de nuevo.')
    }
  }

  const isFullyApproved = (candidateId) => approvalFor(candidateId)?.status === 'aprobado'

  const byTrack = track === 'todos' ? rows : rows.filter((c) => c.track === track)
  // En la vía "Funcionarios" solo deben aparecer quienes ya completaron
  // las dos firmas (preaprobación de Reclutamiento + aprobación final
  // del Administrador).
  const filtered = track === 'funcionario' ? byTrack.filter((c) => isFullyApproved(c.id)) : byTrack

  const columns = [
    {
      key: 'name', header: 'Aspirante', strong: true,
      render: (c) => (
        <div className="row gap-2">
          <div className="avatar avatar--sm">{c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
          <div>
            <div style={{ color: 'var(--text)', fontWeight: 600 }}>{c.name}</div>
            <div className="card-sub">{c.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'position', header: 'Cargo' },
    { key: 'track', header: 'Vía', render: (c) => <Badge variant={c.track === 'contratista' ? 'violet' : 'info'}>{trackLabel(c.track) || '—'}</Badge> },
    {
      key: 'groups', header: 'Grupos', sortable: false, render: (c) => {
        const gs = groupsForCandidate(c.id)
        return gs.length ? (
          <div className="row gap-1 wrap">{gs.map((g) => <Badge key={g.id} variant="neutral">{g.name}</Badge>)}</div>
        ) : <span className="dim">—</span>
      },
    },
    { key: 'stage', header: 'Etapa', render: (c) => <Badge variant="info">{stageLabel(c.stage)}</Badge> },
    { key: 'progress', header: 'Avance', sortValue: (c) => c.progress, render: (c) => <div style={{ width: 110 }}><ProgressBar value={c.progress} /></div> },
    { key: 'status', header: 'Estado', render: (c) => <Badge variant={STATUS_VARIANT[c.status]} dot>{c.status}</Badge> },
    {
      key: 'approval', header: 'Aprobación aspirante', sortable: false,
      render: (c) => {
        const a = approvalFor(c.id)
        if (!a) return <span className="dim">Sin enviar</span>
        if (a.status === 'rechazado') return <Badge variant="danger" dot>Devuelto por Admin</Badge>
        return <Badge variant={APR_VARIANT[a.status]} dot>{a.status === 'pendiente' ? 'Pendiente Admin' : a.status}</Badge>
      },
    },
    { key: 'createdAt', header: 'Creado', render: (c) => formatDate(c.createdAt), sortValue: (c) => new Date(c.createdAt).getTime() },
    {
      key: 'actions', header: '', sortable: false,
      render: (c) => {
        const a = approvalFor(c.id)
        // Se puede (re)enviar si nunca se ha enviado, o si Admin lo devolvió.
        if (a && a.status !== 'rechazado') return null
        return (
          <Button size="sm" variant="ghost" icon={Send} onClick={() => openApprove(c)}>
            {a ? 'Volver a enviar' : 'Preaprobar'}
          </Button>
        )
      },
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Aspirantes"
        subtitle="Solo el área de reclutamiento puede crear cuentas de aspirantes."
        actions={
          <div className="row gap-2">
            <Button variant="ghost" icon={UserPlus} onClick={() => { setProfileCreated(null); setProfileError(''); setProfileOpen(true) }}>
              Agregar perfil de aspirante
            </Button>
            <Button variant="primary" icon={UserPlus} onClick={() => { setCreated(null); setOpen(true) }}>Crear aspirante</Button>
          </div>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Tabs
          active={track}
          onChange={setTrack}
          tabs={[{ value: 'todos', label: 'Todos' }, ...tracks.map((t) => ({ value: t.id, label: t.label }))]}
        />
      </div>

      <Card className="anim-up">
        <DataTable
          columns={columns}
          data={filtered}
          searchKeys={['name', 'email', 'position', 'doc']}
          pageSize={9}
          onExport={() =>
            exportToCSV('aspirantes_conexion360.csv', filtered, [
              { key: 'name', label: 'Nombre' },
              { key: 'doc', label: 'Documento' },
              { key: 'email', label: 'Correo' },
              { key: 'position', label: 'Cargo' },
              { key: 'track', label: 'Vía', value: (c) => trackLabel(c.track) || '' },
              { key: 'stage', label: 'Etapa', value: (c) => stageLabel(c.stage) },
              { key: 'status', label: 'Estado' },
            ])
          }
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Crear cuenta de aspirante"
        footer={
          created ? (
            <Button variant="primary" onClick={() => setOpen(false)}>Entendido</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="primary" icon={Mail} onClick={create}>Crear y enviar acceso</Button>
            </>
          )
        }
      >
        {created ? (
          <div className="col gap-3">
            <AlertBanner variant="success" title="Cuenta creada">
              Se generó el acceso del aspirante. El sistema enviará la invitación al correo registrado.
            </AlertBanner>
            <div className="glass-soft" style={{ padding: 14 }}>
              <div className="stat-row"><span className="muted">Usuario</span><b>{created.email}</b></div>
              <div className="stat-row"><span className="muted">Contraseña temporal</span><b>{created.password}</b></div>
            </div>
            <p className="card-sub">El aspirante deberá completar sus datos y aceptar la autorización de tratamiento de datos (Ley 1581 de 2012) en su primer ingreso.</p>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Nombres y apellidos" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="N.° documento"><Input value={form.doc} onChange={(e) => setForm({ ...form, doc: e.target.value })} /></Field>
            <Field label="Correo electrónico" required><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Teléfono"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Cargo aspirado"><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></Field>
            <Field label="Ciudad"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="Vía de vinculación" required>
              <Select
                value={form.track}
                onChange={(e) => setForm({ ...form, track: e.target.value })}
                options={[...tracks.map((t) => ({ value: t.id, label: t.label })), { value: NEW_TRACK_VALUE, label: '+ Crear nueva vía…' }]}
              />
              {form.track === NEW_TRACK_VALUE && (
                <div className="row gap-2" style={{ marginTop: 8 }}>
                  <Input
                    value={newTrackName}
                    onChange={(e) => setNewTrackName(e.target.value)}
                    placeholder="Ej: Practicantes, Temporales…"
                    onKeyDown={(e) => e.key === 'Enter' && confirmNewTrack()}
                    autoFocus
                  />
                  <Button size="sm" variant="primary" icon={Check} onClick={confirmNewTrack} disabled={!newTrackName.trim()} />
                  <Button size="sm" variant="ghost" icon={X} onClick={() => setForm((f) => ({ ...f, track: '' }))} />
                </div>
              )}
            </Field>
          </div>
        )}
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

      {/* Modal: Agregar perfil de aspirante (cuenta de acceso real) */}
      <Modal
        open={profileOpen}
        onClose={closeProfile}
        title="Agregar perfil de aspirante"
        footer={
          profileCreated ? (
            <Button variant="primary" onClick={closeProfile}>Entendido</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={closeProfile}>Cancelar</Button>
              <Button
                variant="primary"
                icon={UserPlus}
                onClick={createProfile}
                disabled={profileLoading || !profileForm.name || !profileForm.email || !profileForm.password}
              >
                {profileLoading ? 'Creando…' : 'Crear cuenta'}
              </Button>
            </>
          )
        }
      >
        {profileCreated ? (
          <div className="col gap-3">
            <AlertBanner variant="success" title="Cuenta creada">
              El aspirante ya puede ingresar con estas credenciales.
            </AlertBanner>
            <div className="glass-soft" style={{ padding: 14 }}>
              <div className="stat-row"><span className="muted">Correo</span><b>{profileCreated.email}</b></div>
              <div className="stat-row"><span className="muted">Contraseña</span><b>{profileCreated.password}</b></div>
            </div>
            <p className="card-sub">Comparte estas credenciales con el aspirante. Al ingresar, podrá completar su perfil y documentos.</p>
          </div>
        ) : (
          <div className="col gap-3">
            <AlertBanner variant="info">
              Crea un acceso directo para el aspirante. Recibirá las credenciales que tú definas y podrá ingresar de inmediato como aspirante.
            </AlertBanner>
            {!USE_SUPABASE && (
              <AlertBanner variant="warning">
                Modo demo: la cuenta no se creará en Supabase. Este flujo funciona completamente solo cuando la app está desplegada en Vercel.
              </AlertBanner>
            )}
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Nombres y apellidos" required>
                <Input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Ej: María Pérez"
                />
              </Field>
              <Field label="Correo electrónico" required>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="aspirante@correo.com"
                />
              </Field>
              <Field label="Contraseña" required style={{ gridColumn: '1 / -1' }}>
                <Input
                  type="password"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                />
              </Field>
            </div>
            {profileError && <AlertBanner variant="danger">{profileError}</AlertBanner>}
          </div>
        )}
      </Modal>
    </div>
  )
}
