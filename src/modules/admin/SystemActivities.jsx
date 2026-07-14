import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import ActivityLog from '../../components/feature/ActivityLog.jsx'

// Panel de supervisión del Administrador: TODA la actividad de firma del
// sistema (documentos y contratos), sin importar quién la envió. Distinto
// del panel "Mis actividades" (que solo muestra lo propio).
export default function SystemActivities() {
  return (
    <div className="page">
      <PageHeader
        title="Actividades del sistema"
        subtitle="Todo lo que se ha enviado a firma en la plataforma, de cualquier área y persona."
      />
      <Card className="anim-up">
        <ActivityLog scope="all" />
      </Card>
    </div>
  )
}
