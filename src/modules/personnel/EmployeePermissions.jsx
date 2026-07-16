import { useState, useRef } from 'react'
import { Plus, UploadCloud, FileText, X, CheckCircle2, Clock, XCircle, Send } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select, Textarea } from '../../components/ui/Form.jsx'
import { AlertBanner, EmptyState } from '../../components/ui/Feedback.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLeaveRequests, LEAVE_TYPES, LEAVE_STATUS_VARIANT, getSignedLeaveUrl } from '../../hooks/useLeaveRequests.js'
import { formatDateTime } from '../../utils/format.js'
import { USE_SUPABASE } from '../../services/api.js'

const STATUS_ICON = {
  pendiente: <Clock size={14} />,
  aprobado:  <CheckCircle2 size={14} />,
  devuelto:  <XCircle size={14} />,
}

const ACCEPT = 'application/pdf,image/png,image/jpeg,image/jpg,image/webp'
const MAX_FILES = 5
const MAX_MB = 10

export default function EmployeePermissions() {
  const { user } = useAuth()
  const { requests, loading, submitRequest } = useLeaveRequests()

  const [open, setOpen] = useState(false)
  const [type, setType] = useState(LEAVE_TYPES[0].value)
  const [otherDesc, setOtherDesc] = useState('')
  const [observations, setObservations] = useState('')
  const [files, setFiles] = useState([])
  const [fileError, setFileError] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [done, setDone] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [detailUrls, setDetailUrls] = useState({})
  const inputRef = useRef(null)

  const reset = () => {
    setType(LEAVE_TYPES[0].value)
    setOtherDesc('')
    setObservations('')
    setFiles([])
    setFileError('')
    setSendError(null)
    setDone(false)
  }

  const openModal = () => { reset(); setOpen(true) }

  const addFiles = (incoming) => {
    setFileError('')
    const allowed = [...incoming].filter((f) => {
      if (!ACCEPT.split(',').some((a) => f.type === a.trim())) {
        setFileError('Solo se aceptan PDF, PNG, JPG o WEBP.')
        return false
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        setFileError(`Cada archivo debe pesar menos de ${MAX_MB} MB.`)
        return false
      }
      return true
    })
    setFiles((prev) => {
      const combined = [...prev, ...allowed]
      if (combined.length > MAX_FILES) {
        setFileError(`Máximo ${MAX_FILES} archivos por solicitud.`)
        return prev
      }
      return combined
    })
  }

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  const send = async () => {
    if (type === 'otro' && !otherDesc.trim()) {
      setSendError('Escribe la descripción del permiso.')
      return
    }
    setSending(true)
    setSendError(null)
    try {
      await submitRequest({
        type,
        otherDesc: type === 'otro' ? otherDesc : null,
        observations,
        files,
        employeeId: user.employeeId || null,
      })
      setDone(true)
    } catch (err) {
      setSendError(err.message || 'No se pudo enviar la solicitud.')
    } finally {
      setSending(false)
    }
  }

  const openDetail = async (item) => {
    setDetailItem(item)
    setDetailUrls({})
    if (USE_SUPABASE && item.files?.length) {
      const urls = {}
      for (const f of item.files) {
        try { urls[f.path] = await getSignedLeaveUrl(f.path) } catch { /* ignorar */ }
      }
      setDetailUrls(urls)
    }
  }

  const typeLabel = (t) => LEAVE_TYPES.find((x) => x.value === t)?.label || t

  return (
    <div className="page">
      <PageHeader
        title="Mis permisos"
        subtitle="Solicita permisos laborales y consulta el estado de tus solicitudes anteriores."
        actions={<Button variant="primary" icon={Plus} onClick={openModal}>Nueva solicitud</Button>}
      />

      {loading ? (
        <div className="card-sub" style={{ padding: 24 }}>Cargando…</div>
      ) : requests.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="Sin solicitudes">
          Aún no has enviado ninguna solicitud de permiso.
        </EmptyState>
      ) : (
        <div className="col gap-3 anim-up">
          {requests.map((r) => (
            <Card key={r.id} onClick={() => openDetail(r)} style={{ cursor: 'pointer' }}>
              <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
                <div className="col gap-1">
                  <div style={{ fontWeight: 700 }}>
                    {typeLabel(r.type)}{r.type === 'otro' && r.otherDesc ? `: ${r.otherDesc}` : ''}
                  </div>
                  <div className="card-sub">{formatDateTime(r.createdAt)}</div>
                  {r.adminComment && (
                    <div className="card-sub" style={{ marginTop: 4 }}>
                      <b>Observación admin:</b> {r.adminComment}
                    </div>
                  )}
                </div>
                <Badge variant={LEAVE_STATUS_VARIANT[r.status]} dot>
                  {STATUS_ICON[r.status]} {r.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ---- Modal nueva solicitud ---- */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva solicitud de permiso"
        footer={
          done ? (
            <Button variant="primary" onClick={() => setOpen(false)}>Cerrar</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="primary" icon={Send} onClick={send} disabled={sending}>
                {sending ? 'Enviando…' : 'Enviar solicitud'}
              </Button>
            </>
          )
        }
      >
        {done ? (
          <AlertBanner variant="success" title="Solicitud enviada">
            Tu solicitud fue enviada al administrador. Recibirás una notificación cuando sea revisada.
          </AlertBanner>
        ) : (
          <div className="col gap-3">
            {sendError && <AlertBanner variant="danger">{sendError}</AlertBanner>}

            <Field label="Tipo de permiso" required>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={LEAVE_TYPES.map((t) => ({ value: t.value, label: t.label }))}
              />
            </Field>

            {type === 'otro' && (
              <Field label="Describe el permiso" required>
                <Input
                  value={otherDesc}
                  onChange={(e) => setOtherDesc(e.target.value)}
                  placeholder="Ej: Trámite en notaría"
                />
              </Field>
            )}

            <Field label="Soporte(s)" hint={`Adjunta los documentos de soporte (PDF, imagen). Máx ${MAX_FILES} archivos.`}>
              <div
                className="dropzone"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
              >
                <div className="ic"><UploadCloud size={22} /></div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Arrastra aquí o haz clic para seleccionar</div>
                <div className="card-sub" style={{ marginTop: 4 }}>PDF, PNG, JPG · máx {MAX_MB} MB por archivo</div>
                <input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => addFiles(e.target.files)} />
              </div>
              {fileError && <div className="field-error" style={{ marginTop: 6 }}>{fileError}</div>}
              {files.length > 0 && (
                <div className="col gap-2" style={{ marginTop: 8 }}>
                  {files.map((f, i) => (
                    <div key={i} className="file-pill">
                      <div className="fic"><FileText size={16} /></div>
                      <div className="grow">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{f.name}</div>
                        <div className="card-sub">{(f.size / 1024).toFixed(0)} KB</div>
                      </div>
                      <button className="icon-btn" onClick={() => removeFile(i)}><X size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </Field>

            <Field label="Observaciones" hint="Opcional — información adicional para el administrador.">
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ej: Estaré disponible por teléfono durante la tarde."
              />
            </Field>
          </div>
        )}
      </Modal>

      {/* ---- Modal detalle ---- */}
      <Modal
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title="Detalle de solicitud"
        footer={<Button variant="ghost" onClick={() => setDetailItem(null)}>Cerrar</Button>}
      >
        {detailItem && (
          <div className="col gap-3">
            <div className="glass-soft" style={{ padding: 14 }}>
              <div className="stat-row"><span className="muted">Tipo</span><b>{typeLabel(detailItem.type)}{detailItem.otherDesc ? `: ${detailItem.otherDesc}` : ''}</b></div>
              <div className="stat-row"><span className="muted">Estado</span><Badge variant={LEAVE_STATUS_VARIANT[detailItem.status]} dot>{detailItem.status}</Badge></div>
              <div className="stat-row"><span className="muted">Enviada</span><b>{formatDateTime(detailItem.createdAt)}</b></div>
              {detailItem.observations && <div className="stat-row"><span className="muted">Mis observaciones</span><b>{detailItem.observations}</b></div>}
              {detailItem.adminComment && <div className="stat-row"><span className="muted">Respuesta admin</span><b>{detailItem.adminComment}</b></div>}
              {detailItem.reviewedBy && <div className="stat-row"><span className="muted">Revisada por</span><b>{detailItem.reviewedBy}</b></div>}
            </div>
            {detailItem.files?.length > 0 && (
              <div>
                <div className="card-sub" style={{ marginBottom: 8 }}>Soportes adjuntos</div>
                <div className="col gap-2">
                  {detailItem.files.map((f, i) => (
                    <div key={i} className="file-pill">
                      <div className="fic"><FileText size={16} /></div>
                      <div className="grow"><div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{f.name || f.path}</div></div>
                      {detailUrls[f.path] && (
                        <a href={detailUrls[f.path]} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost">Ver</Button>
                        </a>
                      )}
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
