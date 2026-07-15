import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, X } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications.js'

// Aviso flotante que aparece en la esquina cuando llega una notificación
// nueva en vivo (Realtime) — ej. un aspirante sube un documento o se
// registra. Se autocierra a los 8s; si se hace clic, navega a donde
// corresponda revisarlo y marca la notificación como leída.
export default function NotificationToast() {
  const navigate = useNavigate()
  const { toast, dismissToast, markRead } = useNotifications()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(dismissToast, 8000)
    return () => clearTimeout(t)
  }, [toast, dismissToast])

  if (!toast) return null

  const go = () => {
    markRead(toast.id)
    if (toast.link) navigate(toast.link)
    dismissToast()
  }

  return (
    <div className="notif-toast" role="alert">
      <div className="notif-toast-icon" style={{ background: `${toast.color || '#19E3D9'}22`, color: toast.color || '#19E3D9' }}>
        <Bell size={18} />
      </div>
      <div className="notif-toast-body" onClick={go}>
        <div className="notif-toast-title">{toast.title}</div>
        {toast.body && <div className="notif-toast-text">{toast.body}</div>}
      </div>
      <button className="icon-btn" onClick={dismissToast} aria-label="Cerrar">
        <X size={16} />
      </button>
    </div>
  )
}
