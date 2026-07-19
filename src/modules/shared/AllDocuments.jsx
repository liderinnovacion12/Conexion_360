import { useState, useMemo } from 'react'
import {
  FileText, Search, X, CheckCircle2, XCircle, Undo2,
  Eye, Download, History, Users, UserCheck, Briefcase,
} from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Textarea } from '../../components/ui/Form.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { useDocuments } from '../../hooks/useDocuments.js'
import { useCandidates } from '../../hooks/useCandidates.js'
import { usePersonnel } from '../../hooks/usePersonnel.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { docStatusVariant, formatDateTime } from '../../utils/format.js'
import { USE_SUPABASE } from '../../services/api.js'
import { getSignedDocumentUrl } from '../../services/supabaseClient.js'

// Segmentos de personas
const SEGMENTS = [
  { key: 'all',          label: 'Todos',                      icon: FileText,   color: '#19E3D9' },
  { key: 'unregistered', label: 'Aspirantes sin registrar',   icon: Users,      color: '#FFC857' },
  { key: 'candidate',    label: 'Aspirantes registrados',     icon: UserCheck,  color: '#9B5DE5' },
  { key: 'employee',     label: 'Empleados',                  icon: Briefcase,  color: '#2EE6A6' },
]

const STATUS_OPTS = [
  { value: '',          label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobado',  label: 'Aprobado' },
  { value: 'devuelto',  label: 'Devuelto' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'vencido',   label: 'Vencido' },
]

// Determina si un candidato ya se "registró" (tiene perfil en la plataforma).
// Usamos el campo `stage` — si pasó de `registro` ya está registrado.
const REGISTERED_STAGES = [
  'doc_revision','doc_aprobados','doc_pendientes','doc_devueltos',
  'curso_asignado','curso_completado','eval_aprobada','apto','contratado',
]

export default function AllDocuments() {
  const { user } = useAuth()
  const { documents, loading: loadDocs, reviewDocument } = useDocuments()
  const { candidates, loading: loadCands } = useCandidates()
  const { personnel, loading: loadPersonnel } = usePersonnel()

  const loading = loadDocs || loadCands || loadPersonnel

  // ── Segmento activo ────────────────────────────────────────────────────────
  const [segment, setSegment] = useState('all')
  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState('')

  // ── Construir mapa de personas ─────────────────────────────────────────────
  // Los candidatos ya contratados (stage = 'contratado') también aparecen en
  // personnel — los unificamos por cédula para evitar duplicados.
  const personMap = useMemo(() => {
    const map = {}
    candidates.forEach((c) => {
      map[`c:${c.id}`] = {
        id:       `c:${c.id}`,
        name:     c.name,
        doc:      c.doc,
        email:    c.email,
        type:     REGISTERED_STAGES.includes(c.stage) ? 'candidate' : 'unregistered',
        stage:    c.stage,
        status:   c.status,
        // Si está contratado pero también en personnel, el tipo cambia abajo
      }
    })
    // Empleados en personnel — pueden tener correspondencia con un candidato
    personnel.forEach((p) => {
      // Buscar si existe candidato con misma cédula
      const match = candidates.find((c) => c.doc === p.doc)
      const key = match ? `c:${match.id}` : `p:${p.id}`
      if (map[key]) {
        map[key].type = 'employee'
        map[key].employeeState = p.state
        map[key].area = p.area
      } else {
        map[key] = {
          id:            key,
          name:          p.name,
          doc:           p.doc,
          type:          'employee',
          employeeState: p.state,
          area:          p.area,
        }
      }
    })
    return map
  }, [candidates, personnel])

  // ── Filtrado ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = documents

    // Segmento
    if (segment !== 'all') {
      list = list.filter((d) => {
        const person = personMap[`c:${d.candidateId}`]
        return person?.type === segment
      })
    }

    // Búsqueda (nombre o tipo de documento)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((d) => {
        const person = personMap[`c:${d.candidateId}`]
        return (
          person?.name?.toLowerCase().includes(q) ||
          d.type?.toLowerCase().includes(q)
        )
      })
    }

    // Estado
    if (status) list = list.filter((d) => d.status === status)

    return list
  }, [documents, segment, search, status, personMap])

  // ── Conteos por segmento ───────────────────────────────────────────────────
  const counts = useMemo(() => {
    const c = { all: documents.length, unregistered: 0, candidate: 0, employee: 0 }
    documents.forEach((d) => {
      const person = personMap[`c:${d.candidateId}`]
      if (person?.type === 'unregistered') c.unregistered++
      else if (person?.type === 'candidate') c.candidate++
      else if (person?.type === 'employee') c.employee++
    })
    return c
  }, [documents, personMap])

  // ── Modal de revisión ──────────────────────────────────────────────────────
  const [active,   setActive]  = useState(null)
  const [comment,  setComment] = useState('')
  const [versions, setVersions] = useState(null)
  const [fileUrl,  setFileUrl]  = useState(null)
  const [fileErr,  setFileErr]  = useState(null)
  const [acting,   setActing]   = useState(false)

  const openDoc = async (doc) => {
    setActive(doc)
    setComment(doc.comment || '')
    setVersions(null)
    setFileUrl(null)
    setFileErr(null)
    if (USE_SUPABASE && doc.file) {
      try {
        const url = await getSignedDocumentUrl(doc.file)
        setFileUrl(url)
      } catch { setFileErr('No se pudo cargar el archivo.') }
    }
  }

  const closeDoc = () => { setActive(null); setVersions(null); setFileUrl(null) }

  const act = async (actionStatus) => {
    if (!active) return
    setActing(true)
    try {
      await reviewDocument(active.id, { status: actionStatus, comment, reviewedByName: user.name })
      closeDoc()
    } finally { setActing(false) }
  }

  const person = active ? (personMap[`c:${active.candidateId}`] || null) : null

  const segmentLabel = (type) => {
    if (type === 'employee')     return { label: 'Empleado',             variant: 'success' }
    if (type === 'candidate')    return { label: 'Aspirante registrado', variant: 'info'    }
    if (type === 'unregistered') return { label: 'Sin registrar',        variant: 'warning' }
    return { label: '—', variant: 'neutral' }
  }

  return (
    <div className="page">
      <PageHeader
        title="Documentos"
        subtitle="Visualiza todos los documentos subidos por aspirantes y empleados."
      />

      {/* ── Segmentos ─────────────────────────────────────────────────────── */}
      <div className="row gap-2" style={{ flexWrap: 'wrap', marginBottom: 20 }}>
        {SEGMENTS.map((seg) => (
          <button
            key={seg.key}
            onClick={() => setSegment(seg.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 10,
              border: `1.5px solid ${segment === seg.key ? seg.color : 'var(--glass-border)'}`,
              background: segment === seg.key ? seg.color + '18' : 'transparent',
              color: segment === seg.key ? seg.color : 'var(--text-soft)',
              fontWeight: 600, cursor: 'pointer', fontSize: '0.84rem',
              transition: 'all .15s',
            }}
          >
            <seg.icon size={14} />
            {seg.label}
            <span style={{
              padding: '1px 7px', borderRadius: 100, fontSize: '0.72rem',
              background: segment === seg.key ? seg.color + '33' : 'rgba(255,255,255,0.07)',
              color: segment === seg.key ? seg.color : 'var(--text-dim)',
              fontWeight: 700,
            }}>
              {counts[seg.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Barra de búsqueda + filtro estado ─────────────────────────────── */}
      <div className="row gap-2" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            className="input"
            placeholder="Buscar por persona o tipo de documento…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, paddingRight: search ? 34 : 12 }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>
        <select
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ minWidth: 180 }}
        >
          {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* ── Contenido ─────────────────────────────────────────────────────── */}
      {loading ? (
        <Card><div style={{ padding: 32, textAlign: 'center', color: 'var(--text-soft)' }}>Cargando documentos…</div></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-soft)' }}>
            <FileText size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Sin documentos</div>
            <div style={{ fontSize: '0.875rem' }}>
              {documents.length === 0
                ? 'Aún no hay documentos cargados en la plataforma.'
                : 'Ningún documento coincide con los filtros aplicados.'}
            </div>
          </div>
        </Card>
      ) : (
        <div className="col gap-2">
          {filtered.map((doc) => {
            const p = personMap[`c:${doc.candidateId}`]
            const seg = segmentLabel(p?.type)
            return (
              <div
                key={doc.id}
                className="card glass"
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer', transition: 'border-color .15s' }}
                onClick={() => openDoc(doc)}
              >
                <FileText size={20} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 2 }}>
                    {doc.type}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                    {p?.name || doc.candidateId}
                    {p?.area ? ` · ${p.area}` : ''}
                  </div>
                </div>

                <div className="row gap-2" style={{ flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6 }}>
                  <Badge variant={seg.variant} dot>{seg.label}</Badge>
                  <Badge variant={docStatusVariant[doc.status] || 'neutral'} dot>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </Badge>
                  {doc.uploadedAt && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {formatDateTime(doc.uploadedAt)}
                    </span>
                  )}
                </div>

                <Button size="sm" variant="ghost" icon={Eye} onClick={(e) => { e.stopPropagation(); openDoc(doc) }}>
                  Revisar
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal de revisión ─────────────────────────────────────────────── */}
      <Modal
        open={!!active}
        onClose={closeDoc}
        title={active?.type || 'Documento'}
        size="md"
      >
        {active && (
          <div className="col gap-4">
            {/* Info persona */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface)', borderRadius: 10 }}>
              {person?.type === 'employee'     && <Briefcase size={16} style={{ color: '#2EE6A6' }} />}
              {person?.type === 'candidate'    && <UserCheck  size={16} style={{ color: '#9B5DE5' }} />}
              {person?.type === 'unregistered' && <Users      size={16} style={{ color: '#FFC857' }} />}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{person?.name || active.candidateId}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                  {segmentLabel(person?.type).label}
                  {person?.doc   ? ` · CC ${person.doc}`   : ''}
                  {person?.email ? ` · ${person.email}`     : ''}
                  {person?.area  ? ` · ${person.area}`      : ''}
                </div>
              </div>
              <Badge variant={segmentLabel(person?.type).variant} style={{ marginLeft: 'auto' }}>
                {segmentLabel(person?.type).label}
              </Badge>
            </div>

            {/* Estado actual */}
            <div className="row gap-2">
              <Badge variant={docStatusVariant[active.status] || 'neutral'} dot>
                {active.status.charAt(0).toUpperCase() + active.status.slice(1)}
              </Badge>
              {active.version > 1 && <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>v{active.version}</span>}
              {active.uploadedAt && <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Subido: {formatDateTime(active.uploadedAt)}</span>}
            </div>

            {/* Vista previa / descarga */}
            {USE_SUPABASE ? (
              fileErr
                ? <AlertBanner variant="warning">{fileErr}</AlertBanner>
                : fileUrl
                  ? <div className="row gap-2">
                      <a href={fileUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="ghost" icon={Eye}>Ver archivo</Button>
                      </a>
                      <a href={fileUrl} download>
                        <Button size="sm" variant="ghost" icon={Download}>Descargar</Button>
                      </a>
                    </div>
                  : <div style={{ fontSize: '0.83rem', color: 'var(--text-dim)' }}>Cargando archivo…</div>
            ) : (
              active.file && (
                <div style={{ fontSize: '0.83rem', color: 'var(--text-dim)' }}>
                  Archivo: <b>{active.file}</b> (solo disponible con Supabase activo)
                </div>
              )
            )}

            {/* Comentario previo */}
            {active.comment && active.status !== 'pendiente' && (
              <AlertBanner variant={active.status === 'devuelto' ? 'warning' : active.status === 'rechazado' ? 'danger' : 'success'}>
                <b>Nota del revisor:</b> {active.comment}
              </AlertBanner>
            )}

            {/* Campo comentario (solo si no está aprobado) */}
            {active.status !== 'aprobado' && (
              <Field label="Comentario (opcional)">
                <Textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe una nota para la persona…"
                />
              </Field>
            )}

            {/* Historial de versiones */}
            {versions && (
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Historial de versiones
                </div>
                <div className="col gap-1">
                  {versions.map((v) => (
                    <div key={v.id} style={{ fontSize: '0.8rem', color: 'var(--text-soft)', display: 'flex', gap: 10 }}>
                      <span>v{v.version}</span>
                      <span>{formatDateTime(v.uploadedAt)}</span>
                      <span>{v.uploadedBy}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            {active.status !== 'aprobado' && (
              <div className="row gap-2" style={{ paddingTop: 8, borderTop: '1px solid var(--glass-border)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Button size="sm" variant="ghost" icon={History} onClick={async () => {
                  // lazy-load historial solo si se pide
                }}>
                  Historial
                </Button>
                <Button size="sm" variant="ghost" icon={Undo2} disabled={acting || active.status === 'devuelto'} onClick={() => act('devuelto')}>
                  Devolver
                </Button>
                <Button size="sm" variant="danger" icon={XCircle} disabled={acting || active.status === 'rechazado'} onClick={() => act('rechazado')}>
                  Rechazar
                </Button>
                <Button size="sm" variant="primary" icon={CheckCircle2} disabled={acting} onClick={() => act('aprobado')}>
                  Aprobar
                </Button>
              </div>
            )}
            {active.status === 'aprobado' && (
              <AlertBanner variant="success">Este documento ya fue aprobado. No requiere acción adicional.</AlertBanner>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
