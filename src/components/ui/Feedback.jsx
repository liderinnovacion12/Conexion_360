import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react'

const icons = { warning: AlertTriangle, danger: XCircle, info: Info, success: CheckCircle2 }

export function AlertBanner({ variant = 'info', title, children }) {
  const Icon = icons[variant] || Info
  return (
    <div className={`alert alert--${variant}`} role="alert">
      <Icon />
      <div>
        {title && <strong>{title}</strong>}
        {title && children && <br />}
        {children}
      </div>
    </div>
  )
}

export function Skeleton({ height = 16, width = '100%', radius = 8, style }) {
  return <div className="skeleton" style={{ height, width, borderRadius: radius, ...style }} />
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="col center" style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>
      {Icon && <Icon size={34} style={{ marginBottom: 10, opacity: 0.6 }} />}
      <b style={{ color: 'var(--text-soft)' }}>{title}</b>
      {children && <p className="card-sub" style={{ marginTop: 4 }}>{children}</p>}
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={active === t.value}
          className={`tab ${active === t.value ? 'active' : ''}`}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
