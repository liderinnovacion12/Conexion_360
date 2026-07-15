import { useState } from 'react'
import { UserPlus, Pencil, Shield, Trash2, KeyRound } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { useUsers } from '../../hooks/useUsers.js'
import { ROLE_META, ROLES } from '../../utils/roles.js'
import { exportToCSV } from '../../utils/pdf.js'
import { USE_SUPABASE } from '../../services/api.js'

const emptyForm = { name: '', email: '', role: ROLES.EMPLOYEE, area: '' }

export default function UserManagement() {
  const { users, addUser, updateUser, removeUser, adminUpdateCredentials } = useUsers()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [created, setCreated] = useState(null)
  const [createError, setCreateError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(null) // usuario al que se le está restableciendo la clave
  const [resetPassword, setResetPassword] = useState('')
  const [resetError, setResetError] = useState(null)
  const [resetting2, setResettingBusy] = useState(false)
  const [resetDone, setResetDone] = useState(null) // { email, password } ya restablecida

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setCreated(null)
    setCreateError(null)
    setSaveError(null)
    setOpen(true)
  }
  const openEdit = (u) => {
    setEditing(u)
    setForm({ name: u.name, email: u.email, role: u.role, area: u.area })
    setCreated(null)
    setCreateError(null)
    setSaveError(null)
    setOpen(true)
  }
  const save = async () => {
    if (!form.name || !form.email) return
    if (editing) {
      setSaving(true)
      setSaveError(null)
      try {
        // El correo real de acceso vive en auth.users, no en profiles —
        // si cambió, pasa por el endpoint seguro de Administrador.
        if (USE_SUPABASE && form.email !== editing.email) {
          await adminUpdateCredentials(editing.id, { email: form.email })
        }
        await updateUser(editing.id, form)
        setOpen(false)
      } catch (err) {
        setSaveError(err.message)
      } finally {
        setSaving(false)
      }
    } else {
      try {
        const avatar = form.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
        await addUser({ ...form, avatar })
        setCreated({ email: form.email, password: 'demo' })
      } catch (err) {
        setCreateError(err.message)
      }
    }
  }

  // Restablecer la contraseña de alguien que no la recuerda: el Admin
  // define una nueva clave temporal y se la comunica; la persona puede
  // cambiarla luego desde su propio menú de usuario. En modo Supabase
  // pasa por el endpoint seguro de Administrador (nunca por el navegador
  // directamente con la service role key).
  const askReset = (u) => {
    setResetting(u)
    setResetPassword(Math.random().toString(36).slice(-10))
    setResetError(null)
  }
  const confirmReset = async () => {
    if (!resetting) return
    if (USE_SUPABASE) {
      if (resetPassword.length < 8) {
        setResetError('La contraseña debe tener al menos 8 caracteres.')
        return
      }
      setResettingBusy(true)
      setResetError(null)
      try {
        await adminUpdateCredentials(resetting.id, { password: resetPassword })
        setResetDone({ email: resetting.email, password: resetPassword })
        setResetting(null)
      } catch (err) {
        setResetError(err.message)
      } finally {
        setResettingBusy(false)
      }
      return
    }
    const temp = resetPassword || Math.random().toString(36).slice(-8)
    await adminUpdateCredentials(resetting.id, { password: temp })
    setResetDone({ email: resetting.email, password: temp })
    setResetting(null)
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
        <div className="row gap-1">
          <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(u)}>Editar</Button>
          <Button size="sm" variant="ghost" icon={KeyRound} onClick={() => askReset(u)} title="Restablecer contraseña">Clave</Button>
          <Button size="sm" variant="ghost" icon={Trash2} onClick={() => removeUser(u.id)} />
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Gestión de usuarios"
        subtitle="Administra cuentas y roles. Los permisos finos de cada persona se ajustan en Admin → Permisos."
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
          created ? (
            <Button variant="primary" onClick={() => setOpen(false)}>Entendido</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="primary" icon={Shield} onClick={save} disabled={saving}>
                {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear usuario'}
              </Button>
            </>
          )
        }
      >
        {created ? (
          <div className="col gap-3">
            <AlertBanner variant="success" title="Usuario creado">
              Ya puede iniciar sesión y aparece en Admin → Permisos para ajustar sus accesos individuales.
            </AlertBanner>
            <div className="glass-soft" style={{ padding: 14 }}>
              <div className="stat-row"><span className="muted">Usuario</span><b>{created.email}</b></div>
              <div className="stat-row"><span className="muted">Contraseña</span><b>{created.password}</b></div>
            </div>
          </div>
        ) : (
          <div className="col gap-3">
            {createError && <AlertBanner variant="danger" title="No se pudo crear">{createError}</AlertBanner>}
            {saveError && <AlertBanner variant="danger" title="No se pudo guardar">{saveError}</AlertBanner>}
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
        )}
      </Modal>

      <Modal
        open={!!resetting}
        onClose={() => setResetting(null)}
        title="Restablecer contraseña"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetting(null)}>Cancelar</Button>
            <Button variant="primary" icon={KeyRound} onClick={confirmReset} disabled={resetting2}>
              {resetting2 ? 'Restableciendo…' : 'Restablecer'}
            </Button>
          </>
        }
      >
        {resetting && (
          <div className="col gap-3">
            <AlertBanner variant="warning">
              Vas a generar una <b>nueva contraseña</b> para <b>{resetting.name}</b> ({resetting.email}).
              Su contraseña actual dejará de funcionar de inmediato.
            </AlertBanner>
            {resetError && <AlertBanner variant="danger">{resetError}</AlertBanner>}
            <Field label="Nueva contraseña" required hint="Mínimo 8 caracteres. Se sugiere una aleatoria, pero puedes escribir otra.">
              <Input value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
            </Field>
          </div>
        )}
      </Modal>

      <Modal
        open={!!resetDone}
        onClose={() => setResetDone(null)}
        title="Contraseña restablecida"
        footer={<Button variant="primary" onClick={() => setResetDone(null)}>Entendido</Button>}
      >
        {resetDone && (
          <div className="col gap-3">
            <AlertBanner variant="success" title="Nueva contraseña generada">
              Comunícasela a la persona por un canal seguro. Podrá cambiarla luego desde su propio menú de usuario.
            </AlertBanner>
            <div className="glass-soft" style={{ padding: 14 }}>
              <div className="stat-row"><span className="muted">Usuario</span><b>{resetDone.email}</b></div>
              <div className="stat-row"><span className="muted">Contraseña temporal</span><b>{resetDone.password}</b></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
