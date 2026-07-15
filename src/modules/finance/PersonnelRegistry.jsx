import { useState, useMemo } from 'react'
import { UserPlus, Pencil, FileSignature } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { CONTRACT_TYPES, PAYROLL_STATES } from '../../data/mockPersonnel.js'
import { formatCOP, formatDate } from '../../utils/format.js'
import { generateLaborCertificate, exportToCSV } from '../../utils/pdf.js'
import { usePersonnel } from '../../hooks/usePersonnel.js'

const emptyForm = { doc: '', name: '', position: '', contract: 'Indefinido', salary: '', state: 'Activo', start: '', end: '', area: '' }
const stateVariant = { Activo: 'success', Inactivo: 'neutral', Suspendido: 'warning' }

export default function PersonnelRegistry() {
  const { personnel: rows, addPersonnel, updatePersonnel } = usePersonnel()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [filterArea, setFilterArea] = useState('')
  const [filterContract, setFilterContract] = useState('')

  const areas = useMemo(() => [...new Set(rows.map((p) => p.area))], [rows])
  const data = rows.filter(
    (p) => (!filterArea || p.area === filterArea) && (!filterContract || p.contract === filterContract)
  )

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setOpen(true) }
  const openEdit = (p) => { setEditing(p); setForm({ ...p, end: p.end || '' }); setErrors({}); setOpen(true) }

  const validate = () => {
    const e = {}
    if (!form.doc) e.doc = 'Requerido'
    if (!form.name) e.name = 'Requerido'
    if (!form.position) e.position = 'Requerido'
    if (!form.salary || Number(form.salary) <= 0) e.salary = 'Valor inválido'
    if (!form.start) e.start = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) return
    const payload = { ...form, salary: Number(form.salary), end: form.end || null }
    if (editing) await updatePersonnel(editing.id, payload)
    else await addPersonnel(payload)
    setOpen(false)
  }

  const columns = [
    { key: 'doc', header: 'Documento', strong: true },
    { key: 'name', header: 'Nombre', render: (p) => <span style={{ color: 'var(--text)' }}>{p.name}</span> },
    { key: 'position', header: 'Cargo' },
    { key: 'contract', header: 'Contrato', render: (p) => <Badge variant="neutral">{p.contract}</Badge> },
    { key: 'salary', header: 'Salario', render: (p) => formatCOP(p.salary), sortValue: (p) => p.salary },
    { key: 'state', header: 'Estado', render: (p) => <Badge variant={stateVariant[p.state]} dot>{p.state}</Badge> },
    { key: 'start', header: 'Inicio', render: (p) => formatDate(p.start), sortValue: (p) => new Date(p.start).getTime() },
    {
      key: 'actions', header: 'Acciones', sortable: false,
      render: (p) => (
        <div className="row gap-1">
          <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(p)} />
          <Button size="sm" variant="ghost" icon={FileSignature} onClick={() => generateLaborCertificate(p)} title="Certificado laboral" />
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Registro de personal"
        subtitle="Datos contractuales y de nómina del personal."
        actions={<Button variant="primary" icon={UserPlus} onClick={openCreate}>Registrar persona</Button>}
      />

      <Card className="anim-up">
        <DataTable
          columns={columns}
          data={data}
          searchKeys={['doc', 'name', 'position', 'area']}
          pageSize={9}
          toolbar={
            <>
              <Select placeholder="Todas las áreas" value={filterArea} onChange={(e) => setFilterArea(e.target.value)} options={areas} />
              <Select placeholder="Todo contrato" value={filterContract} onChange={(e) => setFilterContract(e.target.value)} options={CONTRACT_TYPES} />
            </>
          }
          onExport={() =>
            exportToCSV('personal_conexion360.csv', data, [
              { key: 'doc', label: 'Documento' },
              { key: 'name', label: 'Nombre' },
              { key: 'position', label: 'Cargo' },
              { key: 'contract', label: 'Contrato' },
              { key: 'salary', label: 'Salario' },
              { key: 'state', label: 'Estado' },
              { key: 'area', label: 'Área' },
            ])
          }
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar registro' : 'Registrar persona'}
        width={640}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={save}>{editing ? 'Guardar' : 'Registrar'}</Button>
          </>
        }
      >
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="N.° documento" required error={errors.doc}><Input value={form.doc} onChange={(e) => setForm({ ...form, doc: e.target.value })} /></Field>
          <Field label="Nombres y apellidos" required error={errors.name}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Cargo / posición" required error={errors.position}><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></Field>
          <Field label="Área / departamento"><Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></Field>
          <Field label="Tipo de contrato"><Select value={form.contract} onChange={(e) => setForm({ ...form, contract: e.target.value })} options={CONTRACT_TYPES} /></Field>
          <Field label="Salario / valor de pago" required error={errors.salary}><Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></Field>
          <Field label="Estado de nómina"><Select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} options={PAYROLL_STATES} /></Field>
          <div />
          <Field label="Fecha de inicio" required error={errors.start}><Input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Field>
          <Field label="Fecha de fin (si aplica)"><Input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  )
}
