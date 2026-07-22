// Conexión Todo Ágil 360 — logo triangular animado
export function LogoMark({ size = 34, animated = false }) {
  const id = animated ? 'cx-a' : 'cx-s'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Conexión Todo Ágil 360">
      <defs>
        <linearGradient id={`${id}-teal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#19E3D9" />
          <stop offset="1" stopColor="#00838F" />
        </linearGradient>
        <linearGradient id={`${id}-violet`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9B5DE5" />
          <stop offset="1" stopColor="#6A1B9A" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>{`
          @keyframes lm-pulse { 0%,100%{opacity:.85} 50%{opacity:1} }
          @keyframes lm-spin { to{transform:rotate(360deg)} }
          @keyframes lm-fade { 0%{opacity:0} 100%{opacity:1} }
          .lm-ring { transform-origin:32px 40px; animation:lm-spin 18s linear infinite; }
          .lm-glow { animation:lm-pulse 3s ease-in-out infinite; }
          .lg-part { opacity:0; animation:lm-fade .6s ease forwards; }
          .lg-1 { animation-delay:.15s; }
          .lg-2 { animation-delay:.35s; }
          .lg-3 { animation-delay:.55s; }
          .lg-4 { animation-delay:.75s; }
        `}</style>
      </defs>

      {/* Rotating particle ring */}
      <g className="lm-ring" opacity="0.45">
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2
          const cx = 32 + Math.cos(a) * 24
          const cy = 40 + Math.sin(a) * 18
          return <circle key={i} cx={cx} cy={cy} r={i % 2 ? 0.55 : 0.95} fill={i % 2 ? '#9B5DE5' : '#19E3D9'} />
        })}
      </g>

      {/* Solid triangle sections */}
      <g filter={`url(#${id}-glow)`} className="lm-glow">
        <path
          d="M32 4 L47 31 L32 40 L17 31 Z"
          fill={`url(#${id}-teal)`}
          className={animated ? 'lg-part lg-1' : undefined}
        />
        <path
          d="M47 31 L62 58 L32 58 L32 40 Z"
          fill={`url(#${id}-violet)`}
          className={animated ? 'lg-part lg-2' : undefined}
        />
        <path
          d="M17 31 L32 40 L32 58 L2 58 Z"
          fill="#16213E"
          className={animated ? 'lg-part lg-3' : undefined}
        />
        <circle
          cx="32" cy="40" r="5.5"
          fill={`url(#${id}-teal)`}
          className={animated ? 'lg-part lg-4' : undefined}
        />
      </g>

      {/* Neon outline strokes */}
      <path d="M32 4 L47 31 L32 40 L17 31 Z" fill="none" stroke="#19E3D9" strokeWidth="0.6" opacity="0.55" />
      <path d="M47 31 L62 58 L32 58 L32 40 Z" fill="none" stroke="#9B5DE5" strokeWidth="0.6" opacity="0.55" />
      <path d="M17 31 L32 40 L32 58 L2 58 Z" fill="none" stroke="#19E3D9" strokeWidth="0.6" opacity="0.3" />
    </svg>
  )
}

export function LogoFull({ size = 34, stacked = false }) {
  return (
    <div className="row gap-2" style={{ flexDirection: stacked ? 'column' : 'row', alignItems: 'center' }}>
      <LogoMark size={size} animated />
      <div style={{ lineHeight: 1.08, textAlign: stacked ? 'center' : 'left' }}>
        <div style={{ fontWeight: 800, fontSize: size * 0.38, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
          CONEXIÓN TODO ÁGIL <span className="text-grad">360</span>
        </div>
      </div>
    </div>
  )
}
