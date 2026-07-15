import { useState, useEffect } from 'react'
import { FileSignature, Download, Eye } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Select } from '../../components/ui/Form.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { usePersonnel } from '../../hooks/usePersonnel.js'
import { formatCOP, formatDate } from '../../utils/format.js'
import { generateLaborCertificate } from '../../utils/pdf.js'

export default function Certificates() {
  const { personnel: PERSONNEL } = usePersonnel()
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!selected && PERSONNEL.length) setSelected(PERSONNEL[0].id)
  }, [PERSONNEL, selected])

  const emp = PERSONNEL.find((p) => p.id === selected)
  if (!emp) return null

  return (
    <div className="page">
      <PageHeader title="Certificados laborales" subtitle="Genera certificados en PDF con datos auto-completados." />

      <div className="grid grid-2">
        <Card title="Generador" subtitle="Selecciona el empleado" className="anim-up">
          <Field label="Empleado">
            <Select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              options={PERSONNEL.map((p) => ({ value: p.id, label: `${p.name} · ${p.doc}` }))}
            />
          </Field>
          <div className="divider" />
          <AlertBanner variant="info">
            La plantilla incluye el logo de la empresa, datos contractuales y fecha de emisión automática.
          </AlertBanner>
          <div className="row gap-2" style={{ marginTop: 16 }}>
            <Button variant="primary" icon={Download} onClick={() => generateLaborCertificate(emp)}>
              Descargar certificado PDF
            </Button>
          </div>
        </Card>

        <Card title="Vista previa de datos" subtitle="Campos del certificado" className="anim-up">
          <div className="col">
            <div className="stat-row"><span className="muted">Nombre</span><b>{emp.name}</b></div>
            <div className="stat-row"><span className="muted">Documento</span><b>{emp.doc}</b></div>
            <div className="stat-row"><span className="muted">Cargo</span><b>{emp.position}</b></div>
            <div className="stat-row"><span className="muted">Área</span><b>{emp.area}</b></div>
            <div className="stat-row"><span className="muted">Tipo de contrato</span><Badge variant="neutral">{emp.contract}</Badge></div>
            <div className="stat-row"><span className="muted">Salario</span><b>{formatCOP(emp.salary)}</b></div>
            <div className="stat-row"><span className="muted">Fecha de inicio</span><b>{formatDate(emp.start)}</b></div>
            <div className="stat-row"><span className="muted">Estado</span><Badge variant="success" dot>{emp.state}</Badge></div>
          </div>
          <div className="course-viewer" style={{ aspectRatio: '8.5/4', marginTop: 16 }}>
            <div className="col center gap-2">
              <FileSignature size={30} style={{ color: 'var(--teal)' }} />
              <span className="card-sub">Vista previa del documento PDF</span>
              <Button size="sm" variant="ghost" icon={Eye} onClick={() => generateLaborCertificate(emp)}>Generar para ver</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
