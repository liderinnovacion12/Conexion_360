import { FileSignature, Clock, CheckCircle2, XCircle } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card, KpiCard } from '../../components/ui/Card.jsx'
import { DonutChart } from '../../components/charts/Charts.jsx'
import { AlertBanner, EmptyState } from '../../components/ui/Feedback.jsx'
import { useContracts } from '../../hooks/useContracts.js'

export default function LegalDashboard() {
  const { contracts } = useContracts()

  const pendientes = contracts.filter((c) => c.status === 'pendiente').length
  const aprobados = contracts.filter((c) => c.status === 'aprobado').length
  const rechazados = contracts.filter((c) => c.status === 'rechazado').length

  const byCategory = Object.entries(
    contracts.reduce((acc, c) => {
      acc[c.templateName] = (acc[c.templateName] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  return (
    <div className="page">
      <PageHeader title="Tablero Jurídica" subtitle="Contratos, plantillas y control de aprobaciones." />

      <div className="grid grid-kpi stagger" style={{ marginBottom: 18 }}>
        <KpiCard label="Contratos emitidos" value={contracts.length} icon={FileSignature} accent="violet" />
        <KpiCard label="Pendientes de aprobación" value={pendientes} icon={Clock} accent="warning" />
        <KpiCard label="Aprobados" value={aprobados} icon={CheckCircle2} accent="success" />
        <KpiCard label="Rechazados" value={rechazados} icon={XCircle} accent="teal" />
      </div>

      {contracts.length === 0 ? (
        <Card>
          <EmptyState icon={FileSignature} title="Aún no se han emitido contratos">
            Ve a “Emitir contratos” para generar el primero desde una plantilla.
          </EmptyState>
        </Card>
      ) : (
        <Card title="Contratos por plantilla" subtitle="Distribución de lo emitido">
          <DonutChart data={byCategory} />
        </Card>
      )}

      <div style={{ marginTop: 18 }}>
        <AlertBanner variant="info">
          Cada contrato requiere dos firmas: quien lo emite y quien lo aprueba (con re-confirmación de usuario y contraseña).
        </AlertBanner>
      </div>
    </div>
  )
}
