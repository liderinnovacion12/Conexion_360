import { ClipboardList } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Select } from '../../components/ui/Form.jsx'
import { EmptyState } from '../../components/ui/Feedback.jsx'
import { useServiceRequests } from '../../hooks/useServiceRequests.js'
import { SERVICE_REQUEST_STATES } from '../../data/mockServiceRequests.js'
import { formatDateTime } from '../../utils/format.js'

const STATUS_VARIANT = { pendiente: 'warning', 'en gestión': 'info', atendida: 'success', cerrada: 'neutral' }

// Bandeja del Admin para revisar lo que los clientes solicitan desde la
// vitrina de servicios (rol Cliente) y darles seguimiento comercial.
export default function ClientRequests() {
  const { requests, updateStatus } = useServiceRequests()

  const columns = [
    { key: 'company', header: 'Empresa', strong: true },
    { key: 'requestedBy', header: 'Contacto' },
    { key: 'serviceName', header: 'Servicio' },
    { key: 'message', header: 'Mensaje', render: (r) => r.message || <span className="dim">—</span> },
    { key: 'createdAt', header: 'Fecha', sortValue: (r) => new Date(r.createdAt).getTime(), render: (r) => formatDateTime(r.createdAt) },
    {
      key: 'status',
      header: 'Estado',
      sortable: false,
      render: (r) => (
        <div className="row gap-2">
          <Badge variant={STATUS_VARIANT[r.status]} dot>{r.status}</Badge>
          <Select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} options={SERVICE_REQUEST_STATES} style={{ maxWidth: 140 }} />
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader title="Solicitudes de clientes" subtitle="Servicios solicitados desde la vitrina del portal Cliente." />
      <Card className="anim-up">
        {requests.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Aún no hay solicitudes de clientes">
            Aparecerán aquí cuando un cliente pida un servicio desde su portal.
          </EmptyState>
        ) : (
          <DataTable columns={columns} data={requests} searchKeys={['company', 'requestedBy', 'serviceName']} pageSize={8} />
        )}
      </Card>
    </div>
  )
}
