import { useState } from 'react'
import { Save, Database, Bell, ShieldCheck, Palette } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { isSupabaseConfigured, DATA_MODE } from '../../services/supabaseClient.js'

function Toggle({ label, desc, defaultChecked }) {
  const [on, setOn] = useState(defaultChecked)
  return (
    <div className="stat-row">
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
        <div className="card-sub">{desc}</div>
      </div>
      <button
        onClick={() => setOn((o) => !o)}
        style={{
          width: 44, height: 24, borderRadius: 99, border: 'none',
          background: on ? 'var(--grad-teal)' : 'rgba(255,255,255,0.12)',
          position: 'relative', transition: 'background .2s',
        }}
        aria-pressed={on}
      >
        <span style={{
          position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18,
          borderRadius: '50%', background: '#fff', transition: 'left .2s',
        }} />
      </button>
    </div>
  )
}

export default function Settings() {
  return (
    <div className="page">
      <PageHeader title="Configuración" subtitle="Parámetros de la plataforma e integraciones." />

      {!isSupabaseConfigured() && (
        <AlertBanner variant="info" title="Modo de datos: prototipo">
          La plataforma opera con datos de ejemplo (<b>VITE_DATA_MODE={DATA_MODE}</b>). Configura las variables
          de Supabase en tu archivo <b>.env</b> para activar la persistencia real.
        </AlertBanner>
      )}

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <Card title="Organización" subtitle="Datos de la empresa" className="anim-up">
          <div className="col gap-3">
            <Field label="Razón social"><Input defaultValue="Conexión 360 · Todo Ágil CTA" /></Field>
            <Field label="NIT"><Input defaultValue="900.000.000-0" /></Field>
            <Field label="Ciudad principal"><Input defaultValue="Bogotá D.C." /></Field>
            <Field label="Zona horaria"><Select defaultValue="America/Bogota" options={['America/Bogota', 'America/Mexico_City', 'America/Lima']} /></Field>
          </div>
        </Card>

        <Card title={<span className="row gap-2"><Database size={16} /> Integraciones</span>} className="anim-up">
          <div className="col gap-2">
            <div className="stat-row">
              <span>Supabase (Auth + DB + Storage)</span>
              <Badge variant={isSupabaseConfigured() ? 'success' : 'warning'} dot>
                {isSupabaseConfigured() ? 'Conectado' : 'Pendiente'}
              </Badge>
            </div>
            <div className="stat-row"><span>Asistente IA (Anthropic)</span><Badge variant="neutral" dot>Pendiente</Badge></div>
            <div className="stat-row"><span>Odoo ERP</span><Badge variant="neutral" dot>Pendiente</Badge></div>
            <div className="stat-row"><span>Pasarela de nómina</span><Badge variant="neutral" dot>Pendiente</Badge></div>
          </div>
        </Card>

        <Card title={<span className="row gap-2"><ShieldCheck size={16} /> Seguridad</span>} className="anim-up">
          <div className="col">
            <Field label="Cierre de sesión por inactividad (min)"><Input type="number" defaultValue="30" /></Field>
            <div style={{ height: 8 }} />
            <Toggle label="Doble factor (2FA)" desc="Exigir verificación adicional al ingresar" defaultChecked={false} />
            <Toggle label="Forzar firma de autorización de datos" desc="Ley 1581 de 2012" defaultChecked />
            <Toggle label="Registrar dirección IP en auditoría" desc="Trazabilidad completa" defaultChecked />
          </div>
        </Card>

        <Card title={<span className="row gap-2"><Bell size={16} /> Notificaciones</span>} className="anim-up">
          <div className="col">
            <Toggle label="Alertas de documentos por vencer" desc="Avisar N días antes" defaultChecked />
            <Toggle label="Aprobaciones pendientes" desc="Recordatorio tras 5 días" defaultChecked />
            <Toggle label="Resumen ejecutivo semanal" desc="Enviar cada lunes" defaultChecked={false} />
          </div>
        </Card>
      </div>

      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
        <Button variant="primary" icon={Save}>Guardar configuración</Button>
      </div>
    </div>
  )
}
