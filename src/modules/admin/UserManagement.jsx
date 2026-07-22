import { useState } from 'react'
import { UserPlus, Pencil, Shield, Trash2, KeyRound, ArrowUpRight, UserCheck } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { useUsers } from '../../hooks/useUsers.js'
import { usePersonnel } from '../../hooks/usePersonnel.js'
import { useCandidates } from '../../hooks/useCandidates.js'
import { ROLE_META, ROLES } from '../../utils/roles.js'
import { toNameCase } from '../../utils/format.js'
import { CONTRACT_TYPES } from '../../data/mockPersonnel.js'
import { exportToCSV } from '../../utils/pdf.js'
import { USE_SUPABASE } from '../../services/api.js'

const emptyForm = { name: '', email: '', role: ROLES.EMPLOYEE, area: '' }
const emptyPromotion = { position: '', contract: CONTRACT_TYPES[0], salary: '', area: '', start: '' }

export default function UserManagement() {
  const { users, addUser, updateUser, removeUser, adminUpdateCredentials } = useUsers()
  const { addPersonnel } = usePersonnel()
  const { candidates, addCandidate } = useCandidates()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [created, setCreated] = useState(null)
  const [createError, setCreateError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)    // usuario a eliminar
  const [deleteStep, setDeleteStep] = useState(1)   // 1 = primera confirmación, 2 = segunda
  const [deleting, setDeleting] = useState(false)

  const openDelete = (u) => { setToDelete(u); setDeleteStep(1) }
  const confirmDelete = async () => {
    if (deleteStep === 1) { setDeleteStep(2); return }
    setDeleting(true)
    try { await removeUser(toDelete.id) } finally { setDeleting(false); setToDelete(null) }
  }

  // ── Convertir aspirante en candidato (crea fila en candidates y enlaza) ──
  const [converting, setConverting] = useState(null)   // usuario a convertir
  const [convertSaving, setConvertSaving] = useState(false)
  const [convertError, setConvertError] = useState(null)
  const [convertDone, setConvertDone] = useState(null)

  const confirmConvert = async () => {
    if (!converting) return
    setConvertSaving(true)
    setConvertError(null)
    try {
      const candidate = await addCandidate({
        name:   converting.name,
        email:  converting.email,
        stage:  'registro',
        status: 'pendiente',
        track:  'funcionario',
      })
      await updateUser(converting.id, { candidateId: candidate.id })
      setConvertDone(converting.name)
      setConverting(null)
    } catch (err) {
      setConvertError(err.message || 'No se pudo convertir el aspirante.')
    } finally {
      setConvertSaving(false)
    }
  }

  const [promoting, setPromoting] = useState(null)   // usuario aspirante a promover
  const [promoForm, setPromoForm] = useState(emptyPromotion)
  const [promoError, setPromoError] = useState(null)
  const [promoSaving, setPromoSaving] = useState(false)
  const [promoDone, setPromoDone] = useState(null)    // nombre ya promovido

  const openPromote = (u) => {
    const candidate = candidates.find((c) => c.id === u.candidateId)
    setPromoting(u)
    setPromoForm({
      ...emptyPromotion,
      position: candidate?.position || '',
      area: u.area || candidate?.city || '',
    })
    setPromoError(null)
    setPromoDone(null)
  }

  const confirmPromote = async () => {
    if (!promoting) return
    if (!promoForm.position || !promoForm.start) {
      setPromoError('El cargo y la fecha de inicio son obligatorios.')
      return
    }
    setPromoSaving(true)
    setPromoError(null)
    try {
      const candidate = candidates.find((c) => c.id === promoting.candidateId)
      // 1. Crear registro de personal con los datos del aspirante
      const personnel = await addPersonnel({
        id: promoting.candidateId || undefined,  // mantiene el ID PRIMERNOMBRE-CEDULA en la tabla de personal
        doc: candidate?.doc || promoting.doc || '',
        name: promoting.name,
        position: promoForm.position,
        contract: promoForm.contract,
        salary: promoForm.salary ? Number(promoForm.salary) : 0,
        state: 'Activo',
        start: promoForm.start,
        end: null,
        area: promoForm.area,
      })
      // 2. Cambiar el rol del perfil de candidato a empleado y enlazar el ID
      await updateUser(promoting.id, {
        role: ROLES.EMPLOYEE,
        area: promoForm.area,
        employeeId: personnel.id,
      })
      setPromoDone(promoting.name)
      setPromoting(null)
    } catch (err) {
      setPromoError(err.message || 'No se pudo completar la promoción.')
    } finally {
      setPromoSaving(false)
    }
  }

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
    const normalForm = { ...form, name: toNameCase(form.name) }
    if (editing) {
      setSaving(true)
      setSaveError(null)
      try {
        // El correo real de acceso vive en auth.users, no en profiles —
        // si cambió, pasa por el endpoint seguro de Administrador.
        if (USE_SUPABASE && form.email !== editing.email) {
          await adminUpdateCredentials(editing.id, { email: form.email })
        }
        await updateUser(editing.id, normalForm)
        setOpen(false)
      } catch (err) {
        setSaveError(err.message)
      } finally {
        setSaving(false)
      }
    } else {
      try {
        const avatar = normalForm.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
        await addUser({ ...normalForm, avatar })
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
      render: (u) => (
        <div className="col gap-1">
          <Badge variant="violet" dot>{ROLE_META[u.role]?.label ?? u.role}</Badge>
          {u.role === ROLES.CANDIDATE && !u.candidateId && (
            <Badge variant="warning" dot>Aspirante — pendiente de activar</Badge>
          )}
        </div>
      ),
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
          {u.role === ROLES.CANDIDATE && !u.candidateId && (
            <Button size="sm" variant="ghost" icon={UserCheck} onClick={() => { setConverting(u); setConvertError(null) }} title="Convertir en candidato">
              Candidato
            </Button>
          )}
          {u.role === ROLES.CANDIDATE && u.candidateId && (
            <Button size="sm" variant="ghost" icon={ArrowUpRight} onClick={() => openPromote(u)} title="Promover a Personal">
              Promover
            </Button>
          )}
          <Button size="sm" variant="ghost" icon={Trash2} onClick={() => openDelete(u)} />
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
              { key: 'role', label: 'Rol', value: (u) => ROLE_META[u.role]?.label ?? u.role },
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

      {/* ---- Modal: convertir aspirante en candidato ---- */}
      <Modal
        open={!!converting}
        onClose={() => setConverting(null)}
        title="Activar como candidato"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConverting(null)}>Cancelar</Button>
            <Button variant="primary" icon={UserCheck} onClick={confirmConvert} disabled={convertSaving}>
              {convertSaving ? 'Activando…' : 'Confirmar'}
            </Button>
          </>
        }
      >
        {converting && (
          <div className="col gap-3">
            <AlertBanner variant="info" title={`Activar a ${converting.name} como candidato`}>
              Esta persona se registró con un código de acceso. Al confirmar, se creará su ficha en el pipeline de
              reclutamiento y podrá avanzar por las etapas del proceso de selección.
            </AlertBanner>
            {convertError && <AlertBanner variant="danger">{convertError}</AlertBanner>}
            <div className="glass-soft" style={{ padding: 14 }}>
              <div className="stat-row"><span className="muted">Nombre</span><b>{converting.name}</b></div>
              <div className="stat-row"><span className="muted">Correo</span><b>{converting.email}</b></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!convertDone}
        onClose={() => setConvertDone(null)}
        title="Candidato activado"
        footer={<Button variant="primary" onClick={() => setConvertDone(null)}>Entendido</Button>}
      >
        {convertDone && (
          <AlertBanner variant="success" title="Listo">
            <b>{convertDone}</b> ahora aparece en el pipeline de reclutamiento como candidato activo.
          </AlertBanner>
        )}
      </Modal>

      {/* ---- Modal: promover aspirante a personal ---- */}
      <Modal
        open={!!promoting}
        onClose={() => setPromoting(null)}
        title="Promover a Personal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPromoting(null)}>Cancelar</Button>
            <Button variant="primary" icon={ArrowUpRight} onClick={confirmPromote} disabled={promoSaving}>
              {promoSaving ? 'Promoviendo…' : 'Confirmar promoción'}
            </Button>
          </>
        }
      >
        {promoting && (
          <div className="col gap-3">
            <AlertBanner variant="info" title={`Vas a promover a ${promoting.name}`}>
              Su rol cambiará de <b>Aspirante</b> a <b>Personal</b> y se creará su registro en nómina.
            </AlertBanner>
            {promoError && <AlertBanner variant="danger">{promoError}</AlertBanner>}
            <Field label="Cargo / posición" required>
              <Input
                value={promoForm.position}
                onChange={(e) => setPromoForm({ ...promoForm, position: e.target.value })}
                placeholder="Ej: Operario de Producción"
              />
            </Field>
            <Field label="Tipo de contrato" required>
              <Select
                value={promoForm.contract}
                onChange={(e) => setPromoForm({ ...promoForm, contract: e.target.value })}
                options={CONTRACT_TYPES.map((c) => ({ value: c, label: c }))}
              />
            </Field>
            <Field label="Salario (COP)" hint="Puedes dejarlo en 0 y ajustarlo luego en Nómina.">
              <Input
                type="number"
                value={promoForm.salary}
                onChange={(e) => setPromoForm({ ...promoForm, salary: e.target.value })}
                placeholder="Ej: 2500000"
              />
            </Field>
            <Field label="Área / departamento">
              <Input
                value={promoForm.area}
                onChange={(e) => setPromoForm({ ...promoForm, area: e.target.value })}
                placeholder="Ej: Operaciones"
              />
            </Field>
            <Field label="Fecha de inicio" required>
              <Input
                type="date"
                value={promoForm.start}
                onChange={(e) => setPromoForm({ ...promoForm, start: e.target.value })}
              />
            </Field>
          </div>
        )}
      </Modal>

      {/* ---- Confirmación de promoción exitosa ---- */}
      <Modal
        open={!!promoDone}
        onClose={() => setPromoDone(null)}
        title="Promoción completada"
        footer={<Button variant="primary" onClick={() => setPromoDone(null)}>Entendido</Button>}
      >
        {promoDone && (
          <AlertBanner variant="success" title="Listo">
            <b>{promoDone}</b> ahora tiene perfil de <b>Personal</b> y aparece en el módulo de Nómina y personal.
          </AlertBanner>
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

      {/* ---- Doble confirmación: eliminar perfil ---- */}
      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={deleteStep === 1 ? 'Eliminar perfil' : '⚠ Confirmación final'}
        width={460}
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>Cancelar</Button>
            <Button variant="danger" icon={Trash2} onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Eliminando…' : deleteStep === 1 ? 'Sí, continuar' : 'Eliminar definitivamente'}
            </Button>
          </>
        }
      >
        {toDelete && deleteStep === 1 && (
          <div className="col gap-3">
            <AlertBanner variant="warning" title="¿Estás seguro?">
              Vas a eliminar el perfil de <b>{toDelete.name}</b> ({toDelete.email}).
              Esta acción es irreversible y borrará su acceso a la plataforma.
            </AlertBanner>
            <div className="glass-soft" style={{ padding: 14 }}>
              <div className="stat-row"><span className="muted">Nombre</span><b>{toDelete.name}</b></div>
              <div className="stat-row"><span className="muted">Correo</span><b>{toDelete.email}</b></div>
              <div className="stat-row"><span className="muted">Rol</span><b>{ROLE_META[toDelete.role]?.label}</b></div>
            </div>
          </div>
        )}
        {toDelete && deleteStep === 2 && (
          <AlertBanner variant="danger" title="Última confirmación requerida">
            Confirmas que deseas <b>eliminar permanentemente</b> el perfil de <b>{toDelete.name}</b>.
            No podrás recuperar esta cuenta.
          </AlertBanner>
        )}
      </Modal>
    </div>
  )
}
