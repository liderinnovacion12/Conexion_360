import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Undo2, FileText, History, Eye, Download, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Textarea } from '../../components/ui/Form.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { DOCUMENT_TYPES } from '../../data/mockDocuments.js'
import { docStatusVariant, formatDateTime } from '../../utils/format.js'
import { useFormTemplates } from '../../hooks/useFormTemplates.js'
import { useCandidateGroups } from '../../hooks/useCandidateGroups.js'
import { useCandidates } from '../../hooks/useCandidates.js'
import { useDocuments } from '../../hooks/useDocuments.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { resolveRequiredFields } from '../../utils/formTemplates.js'
import { USE_SUPABASE, toggleGroupMembership } from '../../services/api.js'
import { getSignedDocumentUrl } from '../../services/supabaseClient.js'

const RECHAZADOS_GROUP_ID = 'grp-rechazados'

export default function DocumentReview() {
  const { user } = useAuth()
  const { candidates } = useCandidates()
  const { documents: docs, reviewDocument, getVersions } = useDocuments()
  const [active, setActive] = useState(null)
  const [comment, setComment] = useState('')
  const [versions, setVersions] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [fileError, setFileError] = useState(null)
  const { templates } = useFormTemplates()
  const { groups, groupsForCandidate } = useCandidateGroups()
  const [filterGroupId, setFilterGroupId] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const highlightCandidateId = searchParams.get('candidato')

  const candName = (id) => candidates.find((c) => c.id === id)?.name || id

  // Solo muestra documentos de aspirantes que ya están en algún grupo (no rechazados)
  const docsBase = docs.filter((d) => {
    const gs = groupsForCandidate(d.candidateId)
    return gs.length > 0 && !gs.every((g) => g.id === RECHAZADOS_GROUP_ID)
  })

  // Filtro adicional por grupo seleccionado
  const docsFiltered = filterGroupId
    ? docsBase.filter((d) => groupsForCandidate(d.candidateId).some((g) => g.id === filterGroupId))
    : docsBase

  // Grupos que tienen al menos un documento en la vista
  const activeGroups = groups.filter((g) =>
    g.id !== RECHAZADOS_GROUP_ID &&
    docsBase.some((d) => groupsForCandidate(d.candidateId).some((x) => x.id === g.id))
  )

  // Cuando llega ?candidato=ID desde el Pipeline, abrir su primer documento
  useEffect(() => {
    if (!highlightCandidateId || docs.length === 0) return
    const firstDoc = docsBase.find((d) => d.candidateId === highlightCandidateId)
    if (firstDoc) open(firstDoc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightCandidateId, docs.length])

  // Determina si un documento es obligatorio según la plantilla vigente para
  // la vía/grupo del aspirante (en vez del valor fijo guardado al cargarlo).
  const isRequiredNow = (doc) => {
    const candidate = candidates.find((c) => c.id === doc.candidateId)
    if (!candidate) return doc.required
    const groupIds = groupsForCandidate(candidate.id).map((g) => g.id)
    const fields = resolveRequiredFields(candidate.track, groupIds, templates, DOCUMENT_TYPES)
    const match = fields.find((f) => f.label === doc.type)
    return match ? match.required : doc.required
  }

  const open = (d) => {
    setActive(d)
    setComment(d.comment || '')
    setVersions(null)
    setFileUrl(null)
    setFileError(null)
    getVersions(d.id).then(setVersions)

    // `d.file` guarda la ruta real en Storage en modo Supabase (bucket
    // privado) — se genera una URL firmada temporal para poder ver o
    // descargar el PDF/imagen que subió el aspirante.
    if (USE_SUPABASE && d.file) {
      getSignedDocumentUrl(d.file)
        .then(setFileUrl)
        .catch((err) => setFileError(err.message))
    }
  }

  const review = async (status) => {
    await reviewDocument(active.id, { status, comment, reviewedByName: user.name })
    // Al rechazar un documento, mover al aspirante al grupo Rechazados
    if (status === 'rechazado' && USE_SUPABASE) {
      try {
        await toggleGroupMembership(active.candidateId, RECHAZADOS_GROUP_ID, false)
      } catch { /* no crítico */ }
    }
    setActive(null)
    setComment('')
  }

  const columns = [
    { key: 'type', header: 'Documento', strong: true, render: (d) => (
      <div className="row gap-2"><FileText size={16} className="dim" /><span style={{ color: 'var(--text)' }}>{d.type}</span></div>
    )},
    { key: 'candidateId', header: 'Aspirante', render: (d) => candName(d.candidateId) },
    { key: 'required', header: 'Tipo', render: (d) => <Badge variant={isRequiredNow(d) ? 'violet' : 'neutral'}>{isRequiredNow(d) ? 'Requerido' : 'Opcional'}</Badge> },
    { key: 'status', header: 'Estado', render: (d) => <Badge variant={docStatusVariant[d.status]} dot>{d.status}</Badge> },
    { key: 'uploadedAt', header: 'Cargado', sortValue: (d) => new Date(d.uploadedAt).getTime(), render: (d) => formatDateTime(d.uploadedAt) },
    { key: 'actions', header: '', sortable: false, render: (d) => (
      <Button size="sm" variant="ghost" icon={Eye} onClick={() => open(d)}>Revisar</Button>
    )},
  ]

  const highlightName = highlightCandidateId ? candName(highlightCandidateId) : null

  return (
    <div className="page">
      <PageHeader title="Revisión documental" subtitle="Aprueba, rechaza o devuelve documentos con comentarios." />

      {/* Banner cuando se viene desde el pipeline con un candidato resaltado */}
      {highlightCandidateId && (
        <AlertBanner variant="info" title={`Documentos de: ${highlightName}`}>
          Mostrando y resaltando documentos de <b>{highlightName}</b> — llegaste desde el Pipeline.{' '}
          <button
            onClick={() => setSearchParams({})}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', textDecoration: 'underline', padding: 0 }}
          >
            Ver todos
          </button>
        </AlertBanner>
      )}

      {/* Filtros por grupo */}
      {activeGroups.length > 0 && (
        <div className="row gap-2" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
          <button
            className={`pill-btn${!filterGroupId ? ' pill-btn--active' : ''}`}
            onClick={() => setFilterGroupId(null)}
          >
            Todos
          </button>
          {activeGroups.map((g) => (
            <button
              key={g.id}
              className={`pill-btn${filterGroupId === g.id ? ' pill-btn--active' : ''}`}
              style={filterGroupId === g.id ? { '--pill-color': g.color } : { '--pill-color': g.color }}
              onClick={() => setFilterGroupId(filterGroupId === g.id ? null : g.id)}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, display: 'inline-block', marginRight: 6 }} />
              {g.name}
            </button>
          ))}
        </div>
      )}

      {docs.length > 0 && docsBase.length === 0 && (
        <AlertBanner variant="info" title="Sin documentos para revisar">
          Todos los aspirantes con documentos pendientes aún no han sido asignados a un grupo. Asígnalos desde <b>Grupos de aspirantes</b> para que aparezcan aquí.
        </AlertBanner>
      )}

      <Card className="anim-up">
        <DataTable
          columns={columns}
          data={docsFiltered}
          searchKeys={['type', 'status']}
          pageSize={9}
          getRowStyle={(d) =>
            d.candidateId === highlightCandidateId
              ? { background: 'rgba(74,158,255,0.12)', outline: '1px solid rgba(74,158,255,0.4)' }
              : undefined
          }
        />
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

            {/* Archivo real subido por el aspirante (Storage, bucket privado) */}
            {USE_SUPABASE ? (
              fileError ? (
                <AlertBanner variant="warning">No se pudo generar el enlace de descarga: {fileError}</AlertBanner>
              ) : fileUrl ? (
                <div className="glass-soft" style={{ padding: 14 }}>
                  <div className="row between" style={{ alignItems: 'center' }}>
                    <span className="row gap-2"><FileText size={18} style={{ color: 'var(--teal)' }} /> Archivo cargado</span>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="primary" icon={Download}>Ver / descargar</Button>
                    </a>
                  </div>
                  <p className="card-sub" style={{ marginTop: 8 }}>El enlace es temporal y privado (expira en unos minutos).</p>
                </div>
              ) : (
                <div className="course-viewer" style={{ aspectRatio: '8.5/4' }}>
                  <div className="col center gap-2">
                    <FileText size={28} style={{ color: 'var(--teal)' }} />
                    <span className="card-sub">Generando enlace de descarga…</span>
                  </div>
                </div>
              )
            ) : (
              <div className="course-viewer" style={{ aspectRatio: '8.5/4' }}>
                <div className="col center gap-2">
                  <FileText size={28} style={{ color: 'var(--teal)' }} />
                  <span className="card-sub">Vista previa del PDF · {active.file}</span>
                </div>
              </div>
            )}

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
