import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { Field, Input } from '../ui/Form.jsx'
import { AlertBanner } from '../ui/Feedback.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ChangePasswordModal({ open, onClose }) {
  const { changePassword } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const close = () => {
    setCurrent(''); setNext(''); setConfirm(''); setError(''); setDone(false)
    onClose?.()
  }

  const submit = () => {
    setError('')
    if (next !== confirm) {
      setError('La confirmación no coincide con la nueva contraseña.')
      return
    }
    try {
      changePassword(current, next)
      setDone(true)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Cambiar contraseña"
      width={420}
      footer={
        !done && (
          <>
            <Button variant="ghost" onClick={close}>Cancelar</Button>
            <Button variant="primary" icon={KeyRound} disabled={!current || !next || !confirm} onClick={submit}>
              Cambiar contraseña
            </Button>
          </>
        )
      }
    >
      {done ? (
        <AlertBanner variant="success" title="Contraseña actualizada">
          Tu contraseña fue cambiada correctamente. Úsala en tu próximo ingreso.
        </AlertBanner>
      ) : (
        <div className="col gap-3">
          <Field label="Contraseña actual" required>
            <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </Field>
          <Field label="Nueva contraseña" required>
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
          </Field>
          <Field label="Confirmar nueva contraseña" required>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Field>
          {error && <div className="field-error">{error}</div>}
        </div>
      )}
    </Modal>
  )
}
