import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import ApprovalQueue from '../../components/feature/ApprovalQueue.jsx'
import { useContracts } from '../../hooks/useContracts.js'
import { updateContractStatus } from '../../services/api.js'

// Página para que el aspirante o empleado firme el contrato que le enviaron
export default function ContractToSign() {
  const { contracts } = useContracts()

  const handleApproved = async (item) => {
    await updateContractStatus(item.refId, 'aprobado')
  }

  const renderPreview = (item) => {
    const contract = contracts.find((c) => c.id === item.refId)
    if (!contract) return null
    return (
      <div className="glass-soft" style={{ padding: 14, maxHeight: 280, overflow: 'auto' }}>
        <b style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem' }}>{contract.templateName}</b>
        <div className="card-sub" style={{ marginBottom: 8 }}>{contract.personName} · {contract.personDoc}</div>
        <div dangerouslySetInnerHTML={{ __html: contract.content }} style={{ fontSize: '0.85rem' }} />
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Contrato por firmar"
        subtitle="Revisa el contrato que te enviaron y firma electrónicamente para continuar el proceso."
      />
      <Card className="anim-up">
        <ApprovalQueue
          domain="contract"
          renderPreview={renderPreview}
          onApproved={handleApproved}
          allowSign
          rejectLabel="Rechazar contrato"
          rejectConfirmMessage="¿Estás seguro de que quieres rechazar el contrato? Esto notificará al área jurídica."
        />
      </Card>
    </div>
  )
}
