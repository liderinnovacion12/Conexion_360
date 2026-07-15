import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { useAuditLogs } from '../../hooks/useAuditLogs.js'
import { formatDateTime } from '../../utils/format.js'
import { exportToCSV } from '../../utils/pdf.js'

export default function AuditLogs({ readOnly }) {
  const { logs: AUDIT_LOGS } = useAuditLogs()
  const columns = [
    { key: 'actor', header: 'Usuario', strong: true },
    { key: 'role', header: 'Rol', render: (r) => <Badge variant="neutral">{r.role}</Badge> },
    { key: 'action', header: 'Acción' },
    { key: 'target', header: 'Objeto', render: (r) => <span className="muted">{r.target}</span> },
    { key: 'ts', header: 'Fecha', sortValue: (r) => new Date(r.ts).getTime(), render: (r) => formatDateTime(r.ts) },
    { key: 'ip', header: 'IP', render: (r) => <span className="dim">{r.ip}</span> },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Registros de auditoría"
        subtitle={readOnly ? 'Trazabilidad de acciones (solo lectura).' : 'Quién hizo qué, cuándo y desde dónde.'}
      />
      <Card className="anim-up">
        <DataTable
          columns={columns}
          data={AUDIT_LOGS}
          searchKeys={['actor', 'action', 'target', 'role']}
          pageSize={10}
          onExport={() =>
            exportToCSV('auditoria_conexion360.csv', AUDIT_LOGS, [
              { key: 'actor', label: 'Usuario' },
              { key: 'role', label: 'Rol' },
              { key: 'action', label: 'Acción' },
              { key: 'target', label: 'Objeto' },
              { key: 'ts', label: 'Fecha' },
              { key: 'ip', label: 'IP' },
            ])
          }
        />
      </Card>
    </div>
  )
}
