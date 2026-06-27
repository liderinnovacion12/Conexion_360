export default function Badge({ children, variant = 'neutral', dot = false }) {
  return (
    <span className={`badge badge--${variant}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  )
}

export function ProgressBar({ value = 0, max = 100 }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%` }} />
    </div>
  )
}
