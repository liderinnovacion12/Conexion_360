import { useNavigate } from 'react-router-dom'
import { Briefcase, CalendarClock, Wallet, FileText, AlertTriangle } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card, KpiCard } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { ProgressBar } from '../../components/ui/Badge.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { PERSONNEL } from '../../data/mockPersonnel.js'
import { formatCOP, formatDate, daysBetween } from '../../utils/format.js'

export default function ContractorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const c = PERSONNEL.find((p) => p.id === user.employeeId) || PERSONNEL.find((p) => p.contract === 'Prestación de servicios')
  const diasRestantes = c.end ? daysBetween(new Date(), c.end) : null
  const totalDias = c.end ? daysBetween(c.start, c.end) : 1
  const transcurridos = daysBetween(c.start, new Date())
  const pct = Math.min(100, Math.round((transcurridos / totalDias) * 100))

  return (
    <div className="page">
      <PageHeader title={`Hola, ${user.name.split(' ')[0]}`} subtitle="Resumen de tu contrato de prestación de servicios." />

      {diasRestantes != null && diasRestantes < 30 && (
        <AlertBanner variant="warning" title="Contrato próximo a vencer">
          Tu contrato finaliza en {diasRestantes} días ({formatDate(c.end)}). Coordina la renovación con tu supervisor.
        </AlertBanner>
      )}

      <div className="grid grid-kpi stagger" style={{ margin: '18px 0' }}>
        <KpiCard label="Objeto del contrato" value={c.position} icon={Briefcase} accent="violet" />
        <KpiCard label="Honorarios mensuales" value={formatCOP(c.salary)} icon={Wallet} accent="success" />
        <KpiCard label="Vigencia hasta" value={c.end ? formatDate(c.end) : 'Indefinido'} icon={CalendarClock} accent="warning" />
        <KpiCard label="Días restantes" value={diasRestantes != null ? `${diasRestantes}` : '—'} icon={AlertTriangle} accent="cyan" />
      </div>

      <div className="grid grid-2">
        <Card title="Avance del contrato" subtitle={`${pct}% del periodo transcurrido`}>
          <ProgressBar value={pct} />
          <div className="col" style={{ marginTop: 14 }}>
            <div className="stat-row"><span className="muted">Inicio</span><b>{formatDate(c.start)}</b></div>
            <div className="stat-row"><span className="muted">Fin</span><b>{c.end ? formatDate(c.end) : '—'}</b></div>
            <div className="stat-row"><span className="muted">Estado</span><Badge variant="success" dot>{c.state}</Badge></div>
          </div>
        </Card>
        <Card title="Acciones" subtitle="Autoservicio del contratista">
          <div className="col gap-2">
            <Button variant="primary" icon={FileText} className="full" onClick={() => navigate('/contratista/documentos')}>Mis documentos</Button>
            <Button variant="ghost" icon={Briefcase} className="full" onClick={() => navigate('/contratista/contrato')}>Ver mi contrato</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
