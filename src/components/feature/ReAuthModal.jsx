import { useState } from 'react'
import { ShieldCheck, Lock, HelpCircle } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { Field, Input } from '../ui/Form.jsx'
import { AlertBanner } from '../ui/Feedback.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { findUserByCredentials } from '../../data/mockUsers.js'

// Exige reingresar usuario y clave ANTES de estampar una firma (la del
// creador del documento o la de un aprobador en la ruta). Evita que una
// firma quede registrada desde una sesión que no es la de su propio dueño.
// Puede mostrar además una vista previa (`preview`) de cómo quedará el
// documento antes de confirmar.
export default function ReAuthModal({
  open,
  onClose,
  onConfirm,
  actionLabel = 'Confirmar aprobación',
  title = '¿Seguro que quieres firmar?',
  message,
  preview,
}) {
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showForgot, setShowForgot] = useState(false)

  const close = () => {
    setPassword('')
    setError('')
    setShowForgot(false)
    onClose?.()
  }

  const confirm = () => {
    const found = findUserByCredentials(email, password)
    if (!found) {
      setError('Usuario o contraseña incorrectos.')
      return
    }
    if (found.id !== user?.id) {
      setError('Debes confirmar con tu propia cuenta.')
      return
    }
    setPassword('')
    setError('')
    setShowForgot(false)
    onConfirm?.()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      width={480}
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancelar</Button>
          <Button variant="violet" icon={ShieldCheck} disabled={!password} onClick={confirm}>
            {actionLabel}
          </Button>
        </>
      }
    >
      <div className="col gap-3">
        <AlertBanner variant="info">
          <span className="row gap-2">
            <Lock size={14} />
            {message || 'Confirma tu usuario y contraseña para estampar tu firma. Esta acción queda registrada de forma permanente.'}
          </span>
        </AlertBanner>

        {preview && (
          <div>
            <div className="card-sub" style={{ marginBottom: 6 }}>Así quedará el documento</div>
            <div className="glass-soft" style={{ padding: 12, maxHeight: 300, overflow: 'auto' }}>
              {preview}
            </div>
          </div>
        )}

        <Field label="Usuario (correo)" required>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Contraseña" required>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === 'Enter' && confirm()}
          />
        </Field>
        {error && <div className="field-error">{error}</div>}

        <button
          type="button"
          onClick={() => setShowForgot((v) => !v)}
          style={{ background: 'none', border: 0, padding: 0, color: 'var(--violet)', fontSize: '0.8rem', textAlign: 'left', cursor: 'pointer', width: 'fit-content' }}
        >
          <span className="row gap-1"><HelpCircle size={13} /> ¿Olvidaste tu contraseña?</span>
        </button>
        {showForgot && (
          <AlertBanner variant="warning">
            Pide a tu Administrador que la restablezca desde <b>Admin → Gestión de usuarios</b>. Por seguridad,
            ninguna firma se estampa sin confirmar la contraseña vigente.
          </AlertBanner>
        )}
      </div>
    </Modal>
  )
}
