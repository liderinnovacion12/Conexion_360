import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, IdCard, Eye, EyeOff, Sun, Moon, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react'
import AnimatedLogo from '../assets/AnimatedLogo.jsx'
import { LogoFull } from '../assets/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { validateRegistrationCode, markCodeUsed } from '../hooks/useJobApplications.js'
import Button from '../components/ui/Button.jsx'
import { Field, Input } from '../components/ui/Form.jsx'
import { AlertBanner } from '../components/ui/Feedback.jsx'

// Registro público para aspirantes.
// Requiere un código de registro generado por el reclutador al aprobar la aplicación.
export default function Register() {
  const { register, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Paso 1: validar código
  const [code, setCode]           = useState('')
  const [codeValid, setCodeValid] = useState(false)
  const [application, setApplication] = useState(null)
  const [codeLoading, setCodeLoading] = useState(false)
  const [codeError, setCodeError]     = useState('')

  // Paso 2: crear cuenta
  const [form, setForm] = useState({ name: '', doc: '', email: '', password: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [pendingConfirmation, setPendingConfirmation] = useState(false)

  if (isAuthenticated) return <Navigate to="/aspirante" replace />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // ── Paso 1: validar código ──────────────────────────────────────────────────
  const validateCode = async (e) => {
    e.preventDefault()
    setCodeError('')
    if (!code.trim()) { setCodeError('Ingresa el código que te dio el reclutador.'); return }
    setCodeLoading(true)
    try {
      const result = await validateRegistrationCode(code.trim())
      if (result.valid) {
        setCodeValid(true)
        setApplication(result.application)
        // Pre-llenar nombre y email si vienen de la aplicación
        setForm((f) => ({
          ...f,
          name:  result.application?.name  || f.name,
          email: result.application?.email || f.email,
        }))
      } else {
        setCodeError('Código inválido o ya utilizado. Verifica con tu reclutador.')
      }
    } catch {
      setCodeError('No se pudo validar el código. Intenta de nuevo.')
    } finally {
      setCodeLoading(false)
    }
  }

  // ── Paso 2: crear cuenta ────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden.'); return }
    if (!form.doc.trim()) { setError('Ingresa tu número de cédula.'); return }

    setLoading(true)
    try {
      const result = await register({
        name:     form.name.trim(),
        doc:      form.doc.trim(),
        email:    form.email.trim(),
        password: form.password,
      })
      // Marcar el código como usado
      await markCodeUsed(code.trim())

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

          {pendingConfirmation ? (
            <>
              <div className="col center gap-3" style={{ padding: '20px 0', textAlign: 'center' }}>
                <CheckCircle2 size={40} style={{ color: '#2ECC71' }} />
              </div>
              <AlertBanner variant="success" title="Revisa tu correo">
                Te enviamos un enlace de confirmación a <b>{form.email}</b>. Confírmalo y luego inicia sesión.
              </AlertBanner>
            </>
          ) : !codeValid ? (
            /* ── Paso 1: ingresar código ── */
            <form className="col gap-3" onSubmit={validateCode}>
              <p className="sub">
                Para registrarte necesitas un <b>código de acceso</b> que el reclutador te entrega tras revisar tu hoja de vida.
                ¿Aún no tienes código?{' '}
                <Link to="/#empleos">Aplica a una vacante</Link>.
              </p>

              <Field label="Código de acceso" required>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
                  <Input
                    required
                    placeholder="Ej: ABC12345"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    style={{ paddingLeft: 36, fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 700 }}
                    autoFocus
                    maxLength={8}
                  />
                </div>
              </Field>

              {codeError && <div className="alert alert--danger" style={{ padding: '10px 12px' }}>{codeError}</div>}

              <Button type="submit" variant="primary" icon={KeyRound} disabled={codeLoading} className="full">
                {codeLoading ? 'Validando…' : 'Validar código'}
              </Button>
            </form>
          ) : (
            /* ── Paso 2: crear cuenta ── */
            <form className="col gap-3" onSubmit={submit}>
              {application && (
                <div className="alert alert--success" style={{ padding: '10px 12px', marginBottom: 4 }}>
                  ✓ Código válido — aplicación para <b>{application.jobTitle}</b> aprobada.
                </div>
              )}

              <p className="sub">Completa tus datos para crear tu cuenta en la plataforma.</p>

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
                    type="email" required placeholder="tucorreo@ejemplo.com"
                    value={form.email} onChange={set('email')} style={{ paddingLeft: 36 }}
                  />
                </div>
              </Field>

              <Field label="Contraseña" required>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
                  <Input
                    type={show ? 'text' : 'password'} required placeholder="Mínimo 6 caracteres"
                    value={form.password} onChange={set('password')} style={{ paddingLeft: 36, paddingRight: 38 }}
                  />
                  <button type="button" className="icon-btn" onClick={() => setShow((s) => !s)}
                    style={{ position: 'absolute', right: 4, top: 3 }} aria-label="Mostrar contraseña">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <Field label="Confirmar contraseña" required>
                <Input
                  type={show ? 'text' : 'password'} required placeholder="Repite tu contraseña"
                  value={form.confirm} onChange={set('confirm')}
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
