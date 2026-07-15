import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, IdCard, Eye, EyeOff, Sun, Moon, ArrowLeft } from 'lucide-react'
import AnimatedLogo from '../assets/AnimatedLogo.jsx'
import { LogoFull } from '../assets/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import Button from '../components/ui/Button.jsx'
import { Field, Input } from '../components/ui/Form.jsx'
import { AlertBanner } from '../components/ui/Feedback.jsx'

// Registro público, exclusivo para Aspirantes. El resto de roles
// (financiera, reclutamiento, jurídica, etc.) los sigue creando el
// Administrador desde Admin → Gestión de usuarios.
export default function Register() {
  const { register, isAuthenticated, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', doc: '', email: '', password: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState(false)

  if (isAuthenticated) return <Navigate to={`/aspirante`} replace state={{ from: 'register' }} />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!form.doc.trim()) {
      setError('Ingresa tu número de cédula.')
      return
    }

    setLoading(true)
    try {
      const result = await register({
        name: form.name.trim(),
        doc: form.doc.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      if (result.needsEmailConfirmation) {
        setPendingConfirmation(true)
      } else {
        navigate('/aspirante', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'No se pudo completar el registro.')
    } finally {
      setLoading(false)
    }
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

      <div className="auth-panel">
        <div className="orb violet" style={{ opacity: 0.25 }} />
        <div className="auth-card glass">
          <Link to="/login" className="row gap-1" style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: 10 }}>
            <ArrowLeft size={14} /> Volver a inicio de sesión
          </Link>

          <h2>Regístrate como aspirante</h2>
          <p className="sub">Crea tu cuenta para postularte e iniciar tu proceso de selección.</p>

          {pendingConfirmation ? (
            <AlertBanner variant="success" title="Revisa tu correo">
              Te enviamos un enlace de confirmación a <b>{form.email}</b>. Confírmalo y luego inicia sesión con tu correo y la
              contraseña que elegiste.
            </AlertBanner>
          ) : (
            <form className="col gap-3" onSubmit={submit}>
              <Field label="Nombre completo" required>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
                  <Input required placeholder="Nombres y apellidos" value={form.name} onChange={set('name')} style={{ paddingLeft: 36 }} />
                </div>
              </Field>

              <Field label="Número de cédula" required>
                <div style={{ position: 'relative' }}>
                  <IdCard size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
                  <Input required placeholder="1.022.334.556" value={form.doc} onChange={set('doc')} style={{ paddingLeft: 36 }} />
                </div>
              </Field>

              <Field label="Correo electrónico" required>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
                  <Input
                    type="email"
                    required
                    placeholder="tucorreo@ejemplo.com"
                    value={form.email}
                    onChange={set('email')}
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
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={set('password')}
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

              <Field label="Confirmar contraseña" required>
                <Input
                  type={show ? 'text' : 'password'}
                  required
                  placeholder="Repite tu contraseña"
                  value={form.confirm}
                  onChange={set('confirm')}
                />
              </Field>

              {error && <div className="alert alert--danger" style={{ padding: '10px 12px' }}>{error}</div>}

              <Button type="submit" variant="primary" icon={UserPlus} disabled={loading} className="full">
                {loading ? 'Creando cuenta…' : 'Crear mi cuenta'}
              </Button>

              <p className="sub" style={{ textAlign: 'center', marginTop: 4 }}>
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
