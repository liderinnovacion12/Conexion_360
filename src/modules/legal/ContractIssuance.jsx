import { useMemo, useRef, useState } from 'react'
import { Download, ShieldCheck, Send, FilePlus2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import SignaturePicker from '../../components/feature/SignaturePicker.jsx'
import SignatureSeal from '../../components/feature/SignatureSeal.jsx'
import ReAuthModal from '../../components/feature/ReAuthModal.jsx'
import { LogoMark } from '../../assets/Logo.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { usePermissions } from '../../context/PermissionsContext.jsx'
import { useMySignatures } from '../../hooks/useMySignatures.js'
import { useLegalTemplates } from '../../hooks/useLegalTemplates.js'
import { useContracts } from '../../hooks/useContracts.js'
import { useApprovals } from '../../hooks/useApprovals.js'
import { useUsers } from '../../hooks/useUsers.js'
import { PERSONNEL } from '../../data/mockPersonnel.js'
import { CANDIDATES } from '../../data/mockCandidates.js'
import { AREA_APPROVERS } from '../../data/mockApprovals.js'
import { formatDate, formatDateTime } from '../../utils/format.js'
import { nextConsecutive, formatConsecutive, verificationCode } from '../../utils/documents.js'
import { exportNodeToPdf } from '../../utils/pdf.js'

const PEOPLE = [
  ...PERSONNEL.map((p) => ({ id: `p:${p.id}`, name: p.name, doc: p.doc, cargo: p.position, area: p.area })),
  ...CANDIDATES.map((c) => ({ id: `c:${c.id}`, name: c.name, doc: c.doc, cargo: c.position, area: 'Aspirante' })),
]

function fillTemplate(body, values) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || `[${key}]`)
}

export default function ContractIssuance() {
  const { user } = useAuth()
  const { hasCapability } = usePermissions()
  const canGenerate = hasCapability(user.id, 'canGenerateDocuments')
  const canSignDocs = hasCapability(user.id, 'canSign')
  const pageRef = useRef(null)
  const { templates } = useLegalTemplates()
  const { addContract } = useContracts()
  const { submitForApproval } = useApprovals()
  const { users } = useUsers()
  const [library, setLibrary] = useMySignatures()

  const [personId, setPersonId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [city, setCity] = useState('Bogotá D.C.')
  const [fieldValues, setFieldValues] = useState({})
  const [signature, setSignature] = useState(null)
  const [submitted, setSubmitted] = useState(null)
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  const person = PEOPLE.find((p) => p.id === personId)
  const template = templates.find((t) => t.id === templateId)
  const today = formatDate(new Date())

  const extraPlaceholders = useMemo(() => {
    if (!template) return []
    const autoKeys = ['nombre', 'documento', 'cargo', 'ciudad', 'fecha']
    return template.placeholders.filter((p) => !autoKeys.includes(p.key))
  }, [template])

  const values = useMemo(
    () => ({
      nombre: person?.name || '',
      documento: person?.doc || '',
      cargo: person?.cargo || '',
      ciudad: city,
      fecha: today,
      ...fieldValues,
    }),
    [person, city, today, fieldValues]
  )

  const filledBody = template ? fillTemplate(template.body, values) : ''
  const canSubmit = person && template && signature && !submitted && canSignDocs

  const submit = () => {
    if (!canSubmit) return
    setConfirmSubmit(false)
    const consecutive = nextConsecutive()
    const date = new Date().toISOString()
    const code = verificationCode({ personId, templateId, filledBody, signerName: user.name, consecutive, date })
    const creatorSeal = { consecutive, date, code, signature, signerName: user.name, signerRole: 'Área Jurídica' }

    const contract = addContract({
      templateId: template.id,
      templateName: template.name,
      personId,
      personName: person.name,
      personDoc: person.doc,
      personArea: person.area,
      city,
      content: filledBody,
      status: 'pendiente',
      createdBy: user.name,
      createdByRole: 'Área Jurídica',
      createdAt: date,
      consecutive,
      verificationCode: code,
      creatorSignature: signature,
    })

    const approverId = AREA_APPROVERS['Jurídica / Contratos']
    const approver = users.find((u) => u.id === approverId)

    const approval = submitForApproval({
      domain: 'contract',
      refId: contract.id,
      title: `${template.name} — ${person.name}`,
      area: 'Jurídica / Contratos',
      requestedById: user.id,
      requestedBy: user.name,
      requestedByRole: 'Área Jurídica',
      creatorSeal,
      chain: [{ id: approverId, name: approver?.name || 'Líder Jurídica', role: 'Líder Jurídica', area: 'Jurídica / Contratos' }],
    })

    setSubmitted({ consecutive, date, code, approvalId: approval.id })
  }

  const download = () => {
    if (!pageRef.current) return
    const name = submitted ? formatConsecutive(submitted.consecutive) : `contrato_${Date.now()}`
    exportNodeToPdf(pageRef.current, `${name}.pdf`)
  }

  const reset = () => {
    setPersonId(''); setTemplateId(''); setFieldValues({}); setSignature(null); setSubmitted(null)
  }

  if (!canGenerate) {
    return (
      <div className="page">
        <PageHeader title="Emitir contratos" subtitle="Selecciona persona y plantilla, firma y envía a aprobación." />
        <Card>
          <AlertBanner variant="warning" title="Sin permiso para este módulo">
            Tu rol no tiene habilitada la generación de contratos. Solicita al Administrador que active esta
            capacidad desde <b>Admin → Permisos</b>.
          </AlertBanner>
        </Card>
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Emitir contratos"
        subtitle="Selecciona persona y plantilla, firma y envía a aprobación."
        actions={submitted && <Button variant="ghost" icon={FilePlus2} onClick={reset}>Nuevo contrato</Button>}
      />

      <div className="grid" style={{ gridTemplateColumns: 'minmax(340px, 440px) 1fr', gap: 18, alignItems: 'start' }}>
        <div className="col gap-3">
          <Card title="Datos del contrato" subtitle="Persona y plantilla">
            <div className="col gap-3">
              <Field label="Persona" required>
                <Select
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  disabled={!!submitted}
                  placeholder="Selecciona una persona"
                  options={PEOPLE.map((p) => ({ value: p.id, label: `${p.name} · ${p.doc}` }))}
                />
              </Field>
              <Field label="Plantilla" required>
                <Select
                  value={templateId}
                  onChange={(e) => { setTemplateId(e.target.value); setFieldValues({}) }}
                  disabled={!!submitted}
                  placeholder="Selecciona una plantilla"
                  options={templates.map((t) => ({ value: t.id, label: t.name }))}
                />
              </Field>
              <Field label="Ciudad"><Input value={city} onChange={(e) => setCity(e.target.value)} disabled={!!submitted} /></Field>

              {extraPlaceholders.map((ph) => (
                <Field label={ph.label} key={ph.key}>
                  <Input
                    value={fieldValues[ph.key] || ''}
                    onChange={(e) => setFieldValues((v) => ({ ...v, [ph.key]: e.target.value }))}
                    disabled={!!submitted}
                  />
                </Field>
              ))}
            </div>
          </Card>

          <Card title="Firma de quien emite" subtitle="Área Jurídica">
            {submitted ? (
              <AlertBanner variant="success" title="Contrato enviado a aprobación">
                Consecutivo <b>{formatConsecutive(submitted.consecutive)}</b> · enviado el {formatDateTime(submitted.date)}.
                Queda pendiente de la firma del aprobador designado.
              </AlertBanner>
            ) : (
              <>
                <SignaturePicker library={library} setLibrary={setLibrary} active={signature} onSelect={setSignature} />
                {!canSignDocs && (
                  <AlertBanner variant="warning">Tu rol no tiene permiso para firmar. Pide al Admin que lo habilite en Permisos.</AlertBanner>
                )}
                <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
                  <Button variant="violet" icon={Send} disabled={!canSubmit} onClick={() => setConfirmSubmit(true)} title={!canSignDocs ? 'Sin permiso para firmar' : undefined}>
                    Firmar y enviar a aprobación
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>

        <Card
          title="Vista previa"
          subtitle="Contrato con datos reemplazados"
          action={
            <div className="row gap-2">
              <Badge variant={submitted ? 'success' : 'warning'} dot>{submitted ? 'Enviado' : 'Borrador'}</Badge>
              <Button size="sm" variant="ghost" icon={Download} onClick={download} disabled={!template}>Descargar PDF</Button>
            </div>
          }
        >
          {!template ? (
            <AlertBanner variant="info">Selecciona una persona y una plantilla para ver la vista previa.</AlertBanner>
          ) : (
            <div className="doc-scroll">
              <div className="doc-page" ref={pageRef}>
                <div className="doc-head">
                  <div className="brand">
                    <LogoMark size={40} />
                    <div><b>CONEXIÓN 360</b><span>TODO ÁGIL CTA</span></div>
                  </div>
                  <div className="doc-meta">
                    <div>NIT 900.000.000-0</div><div><b>{city}</b></div><div>{today}</div>
                  </div>
                </div>
                <div className="doc-title">{template.name}</div>
                <div className="doc-body" dangerouslySetInnerHTML={{ __html: filledBody }} />
                <div className="doc-sign">
                  <SignatureSeal signature={signature} signerName={user.name} signerRole="Área Jurídica" signed={submitted} />
                </div>
                <div className="doc-foot">
                  Documento generado por la plataforma Conexión 360 · Todo Ágil CTA. Plantilla de referencia, no constituye asesoría legal.
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <ReAuthModal
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        actionLabel="Confirmar y firmar"
        message="¿Seguro que quieres firmar este contrato y enviarlo a aprobación? Quedará un consecutivo y código de verificación permanentes."
        onConfirm={submit}
        preview={
          template && (
            <>
              <b style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>{template.name} — {person?.name}</b>
              <div className="doc-body" style={{ fontSize: '0.82rem' }} dangerouslySetInnerHTML={{ __html: filledBody }} />
              <div style={{ marginTop: 12 }}>
                <SignatureSeal signature={signature} signerName={user.name} signerRole="Área Jurídica" signed={null} />
              </div>
            </>
          )
        }
      />
    </div>
  )
}
