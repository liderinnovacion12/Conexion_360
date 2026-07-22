// Conexión Todo Ágil 360 — logo triangular (teal + violet + dark)
export function LogoMark({ size = 34, animated = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Conexión Todo Ágil 360">
      <defs>
        <linearGradient id="cx-teal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#19E3D9" />
          <stop offset="1" stopColor="#00838F" />
        </linearGradient>
        <linearGradient id="cx-violet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9B5DE5" />
          <stop offset="1" stopColor="#6A1B9A" />
        </linearGradient>
      </defs>
      {/* Diamante superior — teal */}
      <path
        d="M32 4 L47 31 L32 40 L17 31 Z"
        fill="url(#cx-teal)"
        className={animated ? 'lg-part lg-1' : undefined}
      />
      {/* Triángulo inferior-derecho — violet */}
      <path
        d="M47 31 L62 58 L32 58 L32 40 Z"
        fill="url(#cx-violet)"
        className={animated ? 'lg-part lg-2' : undefined}
      />
      {/* Triángulo inferior-izquierdo — oscuro */}
      <path
        d="M17 31 L32 40 L32 58 L2 58 Z"
        fill="#16213E"
        className={animated ? 'lg-part lg-3' : undefined}
      />
      {/* Círculo central — teal */}
      <circle cx="32" cy="40" r="5.5" fill="url(#cx-teal)" className={animated ? 'lg-part lg-4' : undefined} />
    </svg>
  )
}

export function LogoFull({ size = 34, stacked = false }) {
  return (
    <div className="row gap-2" style={{ flexDirection: stacked ? 'column' : 'row', alignItems: 'center' }}>
      <LogoMark size={size} />
      <div style={{ lineHeight: 1.08, textAlign: stacked ? 'center' : 'left' }}>
        <div style={{ fontWeight: 800, fontSize: size * 0.38, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
          CONEXIÓN TODO ÁGIL <span className="text-grad">360</span>
        </div>
      </div>
    </div>
  )
}
