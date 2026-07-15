import { Briefcase, Download } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { usePersonnel } from '../../hooks/usePersonnel.js'
import { formatCOP, formatDate } from '../../utils/format.js'

// Autoservicio de contrato para CUALQUIER tipo de vinculación (indefinido,
// fijo, obra labor o prestación de servicios) — antes existía solo para el
// rol Contratista; ahora vive junto al resto del autoservicio de Personal
// Activo, ya que es el mismo tipo de información para cualquier persona.
export default function MyContract() {
  const { user } = useAuth()
  const { personnel } = usePersonnel()
  const c = personnel.find((p) => p.id === user.employeeId) || personnel[0]
  if (!c) return null

  return (
    <div className="page">
      <PageHeader title="Mi contrato" subtitle="Detalle de tu vinculación laboral." />
      <Card className="anim-up" style={{ maxWidth: 720 }}>
        <div className="row gap-2" style={{ marginBottom: 14 }}>
          <div className="kpi-icon" style={{ margin: 0, width: 40, height: 40, '--kpi-icon-bg': 'var(--grad-violet)' }}><Briefcase size={18} /></div>
          <div>
            <div className="card-title">Contrato — {c.contract}</div>
            <div className="card-sub">N.° CTA-2024-{c.id.replace('p-', '')}</div>
          </div>
        </div>
        <div className="col">
          <div className="stat-row"><span className="muted">Nombre</span><b>{c.name}</b></div>
          <div className="stat-row"><span className="muted">Documento</span><b>{c.doc}</b></div>
          <div className="stat-row"><span className="muted">Cargo</span><b>{c.position}</b></div>
          <div className="stat-row"><span className="muted">Área</span><b>{c.area}</b></div>
          <div className="stat-row"><span className="muted">Asignación / honorarios</span><b>{formatCOP(c.salary)}</b></div>
          <div className="stat-row"><span className="muted">Inicio</span><b>{formatDate(c.start)}</b></div>
          <div className="stat-row"><span className="muted">Fin</span><b>{c.end ? formatDate(c.end) : 'Indefinido'}</b></div>
          <div className="stat-row"><span className="muted">Estado</span><Badge variant="success" dot>{c.state}</Badge></div>
        </div>
        <div className="divider" />
        <Button variant="primary" icon={Download}>Descargar contrato (PDF)</Button>
      </Card>
    </div>
  )
}
