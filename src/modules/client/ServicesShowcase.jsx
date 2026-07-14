import { useState } from 'react'
import { UserPlus, Briefcase, Wallet, Receipt, Scale, ShieldCheck, Send, Sparkles } from 'lucide-react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Textarea } from '../../components/ui/Form.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useServiceRequests } from '../../hooks/useServiceRequests.js'
import { SERVICES } from '../../data/mockServices.js'

const ICONS = { UserPlus, Briefcase, Wallet, Receipt, Scale, ShieldCheck }

// Vitrina de servicios para el rol Cliente: deliberadamente NO se ve como el
// resto de la plataforma (nada de KPIs/tablero operativo) — es una página de
// presentación y venta de servicios, con un hero y tarjetas de producto.
export default function ServicesShowcase() {
  const { user } = useAuth()
  const { addRequest } = useServiceRequests()
  const [active, setActive] = useState(null)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(null)

  const openRequest = (service) => {
    setActive(service)
    setMessage('')
    setSent(null)
  }

  const submit = () => {
    if (!active) return
    addRequest({
      serviceId: active.id,
      serviceName: active.name,
      requestedById: user.id,
      requestedBy: user.name,
      company: user.clientCompany || user.area,
      message,
    })
    setSent(active.name)
  }

  return (
    <div className="page">
      <section className="svc-hero">
        <span className="svc-hero-tag"><Sparkles size={14} /> Conexión 360 · Servicios para tu empresa</span>
        <h1>Soluciones de talento humano, nómina y cumplimiento, listas para escalar contigo.</h1>
        <p>Elige un servicio y envíanos tu solicitud. Un asesor comercial te contactará para diseñar la propuesta.</p>
      </section>

      <div className="svc-grid">
        {SERVICES.map((s) => {
          const Icon = ICONS[s.icon]
          return (
            <article key={s.id} className="svc-card">
              {s.highlight && <span className="svc-card-flag">Más solicitado</span>}
              <div className="svc-card-icon"><Icon size={22} /></div>
              <Badge variant="neutral">{s.category}</Badge>
              <h3>{s.name}</h3>
              <p className="svc-card-tagline">{s.tagline}</p>
              <p className="svc-card-desc">{s.description}</p>
              <Button variant="primary" icon={Send} className="full" onClick={() => openRequest(s)}>
                Solicitar este servicio
              </Button>
            </article>
          )
        })}
      </div>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={sent ? 'Solicitud enviada' : `Solicitar: ${active?.name || ''}`}
        footer={
          sent ? (
            <Button variant="primary" onClick={() => setActive(null)}>Entendido</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setActive(null)}>Cancelar</Button>
              <Button variant="primary" icon={Send} onClick={submit}>Enviar solicitud</Button>
            </>
          )
        }
      >
        {sent ? (
          <AlertBanner variant="success" title="¡Gracias por tu interés!">
            Recibimos tu solicitud de <b>{sent}</b>. Puedes seguir su estado en <b>Mis solicitudes</b>.
          </AlertBanner>
        ) : (
          <div className="col gap-3">
            <p className="card-sub">{active?.description}</p>
            <Field label="Cuéntanos qué necesitas (opcional)">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ej: Necesitamos 5 operarios de producción para nuestra planta en Bogotá…"
              />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  )
}
