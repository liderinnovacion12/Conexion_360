import { useState } from 'react'
import { UserPlus, Mail, Eye } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { ProgressBar } from '../../components/ui/Badge.jsx'
import { Field, Input } from '../../components/ui/Form.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { CANDIDATES, STATUS_VARIANT } from '../../data/mockCandidates.js'
import { stageLabel } from '../../data/pipeline.js'
import { formatDate } from '../../utils/format.js'
import { exportToCSV } from '../../utils/pdf.js'

export default function CandidatesAdmin() {
  const [rows, setRows] = useState(CANDIDATES)
  const [open, setOpen] = useState(false)
  const [created, setCreated] = useState(null)
  const [form, setForm] = useState({ name: '', doc: '', email: '', phone: '', position: '', city: '' })

  const create = () => {
    if (!form.name || !form.email) return
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
    setForm({ name: '', doc: '', email: '', phone: '', position: '', city: '' })
  }

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

      <Card className="anim-up">
        <DataTable
          columns={columns}
          data={rows}
          searchKeys={['name', 'email', 'position', 'doc']}
          pageSize={9}
          onExport={() =>
            exportToCSV('aspirantes_conexion360.csv', rows, [
              { key: 'name', label: 'Nombre' },
              { key: 'doc', label: 'Documento' },
              { key: 'email', label: 'Correo' },
              { key: 'position', label: 'Cargo' },
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
          </div>
        )}
      </Modal>
    </div>
  )
}
