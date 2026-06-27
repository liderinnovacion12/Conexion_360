// Conexión 360 brand mark — vector recreation of the hexagonal "C" + sphere.
export function LogoMark({ size = 34, animated = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Conexión 360">
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
      <path
        d="M34 12 H20 a8 8 0 0 0 -8 8 v12 h9 v-9 a3 3 0 0 1 3 -3 h10 z"
        fill="url(#cx-teal)"
        className={animated ? 'lg-part lg-1' : undefined}
      />
      <path
        d="M40 52 H30 v-9 h7 a3 3 0 0 0 3 -3 V20 h9 v24 a8 8 0 0 1 -8 8 z"
        fill="url(#cx-violet)"
        className={animated ? 'lg-part lg-2' : undefined}
      />
      <path
        d="M12 32 v12 a8 8 0 0 0 8 8 h14 v-9 H24 a3 3 0 0 1 -3 -3 v-8 z"
        fill="#16213E"
        className={animated ? 'lg-part lg-3' : undefined}
      />
      <circle cx="32" cy="32" r="5.5" fill="url(#cx-teal)" className={animated ? 'lg-part lg-4' : undefined} />
    </svg>
  )
}

export function LogoFull({ size = 34, stacked = false }) {
  return (
    <div className="row gap-2" style={{ flexDirection: stacked ? 'column' : 'row' }}>
      <LogoMark size={size} />
      <div style={{ lineHeight: 1.02, textAlign: stacked ? 'center' : 'left' }}>
        <div style={{ fontWeight: 800, fontSize: size * 0.5, letterSpacing: '-0.02em' }}>
          CONEXIÓN <span className="text-grad">360</span>
        </div>
        <div style={{ fontSize: size * 0.26, letterSpacing: '0.16em', color: 'var(--text-dim)' }}>
          TODO ÁGIL CTA
        </div>
      </div>
    </div>
  )
}
