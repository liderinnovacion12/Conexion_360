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
import { DOCUMENTS, DOCUMENT_TYPES } from '../../data/mockDocuments.js'
import { docStatusVariant, formatDateTime } from '../../utils/format.js'

export default function CandidateDocuments() {
  const { user } = useAuth()
  const cid = user.candidateId
  const [docs, setDocs] = useState(DOCUMENTS.filter((d) => d.candidateId === cid))
  const [upFor, setUpFor] = useState(null)
  const [file, setFile] = useState(null)

  // Une los tipos requeridos con lo ya cargado.
  const rows = DOCUMENT_TYPES.map((t) => {
    const existing = docs.find((d) => d.type === t.label)
    return { ...t, doc: existing }
  })

  const submitUpload = () => {
    if (!file) return
    const label = upFor.label
    setDocs((ds) => {
      const idx = ds.findIndex((d) => d.type === label)
      const base = {
        id: `d-${Date.now()}`, candidateId: cid, type: label, status: 'pendiente',
        required: upFor.required, visibility: 'ambos', uploadedBy: user.name,
        uploadedAt: new Date().toISOString(), reviewedBy: null, reviewedAt: null,
        comment: '', version: 1, expires: null, file: file.name,
      }
      if (idx >= 0) {
        const copy = [...ds]
        copy[idx] = { ...copy[idx], status: 'pendiente', file: file.name, uploadedAt: new Date().toISOString(), version: copy[idx].version + 1, comment: '' }
        return copy
      }
      return [...ds, base]
    })
    setUpFor(null)
    setFile(null)
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
        footer={<><Button variant="ghost" onClick={() => setUpFor(null)}>Cancelar</Button><Button variant="primary" disabled={!file} onClick={submitUpload}>Enviar documento</Button></>}
      >
        <FileDropzone onFile={setFile} />
      </Modal>
    </div>
  )
}
