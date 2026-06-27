import { useState } from 'react'
import { ShieldCheck, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import SignaturePad from '../../components/feature/SignaturePad.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatDate } from '../../utils/format.js'

export default function DataAuthorization() {
  const { user } = useAuth()
  const [accepted, setAccepted] = useState(false)
  const [signature, setSignature] = useState(null)
  const [done, setDone] = useState(false)
  const today = formatDate(new Date())

  const canSubmit = accepted && signature
  const submit = () => canSubmit && setDone(true)

  if (done) {
    return (
      <div className="page">
        <PageHeader title="Autorización de tratamiento de datos" />
        <Card className="anim-scale" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <CheckCircle2 size={48} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
          <h2 className="h2">Autorización firmada</h2>
          <p className="muted" style={{ marginTop: 6 }}>
            Registramos tu autorización el {today}. Gracias, {user.name}.
          </p>
          <div className="glass-soft" style={{ padding: 14, marginTop: 16, textAlign: 'left' }}>
            <div className="stat-row"><span className="muted">Titular</span><b>{user.name}</b></div>
            <div className="stat-row"><span className="muted">Fecha</span><b>{today}</b></div>
            <div className="stat-row"><span className="muted">Método de firma</span><Badge variant="violet">{signature.type === 'draw' ? 'Dibujada' : signature.type === 'upload' ? 'Imagen' : 'Texto'}</Badge></div>
            <div className="stat-row"><span className="muted">Estado</span><Badge variant="success" dot>Aceptada</Badge></div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Autorización de tratamiento de datos personales"
        subtitle="Conforme a la Ley 1581 de 2012 (Colombia)."
      />

      <div className="grid grid-2">
        <Card title="Texto de autorización" subtitle="Lee con atención antes de firmar" className="anim-up">
          <div style={{ maxHeight: 360, overflow: 'auto', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.65, paddingRight: 8 }}>
            <p>
              En cumplimiento de la <b>Ley 1581 de 2012</b>, el Decreto 1377 de 2013 y demás normas concordantes,
              autorizo de manera previa, expresa e informada a <b>CONEXIÓN 360 · TODO ÁGIL CTA</b> (en adelante "la
              Empresa") para recolectar, almacenar, usar, circular, actualizar y suprimir mis datos personales.
            </p>
            <p style={{ marginTop: 10 }}>
              <b>Finalidad.</b> Los datos serán tratados con fines de selección, vinculación, gestión de personal,
              cumplimiento de obligaciones legales y contractuales, generación de certificados, control documental y
              comunicación durante el proceso de reclutamiento y eventual contratación.
            </p>
            <p style={{ marginTop: 10 }}>
              <b>Datos sensibles.</b> Entiendo que algunos datos pueden ser sensibles (p. ej. datos de salud o
              biométricos como fotografías de evidencia). Su entrega es facultativa y autorizo su tratamiento para las
              finalidades aquí descritas.
            </p>
            <p style={{ marginTop: 10 }}>
              <b>Derechos del titular.</b> Conozco que puedo conocer, actualizar, rectificar y suprimir mis datos, así
              como revocar esta autorización, presentando la solicitud a través de los canales dispuestos por la Empresa.
            </p>
            <p style={{ marginTop: 10 }}>
              Declaro que la información suministrada es veraz y que he sido informado sobre la política de tratamiento
              de datos de la Empresa.
            </p>
          </div>
        </Card>

        <Card title="Aceptación y firma" subtitle="Identificación del titular" className="anim-up">
          <div className="glass-soft" style={{ padding: 12, marginBottom: 14 }}>
            <div className="stat-row"><span className="muted">Titular</span><b>{user.name}</b></div>
            <div className="stat-row"><span className="muted">Identificación</span><b>{user.email}</b></div>
            <div className="stat-row"><span className="muted">Fecha</span><b>{today}</b></div>
            <div className="stat-row"><span className="muted">Dirección IP</span><b className="dim">000.000.000.000 (registrada en servidor)</b></div>
          </div>

          <label className="row gap-2" style={{ cursor: 'pointer', marginBottom: 14, alignItems: 'flex-start' }}>
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} style={{ marginTop: 3 }} />
            <span style={{ fontSize: '0.86rem' }}>
              He leído y <b>acepto</b> la autorización para el tratamiento de mis datos personales conforme a la Ley 1581
              de 2012. <span className="req">*</span>
            </span>
          </label>

          <div className="field"><label>Firma digital <span className="req">*</span></label></div>
          <SignaturePad onChange={setSignature} />

          {!canSubmit && (
            <AlertBanner variant="info">Marca la casilla de aceptación y registra tu firma para continuar.</AlertBanner>
          )}

          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
            <Button variant="violet" icon={ShieldCheck} disabled={!canSubmit} onClick={submit}>
              Firmar autorización
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
