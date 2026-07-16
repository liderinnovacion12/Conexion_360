import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Eye, EyeOff, CheckCircle2, Sun, Moon } from 'lucide-react'
import { LogoFull } from '../assets/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { roleHome } from '../utils/roles.js'
import Button from '../components/ui/Button.jsx'
import { Field, Input } from '../components/ui/Form.jsx'

export default function ResetPassword() {
  const { confirmPasswordReset, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // Si ya hay sesión activa tras el redireccionamiento de Supabase, permitir cambiar
  // Supabase inyecta el token en el hash de la URL (#access_token=…)
  useEffect(() => {
    if (done && user) {
      const t = setTimeout(() => navigate(roleHome(user.role), { replace: true }), 2500)
      return () => clearTimeout(t)
    }
  }, [done, user, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      await confirmPasswordReset(password)
      setDone(true)
    } catch (err) {
      setError(err.message)
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
          <div className="auth-hero-wordmark" style={{ marginTop: 0 }}>
            <LogoFull size={72} stacked />
          </div>
        </div>
      </div>

      <div className="auth-panel">
        <div className="orb violet" style={{ opacity: 0.25 }} />
        <div className="auth-card glass">
          {!done ? (
            <>
              <h2>Nueva contraseña</h2>
              <p className="sub">Elige una contraseña segura para tu cuenta.</p>

              <form className="col gap-3" onSubmit={submit}>
                <Field label="Nueva contraseña" required>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
                    <Input
                      type={show ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingLeft: 36, paddingRight: 38 }}
                      autoFocus
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
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
                    <Input
                      type={show ? 'text' : 'password'}
                      required
                      placeholder="Repite la contraseña"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </Field>

                {error && <div className="alert alert--danger" style={{ padding: '10px 12px' }}>{error}</div>}

                <Button type="submit" variant="primary" icon={KeyRound} disabled={loading} className="full">
                  {loading ? 'Guardando…' : 'Guardar nueva contraseña'}
                </Button>
              </form>
            </>
          ) : (
            <div className="col center gap-3" style={{ padding: '24px 0' }}>
              <CheckCircle2 size={40} style={{ color: '#2ECC71' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>Contraseña actualizada</div>
                <div className="sub" style={{ marginBottom: 12 }}>Tu contraseña fue cambiada exitosamente.</div>
                <button
                  onClick={() => navigate('/login', { replace: true })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.88rem', textDecoration: 'underline' }}
                >
                  Ir al inicio de sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
