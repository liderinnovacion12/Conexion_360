import { useState } from 'react'
import { Upload, FileText, MessageSquare, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import FileDropzone from '../../components/feature/FileDropzone.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { DOCUMENT_TYPES } from '../../data/mockDocuments.js'
import { useCandidates } from '../../hooks/useCandidates.js'
import { useDocuments } from '../../hooks/useDocuments.js'
import { useFormTemplates } from '../../hooks/useFormTemplates.js'
import { useCandidateGroups } from '../../hooks/useCandidateGroups.js'
import { resolveRequiredFields } from '../../utils/formTemplates.js'
import { docStatusVariant, formatDateTime } from '../../utils/format.js'

export default function CandidateDocuments() {
  const { user } = useAuth()
  const cid = user.candidateId
  const { candidates } = useCandidates()
  const candidate = candidates.find((c) => c.id === cid)
  const { templates } = useFormTemplates()
  const { groupsForCandidate } = useCandidateGroups()
  const { documents: docs, uploadDocument } = useDocuments(cid)
  const [upFor, setUpFor] = useState(null)
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Documentos requeridos según la plantilla vigente para la vía y los
  // grupos del aspirante (en vez de la lista fija anterior).
  const groupIds = candidate ? groupsForCandidate(candidate.id).map((g) => g.id) : []
  const documentFields = resolveRequiredFields(candidate?.track, groupIds, templates, DOCUMENT_TYPES).filter(
    (f) => f.type === 'document' || !f.type
  )

  const rows = documentFields.map((t) => {
    const existing = docs.find((d) => d.type === t.label)
    return { ...t, doc: existing }
  })

  const submitUpload = async () => {
    if (!file || !upFor) return
    setSubmitting(true)
    try {
      await uploadDocument({
        candidateId: cid,
        type: upFor.label,
        required: upFor.required,
        visibility: 'ambos',
        uploadedByName: user.name,
        file,
        existingVersion: upFor.doc?.version || 0,
      })
      setUpFor(null)
      setFile(null)
    } catch (err) {
      // El AlertBanner de arriba explica el requisito; si falla la subida
      // (ej. sin conexión), dejamos el modal abierto para reintentar.
      alert(err.message || 'No se pudo cargar el documento. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <PageHeader title="Mis documentos" subtitle="Carga tus documentos en PDF. Solo se aceptan archivos PDF." />

      <AlertBanner variant="info" title="Importante">
        Los documentos marcados como <b>requeridos</b> son obligatorios para avanzar en el proceso. Si un documento es
        devuelto, revisa el comentario y vuelve a cargarlo.
      </AlertBanner>

      <div className="grid grid-2 stagger" style={{ marginTop: 18 }}>
        {rows.map((r) => (
          <Card key={r.key}>
            <div className="row between" style={{ marginBottom: 8 }}>
              <div className="row gap-2">
                <div className="file-pill" style={{ margin: 0, padding: 8 }}>
                  <div className="fic"><FileText size={16} /></div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.label}</div>
                  <Badge variant={r.required ? 'violet' : 'neutral'}>{r.required ? 'Requerido' : 'Opcional'}</Badge>
                </div>
              </div>
              {r.doc ? (
                <Badge variant={docStatusVariant[r.doc.status]} dot>{r.doc.status}</Badge>
              ) : (
                <Badge variant="neutral" dot>sin cargar</Badge>
              )}
            </div>

            {r.doc?.uploadedAt && <div className="card-sub">Cargado: {formatDateTime(r.doc.uploadedAt)} · v{r.doc.version}</div>}

            {r.doc?.comment && ['devuelto', 'rechazado'].includes(r.doc.status) && (
              <div className="alert alert--warning" style={{ marginTop: 10, padding: '10px 12px' }}>
                <MessageSquare />
                <div><b>Comentario del revisor:</b><br />{r.doc.comment}</div>
              </div>
            )}

            <div className="row gap-2" style={{ marginTop: 12 }}>
              <Button
                size="sm"
                variant={r.doc && r.doc.status === 'aprobado' ? 'ghost' : 'primary'}
                icon={r.doc && r.doc.status === 'aprobado' ? CheckCircle2 : Upload}
                disabled={r.doc?.status === 'aprobado'}
                onClick={() => { setUpFor(r); setFile(null) }}
              >
                {r.doc?.status === 'aprobado' ? 'Aprobado' : r.doc ? 'Volver a cargar' : 'Cargar PDF'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={!!upFor}
        onClose={() => setUpFor(null)}
        title={`Cargar: ${upFor?.label || ''}`}
        footer={<><Button variant="ghost" onClick={() => setUpFor(null)}>Cancelar</Button><Button variant="primary" disabled={!file || submitting} onClick={submitUpload}>{submitting ? 'Subiendo…' : 'Enviar documento'}</Button></>}
      >
        <FileDropzone onFile={setFile} />
      </Modal>
    </div>
  )
}
