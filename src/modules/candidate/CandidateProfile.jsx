import { useState, useEffect } from 'react'
import { Save, Briefcase } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCandidateGroups } from '../../hooks/useCandidateGroups.js'
import { useTracks } from '../../hooks/useTracks.js'
import { useCandidates } from '../../hooks/useCandidates.js'

const emptyForm = (user) => ({
  name: user.name, docType: 'Cédula de ciudadanía', doc: '', birth: '',
  gender: 'Masculino', address: '', city: '', dept: '',
  phone: '', email: user.email, civil: 'Soltero(a)', education: 'Profesional',
})

export default function CandidateProfile() {
  const { user } = useAuth()
  const { candidates, updateCandidate } = useCandidates()
  const candidate = candidates.find((c) => c.id === user.candidateId)
  const { groupsForCandidate } = useCandidateGroups()
  const { trackLabel } = useTracks()
  const myGroups = candidate ? groupsForCandidate(candidate.id) : []
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm(user))

  // Cuando llegan (o cambian) los datos reales del aspirante, precargamos
  // el formulario con ellos en vez de dejar los valores vacíos por defecto.
  useEffect(() => {
    if (!candidate) return
    setForm({
      name: candidate.name || user.name,
      docType: candidate.docType || 'Cédula de ciudadanía',
      doc: candidate.doc || '',
      birth: candidate.birth || '',
      gender: candidate.gender || 'Masculino',
      address: candidate.address || '',
      city: candidate.city || '',
      dept: candidate.dept || '',
      phone: candidate.phone || '',
      email: candidate.email || user.email,
      civil: candidate.civil || 'Soltero(a)',
      education: candidate.education || 'Profesional',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate?.id])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    if (!candidate) return
    setSaving(true)
    try {
      await updateCandidate(candidate.id, form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <PageHeader title="Mis datos personales" subtitle="Completa tu información para continuar el proceso." />

      {candidate && (
        <Card className="anim-up" style={{ marginBottom: 16 }}>
          <div className="row gap-3 wrap" style={{ alignItems: 'center' }}>
            <span className="row gap-2"><Briefcase size={16} className="dim" />
              <span className="muted">Vía de vinculación:</span>
              <Badge variant={candidate.track === 'contratista' ? 'violet' : 'info'}>
                {trackLabel(candidate.track) || '—'}
              </Badge>
            </span>
            {myGroups.length > 0 && (
              <span className="row gap-2 wrap">
                <span className="muted">Grupos:</span>
                {myGroups.map((g) => <Badge key={g.id} variant="neutral">{g.name}</Badge>)}
              </span>
            )}
          </div>
          <p className="card-sub" style={{ marginTop: 10 }}>
            {candidate.track === 'contratista'
              ? 'Tu proceso corresponde a la vía de contratista (prestación de servicios). Ten a la mano tu RUT y certificación bancaria.'
              : 'Tu proceso corresponde a la vía de funcionario (vinculación directa a planta).'}
          </p>
        </Card>
      )}

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
            <Button type="submit" variant="primary" icon={Save} disabled={!candidate || saving}>
              {saving ? 'Guardando…' : 'Guardar datos'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
