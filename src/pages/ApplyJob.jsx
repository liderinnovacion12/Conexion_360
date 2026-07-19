import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { User, Mail, Phone, Paperclip, Send, CheckCircle2, Sun, Moon, ArrowLeft } from 'lucide-react'
import { LogoFull } from '../assets/Logo.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useJobApplications } from '../hooks/useJobApplications.js'
import Button from '../components/ui/Button.jsx'
import { Field, Input } from '../components/ui/Form.jsx'

export default function ApplyJob() {
  const [params] = useSearchParams()
  const jobId    = params.get('jobId') || null
  const jobTitle = params.get('title') || 'Vacante'
  const { theme, toggleTheme } = useTheme()
  const { submit } = useJobApplications()

  const [form, setForm]   = useState({ name: '', email: '', phone: '', message: '' })
  const [cvFile, setCvFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone]   = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (f && f.size > 5 * 1024 * 1024) { setError('El archivo no debe superar 5 MB.'); return }
    setCvFile(f || null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim()) { setError('Nombre y correo son obligatorios.'); return }
    setLoading(true)
    try {
      await submit({ jobId, jobTitle, ...form }, cvFile)
      setDone(true)
    } catch (err) {
      setError(err.message || 'No se pudo enviar tu aplicación.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <button
        className="icon-btn theme-toggle-float"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
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
          <Link to="/#empleos" className="row gap-1" style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: 10 }}>
            <ArrowLeft size={14} /> Ver todas las vacantes
          </Link>

          {done ? (
            <div className="col center gap-3" style={{ padding: '24px 0', textAlign: 'center' }}>
              <CheckCircle2 size={42} style={{ color: '#2ECC71' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>¡Aplicación enviada!</div>
                <p className="sub">Tu hoja de vida fue recibida. Si tu perfil es seleccionado, el equipo de reclutamiento te enviará un código para completar tu registro en la plataforma.</p>
              </div>
              <Link to="/" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>← Volver al inicio</Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '1.15rem', marginBottom: 4 }}>Aplicar a vacante</h2>
              <p className="sub" style={{ marginBottom: 18 }}>
                <b style={{ color: 'var(--primary)' }}>{jobTitle}</b> — Completa el formulario y adjunta tu hoja de vida.
              </p>

              <form className="col gap-3" onSubmit={handleSubmit}>
                <Field label="Nombre completo" required>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
                    <Input required placeholder="Nombres y apellidos" value={form.name} onChange={set('name')} style={{ paddingLeft: 36 }} autoFocus />
                  </div>
                </Field>

                <Field label="Correo electrónico" required>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
                    <Input type="email" required placeholder="tucorreo@ejemplo.com" value={form.email} onChange={set('email')} style={{ paddingLeft: 36 }} />
                  </div>
                </Field>

                <Field label="Teléfono / WhatsApp">
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
                    <Input type="tel" placeholder="300 000 0000" value={form.phone} onChange={set('phone')} style={{ paddingLeft: 36 }} />
                  </div>
                </Field>

                <Field label="¿Por qué eres el candidato ideal?">
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Cuéntanos brevemente sobre tu experiencia y motivación…"
                    value={form.message}
                    onChange={set('message')}
                  />
                </Field>

                <Field label="Hoja de vida (PDF, DOC — máx. 5 MB)">
                  <label
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                      border: '1px dashed var(--glass-border)', borderRadius: 8, cursor: 'pointer',
                      background: 'var(--surface)', fontSize: '0.875rem', color: cvFile ? 'var(--primary)' : 'var(--text-soft)',
                    }}
                  >
                    <Paperclip size={15} />
                    {cvFile ? cvFile.name : 'Adjuntar hoja de vida'}
                    <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFile} />
                  </label>
                </Field>

                {error && <div className="alert alert--danger" style={{ padding: '10px 12px' }}>{error}</div>}

                <Button type="submit" variant="primary" icon={Send} disabled={loading} className="full">
                  {loading ? 'Enviando…' : 'Enviar aplicación'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
