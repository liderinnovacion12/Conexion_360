import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon, MapPin, Clock, Users, ArrowRight } from 'lucide-react'
import { LogoMark } from '../assets/Logo.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useJobPostings } from '../hooks/useJobPostings.js'
import './LandingPage.css'

function NavLogo() {
  return (
    <Link className="lp-nav-logo" to="/">
      <LogoMark size={34} />
      <div className="lp-logo-wordmark">
        <div className="lp-logo-name">CONEXIÓN <span className="lp-grad">360</span></div>
        <div className="lp-logo-sub">Todo Ágil CTA</div>
      </div>
    </Link>
  )
}

function FooterLogo() {
  return (
    <Link className="lp-nav-logo" to="/" style={{ display: 'inline-flex', marginBottom: 4 }}>
      <LogoMark size={28} />
      <div className="lp-logo-wordmark">
        <div className="lp-logo-name" style={{ fontSize: 13 }}>CONEXIÓN <span className="lp-grad">360</span></div>
        <div className="lp-logo-sub">Todo Ágil CTA</div>
      </div>
    </Link>
  )
}

/* ── Sección de empleos públicos ── */
const CONTRACT_LABELS = {
  servicios: 'Prestación de servicios',
  termino_fijo: 'Término fijo',
  termino_indefinido: 'Término indefinido',
  obra_labor: 'Obra o labor',
  aprendizaje: 'Aprendizaje',
}
const MODALITY_LABELS = { presencial: 'Presencial', remoto: 'Remoto', hibrido: 'Híbrido' }

function JobsSection() {
  const { postings, loading } = useJobPostings()
  const active = postings.filter((p) => p.status === 'activa')

  return (
    <section className="lp-section lp-section-surface" id="empleos">
      <div className="lp-section-center lp-reveal" style={{ marginBottom: 44 }}>
        <div className="lp-section-eyebrow">Empleos</div>
        <h2 className="lp-section-title">Vacantes abiertas</h2>
        <p className="lp-section-sub">
          Explora las oportunidades disponibles y postúlate directamente desde la plataforma.
        </p>
      </div>

      {loading && <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Cargando vacantes…</div>}

      {!loading && active.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 20px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.4 }}>💼</div>
          <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--lp-text)' }}>No hay vacantes abiertas en este momento</div>
          <div style={{ fontSize: '0.875rem' }}>Vuelve pronto o crea tu cuenta para que te notifiquemos cuando haya nuevas oportunidades.</div>
        </div>
      )}

      <div className="lp-services-grid lp-reveal" style={{ maxWidth: 1060, margin: '0 auto' }}>
        {active.map((job) => (
          <div key={job.id} className="lp-service-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--lp-text)' }}>{job.title}</div>
            {job.area && <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{job.area}</div>}

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {job.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--muted)' }}>
                  <MapPin size={12} />{job.location}
                </span>
              )}
              {job.modality && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--muted)' }}>
                  <Clock size={12} />{MODALITY_LABELS[job.modality] || job.modality}
                </span>
              )}
              {job.vacancies > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--muted)' }}>
                  <Users size={12} />{job.vacancies} {job.vacancies === 1 ? 'cupo' : 'cupos'}
                </span>
              )}
            </div>

            {job.contractType && (
              <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px', borderRadius: 100, background: 'rgba(25,227,217,0.1)', color: 'var(--teal)', alignSelf: 'flex-start' }}>
                {CONTRACT_LABELS[job.contractType] || job.contractType}
              </span>
            )}

            {job.description && (
              <p style={{ fontSize: '0.84rem', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>
                {job.description.length > 110 ? job.description.slice(0, 110) + '…' : job.description}
              </p>
            )}

            {job.salary && (
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--teal)' }}>{job.salary}</div>
            )}

            <Link
              to="/registro"
              style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', fontWeight: 600, color: 'var(--teal)', textDecoration: 'none', paddingTop: 8, borderTop: '1px solid var(--border)' }}
            >
              Postularme <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 36 }}>
        <Link to="/registro" className="lp-btn lp-btn-primary lp-btn-lg">
          Registrarme y postularme
        </Link>
      </div>
    </section>
  )
}

/* ── Slides del carrusel: mockups estilizados de cada módulo ── */
const SLIDES = [
  {
    label: 'Panel ejecutivo',
    color: '#19E3D9',
    content: (
      <div className="lp-slide-inner">
        <div className="lp-slide-header">
          <span className="lp-slide-title">Panel ejecutivo</span>
          <span className="lp-slide-badge" style={{ background: 'rgba(25,227,217,0.15)', color: '#19E3D9' }}>Admin</span>
        </div>
        <div className="lp-kpi-grid">
          {[
            { l: 'Aspirantes activos', v: '48', c: '#19E3D9' },
            { l: 'Contratos firmados', v: '17', c: '#9B5DE5' },
            { l: 'Docs aprobados', v: '134', c: '#2EE6A6' },
            { l: 'Personal activo', v: '93', c: '#FFC857' },
          ].map((k) => (
            <div key={k.l} className="lp-kpi-card">
              <div className="lp-kpi-label">{k.l}</div>
              <div className="lp-kpi-val" style={{ color: k.c }}>{k.v}</div>
              <div className="lp-kpi-bar" style={{ background: k.c }} />
            </div>
          ))}
        </div>
        <div className="lp-mini-chart">
          {[40, 65, 50, 80, 60, 90, 75, 95, 70, 85].map((h, i) => (
            <div key={i} className="lp-bar-col" style={{ height: h + '%', background: i === 9 ? '#19E3D9' : 'rgba(25,227,217,0.25)' }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    label: 'Pipeline de selección',
    color: '#9B5DE5',
    content: (
      <div className="lp-slide-inner">
        <div className="lp-slide-header">
          <span className="lp-slide-title">Pipeline de selección</span>
          <span className="lp-slide-badge" style={{ background: 'rgba(155,93,229,0.15)', color: '#9B5DE5' }}>Reclutamiento</span>
        </div>
        <div className="lp-pipeline-grid">
          {[
            { col: 'Aplicados', items: [{ n: 'Camila R.', t: 'Funcionaria', c: '#9B5DE5' }, { n: 'Diego M.', t: 'Contratista', c: '#19E3D9' }] },
            { col: 'En revisión', items: [{ n: 'Laura P.', t: 'Funcionaria', c: '#9B5DE5' }, { n: 'Andrés T.', t: 'Contratista', c: '#19E3D9' }] },
            { col: 'Apto', items: [{ n: 'Sofía V.', t: '✓ Apto', c: '#2EE6A6' }] },
            { col: 'Contratado', items: [{ n: 'Jorge B.', t: 'Firmado', c: '#2EE6A6' }, { n: 'Natalia C.', t: 'Firmado', c: '#2EE6A6' }] },
          ].map((col) => (
            <div key={col.col} className="lp-pl-col">
              <div className="lp-pl-col-head">{col.col}</div>
              {col.items.map((it) => (
                <div key={it.n} className="lp-pl-item">
                  <div className="lp-pl-name">{it.n}</div>
                  <span className="lp-pl-tag" style={{ color: it.c, background: it.c + '22' }}>{it.t}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: 'Revisión de documentos',
    color: '#2EE6A6',
    content: (
      <div className="lp-slide-inner">
        <div className="lp-slide-header">
          <span className="lp-slide-title">Revisión de documentos</span>
          <span className="lp-slide-badge" style={{ background: 'rgba(46,230,166,0.15)', color: '#2EE6A6' }}>Jurídica</span>
        </div>
        <div className="lp-doc-list">
          {[
            { doc: 'Cédula de ciudadanía', person: 'Camila Rodríguez', status: 'Aprobado', c: '#2EE6A6' },
            { doc: 'Tarjeta profesional', person: 'Diego Martínez', status: 'En revisión', c: '#FFC857' },
            { doc: 'Antecedentes judiciales', person: 'Laura Pérez', status: 'Aprobado', c: '#2EE6A6' },
            { doc: 'Diploma universitario', person: 'Andrés Torres', status: 'Pendiente', c: '#FF5D73' },
            { doc: 'Hoja de vida', person: 'Sofía Vargas', status: 'Aprobado', c: '#2EE6A6' },
          ].map((d) => (
            <div key={d.doc} className="lp-doc-row">
              <div className="lp-doc-icon">📄</div>
              <div className="lp-doc-info">
                <div className="lp-doc-name">{d.doc}</div>
                <div className="lp-doc-person">{d.person}</div>
              </div>
              <span className="lp-doc-status" style={{ color: d.c, background: d.c + '18' }}>{d.status}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: 'Contratos digitales',
    color: '#FFC857',
    content: (
      <div className="lp-slide-inner">
        <div className="lp-slide-header">
          <span className="lp-slide-title">Contratos digitales</span>
          <span className="lp-slide-badge" style={{ background: 'rgba(255,200,87,0.15)', color: '#FFC857' }}>Jurídica · Admin</span>
        </div>
        <div className="lp-contract-card">
          <div className="lp-contract-title">Contrato de Prestación de Servicios</div>
          <div className="lp-contract-meta">Sofía Vargas · Vigencia: 01/08/2026 – 31/12/2026</div>
          <div className="lp-contract-lines">
            {[90, 80, 95, 60, 75].map((w, i) => (
              <div key={i} className="lp-contract-line" style={{ width: w + '%' }} />
            ))}
          </div>
          <div className="lp-signatures">
            <div className="lp-sig lp-sig-done">
              <div className="lp-sig-icon">✍️</div>
              <div className="lp-sig-label">Contratado</div>
              <div className="lp-sig-status" style={{ color: '#2EE6A6' }}>Firmado</div>
            </div>
            <div className="lp-sig-line" />
            <div className="lp-sig lp-sig-done">
              <div className="lp-sig-icon">🏢</div>
              <div className="lp-sig-label">Admin</div>
              <div className="lp-sig-status" style={{ color: '#2EE6A6' }}>Firmado</div>
            </div>
            <div className="lp-sig-line" />
            <div className="lp-sig">
              <div className="lp-sig-icon">⚖️</div>
              <div className="lp-sig-label">Jurídica</div>
              <div className="lp-sig-status" style={{ color: '#FFC857' }}>Pendiente</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: 'Gestión de usuarios',
    color: '#FF5D73',
    content: (
      <div className="lp-slide-inner">
        <div className="lp-slide-header">
          <span className="lp-slide-title">Gestión de usuarios</span>
          <span className="lp-slide-badge" style={{ background: 'rgba(255,93,115,0.15)', color: '#FF5D73' }}>Admin</span>
        </div>
        <div className="lp-user-table">
          <div className="lp-user-row lp-user-head">
            <span>Nombre</span><span>Rol</span><span>Estado</span>
          </div>
          {[
            { name: 'María González', role: 'Reclutadora', status: 'Activo', rc: '#2EE6A6', rk: '#9B5DE5' },
            { name: 'Carlos López', role: 'Jurídica', status: 'Activo', rc: '#2EE6A6', rk: '#FFC857' },
            { name: 'Ana Martínez', role: 'Finanzas', status: 'Activo', rc: '#2EE6A6', rk: '#19E3D9' },
            { name: 'Pedro Sánchez', role: 'Personal', status: 'Inactivo', rc: '#FF5D73', rk: '#FF5D73' },
          ].map((u) => (
            <div key={u.name} className="lp-user-row">
              <span className="lp-user-name">{u.name}</span>
              <span className="lp-user-role" style={{ color: u.rk, background: u.rk + '18' }}>{u.role}</span>
              <span className="lp-user-status" style={{ color: u.rc }}>{u.status}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

function AppCarousel() {
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)

  const go = (idx) => {
    setActive((idx + SLIDES.length) % SLIDES.length)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 4500)
    return () => clearInterval(timerRef.current)
  }, [])

  const resetTimer = (idx) => {
    clearInterval(timerRef.current)
    go(idx)
    timerRef.current = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 4500)
  }

  return (
    <div className="lp-carousel">
      {/* Browser chrome */}
      <div className="lp-carousel-chrome">
        <div className="lp-carousel-topbar">
          <div className="lp-carousel-dots-mac">
            <span style={{ background: '#FF5D73' }} />
            <span style={{ background: '#FFC857' }} />
            <span style={{ background: '#2EE6A6' }} />
          </div>
          <div className="lp-carousel-urlbar">conexion360.app / {SLIDES[active].label.toLowerCase().replace(/ /g, '-')}</div>
          <div style={{ width: 60 }} />
        </div>

        {/* Slides */}
        <div className="lp-carousel-track">
          {SLIDES.map((s, i) => (
            <div
              key={i}
              className={`lp-carousel-slide${i === active ? ' active' : ''}`}
              aria-hidden={i !== active}
            >
              {s.content}
            </div>
          ))}
        </div>

        {/* Glow accent per slide */}
        <div
          className="lp-carousel-glow"
          style={{ background: SLIDES[active].color }}
        />
      </div>

      {/* Controls */}
      <div className="lp-carousel-controls">
        <button className="lp-carousel-arrow" onClick={() => resetTimer(active - 1)} aria-label="Anterior">‹</button>
        <div className="lp-carousel-indicators">
          {SLIDES.map((s, i) => (
            <button
              key={i}
              className={`lp-carousel-dot${i === active ? ' active' : ''}`}
              onClick={() => resetTimer(i)}
              aria-label={s.label}
              title={s.label}
              style={i === active ? { background: SLIDES[active].color, width: 24 } : {}}
            />
          ))}
        </div>
        <button className="lp-carousel-arrow" onClick={() => resetTimer(active + 1)} aria-label="Siguiente">›</button>
      </div>

      <div className="lp-carousel-label">{SLIDES[active].label}</div>
    </div>
  )
}

export default function LandingPage() {
  const navRef = useRef(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => {
      if (navRef.current) navRef.current.classList.toggle('scrolled', window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const reveals = document.querySelectorAll('.lp-reveal')
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    )
    reveals.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="lp-wrap">
      {/* NAV */}
      <nav className="lp-nav" ref={navRef}>
        <NavLogo />
        <ul className="lp-nav-links">
          <li><a href="#servicios">Servicios</a></li>
          <li><a href="#como-funciona">Cómo funciona</a></li>
          <li><a href="#empleos">Empleos</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
        <div className="lp-nav-ctas">
          <Link className="lp-btn lp-btn-ghost" to="/login">Iniciar sesión</Link>
          <Link className="lp-btn lp-btn-primary" to="/registro">Registrarse</Link>
          <button
            className="lp-theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-orb lp-orb-teal" />
        <div className="lp-orb lp-orb-violet" />
        <div className="lp-orb lp-orb-green" />
        <div className="lp-hero-bg-text" aria-hidden="true">360°</div>

        {/* Logo prominente */}
        <div className="lp-hero-logo-wrap lp-reveal">
          <div className="lp-hero-logo-glow" />
          <LogoMark size={96} />
        </div>

        <div className="lp-eyebrow">
          <span className="lp-eyebrow-dot" />
          Plataforma de gestión de talento humano
        </div>

        <h1>
          La plataforma que<br />
          <span className="lp-accent-teal">conecta</span> todo tu<br />
          <span className="lp-accent-violet">talento</span>
        </h1>

        <p className="lp-hero-sub">
          Desde la selección hasta la administración de personal. Automatiza, contrata y gestiona a tu equipo con cumplimiento normativo, todo en un solo lugar.
        </p>

        <div className="lp-hero-ctas">
          <Link className="lp-btn lp-btn-primary lp-btn-lg" to="/login">Iniciar sesión</Link>
          <Link className="lp-btn lp-btn-outline lp-btn-lg" to="/registro">Registrarse</Link>
        </div>

        {/* Carrusel de pantallas */}
        <div className="lp-hero-visual lp-reveal">
          <AppCarousel />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-section lp-section-surface" id="como-funciona">
        <div className="lp-how-header lp-reveal">
          <div className="lp-section-eyebrow">Cómo funciona</div>
          <h2 className="lp-section-title" style={{ textAlign: 'center', maxWidth: 520 }}>
            De la selección a la administración, sin fricciones
          </h2>
          <p className="lp-section-sub" style={{ textAlign: 'center' }}>
            Un flujo continuo que elimina la carga operativa y te permite enfocarte en tu negocio.
          </p>
        </div>
        <div className="lp-steps lp-reveal">
          {[
            { num: 'Atrae', icon: '🎯', bg: 'rgba(25,227,217,0.12)', title: 'Publica y atrae talento', desc: 'Difunde tus vacantes, recibe postulaciones y organiza candidatos por grupos y perfiles.' },
            { num: 'Selecciona', icon: '📋', bg: 'rgba(155,93,229,0.12)', title: 'Revisa y decide', desc: 'Pipeline visual, revisión documental con flujo de aprobaciones y trazabilidad completa.' },
            { num: 'Contrata', icon: '✍️', bg: 'rgba(46,230,166,0.12)', title: 'Firma contratos digitales', desc: 'Emisión y cadena jurídica de firmas. El contratado firma primero, luego Admin y Jurídica.' },
            { num: 'Administra', icon: '🏢', bg: 'rgba(255,200,87,0.12)', title: 'Gestiona tu personal', desc: 'Nómina, certificados, permisos laborales, SST y cumplimiento normativo en un solo panel.' },
          ].map((s, i, arr) => (
            <div key={s.num} className="lp-step">
              <div className="lp-step-num">{s.num}</div>
              <div className="lp-step-icon" style={{ background: s.bg }}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < arr.length - 1 && <div className="lp-step-arrow">›</div>}
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="lp-section" id="servicios">
        <div className="lp-section-center lp-reveal">
          <div className="lp-section-eyebrow">Nuestros servicios</div>
          <h2 className="lp-section-title">Todo lo que necesitas para administrar tu capital humano</h2>
          <p className="lp-section-sub">Soluciones que reducen la carga operativa, minimizan riesgos legales y aumentan la productividad.</p>
        </div>
        <div className="lp-services-grid lp-reveal">
          {[
            { icon: '👥', bg: 'rgba(25,227,217,0.1)', title: 'Administración de personal', desc: 'Externalizamos la gestión de RRHH para reducir costos, minimizar riesgos y aumentar la flexibilidad de tu operación.' },
            { icon: '🔍', bg: 'rgba(155,93,229,0.1)', title: 'Outsourcing de selección', desc: 'Acompañamos todo el proceso: desde el perfilamiento hasta la evaluación, verificación y contratación.' },
            { icon: '📄', bg: 'rgba(46,230,166,0.1)', title: 'Contratos y firma digital', desc: 'Emisión y firma digital con cadena de aprobación jurídica, segura y con trazabilidad completa.' },
            { icon: '🔄', bg: 'rgba(255,200,87,0.1)', title: 'Contratación por turnos', desc: 'Gestiona turnos, asegura operatividad continua y distribuye equitativamente la carga laboral.' },
            { icon: '⚖️', bg: 'rgba(255,93,115,0.1)', title: 'Asesoría jurídico-laboral', desc: 'Consultoría en procesos disciplinarios, novedades laborales y cumplimiento normativo colombiano.' },
            { icon: '🦺', bg: 'rgba(25,227,217,0.07)', title: 'Sistema de Gestión SST', desc: 'Diseño, implementación y verificación del SG-SST para prevenir riesgos y promover el bienestar.' },
          ].map((s) => (
            <div key={s.title} className="lp-service-card">
              <div className="lp-service-icon" style={{ background: s.bg }}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EMPLEOS */}
      <JobsSection />

      {/* WHY 360 */}
      <section className="lp-section lp-section-surface" id="por-que">
        <div className="lp-section-center lp-reveal">
          <div className="lp-section-eyebrow">Por qué Conexión 360</div>
          <h2 className="lp-section-title" style={{ textAlign: 'center' }}>Una sola plataforma, visibilidad total</h2>
          <p className="lp-section-sub" style={{ textAlign: 'center' }}>Diseñada desde el inicio para el mercado colombiano y sus exigencias normativas.</p>
        </div>
        <div className="lp-why-grid lp-reveal">
          {[
            { icon: '🔒', title: 'Cumplimiento normativo garantizado', desc: 'Cada proceso cumple la legislación laboral colombiana. Cadena de firmas jurídica, SST integrado y auditoría completa de cada movimiento.' },
            { icon: '⚡', title: 'Automatización inteligente', desc: 'Flujos automáticos de aprobación y un pipeline visual que elimina el caos del correo y las hojas de cálculo.' },
            { icon: '🇨🇴', title: 'Hecho para Colombia', desc: 'Idioma, normativa y cultura laboral colombiana. Soporte humano en español, sin bots, sin barreras.' },
          ].map((w) => (
            <div key={w.title} className="lp-why-card">
              <div className="lp-why-icon">{w.icon}</div>
              <h4>{w.title}</h4>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DUAL CTA */}
      <section className="lp-section" id="contacto">
        <div className="lp-section-center lp-reveal" style={{ marginBottom: 44 }}>
          <div className="lp-section-eyebrow">Empieza hoy</div>
          <h2 className="lp-section-title">¿Ya tienes cuenta o eres nuevo?</h2>
          <p className="lp-section-sub">Accede a tu panel o crea tu cuenta en menos de un minuto.</p>
        </div>
        <div className="lp-dual-cta lp-reveal">
          <div className="lp-cta-card lp-cta-teal">
            <div className="lp-cta-eyebrow" style={{ color: 'var(--teal)' }}>¿Ya tienes cuenta?</div>
            <h3>Ingresa a tu panel</h3>
            <p>Accede a tu documentación, certificados, nómina, permisos y firma de contratos desde cualquier dispositivo.</p>
            <div><Link className="lp-btn lp-btn-primary lp-btn-lg" to="/login">Iniciar sesión</Link></div>
            <div className="lp-cta-bg">🔑</div>
          </div>
          <div className="lp-cta-card lp-cta-violet">
            <div className="lp-cta-eyebrow" style={{ color: 'var(--violet)' }}>¿Eres aspirante nuevo?</div>
            <h3>Crea tu cuenta</h3>
            <p>Regístrate, carga tus documentos y sigue tu proceso de selección en tiempo real desde un solo lugar.</p>
            <div><Link className="lp-btn lp-btn-violet lp-btn-lg" to="/registro">Registrarse</Link></div>
            <div className="lp-cta-bg">✍️</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">
            <FooterLogo />
            <p>Plataforma integral de gestión de talento humano para empresas colombianas. Cumplimiento normativo, automatización y soporte en español.</p>
          </div>
          <div className="lp-footer-col">
            <h4>Plataforma</h4>
            <ul>
              <li><a href="#como-funciona">Reclutamiento</a></li>
              <li><a href="#servicios">Contratos digitales</a></li>
              <li><a href="#servicios">Gestión de personal</a></li>
              <li><a href="#servicios">Nómina y finanzas</a></li>
            </ul>
          </div>
          <div className="lp-footer-col">
            <h4>Servicios</h4>
            <ul>
              <li><a href="#servicios">Outsourcing de selección</a></li>
              <li><a href="#servicios">Administración de personal</a></li>
              <li><a href="#servicios">Asesoría jurídica</a></li>
              <li><a href="#servicios">Sistema SST</a></li>
            </ul>
          </div>
          <div className="lp-footer-col">
            <h4>Acceso</h4>
            <ul>
              <li><Link to="/login">Iniciar sesión</Link></li>
              <li><Link to="/registro">Registrarse</Link></li>
            </ul>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <div className="lp-footer-copy">© 2026 Conexión 360. Todos los derechos reservados. Hecho en Colombia 🇨🇴</div>
          <div className="lp-footer-legal">
            <a href="#">Política de privacidad</a>
            <a href="#">Términos de uso</a>
            <a href="#">Tratamiento de datos</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
