import { useRef, useState } from 'react'
import { Download, FilePlus2, PenLine, ShieldCheck, Send } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { AlertBanner, Tabs } from '../../components/ui/Feedback.jsx'
import RichTextEditor from '../../components/feature/RichTextEditor.jsx'
import SignaturePicker from '../../components/feature/SignaturePicker.jsx'
import SignatureSeal from '../../components/feature/SignatureSeal.jsx'
import PdfSignStudio from '../../components/feature/PdfSignStudio.jsx'
import RoutingChainBuilder from '../../components/feature/RoutingChainBuilder.jsx'
import ReAuthModal from '../../components/feature/ReAuthModal.jsx'
import { LogoMark } from '../../assets/Logo.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { usePermissions } from '../../context/PermissionsContext.jsx'
import { useMySignatures } from '../../hooks/useMySignatures.js'
import { useGeneratedDocuments } from '../../hooks/useGeneratedDocuments.js'
import { useApprovals } from '../../hooks/useApprovals.js'
import { formatDate } from '../../utils/format.js'
import { nextConsecutive, formatConsecutive, verificationCode } from '../../utils/documents.js'
import { exportNodeToPdf } from '../../utils/pdf.js'
import { ROLE_META } from '../../utils/roles.js'

const TEMPLATES = {
  libre: { title: 'Documento', body: '<p>Escribe aquí el contenido del documento…</p>' },
  certificacion: {
    title: 'Certificación',
    body:
      '<p>La empresa <b>CONEXIÓN 360 · TODO ÁGIL CTA</b>, identificada con NIT 900.000.000-0,</p>' +
      '<h2>CERTIFICA QUE:</h2>' +
      '<p>[Nombre del titular], identificado(a) con documento No. [número], se encuentra ' +
      'vinculado(a) a la organización, desempeñando el cargo de [cargo] desde el [fecha].</p>' +
      '<p>La presente se expide a solicitud del interesado.</p>',
  },
  carta: {
    title: 'Carta',
    body: '<p>Señores<br><b>[Destinatario]</b></p><p>Reciban un cordial saludo.</p><p>Por medio de la presente…</p><p>Agradecemos su atención.</p>',
  },
  memorando: {
    title: 'Memorando interno',
    body: '<p><b>PARA:</b> [Área / persona]</p><p><b>DE:</b> [Remitente]</p><p><b>ASUNTO:</b> [Asunto]</p><h2>Desarrollo</h2><p>…</p>',
  },
  acta: {
    title: 'Acta',
    body: '<p>En la ciudad de [Ciudad], siendo las [hora] del [fecha], se reúnen…</p><h2>Orden del día</h2><ol><li>Verificación de asistencia</li><li>Desarrollo</li><li>Compromisos</li></ol>',
  },
}

export default function DocumentEditor() {
  const { user } = useAuth()
  const { hasCapability } = usePermissions()
  const canGenerate = hasCapability(user.id, 'canGenerateDocuments')
  const canSignDocs = hasCapability(user.id, 'canSign')
  const pageRef = useRef(null)

  const [mode, setMode] = useState('crear') // 'crear' | 'firmar'
  const [library, setLibrary] = useMySignatures()
  const [signature, setSignature] = useState(null)
  const [signerName, setSignerName] = useState(user.name)
  const [signerRole, setSignerRole] = useState('Administrador General')
  const { addDocument } = useGeneratedDocuments()
  const { submitForApproval } = useApprovals()

  // --- Modo crear ---
  const [template, setTemplate] = useState('libre')
  const [title, setTitle] = useState('Documento')
  const [city, setCity] = useState('Bogotá D.C.')
  const [content, setContent] = useState(TEMPLATES.libre.body)
  const [editorKey, setEditorKey] = useState(0)
  const [signed, setSigned] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [chain, setChain] = useState([])
  const [routed, setRouted] = useState(null)
  const [confirmSign, setConfirmSign] = useState(false)

  const plainContent = content.replace(/<[^>]+>/g, '').trim()
  const readyToSign = signerName.trim() && signature && plainContent.length > 0 && !signed && canSignDocs

  const applyTemplate = (key) => {
    if (signed) return
    setTemplate(key)
    setTitle(TEMPLATES[key].title)
    setContent(TEMPLATES[key].body)
    setEditorKey((k) => k + 1)
  }

  const doSign = () => {
    const consecutive = nextConsecutive()
    const date = new Date().toISOString()
    const code = verificationCode({ title, content, signerName, signerRole, consecutive, date })
    setSigned({ consecutive, code, date })
    setConfirmSign(false)
  }

  const downloadCreated = async () => {
    if (!pageRef.current) return
    setExporting(true)
    try {
      const name = signed ? formatConsecutive(signed.consecutive) : `documento_${Date.now()}`
      await exportNodeToPdf(pageRef.current, `${name}.pdf`)
    } finally {
      setExporting(false)
    }
  }

  const sendToApproval = () => {
    if (!signed || chain.length === 0) return
    const creatorSeal = { ...signed, signature, signerName, signerRole }
    const doc = addDocument({
      title,
      city,
      content,
      status: 'pendiente',
      createdBy: signerName,
      createdByRole: signerRole,
      createdAt: signed.date,
      consecutive: signed.consecutive,
      verificationCode: signed.code,
      creatorSignature: signature,
    })
    const approval = submitForApproval({
      domain: 'document',
      refId: doc.id,
      title,
      area: ROLE_META[user.role]?.label || user.role,
      requestedById: user.id,
      requestedBy: user.name,
      requestedByRole: ROLE_META[user.role]?.label || user.role,
      creatorSeal,
      chain,
    })
    setRouted({ approvalId: approval.id, chain })
  }

  const resetCreated = () => {
    setSigned(null)
    setTemplate('libre')
    setTitle('Documento')
    setContent(TEMPLATES.libre.body)
    setEditorKey((k) => k + 1)
    setChain([])
    setRouted(null)
  }

  if (!canGenerate) {
    return (
      <div className="page">
        <PageHeader title="Editor de documentos" subtitle="Generar y firmar documentos." />
        <Card>
          <AlertBanner variant="warning" title="Sin permiso para este módulo">
            Tu rol no tiene habilitada la generación de documentos. Solicita al Administrador que active esta
            capacidad desde <b>Admin → Permisos</b>.
          </AlertBanner>
        </Card>
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Editor de documentos"
        subtitle="Crea documentos o firma PDFs existentes con tu firma reutilizable y consecutivo verificable."
        actions={
          mode === 'crear' && (
            <>
              {signed && <Button variant="ghost" icon={FilePlus2} onClick={resetCreated}>Documento nuevo</Button>}
              <Button variant={signed ? 'primary' : 'ghost'} icon={Download} disabled={exporting} onClick={downloadCreated}>
                {exporting ? 'Generando…' : 'Descargar PDF'}
              </Button>
            </>
          )
        }
      />

      <div style={{ marginBottom: 18 }}>
        <Tabs
          active={mode}
          onChange={(m) => { setMode(m); setSignature(null) }}
          tabs={[
            { value: 'crear', label: 'Crear documento' },
            { value: 'firmar', label: 'Firmar documento existente' },
          ]}
        />
      </div>

      {/* ============================ CREAR ============================ */}
      {mode === 'crear' && (
        <div className="grid" style={{ gridTemplateColumns: 'minmax(340px, 460px) 1fr', gap: 18, alignItems: 'start' }}>
          <div className="col gap-3">
            <Card title="Contenido" subtitle="Editor de texto enriquecido">
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Field label="Plantilla">
                  <Select value={template} onChange={(e) => applyTemplate(e.target.value)} disabled={!!signed}
                    options={[
                      { value: 'libre', label: 'Documento libre' },
                      { value: 'certificacion', label: 'Certificación' },
                      { value: 'carta', label: 'Carta' },
                      { value: 'memorando', label: 'Memorando' },
                      { value: 'acta', label: 'Acta' },
                    ]} />
                </Field>
                <Field label="Ciudad"><Input value={city} onChange={(e) => setCity(e.target.value)} disabled={!!signed} /></Field>
              </div>
              <Field label="Título del documento"><Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!!signed} /></Field>
              <div style={{ height: 12 }} />
              <RichTextEditor key={editorKey} value={content} onChange={setContent} disabled={!!signed} />
            </Card>

            <Card title={<span className="row gap-2"><PenLine size={16} /> Firma</span>} subtitle="Reutiliza una firma guardada o crea una nueva">
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <Field label="Nombre de quien firma" required><Input value={signerName} onChange={(e) => setSignerName(e.target.value)} disabled={!!signed} /></Field>
                <Field label="Cargo"><Input value={signerRole} onChange={(e) => setSignerRole(e.target.value)} disabled={!!signed} /></Field>
              </div>

              {signed ? (
                <AlertBanner variant="success" title="Documento firmado">
                  Firmado con consecutivo <b>{formatConsecutive(signed.consecutive)}</b>.
                </AlertBanner>
              ) : (
                <>
                  <SignaturePicker library={library} setLibrary={setLibrary} active={signature} onSelect={setSignature} />
                  <div style={{ height: 12 }} />
                  {!canSignDocs && (
                    <AlertBanner variant="warning">Tu rol no tiene permiso para firmar documentos. Pide al Admin que lo habilite en Permisos.</AlertBanner>
                  )}
                  <AlertBanner variant="info">
                    Al firmar se asigna un <b>consecutivo único</b>, la <b>fecha y hora exactas</b> y un <b>código de verificación</b>.
                  </AlertBanner>
                  <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
                    <Button variant="violet" icon={ShieldCheck} disabled={!readyToSign} onClick={() => setConfirmSign(true)} title={!canSignDocs ? 'Sin permiso para firmar' : undefined}>
                      Firmar documento
                    </Button>
                  </div>
                </>
              )}
            </Card>

            {signed && (
              <Card title={<span className="row gap-2"><Send size={16} /> Enviar de área en área</span>} subtitle="Elige quién debe firmar, en orden">
                {routed ? (
                  <AlertBanner variant="success" title="Documento enviado a firma">
                    Se envió a {routed.chain.length === 1 ? routed.chain[0].name : `${routed.chain.length} personas, empezando por ${routed.chain[0].name}`}.
                    Cada quien deberá confirmar su usuario y contraseña antes de firmar.
                  </AlertBanner>
                ) : (
                  <>
                    <RoutingChainBuilder chain={chain} setChain={setChain} />
                    <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
                      <Button variant="violet" icon={Send} disabled={chain.length === 0} onClick={sendToApproval}>
                        Enviar a firma
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            )}
          </div>

          <Card title="Vista previa" subtitle="Así se verá el PDF"
            action={signed ? <Badge variant="success" dot>Firmado</Badge> : <Badge variant="warning" dot>Borrador</Badge>}>
            <div className="doc-scroll">
              <div className="doc-page" ref={pageRef}>
                <div className="doc-head">
                  <div className="brand">
                    <LogoMark size={40} />
                    <div><b>CONEXIÓN 360</b><span>TODO ÁGIL CTA</span></div>
                  </div>
                  <div className="doc-meta">
                    <div>NIT 900.000.000-0</div><div><b>{city}</b></div><div>{formatDate(new Date())}</div>
                  </div>
                </div>
                <div className="doc-title">{title}</div>
                <div className="doc-body" dangerouslySetInnerHTML={{ __html: content }} />
                <div className="doc-sign">
                  <SignatureSeal signature={signature} signerName={signerName} signerRole={signerRole} signed={signed} />
                </div>
                <div className="doc-foot">
                  Documento generado por la plataforma Conexión 360 · Todo Ágil CTA.
                  {signed && ' La autenticidad puede verificarse con el consecutivo y el código indicado.'}
                </div>
              </div>
            </div>
          </Card>

          <ReAuthModal
            open={confirmSign}
            onClose={() => setConfirmSign(false)}
            actionLabel="Confirmar y firmar"
            message="¿Seguro que quieres firmar este documento? Se asignará un consecutivo y un código de verificación permanentes."
            onConfirm={doSign}
            preview={
              <>
                <b style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>{title}</b>
                <div className="doc-body" style={{ fontSize: '0.82rem' }} dangerouslySetInnerHTML={{ __html: content }} />
                <div style={{ marginTop: 12 }}>
                  <SignatureSeal signature={signature} signerName={signerName} signerRole={signerRole} signed={null} />
                </div>
              </>
            }
          />
        </div>
      )}

      {/* ==================== FIRMAR EXISTENTE (asistente por etapas) ==================== */}
      {mode === 'firmar' && (
        <PdfSignStudio
          library={library}
          setLibrary={setLibrary}
          signerName={signerName}
          setSignerName={setSignerName}
          signerRole={signerRole}
          setSignerRole={setSignerRole}
          onGenerateDoc={() => { setMode('crear'); setSignature(null) }}
        />
      )}
    </div>
  )
}
