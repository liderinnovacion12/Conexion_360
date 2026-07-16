import { CheckCircle2, FileText, User, Calendar } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { useContracts } from '../../hooks/useContracts.js'
import { useCandidates } from '../../hooks/useCandidates.js'
import { formatDateTime } from '../../utils/format.js'

export default function RecruitmentApprovals() {
  const { contracts } = useContracts()
  const { candidates } = useCandidates()

  // Solo los contratos que el área jurídica ya aprobó
  const approved = contracts.filter((c) => c.status === 'aprobado')

  const candidateOf = (personId) => candidates.find((c) => c.id === personId)

  return (
    <div className="page">
      <PageHeader
        title="Contratos aprobados"
        subtitle="Aspirantes cuyo contrato fue aprobado por el área jurídica. Solo lectura."
      />

      {approved.length === 0 ? (
        <Card className="anim-up">
          <div className="col center gap-3" style={{ padding: '48px 0' }}>
            <CheckCircle2 size={36} style={{ color: 'var(--text-dim)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Sin aprobaciones aún</div>
              <div className="card-sub">Cuando el área jurídica apruebe un contrato aparecerá aquí.</div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <AlertBanner variant="info" title="Información de solo lectura">
            Estos contratos fueron aprobados por el área jurídica. Para más detalles contacta al equipo jurídico.
          </AlertBanner>

          <div className="col gap-3 anim-up" style={{ marginTop: 16 }}>
            {approved.map((contract) => {
              const candidate = candidateOf(contract.personId)
              return (
                <Card key={contract.id}>
                  <div className="row between" style={{ flexWrap: 'wrap', gap: 12 }}>
                    <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: 'rgba(46,204,113,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CheckCircle2 size={20} style={{ color: '#2ECC71' }} />
                      </div>
                      <div className="col gap-1">
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          {contract.personName || candidate?.name || 'Aspirante'}
                        </div>
                        {(contract.personDoc || candidate?.doc) && (
                          <div className="row gap-1" style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                            <User size={12} />
                            <span>C.C. {contract.personDoc || candidate?.doc}</span>
                          </div>
                        )}
                        {(contract.personArea || contract.templateName) && (
                          <div className="row gap-1" style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                            <FileText size={12} />
                            <span>{contract.templateName || contract.personArea}</span>
                          </div>
                        )}
                        {contract.createdAt && (
                          <div className="row gap-1" style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                            <Calendar size={12} />
                            <span>Aprobado: {formatDateTime(contract.createdAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="success" dot>Aprobado por jurídica</Badge>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
