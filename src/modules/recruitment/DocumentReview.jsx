import { useState } from 'react'
import { CheckCircle2, XCircle, Undo2, FileText, History, Eye } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Textarea } from '../../components/ui/Form.jsx'
import { DOCUMENTS, DOCUMENT_VERSIONS } from '../../data/mockDocuments.js'
import { CANDIDATES } from '../../data/mockCandidates.js'
import { docStatusVariant, formatDateTime } from '../../utils/format.js'

const candName = (id) => CANDIDATES.find((c) => c.id === id)?.name || id

export default function DocumentReview() {
  const [docs, setDocs] = useState(DOCUMENTS)
  const [active, setActive] = useState(null)
  const [comment, setComment] = useState('')

  const open = (d) => { setActive(d); setComment(d.comment || '') }

  const review = (status) => {
    setDocs((ds) =>
      ds.map((d) =>
        d.id === active.id
          ? { ...d, status, comment, reviewedBy: 'Daniela Ortiz', reviewedAt: new Date().toISOString() }
          : d
      )
    )
    setActive(null)
    setComment('')
  }

  const columns = [
    { key: 'type', header: 'Documento', strong: true, render: (d) => (
      <div className="row gap-2"><FileText size={16} className="dim" /><span style={{ color: 'var(--text)' }}>{d.type}</span></div>
    )},
    { key: 'candidateId', header: 'Aspirante', render: (d) => candName(d.candidateId) },
    { key: 'required', header: 'Tipo', render: (d) => <Badge variant={d.required ? 'violet' : 'neutral'}>{d.required ? 'Requerido' : 'Opcional'}</Badge> },
    { key: 'status', header: 'Estado', render: (d) => <Badge variant={docStatusVariant[d.status]} dot>{d.status}</Badge> },
    { key: 'uploadedAt', header: 'Cargado', sortValue: (d) => new Date(d.uploadedAt).getTime(), render: (d) => formatDateTime(d.uploadedAt) },
    { key: 'actions', header: '', sortable: false, render: (d) => (
      <Button size="sm" variant="ghost" icon={Eye} onClick={() => open(d)}>Revisar</Button>
    )},
  ]

  const versions = active ? DOCUMENT_VERSIONS[active.id] : null

  return (
    <div className="page">
      <PageHeader title="Revisión documental" subtitle="Aprueba, rechaza o devuelve documentos con comentarios." />

      <Card className="anim-up">
        <DataTable columns={columns} data={docs} searchKeys={['type', 'status']} pageSize={9} />
      </Card>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title="Revisión de documento"
        width={620}
        footer={
          <>
            <Button variant="danger" icon={XCircle} onClick={() => review('rechazado')}>Rechazar</Button>
            <Button variant="violet" icon={Undo2} onClick={() => review('devuelto')}>Devolver</Button>
            <Button variant="primary" icon={CheckCircle2} onClick={() => review('aprobado')}>Aprobar</Button>
          </>
        }
      >
        {active && (
          <div className="col gap-3">
            <div className="glass-soft" style={{ padding: 14 }}>
              <div className="stat-row"><span className="muted">Documento</span><b>{active.type}</b></div>
              <div className="stat-row"><span className="muted">Aspirante</span><b>{candName(active.candidateId)}</b></div>
              <div className="stat-row"><span className="muted">Archivo</span><b>{active.file}</b></div>
              <div className="stat-row"><span className="muted">Visibilidad</span><Badge variant="neutral">{active.visibility}</Badge></div>
              <div className="stat-row"><span className="muted">Estado actual</span><Badge variant={docStatusVariant[active.status]} dot>{active.status}</Badge></div>
            </div>

            {/* Vista previa PDF (placeholder) */}
            <div className="course-viewer" style={{ aspectRatio: '8.5/4' }}>
              <div className="col center gap-2">
                <FileText size={28} style={{ color: 'var(--teal)' }} />
                <span className="card-sub">Vista previa del PDF · {active.file}</span>
              </div>
            </div>

            <Field label="Comentario para el aspirante" hint="Visible para el aspirante al devolver o rechazar.">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ej: El acta de grado está ilegible, vuelve a cargarla escaneada."
              />
            </Field>

            {versions && (
              <div>
                <div className="row gap-2" style={{ marginBottom: 8 }}><History size={15} className="dim" /><b style={{ fontSize: '0.85rem' }}>Historial de versiones</b></div>
                <div className="timeline">
                  {versions.map((v) => (
                    <div className="timeline-item" key={v.version}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>v{v.version} · {v.action}</div>
                      <small>{formatDateTime(v.uploadedAt)} — {v.by}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
