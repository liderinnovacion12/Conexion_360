import { ClipboardList } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { EmptyState } from '../../components/ui/Feedback.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useServiceRequests } from '../../hooks/useServiceRequests.js'
import { formatDateTime } from '../../utils/format.js'

const STATUS_VARIANT = { pendiente: 'warning', 'en gestión': 'info', atendida: 'success', cerrada: 'neutral' }

export default function MyRequests() {
  const { user } = useAuth()
  const { listMine } = useServiceRequests()
  const requests = listMine(user.id)

  const columns = [
    { key: 'serviceName', header: 'Servicio', strong: true },
    { key: 'createdAt', header: 'Enviada', sortValue: (r) => new Date(r.createdAt).getTime(), render: (r) => formatDateTime(r.createdAt) },
    { key: 'status', header: 'Estado', render: (r) => <Badge variant={STATUS_VARIANT[r.status]} dot>{r.status}</Badge> },
    { key: 'message', header: 'Tu mensaje', render: (r) => r.message || <span className="dim">—</span> },
  ]

  return (
    <div className="page">
      <PageHeader title="Mis solicitudes" subtitle="Servicios que has solicitado y su estado." />
      <Card className="anim-up">
        {requests.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Aún no has solicitado ningún servicio">
            Ve a <b>Servicios</b> y elige el que necesites para tu empresa.
          </EmptyState>
        ) : (
          <DataTable columns={columns} data={requests} searchKeys={['serviceName']} pageSize={8} />
        )}
      </Card>
    </div>
  )
}
