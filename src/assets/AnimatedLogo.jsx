// Animated assembling logo for the login backdrop.
// Neon outline "draws" itself, then the solid faces fade in — subtle, not aggressive.
export default function AnimatedLogo() {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="al-teal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#19E3D9" />
          <stop offset="1" stopColor="#00838F" />
        </linearGradient>
        <linearGradient id="al-violet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9B5DE5" />
          <stop offset="1" stopColor="#6A1B9A" />
        </linearGradient>
        <filter id="al-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>{`
          .al-fill { opacity: 0; animation: alFill 1s ease forwards; }
          .al-fill.d1 { animation-delay: 1.5s; }
          .al-fill.d2 { animation-delay: 1.8s; }
          .al-fill.d3 { animation-delay: 2.1s; }
          .al-fill.d4 { animation-delay: 2.4s; }
          .al-line { fill: none; stroke-width: 0.7; stroke-dasharray: 140; stroke-dashoffset: 140; animation: alDraw 2.2s ease forwards, alPulse 3s ease-in-out 2.4s infinite; }
          .al-line.t { stroke: #19E3D9; }
          .al-line.v { stroke: #9B5DE5; }
          .al-line.l2 { animation-delay: 0.3s, 2.7s; }
          .al-line.l3 { animation-delay: 0.6s, 3s; }
          @keyframes alDraw { to { stroke-dashoffset: 0; } }
          @keyframes alFill { to { opacity: 1; } }
          @keyframes alPulse { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
          .al-spin { transform-origin: 32px 32px; animation: alSpin 26s linear infinite; }
          @keyframes alSpin { to { transform: rotate(360deg); } }
        `}</style>
      </defs>

      {/* Rotating particle ring */}
      <g className="al-spin" opacity="0.5">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          const cx = 32 + Math.cos(a) * 27
          const cy = 32 + Math.sin(a) * 27
          return <circle key={i} cx={cx} cy={cy} r={i % 2 ? 0.5 : 0.9} fill={i % 2 ? '#9B5DE5' : '#19E3D9'} />
        })}
      </g>

      {/* Solid faces */}
      <g filter="url(#al-glow)">
        <path className="al-fill d1" d="M34 12 H20 a8 8 0 0 0 -8 8 v12 h9 v-9 a3 3 0 0 1 3 -3 h10 z" fill="url(#al-teal)" />
        <path className="al-fill d2" d="M40 52 H30 v-9 h7 a3 3 0 0 0 3 -3 V20 h9 v24 a8 8 0 0 1 -8 8 z" fill="url(#al-violet)" />
        <path className="al-fill d3" d="M12 32 v12 a8 8 0 0 0 8 8 h14 v-9 H24 a3 3 0 0 1 -3 -3 v-8 z" fill="#16213E" />
        <circle className="al-fill d4" cx="32" cy="32" r="5.5" fill="url(#al-teal)" />
      </g>

      {/* Neon outline drawing on top */}
      <path className="al-line t" d="M34 12 H20 a8 8 0 0 0 -8 8 v12 h9 v-9 a3 3 0 0 1 3 -3 h10 z" />
      <path className="al-line v l2" d="M40 52 H30 v-9 h7 a3 3 0 0 0 3 -3 V20 h9 v24 a8 8 0 0 1 -8 8 z" />
      <path className="al-line t l3" d="M12 32 v12 a8 8 0 0 0 8 8 h14 v-9 H24 a3 3 0 0 1 -3 -3 v-8 z" />
    </svg>
  )
}
