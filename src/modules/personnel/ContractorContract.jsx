import { Briefcase, Download } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { PERSONNEL } from '../../data/mockPersonnel.js'
import { formatCOP, formatDate } from '../../utils/format.js'

export default function ContractorContract() {
  const { user } = useAuth()
  const c = PERSONNEL.find((p) => p.id === user.employeeId) || PERSONNEL.find((p) => p.contract === 'Prestación de servicios')

  return (
    <div className="page">
      <PageHeader title="Mi contrato" subtitle="Detalle de la prestación de servicios." />
      <Card className="anim-up" style={{ maxWidth: 720 }}>
        <div className="row gap-2" style={{ marginBottom: 14 }}>
          <div className="kpi-icon" style={{ margin: 0, width: 40, height: 40, '--kpi-icon-bg': 'var(--grad-violet)' }}><Briefcase size={18} /></div>
          <div>
            <div className="card-title">Contrato de prestación de servicios</div>
            <div className="card-sub">N.° CTA-2024-{c.id.replace('p-', '')}</div>
          </div>
        </div>
        <div className="col">
          <div className="stat-row"><span className="muted">Contratista</span><b>{c.name}</b></div>
          <div className="stat-row"><span className="muted">Documento</span><b>{c.doc}</b></div>
          <div className="stat-row"><span className="muted">Objeto</span><b>{c.position}</b></div>
          <div className="stat-row"><span className="muted">Área</span><b>{c.area}</b></div>
          <div className="stat-row"><span className="muted">Honorarios</span><b>{formatCOP(c.salary)}</b></div>
          <div className="stat-row"><span className="muted">Inicio</span><b>{formatDate(c.start)}</b></div>
          <div className="stat-row"><span className="muted">Fin</span><b>{c.end ? formatDate(c.end) : '—'}</b></div>
          <div className="stat-row"><span className="muted">Estado</span><Badge variant="success" dot>{c.state}</Badge></div>
        </div>
        <div className="divider" />
        <Button variant="primary" icon={Download}>Descargar contrato (PDF)</Button>
      </Card>
    </div>
  )
}
