import { useState } from 'react'
import { CheckCircle2, XCircle, Copy, Check, FileText, Mail, Phone } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { useJobApplications } from '../../hooks/useJobApplications.js'
import { formatDateTime } from '../../utils/format.js'

const STATUS_VARIANT = { pendiente: 'warning', aprobado: 'success', rechazado: 'danger' }
const STATUS_LABEL   = { pendiente: 'Pendiente', aprobado: 'Aprobado', rechazado: 'Rechazado' }

export default function JobApplications() {
  const { applications, loading, approve, reject } = useJobApplications()
  const [approvedInfo, setApprovedInfo] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleApprove = async (app) => {
    const updated = await approve(app.id)
    if (updated?.registrationCode) setApprovedInfo(updated)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(approvedInfo.registrationCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pending    = applications.filter((a) => a.status === 'pendiente')
  const processed  = applications.filter((a) => a.status !== 'pendiente')

  return (
    <div className="page">
      <PageHeader
        title="Aplicaciones a vacantes"
        subtitle="Revisa las hojas de vida recibidas, aprueba candidatos y genera su código de acceso."
      />

      {loading && <div className="card-sub" style={{ padding: 16 }}>Cargando…</div>}

      {!loading && applications.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-soft)' }}>
            <FileText size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Sin aplicaciones recibidas</div>
            <div style={{ fontSize: '0.875rem' }}>Cuando alguien aplique desde el sitio web, aparecerá aquí.</div>
          </div>
        </Card>
      )}

      {pending.length > 0 && (
        <>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Por revisar ({pending.length})
          </h3>
          <div className="col gap-3" style={{ marginBottom: 32 }}>
            {pending.map((app) => (
              <AppCard key={app.id} app={app} onApprove={() => handleApprove(app)} onReject={() => reject(app.id)} />
            ))}
          </div>
        </>
      )}

      {processed.length > 0 && (
        <>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Procesadas ({processed.length})
          </h3>
          <div className="col gap-3">
            {processed.map((app) => (
              <AppCard key={app.id} app={app} readonly onApprove={() => setApprovedInfo(app)} />
            ))}
          </div>
        </>
      )}

      {/* Modal: código generado */}
      <Modal
        open={!!approvedInfo}
        onClose={() => { setApprovedInfo(null); setCopied(false) }}
        title="Código de registro generado"
        size="sm"
      >
        {approvedInfo && (
          <div className="col gap-4" style={{ textAlign: 'center', padding: '8px 0' }}>
            <CheckCircle2 size={40} style={{ color: '#2ECC71', margin: '0 auto' }} />

            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-soft)', marginBottom: 12 }}>
                Comparte este código con <b style={{ color: 'var(--text)' }}>{approvedInfo.name}</b> para que pueda registrarse en la plataforma.
              </div>

              <div
                style={{
                  fontFamily: 'monospace', fontSize: '1.9rem', fontWeight: 800,
                  letterSpacing: '0.15em', color: 'var(--primary)',
                  background: 'var(--surface)', borderRadius: 12, padding: '16px 24px',
                  border: '2px dashed var(--primary)', marginBottom: 12,
                }}
              >
                {approvedInfo.registrationCode}
              </div>

              <Button variant="ghost" icon={copied ? Check : Copy} onClick={copyCode} style={{ margin: '0 auto' }}>
                {copied ? 'Copiado' : 'Copiar código'}
              </Button>
            </div>

            <p className="sub" style={{ fontSize: '0.8rem' }}>
              El aspirante debe ingresar este código en la página de registro. Una vez usado, el código queda inválido.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}

function AppCard({ app, onApprove, onReject, readonly }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="row between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.97rem', color: 'var(--text)', marginBottom: 2 }}>{app.name}</div>
          <div className="card-sub">{app.jobTitle}</div>
        </div>
        <div className="row gap-2">
          <Badge variant={STATUS_VARIANT[app.status] || 'neutral'} dot>{STATUS_LABEL[app.status] || app.status}</Badge>
          {app.createdAt && <span className="card-sub">{formatDateTime(app.createdAt)}</span>}
        </div>
      </div>

      <div className="row gap-4" style={{ flexWrap: 'wrap' }}>
        {app.email && <span className="row gap-1 card-sub"><Mail size={13} />{app.email}</span>}
        {app.phone && <span className="row gap-1 card-sub"><Phone size={13} />{app.phone}</span>}
      </div>

      {app.message && (
        <p style={{ fontSize: '0.84rem', color: 'var(--text-soft)', lineHeight: 1.55, margin: 0, padding: '8px 12px', background: 'var(--surface)', borderRadius: 8 }}>
          {app.message}
        </p>
      )}

      <div className="row gap-2" style={{ paddingTop: 6, borderTop: '1px solid var(--glass-border)', flexWrap: 'wrap' }}>
        {app.cvUrl && (
          <a href={app.cvUrl} target="_blank" rel="noreferrer">
            <Button size="sm" variant="ghost" icon={FileText}>Ver hoja de vida</Button>
          </a>
        )}

        {!readonly && app.status === 'pendiente' && (
          <>
            <Button size="sm" variant="primary" icon={CheckCircle2} onClick={onApprove} style={{ marginLeft: 'auto' }}>
              Aprobar y generar código
            </Button>
            <Button size="sm" variant="ghost" icon={XCircle} onClick={onReject}>
              Rechazar
            </Button>
          </>
        )}

        {app.status === 'aprobado' && app.registrationCode && (
          <Button size="sm" variant="ghost" icon={Copy} onClick={onApprove} style={{ marginLeft: 'auto' }}>
            Ver código: {app.registrationCode}
          </Button>
        )}
      </div>
    </Card>
  )
}
