import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import ApprovalQueue from '../../components/feature/ApprovalQueue.jsx'
import { useGeneratedDocuments } from '../../hooks/useGeneratedDocuments.js'

// Bandeja compartida por todas las áreas con generación de documentos
// (Admin, Financiera, Jurídica, Reclutamiento): documentos enviados "de
// área en área" que están pendientes de tu firma.
export default function DocumentApprovals() {
  const { documents, updateDocumentStatus } = useGeneratedDocuments()

  const handleApproved = async (item) => {
    await updateDocumentStatus(item.refId, 'aprobado')
  }

  const renderPreview = (item) => {
    const doc = documents.find((d) => d.id === item.refId)
    if (!doc) return null
    return (
      <div className="glass-soft" style={{ padding: 14, maxHeight: 260, overflow: 'auto' }}>
        <b style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem' }}>{doc.title}</b>
        <div dangerouslySetInnerHTML={{ __html: doc.content }} style={{ fontSize: '0.85rem' }} />
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Documentos por firmar"
        subtitle="Documentos enviados de área en área que llegaron a tu turno de firma."
      />
      <Card className="anim-up">
        <ApprovalQueue domain="document" renderPreview={renderPreview} onApproved={handleApproved} />
      </Card>
    </div>
  )
}
