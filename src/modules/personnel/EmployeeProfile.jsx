import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input } from '../../components/ui/Form.jsx'
import Button from '../../components/ui/Button.jsx'
import { Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { usePersonnel } from '../../hooks/usePersonnel.js'
import { formatCOP, formatDate } from '../../utils/format.js'

export default function EmployeeProfile() {
  const { user } = useAuth()
  const { personnel } = usePersonnel()
  const emp = personnel.find((p) => p.id === user.employeeId) || personnel[0]
  if (!emp) return null

  return (
    <div className="page">
      <PageHeader title="Mi información" subtitle="Datos personales y contractuales." />
      <div className="grid grid-2">
        <Card title="Datos de contacto" subtitle="Editables" className="anim-up">
          <div className="col gap-3">
            <Field label="Nombre completo"><Input defaultValue={emp.name} /></Field>
            <Field label="Correo"><Input defaultValue={user.email} /></Field>
            <Field label="Teléfono"><Input defaultValue="300 123 4567" /></Field>
            <Field label="Dirección"><Input defaultValue="Cra 10 # 20-30, Bogotá" /></Field>
            <div className="row" style={{ justifyContent: 'flex-end' }}><Button variant="primary" icon={Save}>Guardar</Button></div>
          </div>
        </Card>
        <Card title="Datos contractuales" subtitle="Solo lectura" className="anim-up">
          <div className="col">
            <div className="stat-row"><span className="muted">Documento</span><b>{emp.doc}</b></div>
            <div className="stat-row"><span className="muted">Cargo</span><b>{emp.position}</b></div>
            <div className="stat-row"><span className="muted">Área</span><b>{emp.area}</b></div>
            <div className="stat-row"><span className="muted">Contrato</span><Badge variant="neutral">{emp.contract}</Badge></div>
            <div className="stat-row"><span className="muted">Salario</span><b>{formatCOP(emp.salary)}</b></div>
            <div className="stat-row"><span className="muted">Inicio</span><b>{formatDate(emp.start)}</b></div>
            <div className="stat-row"><span className="muted">Estado</span><Badge variant="success" dot>{emp.state}</Badge></div>
          </div>
        </Card>
      </div>
    </div>
  )
}
