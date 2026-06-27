export default function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="page-head row between wrap gap-3 anim-up">
      <div>
        <h1 className="h1">{title}</h1>
        {subtitle && <p className="muted" style={{ marginTop: 4 }}>{subtitle}</p>}
      </div>
      {actions && <div className="row gap-2 wrap">{actions}</div>}
    </header>
  )
}
