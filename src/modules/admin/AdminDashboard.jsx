import { Users, UserPlus, Briefcase, Wallet, Clock, TrendingUp, FileWarning, AlertTriangle, Info } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { LineChartCard, DonutChart } from '../../components/charts/Charts.jsx'
import {
  PAYROLL_TREND,
  PERSONNEL_DISTRIBUTION,
  DOC_COMPLIANCE,
} from '../../data/mockAnalytics.js'

const KPIS = [
  { label: 'Personal activo',      value: '159',     sub: '+1.9% este mes',   accent: '#19E3D9', icon: Users      },
  { label: 'Aspirantes en proceso',value: '12',      sub: '+3 esta semana',   accent: '#9B5DE5', icon: UserPlus   },
  { label: 'Clientes activos',     value: '28',      sub: 'Sin cambios',      accent: '#2EE6A6', icon: Briefcase  },
  { label: 'Nómina mes actual',    value: '$55.4 M', sub: '+3.0% vs anterior',accent: '#FFC857', icon: Wallet     },
  { label: 'Tasa de conversión',   value: '12.5%',   sub: 'Candidatos → contratos', accent: '#19E3D9', icon: TrendingUp },
  { label: 'Aprob. documental',    value: '1.8 días',sub: '-0.4 días',        accent: '#2EE6A6', icon: Clock      },
]

const ALERTS = [
  { icon: FileWarning,    variant: 'danger',  text: '3 documentos llevan más de 5 días sin revisión.' },
  { icon: AlertTriangle,  variant: 'warning', text: '2 certificados de seguridad social vencen en < 30 días.' },
  { icon: Info,           variant: 'info',    text: '5 aspirantes tienen documentación requerida pendiente.' },
]

const VARIANT_COLORS = { danger: '#FF5D73', warning: '#FFC857', info: '#19E3D9' }

export default function AdminDashboard() {
  return (
    <div className="page">
      <PageHeader title="Panel ejecutivo" subtitle="Visión general de personal, reclutamiento y nómina." />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        {KPIS.map((k) => (
          <div
            key={k.label}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 12,
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {k.label}
              </span>
              <k.icon size={15} style={{ color: k.accent, opacity: 0.8 }} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
              {k.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{k.sub}</div>
            <div style={{ height: 2, borderRadius: 2, background: k.accent, opacity: 0.35, marginTop: 4 }} />
          </div>
        ))}
      </div>

      {/* Alertas inline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {ALERTS.map((a) => (
          <div
            key={a.text}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 10,
              background: VARIANT_COLORS[a.variant] + '0f',
              border: `1px solid ${VARIANT_COLORS[a.variant]}30`,
              fontSize: '0.84rem', color: 'var(--text-soft)',
            }}
          >
            <a.icon size={15} style={{ color: VARIANT_COLORS[a.variant], flexShrink: 0 }} />
            {a.text}
          </div>
        ))}
      </div>

      {/* Gráficas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
        <div style={{ gridColumn: 'span 2' }}>
          <Card title="Costo de nómina" subtitle="Millones COP · últimos 6 meses">
            <LineChartCard
              data={PAYROLL_TREND}
              xKey="month"
              area
              lines={[{ key: 'costo', name: 'Costo (M)', color: '#19E3D9' }]}
            />
          </Card>
        </div>
        <Card title="Distribución de personal" subtitle="Por tipo de vinculación">
          <DonutChart data={PERSONNEL_DISTRIBUTION} />
        </Card>
      </div>

      {/* Fila inferior: cumplimiento + resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card title="Cumplimiento documental" subtitle="Estado global de documentos">
          <DonutChart data={DOC_COMPLIANCE} />
        </Card>

        <Card title="Resumen" subtitle="Indicadores clave del período">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Cursos completados',        value: '38 / 66' },
              { label: 'Documentos aprobados',       value: '64'      },
              { label: 'Conversión reclutamiento',   value: '12.5%'   },
              { label: 'Tiempo aprob. documental',   value: '1.8 días'},
              { label: 'Área de mayor costo',        value: 'Producción' },
            ].map((r, i, arr) => (
              <div
                key={r.label}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--glass-border)' : 'none',
                  fontSize: '0.875rem',
                }}
              >
                <span style={{ color: 'var(--text-soft)' }}>{r.label}</span>
                <b style={{ color: 'var(--text)' }}>{r.value}</b>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
            <Badge variant="success" dot>Nómina bajo control</Badge>
            <Badge variant="warning" dot>Revisar vencimientos</Badge>
            <Badge variant="info"    dot>5 docs pendientes</Badge>
          </div>
        </Card>
      </div>
    </div>
  )
}
