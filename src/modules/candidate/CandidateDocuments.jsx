import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Upload, FileText, MessageSquare, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import FileDropzone from '../../components/feature/FileDropzone.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { DOCUMENT_TYPES, REQUIRED_DOC_KEYS } from '../../data/mockDocuments.js'
import { useCandidates } from '../../hooks/useCandidates.js'
import { useDocuments } from '../../hooks/useDocuments.js'
import { useFormTemplates } from '../../hooks/useFormTemplates.js'
import { useCandidateGroups } from '../../hooks/useCandidateGroups.js'
import { resolveRequiredFields } from '../../utils/formTemplates.js'
import { docStatusVariant, formatDateTime } from '../../utils/format.js'

const REQUIRED_PROFILE_FIELDS = ['name', 'doc', 'birth', 'address', 'city', 'dept', 'phone', 'email']

function profileComplete(candidate) {
  if (!candidate) return false
  return REQUIRED_PROFILE_FIELDS.every((f) => candidate[f] && String(candidate[f]).trim() !== '')
}

function authorizationSigned(candidate) {
  return !!candidate?.dataAuthorizationSignedAt
}

function requiredDocsUploaded(docs) {
  return REQUIRED_DOC_KEYS.every((label) =>
    docs.some((d) => d.type === label && !['devuelto', 'rechazado'].includes(d.status))
  )
}

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
  const myGroups = candidate ? groupsForCandidate(candidate.id) : []
  const groupIds = myGroups.map((g) => g.id)
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

  const hasProfile = profileComplete(candidate)
  const hasAuth = authorizationSigned(candidate)
  const hasGroup = myGroups.length > 0
  const canUpload = hasProfile && hasAuth && hasGroup
  const allRequiredUploaded = requiredDocsUploaded(docs)

  return (
    <div className="page">
      <PageHeader title="Mis documentos" subtitle="Carga tus documentos en PDF. Solo se aceptan archivos PDF." />

      {!hasProfile && (
        <AlertBanner variant="warning" title="Completa tus datos personales primero">
          Debes llenar todos los campos obligatorios en{' '}
          <Link to="/aspirante/perfil" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>
            Mis datos personales
          </Link>{' '}
          antes de poder cargar documentos.
        </AlertBanner>
      )}

      {hasProfile && hasAuth && !hasGroup && (
        <AlertBanner variant="warning" title="Aún no estás asignado a un grupo">
          Un reclutador debe asignarte a un grupo de aspirantes antes de que puedas cargar documentos. Contacta al área de Reclutamiento.
        </AlertBanner>
      )}

      {hasProfile && !hasAuth && (
        <AlertBanner variant="warning" title="Firma la autorización de datos primero">
          Debes aceptar y firmar la{' '}
          <Link to="/aspirante/autorizacion" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>
            Autorización de tratamiento de datos
          </Link>{' '}
          antes de poder cargar documentos.
        </AlertBanner>
      )}

      {canUpload && !allRequiredUploaded && (
        <AlertBanner variant="info" title="Documentos requeridos pendientes">
          Debes cargar: <b>Hoja de vida actualizada</b>, <b>Documento de identidad</b>, <b>Certificados académicos</b>{' '}
          y <b>Certificados laborales</b> para que tu proceso pueda avanzar.
        </AlertBanner>
      )}

      {canUpload && allRequiredUploaded && (
        <AlertBanner variant="success" title="Documentos requeridos completos">
          Todos los documentos obligatorios están cargados. Tu proceso puede avanzar.
        </AlertBanner>
      )}

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
                disabled={!canUpload || r.doc?.status === 'aprobado'}
                onClick={() => { if (canUpload) { setUpFor(r); setFile(null) } }}
                title={!canUpload ? 'Completa tus datos personales primero' : undefined}
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
