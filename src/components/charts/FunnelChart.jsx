import { CHART_COLORS } from './Charts.jsx'

// Embudo de conversión basado en CSS — ancho proporcional al valor máximo.
export default function FunnelChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="funnel">
      {data.map((d, i) => {
        const pct = Math.max(8, (d.value / max) * 100)
        const conv = i === 0 ? 100 : Math.round((d.value / data[0].value) * 100)
        return (
          <div className="funnel-row" key={d.label}>
            <div
              className="funnel-bar"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${
                  CHART_COLORS[(i + 1) % CHART_COLORS.length]
                })`,
              }}
            >
              {d.value}
            </div>
            <span className="funnel-label">
              {d.label} · {conv}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
