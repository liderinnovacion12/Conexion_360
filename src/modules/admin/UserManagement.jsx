import { useState } from 'react'
import { UserPlus, Pencil, Shield } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { MOCK_USERS } from '../../data/mockUsers.js'
import { ROLE_META, ROLES } from '../../utils/roles.js'
import { exportToCSV } from '../../utils/pdf.js'

export default function UserManagement() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', role: ROLES.EMPLOYEE, area: '' })

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', email: '', role: ROLES.EMPLOYEE, area: '' })
    setOpen(true)
  }
  const openEdit = (u) => {
    setEditing(u)
    setForm({ name: u.name, email: u.email, role: u.role, area: u.area })
    setOpen(true)
  }
  const save = () => {
    if (!form.name || !form.email) return
    if (editing) {
      setUsers((us) => us.map((u) => (u.id === editing.id ? { ...u, ...form } : u)))
    } else {
      setUsers((us) => [
        ...us,
        { ...form, id: `u-${Date.now()}`, avatar: form.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() },
      ])
    }
    setOpen(false)
  }

  const columns = [
    {
      key: 'name',
      header: 'Usuario',
      strong: true,
      render: (u) => (
        <div className="row gap-2">
          <div className="avatar avatar--sm">{u.avatar}</div>
          <div>
            <div style={{ color: 'var(--text)', fontWeight: 600 }}>{u.name}</div>
            <div className="card-sub">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      render: (u) => <Badge variant="violet" dot>{ROLE_META[u.role].label}</Badge>,
    },
    { key: 'area', header: 'Área' },
    {
      key: 'actions',
      header: 'Acciones',
      sortable: false,
      render: (u) => (
        <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(u)}>
          Editar
        </Button>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Gestión de usuarios"
        subtitle="Administra cuentas, roles y permisos de toda la plataforma."
        actions={<Button variant="primary" icon={UserPlus} onClick={openCreate}>Nuevo usuario</Button>}
      />

      <Card className="anim-up">
        <DataTable
          columns={columns}
          data={users}
          searchKeys={['name', 'email', 'area']}
          onExport={() =>
            exportToCSV('usuarios_conexion360.csv', users, [
              { key: 'name', label: 'Nombre' },
              { key: 'email', label: 'Correo' },
              { key: 'role', label: 'Rol', value: (u) => ROLE_META[u.role].label },
              { key: 'area', label: 'Área' },
            ])
          }
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar usuario' : 'Crear nuevo usuario'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="primary" icon={Shield} onClick={save}>{editing ? 'Guardar cambios' : 'Crear usuario'}</Button>
          </>
        }
      >
        <div className="col gap-3">
          <Field label="Nombre completo" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre y apellidos" />
          </Field>
          <Field label="Correo electrónico" required>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@conexion360.co" />
          </Field>
          <Field label="Rol" required>
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={Object.values(ROLES).map((r) => ({ value: r, label: ROLE_META[r].label }))}
            />
          </Field>
          <Field label="Área / departamento">
            <Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Ej: Operaciones" />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
