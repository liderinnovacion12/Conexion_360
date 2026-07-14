import { useState } from 'react'
import { UserPlus, Pencil, Building2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { useClients } from '../../hooks/useClients.js'
import { exportToCSV } from '../../utils/pdf.js'

const emptyForm = { name: '', nit: '', contactName: '', email: '', phone: '', address: '', city: '', status: 'Activo' }

export default function Clients() {
  const { clients, addClient, updateClient } = useClients()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true) }
  const openEdit = (c) => { setEditing(c); setForm(c); setOpen(true) }
  const save = () => {
    if (!form.name.trim() || !form.nit.trim()) return
    if (editing) updateClient(editing.id, form)
    else addClient(form)
    setOpen(false)
  }

  const columns = [
    { key: 'name', header: 'Cliente', strong: true, render: (c) => (
      <div className="row gap-2"><Building2 size={16} className="dim" /><span style={{ color: 'var(--text)' }}>{c.name}</span></div>
    )},
    { key: 'nit', header: 'NIT' },
    { key: 'contactName', header: 'Contacto' },
    { key: 'city', header: 'Ciudad' },
    { key: 'status', header: 'Estado', render: (c) => <Badge variant={c.status === 'Activo' ? 'success' : 'neutral'} dot>{c.status}</Badge> },
    { key: 'actions', header: '', sortable: false, render: (c) => <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(c)} /> },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Clientes"
        subtitle="Directorio de clientes para facturación."
        actions={<Button variant="primary" icon={UserPlus} onClick={openCreate}>Nuevo cliente</Button>}
      />

      <Card className="anim-up">
        <DataTable
          columns={columns}
          data={clients}
          searchKeys={['name', 'nit', 'contactName', 'city']}
          pageSize={8}
          onExport={() =>
            exportToCSV('clientes_conexion360.csv', clients, [
              { key: 'name', label: 'Cliente' },
              { key: 'nit', label: 'NIT' },
              { key: 'contactName', label: 'Contacto' },
              { key: 'email', label: 'Correo' },
              { key: 'city', label: 'Ciudad' },
              { key: 'status', label: 'Estado' },
            ])
          }
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar cliente' : 'Nuevo cliente'}
        width={640}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button variant="primary" onClick={save}>Guardar</Button></>}
      >
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Razón social" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="NIT" required><Input value={form.nit} onChange={(e) => setForm({ ...form, nit: e.target.value })} /></Field>
          <Field label="Contacto"><Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></Field>
          <Field label="Correo"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Teléfono"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Ciudad"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
          <Field label="Dirección"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <Field label="Estado"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={['Activo', 'Inactivo']} /></Field>
        </div>
      </Modal>
    </div>
  )
}
