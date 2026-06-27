import { Users, UserPlus, Briefcase, Wallet, FileWarning, Clock, TrendingUp, GraduationCap } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card, KpiCard } from '../../components/ui/Card.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { BarChartCard, LineChartCard, DonutChart } from '../../components/charts/Charts.jsx'
import FunnelChart from '../../components/charts/FunnelChart.jsx'
import {
  PAYROLL_TREND,
  PAYROLL_BY_AREA,
  PERSONNEL_DISTRIBUTION,
  RECRUITMENT_FUNNEL,
  DOC_COMPLIANCE,
  HIRING_TREND,
} from '../../data/mockAnalytics.js'

export default function AdminDashboard() {
  return (
    <div className="page">
      <PageHeader
        title="Panel ejecutivo"
        subtitle="Visión 360° de personal, reclutamiento, documentos y nómina."
      />

      <div className="grid grid-kpi stagger" style={{ marginBottom: 18 }}>
        <KpiCard label="Personal activo en planta" value="159" icon={Users} accent="teal" trend={{ dir: 'up', text: '+1.9% vs. mes anterior' }} />
        <KpiCard label="Aspirantes en proceso" value="12" icon={UserPlus} accent="cyan" trend={{ dir: 'up', text: '+3 esta semana' }} />
        <KpiCard label="Contratistas activos" value="28" icon={Briefcase} accent="violet" trend={{ dir: 'flat', text: 'Sin cambios' }} />
        <KpiCard label="Nómina mes actual" value="$55.4 M" icon={Wallet} accent="success" trend={{ dir: 'up', text: '+3.0% costo' }} />
        <KpiCard label="Tasa de conversión" value="12.5%" icon={TrendingUp} accent="teal" trend={{ dir: 'up', text: 'Candidatos → contratados' }} />
        <KpiCard label="Aprob. documental prom." value="1.8 días" icon={Clock} accent="warning" trend={{ dir: 'down', text: '-0.4 días' }} />
      </div>

      {/* Alertas */}
      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <AlertBanner variant="danger" title="Aprobaciones atrasadas">
          3 documentos llevan más de 5 días sin revisión.
        </AlertBanner>
        <AlertBanner variant="warning" title="Documentos por vencer">
          2 certificados de seguridad social vencen en menos de 30 días.
        </AlertBanner>
        <AlertBanner variant="info" title="Documentos incompletos">
          5 aspirantes tienen documentación requerida pendiente.
        </AlertBanner>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <Card title="Tendencia de costos de nómina" subtitle="Millones COP · últimos 6 meses">
          <LineChartCard data={PAYROLL_TREND} xKey="month" area lines={[{ key: 'costo', name: 'Costo (M)', color: '#19E3D9' }]} />
        </Card>
        <Card title="Crecimiento de planta activa" subtitle="Empleados en planta">
          <BarChartCard data={HIRING_TREND} xKey="month" bars={[{ key: 'planta', name: 'Planta', color: '#9B5DE5' }]} />
        </Card>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <Card title="Distribución de personal" subtitle="Por tipo de vinculación">
          <DonutChart data={PERSONNEL_DISTRIBUTION} />
        </Card>
        <Card title="Cumplimiento documental" subtitle="Estado global de documentos">
          <DonutChart data={DOC_COMPLIANCE} />
        </Card>
        <Card title="Nómina por área" subtitle="Millones COP">
          <BarChartCard data={PAYROLL_BY_AREA} xKey="name" bars={[{ key: 'value', name: 'Nómina (M)', color: '#00BCD4' }]} height={260} />
        </Card>
      </div>

      <div className="grid grid-2">
        <Card title="Embudo de reclutamiento" subtitle="Conversión por etapa del pipeline">
          <FunnelChart data={RECRUITMENT_FUNNEL} />
        </Card>
        <Card title="Resumen ejecutivo" subtitle="Lectura rápida para la gerencia">
          <div className="col gap-2" style={{ fontSize: '0.9rem', color: 'var(--text-soft)', lineHeight: 1.6 }}>
            <p>
              La planta activa creció <b style={{ color: 'var(--text)' }}>1.9%</b> respecto al mes anterior, con
              un costo de nómina de <b style={{ color: 'var(--text)' }}>$55.4 M</b> (+3.0%). El área de mayor
              impacto financiero es <b style={{ color: 'var(--text)' }}>Producción</b>.
            </p>
            <p>
              El pipeline de reclutamiento mantiene <b style={{ color: 'var(--text)' }}>12 aspirantes</b> activos
              con una conversión global del <b style={{ color: 'var(--text)' }}>12.5%</b>. El tiempo promedio de
              aprobación documental mejoró a <b style={{ color: 'var(--text)' }}>1.8 días</b>.
            </p>
            <div className="row gap-2 wrap" style={{ marginTop: 6 }}>
              <Badge variant="success" dot>Nómina bajo control</Badge>
              <Badge variant="warning" dot>Revisar vencimientos</Badge>
              <Badge variant="info" dot>5 documentos pendientes</Badge>
            </div>
          </div>
          <div className="divider" />
          <div className="row between"><span className="muted">Cursos completados</span><b>38 / 66</b></div>
          <div className="row between" style={{ marginTop: 8 }}><span className="muted">Documentos aprobados este mes</span><b>64</b></div>
        </Card>
      </div>
    </div>
  )
}
