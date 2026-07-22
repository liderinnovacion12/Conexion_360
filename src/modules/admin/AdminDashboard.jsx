import { useMemo } from 'react'
import { Users, UserPlus, Briefcase, Wallet, FileWarning, AlertTriangle, Info } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { LineChartCard, DonutChart } from '../../components/charts/Charts.jsx'
import { PAYROLL_TREND } from '../../data/mockAnalytics.js'
import { usePersonnel } from '../../hooks/usePersonnel.js'
import { useCandidates } from '../../hooks/useCandidates.js'
import { useClients } from '../../hooks/useClients.js'
import { useDocuments } from '../../hooks/useDocuments.js'
import { formatCOP } from '../../utils/format.js'
import { totalPayroll } from '../finance/financeUtils.js'

const VARIANT_COLORS = { danger: '#FF5D73', warning: '#FFC857', info: '#19E3D9' }

export default function AdminDashboard() {
  const { personnel } = usePersonnel()
  const { candidates } = useCandidates()
  const { clients } = useClients()
  const { documents } = useDocuments()

  const activos      = useMemo(() => personnel.filter((p) => p.state === 'Activo'), [personnel])
  const retirados    = useMemo(() => personnel.filter((p) => p.state === 'Retirado'), [personnel])
  const inactivos    = useMemo(() => personnel.filter((p) => ['Inactivo', 'Suspendido'].includes(p.state)), [personnel])
  const enProceso    = useMemo(() => candidates.filter((c) => !['contratado', 'rechazado'].includes(c.stage)), [candidates])
  const clientesActivos = useMemo(() => clients.filter((c) => c.status === 'Activo').length, [clients])
  const nominaTotal  = useMemo(() => totalPayroll(personnel), [personnel])

  const docsAprobados  = useMemo(() => documents.filter((d) => d.status === 'aprobado').length, [documents])
  const docsPendientes = useMemo(() => documents.filter((d) => d.status === 'pendiente').length, [documents])
  const docsDevueltos  = useMemo(() => documents.filter((d) => d.status === 'devuelto').length, [documents])
  const docsRechazados = useMemo(() => documents.filter((d) => d.status === 'rechazado').length, [documents])

  const personnelDist = useMemo(() => [
    { name: 'Personal activo',    value: activos.length,      color: '#19E3D9' },
    { name: 'Clientes',           value: clientesActivos,     color: '#9B5DE5' },
    { name: 'Aspirantes',         value: enProceso.length,    color: '#FFC857' },
    { name: 'Inactivos/Suspendidos', value: inactivos.length, color: '#6b7793' },
    ...(retirados.length ? [{ name: 'Retirados', value: retirados.length, color: '#FF5D73' }] : []),
  ].filter((d) => d.value > 0), [activos, clientesActivos, enProceso, inactivos, retirados])

  const docCompliance = useMemo(() => [
    { name: 'Aprobados',  value: docsAprobados,  color: '#2EE6A6' },
    { name: 'Pendientes', value: docsPendientes, color: '#FFC857' },
    { name: 'Devueltos',  value: docsDevueltos,  color: '#9B5DE5' },
    { name: 'Rechazados', value: docsRechazados, color: '#FF5D73' },
  ].filter((d) => d.value > 0), [docsAprobados, docsPendientes, docsDevueltos, docsRechazados])

  const KPIS = [
    { label: 'Personal activo',       value: activos.length,           sub: `${retirados.length} retirados · ${inactivos.length} inactivos`, accent: '#19E3D9', icon: Users      },
    { label: 'Aspirantes en proceso', value: enProceso.length,         sub: `${candidates.length} total registrados`,                        accent: '#9B5DE5', icon: UserPlus   },
    { label: 'Clientes activos',      value: clientesActivos,          sub: `${clients.length} en total`,                                    accent: '#2EE6A6', icon: Briefcase  },
    { label: 'Nómina mes actual',     value: formatCOP(nominaTotal),   sub: 'Personal activo',                                               accent: '#FFC857', icon: Wallet     },
  ]

  const ALERTS = [
    ...(docsPendientes > 0
      ? [{ icon: FileWarning, variant: 'warning', text: `${docsPendientes} documento${docsPendientes > 1 ? 's' : ''} pendiente${docsPendientes > 1 ? 's' : ''} de revisión.` }]
      : []),
    ...(docsDevueltos > 0
      ? [{ icon: AlertTriangle, variant: 'danger', text: `${docsDevueltos} documento${docsDevueltos > 1 ? 's' : ''} devuelto${docsDevueltos > 1 ? 's' : ''} por corregir.` }]
      : []),
    ...(enProceso.length > 0
      ? [{ icon: Info, variant: 'info', text: `${enProceso.length} aspirante${enProceso.length > 1 ? 's' : ''} con proceso activo en reclutamiento.` }]
      : []),
    ...(documents.length === 0 && candidates.length === 0 && personnel.length === 0
      ? [{ icon: Info, variant: 'info', text: 'No hay datos registrados aún. Comienza creando candidatos o registrando personal.' }]
      : []),
  ]

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

      {/* Alertas con datos reales */}
      {ALERTS.length > 0 && (
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
      )}

      {/* Gráficas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
        <div style={{ gridColumn: 'span 2' }}>
          <Card title="Tendencia de nómina" subtitle="Millones COP · últimos 6 meses (histórico)">
            <LineChartCard
              data={PAYROLL_TREND}
              xKey="month"
              area
              lines={[{ key: 'costo', name: 'Costo (M)', color: '#19E3D9' }]}
            />
          </Card>
        </div>
        <Card title="Distribución de personal" subtitle="Por tipo de vinculación">
          {personnelDist.length > 0
            ? <DonutChart data={personnelDist} />
            : <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Sin datos</div>
          }
        </Card>
      </div>

      {/* Cumplimiento + resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card title="Cumplimiento documental" subtitle="Estado global de documentos">
          {docCompliance.length > 0
            ? <DonutChart data={docCompliance} />
            : <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Sin documentos registrados</div>
          }
        </Card>

        <Card title="Resumen" subtitle="Indicadores clave del período">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Total personal registrado',  value: personnel.length },
              { label: 'Personal activo',            value: activos.length },
              { label: 'Personal retirado',          value: retirados.length },
              { label: 'Aspirantes registrados',     value: candidates.length },
              { label: 'Aspirantes en proceso',      value: enProceso.length },
              { label: 'Clientes activos',           value: clientesActivos },
              { label: 'Documentos aprobados',       value: docsAprobados },
              { label: 'Documentos pendientes',      value: docsPendientes },
            ].map((r, i, arr) => (
              <div
                key={r.label}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0',
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
            {docsAprobados > 0 && <Badge variant="success" dot>Docs aprobados: {docsAprobados}</Badge>}
            {docsPendientes > 0 && <Badge variant="warning" dot>{docsPendientes} pendientes de revisión</Badge>}
            {enProceso.length > 0 && <Badge variant="info" dot>{enProceso.length} aspirantes activos</Badge>}
            {personnel.length === 0 && <Badge variant="neutral" dot>Sin personal registrado</Badge>}
          </div>
        </Card>
      </div>
    </div>
  )
}
