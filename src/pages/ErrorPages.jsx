import { useNavigate } from 'react-router-dom'
import { ShieldX, Compass } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { roleHome } from '../utils/roles.js'
import Button from '../components/ui/Button.jsx'
import { LogoMark } from '../assets/Logo.jsx'

function Shell({ code, icon: Icon, title, message }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  return (
    <div className="error-page">
      <div className="col center gap-3 anim-up" style={{ maxWidth: 460 }}>
        <LogoMark size={48} />
        <div className="error-code text-grad">{code}</div>
        <Icon size={30} style={{ color: 'var(--text-dim)' }} />
        <h2 className="h2">{title}</h2>
        <p className="muted">{message}</p>
        <div className="row gap-2">
          <Button variant="primary" onClick={() => navigate(user ? roleHome(user.role) : '/login')}>
            {user ? 'Volver a mi panel' : 'Ir al inicio de sesión'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Forbidden() {
  return (
    <Shell
      code="403"
      icon={ShieldX}
      title="Acceso no autorizado"
      message="Tu rol no tiene permisos para ver esta sección. Si crees que es un error, contacta al administrador."
    />
  )
}

export function NotFound() {
  return (
    <Shell
      code="404"
      icon={Compass}
      title="Página no encontrada"
      message="La ruta que buscas no existe o fue movida. Verifica la dirección e inténtalo de nuevo."
    />
  )
}
