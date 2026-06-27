import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function Card({ title, subtitle, action, children, className = '', ...rest }) {
  return (
    <section className={`card ${className}`} {...rest}>
      {(title || action) && (
        <header className="card-head">
          <div>
            {title && <div className="card-title">{title}</div>}
            {subtitle && <div className="card-sub">{subtitle}</div>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

// Tarjeta KPI con glassmorphism, ícono con glow y tendencia.
export function KpiCard({ label, value, icon: Icon, trend, accent = 'teal' }) {
  const accents = {
    teal: { glow: 'rgba(25,227,217,0.20)', bg: 'var(--grad-teal)' },
    violet: { glow: 'rgba(155,93,229,0.22)', bg: 'var(--grad-violet)' },
    cyan: { glow: 'rgba(0,188,212,0.22)', bg: 'linear-gradient(135deg,#00BCD4,#00838F)' },
    success: { glow: 'rgba(46,230,166,0.22)', bg: 'linear-gradient(135deg,#2EE6A6,#0a8f66)' },
    warning: { glow: 'rgba(255,200,87,0.22)', bg: 'linear-gradient(135deg,#FFC857,#c9962f)' },
  }
  const a = accents[accent] || accents.teal
  const TrendIcon = trend?.dir === 'up' ? TrendingUp : trend?.dir === 'down' ? TrendingDown : Minus
  return (
    <article className="kpi" style={{ '--kpi-glow': a.glow }}>
      {Icon && (
        <div className="kpi-icon" style={{ '--kpi-icon-bg': a.bg }}>
          <Icon />
        </div>
      )}
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {trend && (
        <div className={`kpi-trend ${trend.dir}`}>
          <TrendIcon size={14} />
          {trend.text}
        </div>
      )}
    </article>
  )
}
