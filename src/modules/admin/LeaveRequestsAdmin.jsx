import { useState } from 'react'
import { Eye, CheckCircle2, XCircle, FileText } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Textarea } from '../../components/ui/Form.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { useLeaveRequests, LEAVE_TYPES, LEAVE_STATUS_VARIANT, getSignedLeaveUrl } from '../../hooks/useLeaveRequests.js'
import { useUsers } from '../../hooks/useUsers.js'
import { formatDateTime } from '../../utils/format.js'
import { USE_SUPABASE } from '../../services/api.js'

const typeLabel = (t) => LEAVE_TYPES.find((x) => x.value === t)?.label || t

export default function LeaveRequestsAdmin() {
  const { requests, loading, reviewRequest } = useLeaveRequests({ adminMode: true })
  const { users } = useUsers()
  const [active, setActive] = useState(null)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [fileUrls, setFileUrls] = useState({})

  const employeeName = (r) => {
    const u = users.find((u) => u.id === r.profileId)
    return u?.name || r.employeeId || '—'
  }

  const open = async (r) => {
    setActive(r)
    setComment(r.adminComment || '')
    setError(null)
    setFileUrls({})
    if (USE_SUPABASE && r.files?.length) {
      const urls = {}
      for (const f of r.files) {
        try { urls[f.path] = await getSignedLeaveUrl(f.path) } catch { /* ignorar */ }
      }
      setFileUrls(urls)
    }
  }

  const decide = async (status) => {
    setSaving(true)
    setError(null)
    try {
      await reviewRequest(active.id, { status, adminComment: comment })
      setActive(null)
    } catch (err) {
      setError(err.message || 'No se pudo guardar la decisión.')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'employee', header: 'Empleado', strong: true,
      render: (r) => <span>{employeeName(r)}</span>,
    },
    {
      key: 'type', header: 'Tipo de permiso',
      render: (r) => <span>{typeLabel(r.type)}{r.otherDesc ? `: ${r.otherDesc}` : ''}</span>,
    },
    {
      key: 'createdAt', header: 'Fecha solicitud',
      sortValue: (r) => new Date(r.createdAt).getTime(),
      render: (r) => formatDateTime(r.createdAt),
    },
    {
      key: 'status', header: 'Estado',
      render: (r) => <Badge variant={LEAVE_STATUS_VARIANT[r.status]} dot>{r.status}</Badge>,
    },
    {
      key: 'actions', header: '', sortable: false,
      render: (r) => (
        <Button size="sm" variant="ghost" icon={Eye} onClick={() => open(r)}>
          {r.status === 'pendiente' ? 'Revisar' : 'Ver'}
        </Button>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Solicitudes de permisos"
        subtitle="Revisa y aprueba o devuelve las solicitudes de permiso del personal."
      />

      <Card className="anim-up">
        <DataTable
          columns={columns}
          data={requests}
          searchKeys={['type', 'status']}
          pageSize={10}
          loading={loading}
        />
      </Card>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title="Solicitud de permiso"
        width={600}
        footer={
          active?.status === 'pendiente' ? (
            <>
              <Button variant="danger" icon={XCircle} disabled={saving} onClick={() => decide('devuelto')}>
                Devolver
              </Button>
              <Button variant="primary" icon={CheckCircle2} disabled={saving} onClick={() => decide('aprobado')}>
                Aprobar
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setActive(null)}>Cerrar</Button>
          )
        }
      >
        {active && (
          <div className="col gap-3">
            {error && <AlertBanner variant="danger">{error}</AlertBanner>}

            <div className="glass-soft" style={{ padding: 14 }}>
              <div className="stat-row"><span className="muted">Empleado</span><b>{employeeName(active)}</b></div>
              <div className="stat-row"><span className="muted">Tipo</span><b>{typeLabel(active.type)}{active.otherDesc ? `: ${active.otherDesc}` : ''}</b></div>
              <div className="stat-row"><span className="muted">Enviada</span><b>{formatDateTime(active.createdAt)}</b></div>
              <div className="stat-row"><span className="muted">Estado</span><Badge variant={LEAVE_STATUS_VARIANT[active.status]} dot>{active.status}</Badge></div>
              {active.observations && (
                <div className="stat-row"><span className="muted">Observaciones</span><b>{active.observations}</b></div>
              )}
            </div>

            {active.files?.length > 0 && (
              <div>
                <div className="card-sub" style={{ marginBottom: 8 }}>Soportes adjuntos</div>
                <div className="col gap-2">
                  {active.files.map((f, i) => (
                    <div key={i} className="file-pill">
                      <div className="fic"><FileText size={16} /></div>
                      <div className="grow">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{f.name || f.path}</div>
                      </div>
                      {fileUrls[f.path] && (
                        <a href={fileUrls[f.path]} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost">Ver</Button>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Field
              label={active.status === 'pendiente' ? 'Comentario para el empleado (opcional)' : 'Comentario del admin'}
            >
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ej: Aprobado. Recuerda traer el soporte original."
                disabled={active.status !== 'pendiente'}
              />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  )
}
