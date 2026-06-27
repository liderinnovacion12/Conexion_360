import { useNavigate } from 'react-router-dom'
import { BadgeCheck, FileText, CalendarClock, Wallet, Download } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card, KpiCard } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { PERSONNEL } from '../../data/mockPersonnel.js'
import { formatCOP, formatDate } from '../../utils/format.js'
import { generateLaborCertificate } from '../../utils/pdf.js'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const emp = PERSONNEL.find((p) => p.id === user.employeeId) || PERSONNEL[0]

  return (
    <div className="page">
      <PageHeader title={`Bienvenido(a), ${user.name.split(' ')[0]}`} subtitle="Tu información laboral y autoservicio." />

      <div className="grid grid-kpi stagger" style={{ marginBottom: 18 }}>
        <KpiCard label="Cargo" value={emp.position} icon={BadgeCheck} accent="teal" />
        <KpiCard label="Tipo de contrato" value={emp.contract} icon={FileText} accent="violet" />
        <KpiCard label="Asignación mensual" value={formatCOP(emp.salary)} icon={Wallet} accent="success" />
        <KpiCard label="Antigüedad desde" value={formatDate(emp.start)} icon={CalendarClock} accent="cyan" />
      </div>

      <div className="grid grid-2">
        <Card title="Mi información laboral">
          <div className="col">
            <div className="stat-row"><span className="muted">Documento</span><b>{emp.doc}</b></div>
            <div className="stat-row"><span className="muted">Área</span><b>{emp.area}</b></div>
            <div className="stat-row"><span className="muted">Estado de nómina</span><Badge variant="success" dot>{emp.state}</Badge></div>
            <div className="stat-row"><span className="muted">Fecha de inicio</span><b>{formatDate(emp.start)}</b></div>
          </div>
        </Card>
        <Card title="Autoservicio" subtitle="Acciones disponibles">
          <div className="col gap-2">
            <Button variant="primary" icon={Download} className="full" onClick={() => generateLaborCertificate(emp)}>Descargar certificado laboral</Button>
            <Button variant="ghost" icon={FileText} className="full" onClick={() => navigate('/personal/documentos')}>Ver mis documentos</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
