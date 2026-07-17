import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { LogoMark } from '../assets/Logo.jsx'
import './LandingPage.css'

function NavLogo() {
  return (
    <Link className="lp-nav-logo" to="/">
      <LogoMark size={34} />
      <div className="lp-logo-wordmark">
        <div className="lp-logo-name">CONEXIÓN <span className="grad">360</span></div>
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
        <div className="lp-logo-name" style={{ fontSize: 13 }}>CONEXIÓN <span className="grad">360</span></div>
        <div className="lp-logo-sub">Todo Ágil CTA</div>
      </div>
    </Link>
  )
}

export default function LandingPage() {
  const navRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', window.scrollY > 40)
      }
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
          <li><a href="#contacto">Contacto</a></li>
        </ul>
        <div className="lp-nav-ctas">
          <Link className="lp-btn lp-btn-ghost" to="/login">Iniciar sesión</Link>
          <Link className="lp-btn lp-btn-primary" to="/registro">Registrarse</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-orb lp-orb-teal" />
        <div className="lp-orb lp-orb-violet" />
        <div className="lp-hero-bg-text" aria-hidden="true">360°</div>

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

        <div className="lp-hero-trust">
          <div className="lp-trust-item"><span style={{ color: 'var(--teal)' }}>✓</span> Sin contratos de permanencia</div>
          <div className="lp-trust-sep" />
          <div className="lp-trust-item"><span style={{ color: 'var(--teal)' }}>✓</span> Cumplimiento normativo colombiano</div>
          <div className="lp-trust-sep" />
          <div className="lp-trust-item"><span style={{ color: 'var(--teal)' }}>✓</span> Soporte en español</div>
        </div>

        {/* Mockup */}
        <div className="lp-hero-visual lp-reveal">
          <div className="lp-demo-screen">
            <div className="lp-demo-topbar">
              <div className="lp-demo-dot" style={{ background: '#FF5D73' }} />
              <div className="lp-demo-dot" style={{ background: '#FFC857' }} />
              <div className="lp-demo-dot" style={{ background: '#2EE6A6' }} />
              <div className="lp-demo-title-bar" />
              <span style={{ fontSize: '10.5px', color: 'var(--dim)', fontWeight: 600 }}>Panel ejecutivo — Conexión 360</span>
            </div>
            <div className="lp-demo-grid">
              {[
                { label: 'Aspirantes activos', val: '48', sub: '↑ 12 este mes', color: 'var(--teal)', w: '72%', grad: 'linear-gradient(90deg,var(--teal),rgba(25,227,217,0.15))' },
                { label: 'Contratos firmados', val: '17', sub: '↑ 5 este mes', color: 'var(--violet)', w: '55%', grad: 'linear-gradient(90deg,var(--violet),rgba(155,93,229,0.15))' },
                { label: 'Docs aprobados', val: '134', sub: '↑ 28 este mes', color: 'var(--green)', w: '88%', grad: 'linear-gradient(90deg,var(--green),rgba(46,230,166,0.15))' },
                { label: 'Personal en nómina', val: '93', sub: '3 nuevos', color: 'var(--amber)', w: '60%', grad: 'linear-gradient(90deg,var(--amber),rgba(255,200,87,0.15))' },
              ].map((c) => (
                <div key={c.label} className="lp-demo-card">
                  <div className="lp-demo-card-label">{c.label}</div>
                  <div className="lp-demo-card-val" style={{ color: c.color }}>{c.val}</div>
                  <div className="lp-demo-card-sub">{c.sub}</div>
                  <div className="lp-demo-bar" style={{ background: c.grad, width: c.w }} />
                </div>
              ))}
            </div>
            <div className="lp-demo-pipeline">
              <div className="lp-pipe-col">
                <div className="lp-pipe-col-head">Aplicados</div>
                <div className="lp-pipe-item"><div className="lp-pipe-item-name">Camila R.</div><div className="lp-pipe-item-tag"><span className="lp-badge lp-badge-violet">Funcionaria</span></div></div>
                <div className="lp-pipe-item"><div className="lp-pipe-item-name">Diego M.</div><div className="lp-pipe-item-tag"><span className="lp-badge lp-badge-teal">Contratista</span></div></div>
              </div>
              <div className="lp-pipe-col">
                <div className="lp-pipe-col-head">En revisión</div>
                <div className="lp-pipe-item"><div className="lp-pipe-item-name">Laura P.</div><div className="lp-pipe-item-tag"><span className="lp-badge lp-badge-violet">Funcionaria</span></div></div>
                <div className="lp-pipe-item"><div className="lp-pipe-item-name">Andrés T.</div><div className="lp-pipe-item-tag"><span className="lp-badge lp-badge-teal">Contratista</span></div></div>
              </div>
              <div className="lp-pipe-col">
                <div className="lp-pipe-col-head">Apto a contratación</div>
                <div className="lp-pipe-item"><div className="lp-pipe-item-name">Sofía V.</div><div className="lp-pipe-item-tag"><span className="lp-badge lp-badge-green">✓ Apto</span></div></div>
              </div>
              <div className="lp-pipe-col">
                <div className="lp-pipe-col-head">Contratados</div>
                <div className="lp-pipe-item"><div className="lp-pipe-item-name">Jorge B.</div><div className="lp-pipe-item-tag"><span className="lp-badge lp-badge-green">Firmado</span></div></div>
                <div className="lp-pipe-item"><div className="lp-pipe-item-name">Natalia C.</div><div className="lp-pipe-item-tag"><span className="lp-badge lp-badge-green">Firmado</span></div></div>
              </div>
            </div>
          </div>
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
            { num: 'Atrae', icon: '🎯', bg: 'rgba(25,227,217,0.1)', title: 'Publica y atrae talento', desc: 'Difunde tus vacantes, recibe postulaciones y organiza candidatos por grupos y perfiles.' },
            { num: 'Selecciona', icon: '📋', bg: 'rgba(155,93,229,0.1)', title: 'Revisa y decide', desc: 'Pipeline visual, revisión documental con flujo de aprobaciones y trazabilidad completa.' },
            { num: 'Contrata', icon: '✍️', bg: 'rgba(46,230,166,0.1)', title: 'Firma contratos digitales', desc: 'Emisión y cadena jurídica de firmas. El contratado firma primero, luego Admin y Jurídica.' },
            { num: 'Administra', icon: '🏢', bg: 'rgba(255,200,87,0.1)', title: 'Gestiona tu personal', desc: 'Nómina, certificados, permisos laborales, SST y cumplimiento normativo en un solo panel.' },
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
