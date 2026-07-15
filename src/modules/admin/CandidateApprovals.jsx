import { useEffect, useState } from 'react'
import { FileText, Download } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import ApprovalQueue from '../../components/feature/ApprovalQueue.jsx'
import { useCandidates } from '../../hooks/useCandidates.js'
import { useDocuments } from '../../hooks/useDocuments.js'
import { stageLabel } from '../../data/pipeline.js'
import { STATUS_VARIANT } from '../../data/mockCandidates.js'
import { docStatusVariant } from '../../utils/format.js'
import { USE_SUPABASE, notifyUser, notifyRole } from '../../services/api.js'
import { getSignedDocumentUrl } from '../../services/supabaseClient.js'

// Aprobación FINAL del aspirante (no de un documento suyo). Reclutamiento
// ya lo preaprobó y firmó; aquí el Administrador da el visto bueno de
// cierre — o lo devuelve a Reclutamiento con un comentario si algo no
// está en orden. Al aprobar, el aspirante queda "aprobado" y recibe un
// correo real confirmándole que su proceso fue aprobado.
export default function CandidateApprovals() {
  const { candidates, updateCandidate } = useCandidates()
  const { documents } = useDocuments()
  const handleApproved = async (item) => {
    const candidate = candidates.find((c) => c.id === item.refId)
    if (candidate) {
      await updateCandidate(candidate.id, { status: 'aprobado' })
      if (USE_SUPABASE && candidate.id) {
        try {
          await notifyUser(candidate.id, {
            title: '¡Tu proceso fue aprobado!',
            body: 'El Administrador aprobó tu proceso en Conexión 360. Ingresa a tu perfil para ver los próximos pasos.',
            link: '/aspirante',
            color: '#19C7A0',
          })
        } catch {
          // No es crítico si falla la notificación
        }
      }
    }
  }

  const handleRejected = async (item, comment) => {
    const candidate = candidates.find((c) => c.id === item.refId)
    if (!USE_SUPABASE) return
    try {
      await notifyRole('recruitment', {
        title: 'Aspirante devuelto por Administración',
        body: `${candidate?.name || item.title} fue devuelto${comment ? `: "${comment}"` : '.'} Corrige y vuelve a enviarlo.`,
        link: '/reclutamiento/aspirantes',
        color: '#FF8FB1',
      })
    } catch {
      // No es crítico si falla el aviso: el estado "rechazado" en la
      // bandeja de Reclutamiento ya refleja la devolución.
    }
  }

  const renderPreview = (item) => {
    const candidate = candidates.find((c) => c.id === item.refId)
    if (!candidate) return null
    const candidateDocs = documents.filter((d) => d.candidateId === candidate.id)
    return (
      <div className="col gap-3">
        <div className="glass-soft" style={{ padding: 14 }}>
          <div className="stat-row"><span className="muted">Aspirante</span><b>{candidate.name}</b></div>
          <div className="stat-row"><span className="muted">Documento</span><b>{candidate.doc || '—'}</b></div>
          <div className="stat-row"><span className="muted">Correo</span><b>{candidate.email || '—'}</b></div>
          <div className="stat-row"><span className="muted">Cargo</span><b>{candidate.position || '—'}</b></div>
          <div className="stat-row"><span className="muted">Etapa</span><Badge variant="info">{stageLabel(candidate.stage)}</Badge></div>
          <div className="stat-row"><span className="muted">Estado actual</span><Badge variant={STATUS_VARIANT[candidate.status]} dot>{candidate.status}</Badge></div>
        </div>
        <div>
          <div className="card-sub" style={{ marginBottom: 8 }}>Documentación</div>
          {candidateDocs.length === 0 ? (
            <AlertBanner variant="info">Este aspirante no ha cargado documentos todavía.</AlertBanner>
          ) : (
            <div className="col gap-2">
              {candidateDocs.map((d) => (
                <DocumentRow key={d.id} doc={d} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Aprobación final de aspirantes"
        subtitle="Aspirantes preaprobados por Reclutamiento, pendientes de tu firma final. Al aprobar, el aspirante recibe una notificación en su perfil."
      />
      <Card className="anim-up">
        <ApprovalQueue
          domain="candidate"
          renderPreview={renderPreview}
          onApproved={handleApproved}
          onRejected={handleRejected}
          rejectLabel="Devolver a reclutamiento"
          rejectConfirmMessage="¿Seguro que quieres devolver este aspirante a Reclutamiento? Deja un comentario explicando qué falta o corregir; Reclutamiento podrá volver a enviarlo."
        />
      </Card>
    </div>
  )
}

// Fila de un documento del aspirante con enlace de ver/descargar (URL
// firmada temporal de Storage), igual que en Revisión documental.
function DocumentRow({ doc }) {
  const [url, setUrl] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setUrl(null)
    setError(null)
    if (USE_SUPABASE && doc.file) {
      getSignedDocumentUrl(doc.file).then(setUrl).catch((err) => setError(err.message))
    }
  }, [doc.id, doc.file])

  return (
    <div className="glass-soft" style={{ padding: 12 }}>
      <div className="row between" style={{ alignItems: 'center' }}>
        <span className="row gap-2">
          <FileText size={16} className="dim" />
          <span>{doc.type}</span>
        </span>
        <Badge variant={docStatusVariant[doc.status]} dot>{doc.status}</Badge>
      </div>
      <div className="row between" style={{ marginTop: 8, alignItems: 'center' }}>
        {error ? (
          <span className="card-sub">No se pudo generar el enlace: {error}</span>
        ) : USE_SUPABASE ? (
          url ? (
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost" icon={Download}>Ver / descargar</Button>
            </a>
          ) : (
            <span className="card-sub">Generando enlace…</span>
          )
        ) : (
          <span className="card-sub">{doc.file}</span>
        )}
      </div>
    </div>
  )
}
