import { useMemo, useRef, useState, useEffect } from 'react'
import { Download, Send, FilePlus2, FileText, Upload, LayoutTemplate } from 'lucide-react'
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
import { ROLES } from '../../utils/roles.js'
import { useMySignatures } from '../../hooks/useMySignatures.js'
import { useLegalTemplates } from '../../hooks/useLegalTemplates.js'
import { useContracts } from '../../hooks/useContracts.js'
import { useApprovals } from '../../hooks/useApprovals.js'
import { useUsers } from '../../hooks/useUsers.js'
import { usePersonnel } from '../../hooks/usePersonnel.js'
import { useCandidates } from '../../hooks/useCandidates.js'
import { useAreaApprovers } from '../../hooks/useAreaApprovers.js'
import { formatDate, formatDateTime } from '../../utils/format.js'
import { nextConsecutive, formatConsecutive, verificationCode } from '../../utils/documents.js'
import { exportNodeToPdf } from '../../utils/pdf.js'
import { USE_SUPABASE } from '../../services/api.js'
import { supabase } from '../../services/supabaseClient.js'

function fillTemplate(body, values) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || `[${key}]`)
}

async function uploadPdfToStorage(file, personName) {
  const safeName = personName.replace(/\s+/g, '_').toLowerCase()
  const path = `contratos/${Date.now()}_${safeName}.pdf`
  if (USE_SUPABASE) {
    const { error } = await supabase.storage.from('documentos').upload(path, file)
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('documentos').getPublicUrl(path)
    return data?.publicUrl || null
  }
  // Mock: devuelve object URL local
  return URL.createObjectURL(file)
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
  const { personnel: PERSONNEL } = usePersonnel()
  const { candidates: CANDIDATES } = useCandidates()
  const { areaApprovers: AREA_APPROVERS } = useAreaApprovers()
  const [library, setLibrary] = useMySignatures()

  // 'template' | 'pdf'
  const [mode, setMode] = useState('template')

  const PEOPLE = useMemo(() => [
    ...PERSONNEL.map((p) => ({ id: `p:${p.id}`, name: p.name, doc: p.doc, cargo: p.position, area: p.area })),
    ...CANDIDATES.map((c) => ({ id: `c:${c.id}`, name: c.name, doc: c.doc, cargo: c.position, area: 'Aspirante' })),
  ], [PERSONNEL, CANDIDATES])

  const [personId, setPersonId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [city, setCity] = useState('Bogotá D.C.')
  const [cargo, setCargo] = useState('')
  const [fieldValues, setFieldValues] = useState({})
  const [signature, setSignature] = useState(null)
  const [submitted, setSubmitted] = useState(null)
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  // Modo PDF
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfName, setPdfName] = useState('')
  const [pdfUploading, setPdfUploading] = useState(false)
  const [pdfError, setPdfError] = useState('')

  const person = PEOPLE.find((p) => p.id === personId)

  useEffect(() => {
    if (person) setCargo(person.cargo || '')
  }, [personId]) // eslint-disable-line react-hooks/exhaustive-deps
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
      cargo: cargo || person?.cargo || '',
      ciudad: city,
      fecha: today,
      ...fieldValues,
    }),
    [person, cargo, city, today, fieldValues]
  )

  const filledBody = template ? fillTemplate(template.body, values) : ''
  const canSubmit = person && template && signature && !submitted && canSignDocs
  const canSubmitPdf = person && pdfFile && pdfName.trim() && signature && !submitted && canSignDocs

  const submit = async () => {
    if (!canSubmit) return
    setConfirmSubmit(false)
    const consecutive = nextConsecutive()
    const date = new Date().toISOString()
    const code = verificationCode({ personId, templateId, filledBody, signerName: user.name, consecutive, date })
    const creatorSeal = { consecutive, date, code, signature, signerName: user.name, signerRole: 'Área Jurídica' }

    const contract = await addContract({
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

    const personUserId = personId.startsWith('c:')
      ? personId.slice(2)
      : users.find((u) => u.employeeId === personId.slice(2))?.id
    const adminUser = users.find((u) => u.role === ROLES.ADMIN)
    const legalUser = users.find((u) => u.role === ROLES.LEGAL)

    const chain = [
      ...(personUserId ? [{ id: personUserId, name: person.name, role: 'Contratado/a', area: person.area || 'Personal', stepOrder: 0 }] : []),
      ...(adminUser ? [{ id: adminUser.id, name: adminUser.name, role: 'Administrador', area: 'Dirección General', stepOrder: 1 }] : []),
      ...(legalUser ? [{ id: legalUser.id, name: legalUser.name, role: 'Área Jurídica', area: 'Jurídica', stepOrder: 1 }] : []),
    ]

    const approval = await submitForApproval({
      domain: 'contract',
      refId: contract.id,
      title: `${template.name} — ${person.name}`,
      area: 'Jurídica / Contratos',
      requestedById: user.id,
      requestedBy: user.name,
      requestedByRole: 'Área Jurídica',
      creatorSeal,
      chain,
    })

    setSubmitted({ consecutive, date, code, approvalId: approval.id })
  }

  const submitPdf = async () => {
    if (!canSubmitPdf) return
    setConfirmSubmit(false)
    setPdfUploading(true)
    setPdfError('')
    try {
      const pdfUrl = await uploadPdfToStorage(pdfFile, person.name)
      const consecutive = nextConsecutive()
      const date = new Date().toISOString()
      const code = verificationCode({ personId, templateId: 'pdf-upload', filledBody: pdfName, signerName: user.name, consecutive, date })
      const creatorSeal = { consecutive, date, code, signature, signerName: user.name, signerRole: 'Área Jurídica' }

      const contract = await addContract({
        templateId: null,
        templateName: pdfName.trim(),
        personId,
        personName: person.name,
        personDoc: person.doc,
        personArea: person.area,
        city,
        content: `<p><a href="${pdfUrl}" target="_blank">Ver contrato PDF</a></p>`,
        pdfUrl,
        status: 'pendiente',
        createdBy: user.name,
        createdByRole: 'Área Jurídica',
        createdAt: date,
        consecutive,
        verificationCode: code,
        creatorSignature: signature,
      })

      const personUserId = personId.startsWith('c:')
        ? personId.slice(2)
        : users.find((u) => u.employeeId === personId.slice(2))?.id
      const adminUser = users.find((u) => u.role === ROLES.ADMIN)
      const legalUser = users.find((u) => u.role === ROLES.LEGAL)

      const chain = [
        ...(personUserId ? [{ id: personUserId, name: person.name, role: 'Contratado/a', area: person.area || 'Personal', stepOrder: 0 }] : []),
        ...(adminUser ? [{ id: adminUser.id, name: adminUser.name, role: 'Administrador', area: 'Dirección General', stepOrder: 1 }] : []),
        ...(legalUser ? [{ id: legalUser.id, name: legalUser.name, role: 'Área Jurídica', area: 'Jurídica', stepOrder: 1 }] : []),
      ]

      await submitForApproval({
        domain: 'contract',
        refId: contract.id,
        title: `${pdfName.trim()} — ${person.name}`,
        area: 'Jurídica / Contratos',
        requestedById: user.id,
        requestedBy: user.name,
        requestedByRole: 'Área Jurídica',
        creatorSeal,
        chain,
      })

      setSubmitted({ consecutive, date, code, pdfUrl })
    } catch (err) {
      setPdfError(err.message || 'Error al subir el PDF.')
    } finally {
      setPdfUploading(false)
    }
  }

  const download = () => {
    if (!pageRef.current) return
    const name = submitted ? formatConsecutive(submitted.consecutive) : `contrato_${Date.now()}`
    exportNodeToPdf(pageRef.current, `${name}.pdf`)
  }

  const reset = () => {
    setPersonId(''); setTemplateId(''); setCargo(''); setFieldValues({})
    setSignature(null); setSubmitted(null)
    setPdfFile(null); setPdfName(''); setPdfError('')
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
        subtitle="Usa una plantilla del sistema o sube directamente un PDF ya elaborado."
        actions={submitted && <Button variant="ghost" icon={FilePlus2} onClick={reset}>Nuevo contrato</Button>}
      />

      {/* Toggle de modo */}
      {!submitted && (
        <div className="row gap-2" style={{ marginBottom: 18 }}>
          <button
            className={`tab-btn${mode === 'template' ? ' tab-btn--active' : ''}`}
            onClick={() => setMode('template')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: '1.5px solid var(--glass-border)', background: mode === 'template' ? 'var(--primary)' : 'transparent', color: mode === 'template' ? '#fff' : 'var(--text-soft)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', transition: 'all .15s' }}
          >
            <LayoutTemplate size={15} /> Usar plantilla
          </button>
          <button
            className={`tab-btn${mode === 'pdf' ? ' tab-btn--active' : ''}`}
            onClick={() => setMode('pdf')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: '1.5px solid var(--glass-border)', background: mode === 'pdf' ? 'var(--primary)' : 'transparent', color: mode === 'pdf' ? '#fff' : 'var(--text-soft)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', transition: 'all .15s' }}
          >
            <Upload size={15} /> Subir PDF
          </button>
        </div>
      )}

      {/* ── MODO PLANTILLA ── */}
      {mode === 'template' && (
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
                <Field label="Cargo / posición" required>
                  <Input value={cargo} onChange={(e) => setCargo(e.target.value)} disabled={!!submitted} placeholder="Ej: Técnico de sistemas" />
                </Field>
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
                <AlertBanner variant="success" title="Contrato enviado a firma">
                  Consecutivo <b>{formatConsecutive(submitted.consecutive)}</b> · enviado el {formatDateTime(submitted.date)}.
                  Primero debe firmarlo <b>{person?.name}</b>; luego regresa al Admin y Jurídica para la firma final.
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
      )}

      {/* ── MODO PDF ── */}
      {mode === 'pdf' && (
        <div className="grid" style={{ gridTemplateColumns: 'minmax(340px, 440px) 1fr', gap: 18, alignItems: 'start' }}>
          <div className="col gap-3">
            <Card title="Datos del contrato" subtitle="Sube el PDF ya elaborado">
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
                <Field label="Nombre / descripción del contrato" required>
                  <Input
                    value={pdfName}
                    onChange={(e) => setPdfName(e.target.value)}
                    disabled={!!submitted}
                    placeholder="Ej: Contrato de prestación de servicios"
                  />
                </Field>
                <Field label="Ciudad">
                  <Input value={city} onChange={(e) => setCity(e.target.value)} disabled={!!submitted} />
                </Field>

                <Field label="Archivo PDF (máx. 10 MB)" required>
                  {!submitted ? (
                    <label
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                        border: `1.5px dashed ${pdfFile ? 'var(--primary)' : 'var(--glass-border)'}`,
                        borderRadius: 8, cursor: 'pointer', background: 'var(--surface)',
                        fontSize: '0.875rem', color: pdfFile ? 'var(--primary)' : 'var(--text-soft)',
                        transition: 'border-color .15s',
                      }}
                    >
                      <FileText size={16} />
                      {pdfFile ? pdfFile.name : 'Seleccionar archivo PDF…'}
                      <input
                        type="file" accept=".pdf" style={{ display: 'none' }}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (!f) return
                          if (f.size > 10 * 1024 * 1024) { setPdfError('El archivo no debe superar 10 MB.'); return }
                          setPdfFile(f); setPdfError('')
                        }}
                      />
                    </label>
                  ) : (
                    submitted.pdfUrl && (
                      <a href={submitted.pdfUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="ghost" icon={FileText}>Ver contrato PDF subido</Button>
                      </a>
                    )
                  )}
                </Field>

                {pdfError && <div className="alert alert--danger" style={{ padding: '10px 12px' }}>{pdfError}</div>}
              </div>
            </Card>

            <Card title="Firma de quien emite" subtitle="Área Jurídica">
              {submitted ? (
                <AlertBanner variant="success" title="Contrato enviado a aprobación">
                  Consecutivo <b>{formatConsecutive(submitted.consecutive)}</b> · enviado el {formatDateTime(submitted.date)}.
                  Primero debe firmarlo <b>{person?.name}</b>; luego regresa al Admin y Jurídica.
                </AlertBanner>
              ) : (
                <>
                  <SignaturePicker library={library} setLibrary={setLibrary} active={signature} onSelect={setSignature} />
                  {!canSignDocs && (
                    <AlertBanner variant="warning">Tu rol no tiene permiso para firmar. Pide al Admin que lo habilite en Permisos.</AlertBanner>
                  )}
                  <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
                    <Button
                      variant="violet" icon={Send}
                      disabled={!canSubmitPdf || pdfUploading}
                      onClick={() => setConfirmSubmit(true)}
                      title={!canSignDocs ? 'Sin permiso para firmar' : undefined}
                    >
                      {pdfUploading ? 'Subiendo…' : 'Firmar y enviar a aprobación'}
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>

          <Card title="Información" subtitle="¿Qué pasa al subir el PDF?">
            <div className="col gap-3" style={{ color: 'var(--text-soft)', fontSize: '0.875rem', lineHeight: 1.65 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700, minWidth: 20 }}>1.</span>
                El PDF se sube de forma segura al almacenamiento de la plataforma.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700, minWidth: 20 }}>2.</span>
                Se genera un consecutivo y código de verificación únicos para este documento.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700, minWidth: 20 }}>3.</span>
                El contrato pasa por el mismo flujo de firmas: primero la persona contratada, luego Admin y Jurídica.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700, minWidth: 20 }}>4.</span>
                Queda registrado en el historial de contratos igual que si hubieras usado una plantilla.
              </div>

              {pdfFile && (
                <div style={{ marginTop: 8, padding: '12px 14px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Archivo seleccionado</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={14} style={{ color: 'var(--primary)' }} />
                    <span>{pdfFile.name}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--text-dim)' }}>
                      {(pdfFile.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <ReAuthModal
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        actionLabel="Confirmar y firmar"
        message={
          mode === 'pdf'
            ? `¿Seguro que quieres subir "${pdfName}" y enviarlo a aprobación? Se generará un consecutivo permanente.`
            : '¿Seguro que quieres firmar este contrato y enviarlo a aprobación? Quedará un consecutivo y código de verificación permanentes.'
        }
        onConfirm={mode === 'pdf' ? submitPdf : submit}
        preview={
          mode === 'template' && template ? (
            <>
              <b style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>{template.name} — {person?.name}</b>
              <div className="doc-body" style={{ fontSize: '0.82rem' }} dangerouslySetInnerHTML={{ __html: filledBody }} />
              <div style={{ marginTop: 12 }}>
                <SignatureSeal signature={signature} signerName={user.name} signerRole="Área Jurídica" signed={null} />
              </div>
            </>
          ) : mode === 'pdf' && pdfFile ? (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-soft)' }}>
              <b style={{ color: 'var(--text)' }}>{pdfName}</b> — {person?.name}<br />
              <span>Archivo: {pdfFile.name} ({(pdfFile.size / 1024).toFixed(0)} KB)</span>
            </div>
          ) : null
        }
      />
    </div>
  )
}
