import { Download, FileSignature } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { PERSONNEL } from '../../data/mockPersonnel.js'
import { generateLaborCertificate } from '../../utils/pdf.js'

export default function EmployeeCertificates() {
  const { user } = useAuth()
  const emp = PERSONNEL.find((p) => p.id === user.employeeId) || PERSONNEL[0]

  return (
    <div className="page">
      <PageHeader title="Certificados" subtitle="Genera y descarga tus certificados al instante." />
      <div className="grid grid-2">
        <Card title="Certificado laboral" subtitle="Con datos de tu contrato vigente" className="anim-up">
          <AlertBanner variant="info">El certificado se genera con tu información actual y la fecha de hoy.</AlertBanner>
          <div className="row" style={{ marginTop: 16 }}>
            <Button variant="primary" icon={Download} onClick={() => generateLaborCertificate(emp)}>Descargar certificado laboral</Button>
          </div>
        </Card>
        <Card title="Otros certificados" subtitle="Disponibles bajo solicitud" className="anim-up">
          <div className="col gap-2">
            <Button variant="ghost" icon={FileSignature} className="full" disabled>Certificado de ingresos y retenciones</Button>
            <Button variant="ghost" icon={FileSignature} className="full" disabled>Constancia de afiliación</Button>
            <p className="card-sub">Estas opciones estarán disponibles al integrar la nómina y la DIAN.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
