import { UserPlus, ClipboardCheck, GraduationCap, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card, KpiCard } from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { ProgressBar } from '../../components/ui/Badge.jsx'
import { DonutChart } from '../../components/charts/Charts.jsx'
import FunnelChart from '../../components/charts/FunnelChart.jsx'
import { STATUS_VARIANT } from '../../data/mockCandidates.js'
import { COURSE_STATUS, RECRUITMENT_FUNNEL } from '../../data/mockAnalytics.js'
import { stageLabel } from '../../data/pipeline.js'
import { useCandidates } from '../../hooks/useCandidates.js'

export default function RecruitmentDashboard() {
  const { candidates: CANDIDATES } = useCandidates()
  const enProceso = CANDIDATES.filter((c) => !['contratado', 'rechazado'].includes(c.stage))
  const aprobados = CANDIDATES.filter((c) => c.status === 'aprobado').length
  const contratados = CANDIDATES.filter((c) => c.status === 'contratado').length

  return (
    <div className="page">
      <PageHeader title="Tablero de reclutamiento" subtitle="Estado del pipeline y avance de aspirantes." />

      <div className="grid grid-kpi stagger" style={{ marginBottom: 18 }}>
        <KpiCard label="Aspirantes en proceso" value={enProceso.length} icon={UserPlus} accent="cyan" trend={{ dir: 'up', text: '+3 esta semana' }} />
        <KpiCard label="Documentos por revisar" value="4" icon={ClipboardCheck} accent="warning" trend={{ dir: 'flat', text: 'Pendientes' }} />
        <KpiCard label="Aptos para contratación" value={aprobados} icon={CheckCircle2} accent="success" trend={{ dir: 'up', text: 'Evaluación aprobada' }} />
        <KpiCard label="Contratados (mes)" value={contratados} icon={GraduationCap} accent="violet" trend={{ dir: 'up', text: 'Conversión 12.5%' }} />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <Card title="Embudo de reclutamiento" subtitle="Conversión por etapa">
          <FunnelChart data={RECRUITMENT_FUNNEL} />
        </Card>
        <Card title="Estado de cursos" subtitle="Avance de aspirantes">
          <DonutChart data={COURSE_STATUS} />
        </Card>
      </div>

      <Card title="Aspirantes recientes" subtitle="Avance individual">
        <div className="col gap-2">
          {CANDIDATES.slice(0, 6).map((c) => (
            <div className="stat-row" key={c.id}>
              <div className="row gap-2" style={{ minWidth: 0 }}>
                <div className="avatar avatar--sm">{c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.name}</div>
                  <div className="card-sub">{stageLabel(c.stage)}</div>
                </div>
              </div>
              <div className="row gap-3" style={{ minWidth: 200 }}>
                <div style={{ width: 120 }}><ProgressBar value={c.progress} /></div>
                <Badge variant={STATUS_VARIANT[c.status]} dot>{c.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
