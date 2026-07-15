import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff, Sun, Moon } from 'lucide-react'
import AnimatedLogo from '../assets/AnimatedLogo.jsx'
import { LogoFull } from '../assets/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useUsers } from '../hooks/useUsers.js'
import { ROLE_META, roleHome } from '../utils/roles.js'
import Button from '../components/ui/Button.jsx'
import { Field, Input } from '../components/ui/Form.jsx'

export default function Login() {
  const { login, isAuthenticated, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { users } = useUsers()
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
    setPassword('Conexion360')
    setError('')
  }

  return (
    <div className="auth-wrap">
      <button
        className="icon-btn theme-toggle-float"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Lado izquierdo: solo imagen — el logo ensamblándose y el nombre. Sin texto. */}
      <div className="auth-hero auth-hero--visual">
        <div className="orb teal" />
        <div className="orb violet" />
        <div className="auth-hero-visual-stage">
          <span className="auth-hero-ring auth-hero-ring--1" aria-hidden="true" />
          <span className="auth-hero-ring auth-hero-ring--2" aria-hidden="true" />
          <div className="auth-hero-logo-big">
            <AnimatedLogo />
          </div>
          <div className="auth-hero-wordmark">
            <LogoFull size={72} stacked />
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

            <p className="sub" style={{ textAlign: 'center', marginTop: 2 }}>
              ¿Eres aspirante y quieres postularte? <Link to="/registro">Regístrate aquí</Link>
            </p>
          </form>

        </div>
      </div>
    </div>
  )
}
