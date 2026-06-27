import { useState } from 'react'
import { Save } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function CandidateProfile() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: user.name, docType: 'Cédula de ciudadanía', doc: '1.022.334.556', birth: '1996-04-12',
    gender: 'Masculino', address: 'Calle 123 # 45-67', city: 'Bogotá', dept: 'Cundinamarca',
    phone: '300 456 7890', email: user.email, civil: 'Soltero(a)', education: 'Profesional',
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="page">
      <PageHeader title="Mis datos personales" subtitle="Completa tu información para continuar el proceso." />
      {saved && <AlertBanner variant="success" title="Datos guardados">Tu información fue actualizada correctamente.</AlertBanner>}

      <form onSubmit={save}>
        <Card className="anim-up" style={{ marginTop: saved ? 16 : 0 }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <Field label="Nombres y apellidos" required><Input value={form.name} onChange={set('name')} /></Field>
            <Field label="Tipo de documento" required><Select value={form.docType} onChange={set('docType')} options={['Cédula de ciudadanía', 'Cédula de extranjería', 'Pasaporte']} /></Field>
            <Field label="Número de documento" required><Input value={form.doc} onChange={set('doc')} /></Field>
            <Field label="Fecha de nacimiento" required><Input type="date" value={form.birth} onChange={set('birth')} /></Field>
            <Field label="Género"><Select value={form.gender} onChange={set('gender')} options={['Femenino', 'Masculino', 'Otro', 'Prefiero no decir']} /></Field>
            <Field label="Estado civil"><Select value={form.civil} onChange={set('civil')} options={['Soltero(a)', 'Casado(a)', 'Unión libre', 'Divorciado(a)', 'Viudo(a)']} /></Field>
            <Field label="Dirección de residencia" required><Input value={form.address} onChange={set('address')} /></Field>
            <Field label="Ciudad" required><Input value={form.city} onChange={set('city')} /></Field>
            <Field label="Departamento" required><Input value={form.dept} onChange={set('dept')} /></Field>
            <Field label="Teléfono" required><Input value={form.phone} onChange={set('phone')} /></Field>
            <Field label="Correo electrónico" required><Input type="email" value={form.email} onChange={set('email')} /></Field>
            <Field label="Nivel de educación más alto"><Select value={form.education} onChange={set('education')} options={['Bachiller', 'Técnico', 'Tecnólogo', 'Profesional', 'Especialización', 'Maestría']} /></Field>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
            <Button type="submit" variant="primary" icon={Save}>Guardar datos</Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
