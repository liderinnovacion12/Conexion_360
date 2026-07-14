import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import ActivityLog from '../../components/feature/ActivityLog.jsx'

// "Mis actividades": lo que YO he enviado a firma o aprobación (documentos
// y contratos), con su estado y avance. Disponible en toda área que genera
// documentos (Admin, Financiera, Jurídica, Reclutamiento).
export default function Activities() {
  return (
    <div className="page">
      <PageHeader
        title="Mis actividades"
        subtitle="Documentos y contratos que has enviado a firma, con su estado y avance."
      />
      <Card className="anim-up">
        <ActivityLog scope="mine" />
      </Card>
    </div>
  )
}
