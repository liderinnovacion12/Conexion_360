import { Users, FileCheck2, ShieldCheck, Eye } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card, KpiCard } from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { BarChartCard, DonutChart } from '../../components/charts/Charts.jsx'
import FunnelChart from '../../components/charts/FunnelChart.jsx'
import { DOC_COMPLIANCE, PERSONNEL_DISTRIBUTION, PAYROLL_BY_AREA, RECRUITMENT_FUNNEL } from '../../data/mockAnalytics.js'

export default function AuditorDashboard() {
  return (
    <div className="page">
      <PageHeader title="Tablero analítico" subtitle="Vista de consulta (solo lectura) para auditoría." />

      <AlertBanner variant="info" title="Modo consulta">
        Tu rol tiene acceso de <b>solo lectura</b>. Puedes visualizar y exportar reportes, sin modificar registros.
      </AlertBanner>

      <div className="grid grid-kpi stagger" style={{ margin: '18px 0' }}>
        <KpiCard label="Personal total" value="194" icon={Users} accent="teal" />
        <KpiCard label="Cumplimiento documental" value="64%" icon={FileCheck2} accent="success" trend={{ dir: 'up', text: 'Aprobados' }} />
        <KpiCard label="Documentos vencidos" value="5" icon={ShieldCheck} accent="warning" trend={{ dir: 'down', text: 'Requieren acción' }} />
        <KpiCard label="Accesos auditados" value="1.240" icon={Eye} accent="violet" trend={{ dir: 'up', text: 'Este mes' }} />
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <Card title="Cumplimiento documental"><DonutChart data={DOC_COMPLIANCE} /></Card>
        <Card title="Distribución de personal"><DonutChart data={PERSONNEL_DISTRIBUTION} /></Card>
        <Card title="Nómina por área" subtitle="Millones COP"><BarChartCard data={PAYROLL_BY_AREA} xKey="name" bars={[{ key: 'value', color: '#00BCD4' }]} height={260} /></Card>
      </div>

      <Card title="Embudo de reclutamiento" subtitle="Conversión por etapa">
        <FunnelChart data={RECRUITMENT_FUNNEL} />
      </Card>
    </div>
  )
}
