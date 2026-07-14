import { useState } from 'react'
import { UserPlus, Mail, Check, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { ProgressBar } from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { AlertBanner, Tabs } from '../../components/ui/Feedback.jsx'
import { CANDIDATES, STATUS_VARIANT } from '../../data/mockCandidates.js'
import { stageLabel } from '../../data/pipeline.js'
import { formatDate } from '../../utils/format.js'
import { exportToCSV } from '../../utils/pdf.js'
import { useCandidateGroups } from '../../hooks/useCandidateGroups.js'
import { useTracks } from '../../hooks/useTracks.js'

const NEW_TRACK_VALUE = '__new_track__'

export default function CandidatesAdmin() {
  const [rows, setRows] = useState(CANDIDATES)
  const [track, setTrack] = useState('todos')
  const [open, setOpen] = useState(false)
  const [created, setCreated] = useState(null)
  const [form, setForm] = useState({ name: '', doc: '', email: '', phone: '', position: '', city: '', track: 'funcionario' })
  const [newTrackName, setNewTrackName] = useState('')
  const { groupsForCandidate } = useCandidateGroups()
  const { tracks, addTrack, trackLabel } = useTracks()

  const confirmNewTrack = () => {
    if (!newTrackName.trim()) return
    const createdTrack = addTrack(newTrackName.trim())
    if (createdTrack) setForm((f) => ({ ...f, track: createdTrack.id }))
    setNewTrackName('')
  }

  const create = () => {
    if (!form.name || !form.email || form.track === NEW_TRACK_VALUE) return
    const newCand = {
      ...form,
      id: `c-${Date.now()}`,
      stage: 'registro',
      status: 'pendiente',
      progress: 5,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setRows((r) => [newCand, ...r])
    setCreated({ email: form.email, password: 'Temp#2025' })
    setForm({ name: '', doc: '', email: '', phone: '', position: '', city: '', track: 'funcionario' })
  }

  const filtered = track === 'todos' ? rows : rows.filter((c) => c.track === track)

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
    { key: 'createdAt', header: 'Creado', render: (c) => formatDate(c.createdAt), sortValue: (c) => new Date(c.createdAt).getTime() },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Aspirantes"
        subtitle="Solo el área de reclutamiento puede crear cuentas de aspirantes."
        actions={<Button variant="primary" icon={UserPlus} onClick={() => { setCreated(null); setOpen(true) }}>Crear aspirante</Button>}
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
    </div>
  )
}
