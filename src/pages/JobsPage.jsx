import { useEffect, useRef, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun, Moon, MapPin, Clock, Users, ArrowRight, Search,
  Briefcase, SlidersHorizontal, X, ChevronDown, Building2
} from 'lucide-react'
import { LogoMark } from '../assets/Logo.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useJobPostings } from '../hooks/useJobPostings.js'
import './LandingPage.css'
import './JobsPage.css'

const CONTRACT_LABELS = {
  servicios:         'Prestación de servicios',
  termino_fijo:      'Término fijo',
  termino_indefinido:'Término indefinido',
  obra_labor:        'Obra o labor',
  aprendizaje:       'Aprendizaje',
}
const MODALITY_LABELS  = { presencial: 'Presencial', remoto: 'Remoto', hibrido: 'Híbrido' }
const MODALITY_ICONS   = { presencial: '🏢', remoto: '🏠', hibrido: '🔀' }
const CONTRACT_COLORS  = {
  servicios: '#19E3D9', termino_fijo: '#9B5DE5',
  termino_indefinido: '#2EE6A6', obra_labor: '#FFC857', aprendizaje: '#FF5D73',
}

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

function FilterChip({ label, onRemove }) {
  return (
    <span className="jp-chip">
      {label}
      <button onClick={onRemove} aria-label="Quitar filtro"><X size={11} /></button>
    </span>
  )
}

function FilterSelect({ label, icon: Icon, value, onChange, options, placeholder }) {
  return (
    <div className="jp-filter-select">
      {Icon && <Icon size={14} className="jp-filter-icon" />}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder || label}</option>
        {options.map(({ value: v, label: l }) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <ChevronDown size={13} className="jp-filter-chevron" />
    </div>
  )
}

function JobCard({ job }) {
  const contractColor = CONTRACT_COLORS[job.contractType] || '#19E3D9'

  return (
    <article className="jp-job-card">
      <div className="jp-job-card-accent" style={{ background: contractColor }} />

      <div className="jp-job-card-body">
        <div className="jp-job-title">{job.title}</div>

        {job.area && (
          <div className="jp-job-company">
            <Building2 size={13} />
            {job.area}
          </div>
        )}

        <div className="jp-job-tags">
          {job.location && (
            <span className="jp-tag">
              <MapPin size={11} />{job.location}
            </span>
          )}
          {job.modality && (
            <span className="jp-tag jp-tag--mod">
              {MODALITY_ICONS[job.modality]} {MODALITY_LABELS[job.modality] || job.modality}
            </span>
          )}
          {job.contractType && (
            <span className="jp-tag jp-tag--contract" style={{ color: contractColor, background: contractColor + '18', borderColor: contractColor + '35' }}>
              {CONTRACT_LABELS[job.contractType] || job.contractType}
            </span>
          )}
          {job.vacancies > 0 && (
            <span className="jp-tag">
              <Users size={11} />{job.vacancies} {job.vacancies === 1 ? 'cupo' : 'cupos'}
            </span>
          )}
        </div>

        {job.description && (
          <p className="jp-job-desc">
            {job.description.length > 160 ? job.description.slice(0, 160) + '…' : job.description}
          </p>
        )}

        {job.requirements && (
          <p className="jp-job-reqs">
            <b>Requisitos:</b> {job.requirements.length > 100 ? job.requirements.slice(0, 100) + '…' : job.requirements}
          </p>
        )}
      </div>

      <div className="jp-job-card-footer">
        {job.salary ? (
          <div className="jp-salary">{job.salary}</div>
        ) : (
          <div className="jp-salary jp-salary--empty">Salario a convenir</div>
        )}
        <Link
          to={`/aplicar?jobId=${job.id}&title=${encodeURIComponent(job.title)}`}
          className="jp-apply-btn"
        >
          Postularme <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  )
}

export default function JobsPage() {
  const navRef = useRef(null)
  const { theme, toggleTheme } = useTheme()
  const { postings, loading } = useJobPostings()

  const active = useMemo(() => postings.filter((p) => p.status === 'activa'), [postings])

  // Filtros
  const [search,   setSearch]   = useState('')
  const [modality, setModality] = useState('')
  const [contract, setContract] = useState('')
  const [location, setLocation] = useState('')
  const [area,     setArea]     = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Opciones dinámicas
  const locations = useMemo(() => [...new Set(active.map((j) => j.location).filter(Boolean))], [active])
  const areas     = useMemo(() => [...new Set(active.map((j) => j.area).filter(Boolean))],     [active])

  const filtered = useMemo(() => {
    let list = active
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((j) =>
        j.title.toLowerCase().includes(q) ||
        j.area?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q)
      )
    }
    if (modality) list = list.filter((j) => j.modality === modality)
    if (contract) list = list.filter((j) => j.contractType === contract)
    if (location) list = list.filter((j) => j.location === location)
    if (area)     list = list.filter((j) => j.area === area)
    return list
  }, [active, search, modality, contract, location, area])

  const activeFilters = [
    modality && { key: 'modality', label: MODALITY_LABELS[modality] || modality, clear: () => setModality('') },
    contract && { key: 'contract', label: CONTRACT_LABELS[contract] || contract,  clear: () => setContract('') },
    location && { key: 'location', label: location,                               clear: () => setLocation('') },
    area     && { key: 'area',     label: area,                                   clear: () => setArea('') },
  ].filter(Boolean)

  const clearAll = () => { setSearch(''); setModality(''); setContract(''); setLocation(''); setArea('') }

  useEffect(() => {
    const onScroll = () => navRef.current?.classList.toggle('scrolled', window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="lp-wrap jp-page">
      {/* NAV */}
      <nav className="lp-nav" ref={navRef}>
        <NavLogo />
        <ul className="lp-nav-links">
          <li><Link to="/#servicios">Servicios</Link></li>
          <li><Link to="/#como-funciona">Cómo funciona</Link></li>
          <li><Link to="/empleos" className="lp-nav-active">Empleos</Link></li>
          <li><Link to="/#contacto">Contacto</Link></li>
        </ul>
        <div className="lp-nav-ctas">
          <Link className="lp-btn lp-btn-ghost" to="/login">Iniciar sesión</Link>
          <Link className="lp-btn lp-btn-primary" to="/registro">Registrarse</Link>
          <button className="lp-theme-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </nav>

      {/* HERO COMPACTO */}
      <section className="jp-hero">
        <div className="lp-orb lp-orb-teal" style={{ opacity: 0.35 }} />
        <div className="lp-orb lp-orb-violet" style={{ opacity: 0.25 }} />

        <div className="jp-hero-inner">
          <div className="lp-eyebrow"><span className="lp-eyebrow-dot" /> Oportunidades laborales</div>
          <h1 className="jp-hero-title">
            Encuentra tu próxima<br />
            <span className="lp-accent-teal">oportunidad</span> laboral
          </h1>
          <p className="jp-hero-sub">
            {loading ? '…' : `${active.length} vacante${active.length !== 1 ? 's' : ''} disponible${active.length !== 1 ? 's' : ''}`} en Conexión Todo Ágil 360
          </p>

          {/* Barra de búsqueda principal */}
          <div className="jp-search-bar">
            <Search size={18} className="jp-search-icon" />
            <input
              className="jp-search-input"
              placeholder="Buscar por cargo, área o palabra clave…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="jp-search-clear" onClick={() => setSearch('')} aria-label="Limpiar búsqueda">
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CUERPO: filtros + resultados */}
      <div className="jp-body">

        {/* SIDEBAR de filtros (desktop) */}
        <aside className="jp-sidebar">
          <div className="jp-sidebar-header">
            <SlidersHorizontal size={15} />
            <span>Filtrar por</span>
            {activeFilters.length > 0 && (
              <button className="jp-clear-all" onClick={clearAll}>Limpiar todo</button>
            )}
          </div>

          <div className="jp-sidebar-group">
            <div className="jp-sidebar-label">Modalidad</div>
            {[
              { value: 'presencial', label: '🏢 Presencial' },
              { value: 'remoto',     label: '🏠 Remoto' },
              { value: 'hibrido',    label: '🔀 Híbrido' },
            ].map((opt) => (
              <label key={opt.value} className="jp-radio">
                <input
                  type="radio" name="modality"
                  checked={modality === opt.value}
                  onChange={() => setModality(modality === opt.value ? '' : opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="jp-sidebar-group">
            <div className="jp-sidebar-label">Tipo de contrato</div>
            {Object.entries(CONTRACT_LABELS).map(([val, lbl]) => (
              <label key={val} className="jp-radio">
                <input
                  type="radio" name="contract"
                  checked={contract === val}
                  onChange={() => setContract(contract === val ? '' : val)}
                />
                <span>{lbl}</span>
              </label>
            ))}
          </div>

          {locations.length > 0 && (
            <div className="jp-sidebar-group">
              <div className="jp-sidebar-label">Ciudad / Ubicación</div>
              {locations.map((loc) => (
                <label key={loc} className="jp-radio">
                  <input
                    type="radio" name="location"
                    checked={location === loc}
                    onChange={() => setLocation(location === loc ? '' : loc)}
                  />
                  <span><MapPin size={11} /> {loc}</span>
                </label>
              ))}
            </div>
          )}

          {areas.length > 0 && (
            <div className="jp-sidebar-group">
              <div className="jp-sidebar-label">Área / Sector</div>
              {areas.map((a) => (
                <label key={a} className="jp-radio">
                  <input
                    type="radio" name="area"
                    checked={area === a}
                    onChange={() => setArea(area === a ? '' : a)}
                  />
                  <span>{a}</span>
                </label>
              ))}
            </div>
          )}
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="jp-main">

          {/* Filtros móvil: selects en fila */}
          <div className="jp-filters-mobile">
            <button className="jp-filter-toggle" onClick={() => setShowFilters((s) => !s)}>
              <SlidersHorizontal size={14} /> Filtros
              {activeFilters.length > 0 && <span className="jp-filter-badge">{activeFilters.length}</span>}
            </button>
            {showFilters && (
              <div className="jp-filters-mobile-panel">
                <FilterSelect label="Modalidad" icon={Clock} value={modality} onChange={setModality}
                  options={[{value:'presencial',label:'Presencial'},{value:'remoto',label:'Remoto'},{value:'hibrido',label:'Híbrido'}]} />
                <FilterSelect label="Tipo contrato" icon={Briefcase} value={contract} onChange={setContract}
                  options={Object.entries(CONTRACT_LABELS).map(([v,l]) => ({value:v,label:l}))} />
                {locations.length > 0 && (
                  <FilterSelect label="Ubicación" icon={MapPin} value={location} onChange={setLocation}
                    options={locations.map((l) => ({value:l,label:l}))} />
                )}
                {areas.length > 0 && (
                  <FilterSelect label="Área" icon={Building2} value={area} onChange={setArea}
                    options={areas.map((a) => ({value:a,label:a}))} />
                )}
                {activeFilters.length > 0 && (
                  <button className="jp-clear-all" onClick={clearAll}>Limpiar todo</button>
                )}
              </div>
            )}
          </div>

          {/* Chips de filtros activos */}
          {activeFilters.length > 0 && (
            <div className="jp-active-chips">
              {activeFilters.map((f) => (
                <FilterChip key={f.key} label={f.label} onRemove={f.clear} />
              ))}
            </div>
          )}

          {/* Cabecera de resultados */}
          <div className="jp-results-header">
            <div className="jp-results-count">
              {loading ? (
                <span>Cargando vacantes…</span>
              ) : (
                <span>
                  <b>{filtered.length}</b> vacante{filtered.length !== 1 ? 's' : ''}
                  {search || activeFilters.length > 0 ? ' encontradas' : ' disponibles'}
                </span>
              )}
            </div>
          </div>

          {/* Lista de vacantes */}
          {loading && (
            <div className="jp-loading">
              {[1,2,3].map((i) => <div key={i} className="jp-job-skeleton" />)}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="jp-empty">
              <div className="jp-empty-icon">💼</div>
              <div className="jp-empty-title">
                {active.length === 0
                  ? 'No hay vacantes abiertas en este momento'
                  : 'Sin resultados para esos filtros'}
              </div>
              <div className="jp-empty-sub">
                {active.length === 0
                  ? 'Vuelve pronto o crea tu cuenta para recibir alertas de nuevas oportunidades.'
                  : 'Intenta con otras palabras clave o ajusta los filtros.'}
              </div>
              {activeFilters.length > 0 && (
                <button className="jp-apply-btn" style={{ marginTop: 16 }} onClick={clearAll}>
                  Quitar filtros
                </button>
              )}
            </div>
          )}

          <div className="jp-jobs-list">
            {filtered.map((job) => <JobCard key={job.id} job={job} />)}
          </div>

          {/* CTA inferior */}
          {!loading && filtered.length > 0 && (
            <div className="jp-bottom-cta">
              <p>¿No encontraste lo que buscas? Crea tu cuenta y te avisamos cuando haya nuevas vacantes.</p>
              <Link to="/registro" className="lp-btn lp-btn-primary lp-btn-lg">Crear mi cuenta</Link>
            </div>
          )}
        </main>
      </div>

      {/* FOOTER COMPACTO */}
      <footer className="jp-footer lp-footer">
        <div className="lp-footer-bottom" style={{ borderTop: 'none', paddingTop: 28 }}>
          <div className="lp-footer-copy">© 2026 Conexión Todo Ágil 360 ·<Link to="/" style={{ color: 'var(--teal)' }}>Inicio</Link> · <Link to="/login" style={{ color: 'var(--teal)' }}>Iniciar sesión</Link></div>
          <div className="lp-footer-legal">
            <a href="#">Política de privacidad</a>
            <a href="#">Términos de uso</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
