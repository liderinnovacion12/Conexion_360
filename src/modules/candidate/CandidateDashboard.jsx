import { useNavigate } from 'react-router-dom'
import { FileText, GraduationCap, FileSignature, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card, KpiCard } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { ProgressBar } from '../../components/ui/Badge.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCandidates } from '../../hooks/useCandidates.js'
import { useDocuments } from '../../hooks/useDocuments.js'
import { stageLabel, PIPELINE_STAGES } from '../../data/pipeline.js'
import { docStatusVariant } from '../../utils/format.js'

export default function CandidateDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const cid = user.candidateId
  const { candidates } = useCandidates()
  const { documents: docs } = useDocuments(cid)
  const cand = candidates.find((c) => c.id === cid)
  const aprobados = docs.filter((d) => d.status === 'aprobado').length
  const pendientes = docs.filter((d) => d.status === 'pendiente').length
  const devueltos = docs.filter((d) => ['devuelto', 'rechazado'].includes(d.status))

  const stageIdx = PIPELINE_STAGES.findIndex((s) => s.id === cand?.stage)
  const stagePct = Math.round(((stageIdx + 1) / PIPELINE_STAGES.length) * 100)

  return (
    <div className="page">
      <PageHeader title={`Hola, ${user.name.split(' ')[0]} 👋`} subtitle="Este es el estado de tu proceso de selección." />

      {devueltos.length > 0 && (
        <AlertBanner variant="warning" title="Tienes documentos por corregir">
          {devueltos.length} documento(s) fueron devueltos o rechazados. Revisa los comentarios y vuelve a cargarlos.
        </AlertBanner>
      )}

      <div className="grid grid-kpi stagger" style={{ margin: '18px 0' }}>
        <KpiCard label="Etapa actual" value={stageLabel(cand?.stage)} icon={CheckCircle2} accent="teal" />
        <KpiCard label="Documentos aprobados" value={aprobados} icon={FileText} accent="success" />
        <KpiCard label="Pendientes de revisión" value={pendientes} icon={Clock} accent="warning" />
        <KpiCard label="Por corregir" value={devueltos.length} icon={AlertTriangle} accent="violet" />
      </div>

      <div className="grid grid-2">
        <Card title="Avance de tu proceso" subtitle={`${stagePct}% completado`}>
          <ProgressBar value={stagePct} />
          <div className="timeline" style={{ marginTop: 18 }}>
            {PIPELINE_STAGES.slice(0, 10).map((s, i) => (
              <div className="timeline-item" key={s.id} style={{ opacity: i <= stageIdx ? 1 : 0.45 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: i === stageIdx ? 700 : 500, color: i <= stageIdx ? 'var(--text)' : 'var(--text-dim)' }}>
                  {s.label}
                </div>
                {i === stageIdx && <small>Etapa actual</small>}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Acciones rápidas" subtitle="Completa tu proceso">
          <div className="col gap-2">
            <Button variant="primary" icon={FileText} className="full" onClick={() => navigate('/aspirante/documentos')}>Cargar / ver documentos</Button>
            <Button variant="violet" icon={FileSignature} className="full" onClick={() => navigate('/aspirante/autorizacion')}>Firmar autorización de datos</Button>
            <Button variant="ghost" icon={GraduationCap} className="full" onClick={() => navigate('/aspirante/cursos')}>Ir a mis cursos</Button>
          </div>
          <div className="divider" />
          <div className="col gap-2">
            <b style={{ fontSize: '0.85rem' }}>Mis documentos</b>
            {docs.map((d) => (
              <div className="stat-row" key={d.id}>
                <span className="muted" style={{ fontSize: '0.84rem' }}>{d.type}</span>
                <Badge variant={docStatusVariant[d.status]} dot>{d.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
