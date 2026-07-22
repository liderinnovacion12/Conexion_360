import { useMemo, useState } from 'react'
import { UserMinus, Pencil } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { CONTRACT_TYPES, PAYROLL_STATES } from '../../data/mockPersonnel.js'
import { formatCOP, formatDate, toNameCase } from '../../utils/format.js'
import { exportToCSV } from '../../utils/pdf.js'
import { usePersonnel } from '../../hooks/usePersonnel.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function RetiredPersonnel() {
  const { personnel: rows, updatePersonnel } = usePersonnel()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const retired = useMemo(() => rows.filter((p) => p.state === 'Retirado'), [rows])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})

  const openEdit = (p) => {
    setEditing(p)
    setForm({ ...p, end: p.end || '' })
    setOpen(true)
  }

  const save = async () => {
    const payload = { ...form, name: toNameCase(form.name), salary: Number(form.salary), end: form.end || null }
    await updatePersonnel(editing.id, payload)
    setOpen(false)
  }

  const columns = [
    { key: 'doc', header: 'Documento', strong: true },
    { key: 'name', header: 'Nombre', render: (p) => <span style={{ color: 'var(--text)' }}>{p.name}</span> },
    { key: 'position', header: 'Cargo' },
    { key: 'area', header: 'Área' },
    { key: 'contract', header: 'Contrato', render: (p) => <Badge variant="neutral">{p.contract}</Badge> },
    ...(isAdmin ? [{ key: 'salary', header: 'Salario', render: (p) => formatCOP(p.salary), sortValue: (p) => p.salary }] : []),
    { key: 'start', header: 'Ingreso', render: (p) => formatDate(p.start) },
    { key: 'end',   header: 'Retiro',  render: (p) => formatDate(p.end) || '—' },
    {
      key: 'actions', header: 'Acciones', sortable: false,
      render: (p) => isAdmin
        ? <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(p)} />
        : null,
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Personal retirado"
        subtitle="Registro de personas que ya no forman parte activa de la organización."
        actions={isAdmin && retired.length > 0
          ? <Button variant="ghost" size="sm" onClick={() =>
              exportToCSV('personal_retirado.csv', retired, [
                { key: 'doc', label: 'Documento' },
                { key: 'name', label: 'Nombre' },
                { key: 'position', label: 'Cargo' },
                { key: 'area', label: 'Área' },
                { key: 'state', label: 'Estado' },
              ])
            }>Exportar CSV</Button>
          : null
        }
      />

      {retired.length === 0 ? (
        <Card>
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-soft)' }}>
            <UserMinus size={40} style={{ opacity: 0.3, marginBottom: 14 }} />
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Sin personal retirado</div>
            <div style={{ fontSize: '0.875rem' }}>
              Cuando un empleado sea marcado como <b>Retirado</b> en su registro de nómina, aparecerá aquí.
            </div>
          </div>
        </Card>
      ) : (
        <Card className="anim-up">
          <DataTable
            columns={columns}
            data={retired}
            searchKeys={['doc', 'name', 'position', 'area']}
            pageSize={10}
          />
        </Card>
      )}

      {isAdmin && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Editar registro"
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="primary" onClick={save}>Guardar</Button>
            </>
          }
        >
          <div className="col gap-3">
            <AlertBanner variant="info">
              Puedes cambiar el estado a <b>Activo</b> si el retiro fue un error, o actualizar los datos del registro.
            </AlertBanner>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Nombres y apellidos">
                <Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Cargo / posición">
                <Input value={form.position || ''} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              </Field>
              <Field label="Área">
                <Input value={form.area || ''} onChange={(e) => setForm({ ...form, area: e.target.value })} />
              </Field>
              <Field label="Estado de nómina">
                <Select
                  value={form.state || 'Retirado'}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  options={PAYROLL_STATES}
                />
              </Field>
              <Field label="Fecha de retiro">
                <Input type="date" value={form.end || ''} onChange={(e) => setForm({ ...form, end: e.target.value })} />
              </Field>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
