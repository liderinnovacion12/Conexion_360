import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { DOCUMENTS } from '../../data/mockDocuments.js'
import { CANDIDATES } from '../../data/mockCandidates.js'
import { docStatusVariant, formatDate } from '../../utils/format.js'
import { exportToCSV } from '../../utils/pdf.js'

const candName = (id) => CANDIDATES.find((c) => c.id === id)?.name || id

export default function Compliance() {
  const columns = [
    { key: 'type', header: 'Documento', strong: true },
    { key: 'candidateId', header: 'Titular', render: (d) => candName(d.candidateId) },
    { key: 'required', header: 'Clasificación', render: (d) => <Badge variant={d.required ? 'violet' : 'neutral'}>{d.required ? 'Requerido' : 'Opcional'}</Badge> },
    { key: 'status', header: 'Estado', render: (d) => <Badge variant={docStatusVariant[d.status]} dot>{d.status}</Badge> },
    { key: 'expires', header: 'Vence', render: (d) => (d.expires ? formatDate(d.expires) : '—') },
    { key: 'reviewedBy', header: 'Revisó', render: (d) => d.reviewedBy || '—' },
  ]

  return (
    <div className="page">
      <PageHeader title="Cumplimiento documental" subtitle="Estado de los documentos y vencimientos (solo lectura)." />
      <Card className="anim-up">
        <DataTable
          columns={columns}
          data={DOCUMENTS}
          searchKeys={['type', 'status']}
          pageSize={10}
          onExport={() =>
            exportToCSV('cumplimiento_documental.csv', DOCUMENTS, [
              { key: 'type', label: 'Documento' },
              { key: 'candidateId', label: 'Titular', value: (d) => candName(d.candidateId) },
              { key: 'status', label: 'Estado' },
              { key: 'expires', label: 'Vence' },
              { key: 'reviewedBy', label: 'Revisó' },
            ])
          }
        />
      </Card>
    </div>
  )
}
