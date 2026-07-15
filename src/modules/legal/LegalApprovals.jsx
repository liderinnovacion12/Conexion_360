import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import ApprovalQueue from '../../components/feature/ApprovalQueue.jsx'
import { useContracts } from '../../hooks/useContracts.js'

export default function LegalApprovals() {
  const { contracts, updateContractStatus } = useContracts()

  const handleApproved = async (item) => {
    await updateContractStatus(item.refId, 'aprobado')
  }

  const renderPreview = (item) => {
    const contract = contracts.find((c) => c.id === item.refId)
    if (!contract) return null
    return (
      <div className="glass-soft" style={{ padding: 14, maxHeight: 260, overflow: 'auto' }}>
        <div dangerouslySetInnerHTML={{ __html: contract.content }} style={{ fontSize: '0.85rem' }} />
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Aprobaciones"
        subtitle="Contratos pendientes de tu aprobación como líder del área jurídica."
      />
      <Card className="anim-up">
        <ApprovalQueue domain="contract" renderPreview={renderPreview} onApproved={handleApproved} />
      </Card>
    </div>
  )
}
