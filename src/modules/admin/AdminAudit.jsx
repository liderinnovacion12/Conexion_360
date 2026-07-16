import { useMemo, useState } from 'react'
import {
  Upload, CheckCircle2, XCircle, FileText, UserPlus, Gavel,
  Clock, Filter, Download, ShieldCheck,
} from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { EmptyState } from '../../components/ui/Feedback.jsx'
import { useAuditLogs } from '../../hooks/useAuditLogs.js'
import { useApprovals } from '../../hooks/useApprovals.js'
import { useContracts } from '../../hooks/useContracts.js'
import { useLeaveRequests, LEAVE_TYPES } from '../../hooks/useLeaveRequests.js'
import { useUsers } from '../../hooks/useUsers.js'
import { formatDateTime } from '../../utils/format.js'
import { exportToCSV } from '../../utils/pdf.js'

// Tipos de evento con color e ícono
const EVENT_TYPES = {
  actividad:  { label: 'Actividad',       variant: 'neutral',  Icon: Clock },
  firma:      { label: 'Firma / Aprobación', variant: 'success', Icon: CheckCircle2 },
  rechazo:    { label: 'Rechazo',         variant: 'danger',   Icon: XCircle },
  carga:      { label: 'Carga de archivo', variant: 'info',    Icon: Upload },
  contrato:   { label: 'Contrato',        variant: 'violet',   Icon: Gavel },
  permiso:    { label: 'Permiso laboral', variant: 'warning',  Icon: ShieldCheck },
  aspirante:  { label: 'Aspirante',       variant: 'info',     Icon: UserPlus },
  documento:  { label: 'Documento',       variant: 'neutral',  Icon: FileText },
}

const leaveLabel = (t) => LEAVE_TYPES.find((x) => x.value === t)?.label || t

function buildEvents({ logs, approvals, contracts, leaveRequests, users }) {
  const all = []

  // ── Registros generales de auditoría (actividad del sistema) ──
  logs.forEach((l) => {
    const tipo = l.action?.toLowerCase().includes('carg') ? 'carga'
      : l.action?.toLowerCase().includes('firm') ? 'firma'
      : l.action?.toLowerCase().includes('rechaz') ? 'rechazo'
      : l.action?.toLowerCase().includes('contrat') ? 'contrato'
      : 'actividad'
    all.push({
      id: `log-${l.id}`,
      ts: l.ts,
      actor: l.actor,
      role: l.role,
      action: l.action,
      target: l.target,
      type: tipo,
    })
  })

  // ── Eventos de cadenas de aprobación (firmas y decisiones) ──
  approvals.forEach((a) => {
    // Evento de creación / envío a aprobación
    if (a.requestedAt) {
      all.push({
        id: `apr-create-${a.id}`,
        ts: a.requestedAt,
        actor: a.requestedBy,
        role: a.requestedByRole,
        action: a.domain === 'contract' ? 'Emitió contrato y envió a firma' : 'Envió documento a aprobación',
        target: a.title,
        type: a.domain === 'contract' ? 'contrato' : 'documento',
      })
    }
    // Cada paso de la cadena que ya fue decidido
    a.chain.forEach((step) => {
      if (step.status === 'pendiente' || !step.decidedAt) return
      all.push({
        id: `apr-step-${a.id}-${step.assignedToId}`,
        ts: step.decidedAt,
        actor: step.assignedToName,
        role: step.assignedToRole,
        action: step.status === 'aprobado'
          ? (step.assignedToRole === 'Contratado/a' ? 'Firmó su contrato' : 'Firmó y aprobó')
          : 'Rechazó',
        target: a.title,
        type: step.status === 'aprobado' ? 'firma' : 'rechazo',
        detail: step.comment || null,
      })
    })
  })

  // ── Contratos (complementa con datos de creación) ──
  contracts.forEach((c) => {
    // Solo agregar si no está ya cubierto por approvals
    const yaEnApprovals = approvals.some((a) => a.refId === c.id)
    if (!yaEnApprovals && c.createdAt) {
      all.push({
        id: `ctr-${c.id}`,
        ts: c.createdAt,
        actor: c.createdBy,
        role: c.createdByRole,
        action: 'Creó contrato',
        target: `${c.templateName} — ${c.personName}`,
        type: 'contrato',
      })
    }
  })

  // ── Permisos laborales ──
  leaveRequests.forEach((r) => {
    const emp = users.find((u) => u.id === r.profileId)
    const empName = emp?.name || r.employeeId || 'Empleado'
    all.push({
      id: `lr-${r.id}`,
      ts: r.createdAt,
      actor: empName,
      role: 'Personal',
      action: 'Solicitó permiso laboral',
      target: leaveLabel(r.type) + (r.otherDesc ? `: ${r.otherDesc}` : ''),
      type: 'permiso',
    })
    if (r.reviewedAt) {
      all.push({
        id: `lr-rev-${r.id}`,
        ts: r.reviewedAt,
        actor: r.reviewedBy || 'Administrador',
        role: 'Admin',
        action: r.status === 'aprobado' ? 'Aprobó permiso laboral' : 'Devolvió permiso laboral',
        target: `${leaveLabel(r.type)} · ${empName}`,
        type: r.status === 'aprobado' ? 'firma' : 'rechazo',
        detail: r.adminComment || null,
      })
    }
  })

  return all.sort((a, b) => new Date(b.ts) - new Date(a.ts))
}

const ALL_TYPES_OPTION = { value: '', label: 'Todos los tipos' }
const TYPE_OPTIONS = [ALL_TYPES_OPTION, ...Object.entries(EVENT_TYPES).map(([v, m]) => ({ value: v, label: m.label }))]

export default function AdminAudit() {
  const { logs } = useAuditLogs()
  const { approvals } = useApprovals()
  const { contracts } = useContracts()
  const { requests: leaveRequests } = useLeaveRequests({ adminMode: true })
  const { users } = useUsers()

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')

  const events = useMemo(
    () => buildEvents({ logs, approvals, contracts, leaveRequests, users }),
    [logs, approvals, contracts, leaveRequests, users]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return events.filter((e) => {
      if (filterType && e.type !== filterType) return false
      if (q) {
        return (
          e.actor?.toLowerCase().includes(q) ||
          e.action?.toLowerCase().includes(q) ||
          e.target?.toLowerCase().includes(q) ||
          e.role?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [events, search, filterType])

  const handleExport = () => {
    exportToCSV('auditoria_conexion360.csv', filtered, [
      { key: 'ts',     label: 'Fecha y hora' },
      { key: 'actor',  label: 'Usuario' },
      { key: 'role',   label: 'Rol / Área' },
      { key: 'action', label: 'Acción' },
      { key: 'target', label: 'Sobre qué' },
      { key: 'detail', label: 'Detalle / Comentario' },
    ])
  }

  return (
    <div className="page">
      <PageHeader
        title="Auditar"
        subtitle={`Trazabilidad completa de todos los movimientos de la plataforma. ${events.length} eventos registrados.`}
        actions={
          <button className="btn btn-ghost btn-sm" onClick={handleExport}>
            <Download size={15} /> Exportar CSV
          </button>
        }
      />

      {/* Filtros */}
      <Card className="anim-up" style={{ marginBottom: 16 }}>
        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px' }}>
            <Field label="Buscar">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Usuario, acción, documento…"
              />
            </Field>
          </div>
          <div style={{ flex: '0 0 200px' }}>
            <Field label="Tipo de evento">
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={TYPE_OPTIONS}
              />
            </Field>
          </div>
          <div style={{ alignSelf: 'flex-end', paddingBottom: 2 }}>
            <Badge variant="neutral"><Filter size={12} /> {filtered.length} eventos</Badge>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Sin eventos">
          No hay registros que coincidan con los filtros aplicados.
        </EmptyState>
      ) : (
        <div className="col gap-2 anim-up">
          {filtered.map((e) => {
            const meta = EVENT_TYPES[e.type] || EVENT_TYPES.actividad
            const { Icon } = meta
            return (
              <div
                key={e.id}
                className="glass-soft"
                style={{ padding: '12px 16px', borderRadius: 10, display: 'flex', gap: 14, alignItems: 'flex-start' }}
              >
                {/* Ícono tipo */}
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.07)',
                }}>
                  <Icon size={16} />
                </div>

                {/* Contenido */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row between" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{e.actor}</span>
                      <Badge variant="neutral" style={{ fontSize: '0.75rem' }}>{e.role}</Badge>
                      <Badge variant={meta.variant} style={{ fontSize: '0.75rem' }}>{meta.label}</Badge>
                    </div>
                    <span className="dim" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{formatDateTime(e.ts)}</span>
                  </div>
                  <div style={{ fontSize: '0.88rem' }}>
                    <span style={{ fontWeight: 600 }}>{e.action}</span>
                    {e.target && <span className="muted"> — {e.target}</span>}
                  </div>
                  {e.detail && (
                    <div className="card-sub" style={{ marginTop: 4, fontStyle: 'italic' }}>
                      "{e.detail}"
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
