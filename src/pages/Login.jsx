import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { LogIn, Mail, Lock, ShieldCheck, Zap, Layers, Eye, EyeOff } from 'lucide-react'
import AnimatedLogo from '../assets/AnimatedLogo.jsx'
import { LogoFull } from '../assets/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { MOCK_USERS } from '../data/mockUsers.js'
import { ROLE_META, roleHome } from '../utils/roles.js'
import Button from '../components/ui/Button.jsx'
import { Field, Input } from '../components/ui/Form.jsx'

export default function Login() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to={roleHome(user.role)} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const session = await login({ email, password })
      navigate(roleHome(session.role), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const quickFill = (u) => {
    setEmail(u.email)
    setPassword('demo')
    setError('')
  }

  return (
    <div className="auth-wrap">
      {/* Lado izquierdo: marca + logo animado */}
      <div className="auth-hero">
        <div className="grid-bg" />
        <div className="orb teal" />
        <div className="orb violet" />
        <div className="logo-stage">
          <AnimatedLogo />
        </div>
        <div className="auth-hero-content">
          <LogoFull size={40} />
          <h1>
            Gestión de talento, <span className="text-grad">documentos y nómina</span> en una sola plataforma.
          </h1>
          <p>
            Reclutamiento, personal activo, contratistas y aspirantes — con control de acceso por rol,
            trazabilidad documental y analítica ejecutiva en tiempo real.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="ic"><ShieldCheck size={17} /></span>
              Control de acceso por roles (RBAC) y rutas protegidas
            </div>
            <div className="auth-feature">
              <span className="ic"><Layers size={17} /></span>
              Pipeline de reclutamiento, cursos y gestión documental
            </div>
            <div className="auth-feature">
              <span className="ic"><Zap size={17} /></span>
              Listo para Supabase, Vercel e integración con Odoo
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho: formulario */}
      <div className="auth-panel">
        <div className="orb violet" style={{ opacity: 0.25 }} />
        <div className="auth-card glass">
          <h2>Bienvenido de nuevo</h2>
          <p className="sub">Ingresa a tu panel según tu rol asignado.</p>

          <form className="col gap-3" onSubmit={submit}>
            <Field label="Correo electrónico" required>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
                <Input
                  type="email"
                  required
                  placeholder="tucorreo@conexion360.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </Field>

            <Field label="Contraseña" required>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
                <Input
                  type={show ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: 36, paddingRight: 38 }}
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShow((s) => !s)}
                  style={{ position: 'absolute', right: 4, top: 3 }}
                  aria-label="Mostrar contraseña"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {error && <div className="alert alert--danger" style={{ padding: '10px 12px' }}>{error}</div>}

            <Button type="submit" variant="primary" icon={LogIn} disabled={loading} className="full">
              {loading ? 'Ingresando…' : 'Iniciar sesión'}
            </Button>
          </form>

          <details className="demo-accounts" open>
            <summary>Cuentas de demostración (contraseña: <b>demo</b>)</summary>
            <div className="demo-grid">
              {MOCK_USERS.map((u) => (
                <button key={u.id} className="demo-chip" onClick={() => quickFill(u)} type="button">
                  <span className="dot" style={{ background: ROLE_META[u.role].color, color: ROLE_META[u.role].color }} />
                  <span className="grow">{ROLE_META[u.role].label}</span>
                  <span className="dim" style={{ fontSize: '0.72rem' }}>{u.email}</span>
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
