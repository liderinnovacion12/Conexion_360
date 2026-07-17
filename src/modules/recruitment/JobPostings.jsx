import { useState } from 'react'
import { Plus, Pencil, Trash2, Briefcase, MapPin, Clock, Users } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { useJobPostings } from '../../hooks/useJobPostings.js'

const CONTRACT_TYPES = [
  { value: 'servicios', label: 'Prestación de servicios' },
  { value: 'termino_fijo', label: 'Término fijo' },
  { value: 'termino_indefinido', label: 'Término indefinido' },
  { value: 'obra_labor', label: 'Obra o labor' },
  { value: 'aprendizaje', label: 'Aprendizaje' },
]

const MODALITIES = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'remoto', label: 'Remoto' },
  { value: 'hibrido', label: 'Híbrido' },
]

const STATUS_OPTIONS = [
  { value: 'activa', label: 'Activa' },
  { value: 'pausada', label: 'Pausada' },
  { value: 'cerrada', label: 'Cerrada' },
]

const emptyForm = () => ({
  title: '',
  area: '',
  location: '',
  contractType: 'servicios',
  modality: 'presencial',
  description: '',
  requirements: '',
  salary: '',
  vacancies: 1,
  status: 'activa',
})

const STATUS_VARIANT = { activa: 'success', pausada: 'warning', cerrada: 'neutral' }

export default function JobPostings() {
  const { postings, loading, add, update, remove } = useJobPostings()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setOpen(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({
      title: p.title,
      area: p.area || '',
      location: p.location || '',
      contractType: p.contractType || 'servicios',
      modality: p.modality || 'presencial',
      description: p.description || '',
      requirements: p.requirements || '',
      salary: p.salary || '',
      vacancies: p.vacancies || 1,
      status: p.status || 'activa',
    })
    setOpen(true)
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.title.trim()) return
    if (editing) await update(editing.id, form)
    else await add(form)
    setOpen(false)
  }

  return (
    <div className="page">
      <PageHeader
        title="Publicar vacantes"
        subtitle="Crea y gestiona las vacantes abiertas para atraer talento."
        actions={<Button variant="primary" icon={Plus} onClick={openCreate}>Nueva vacante</Button>}
      />

      {loading && <div className="card-sub" style={{ padding: 16 }}>Cargando…</div>}

      {!loading && postings.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-soft)' }}>
            <Briefcase size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Sin vacantes publicadas</div>
            <div style={{ fontSize: '0.875rem', marginBottom: 16 }}>Crea la primera vacante para atraer candidatos.</div>
            <Button variant="primary" icon={Plus} onClick={openCreate}>Crear vacante</Button>
          </div>
        </Card>
      )}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {postings.map((p) => (
          <Card key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="row between" style={{ alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.97rem', color: 'var(--text)', marginBottom: 3 }}>{p.title}</div>
                {p.area && <div className="card-sub">{p.area}</div>}
              </div>
              <Badge variant={STATUS_VARIANT[p.status] || 'neutral'} dot>{p.status}</Badge>
            </div>

            <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
              {p.location && (
                <span className="card-sub row gap-1"><MapPin size={12} />{p.location}</span>
              )}
              {p.modality && (
                <span className="card-sub row gap-1"><Clock size={12} />{MODALITIES.find((m) => m.value === p.modality)?.label || p.modality}</span>
              )}
              {p.vacancies > 0 && (
                <span className="card-sub row gap-1"><Users size={12} />{p.vacancies} {p.vacancies === 1 ? 'cupo' : 'cupos'}</span>
              )}
            </div>

            {p.contractType && (
              <Badge variant="info" style={{ alignSelf: 'flex-start' }}>
                {CONTRACT_TYPES.find((c) => c.value === p.contractType)?.label || p.contractType}
              </Badge>
            )}

            {p.description && (
              <p style={{ fontSize: '0.84rem', color: 'var(--text-soft)', lineHeight: 1.55, margin: 0 }}>
                {p.description.length > 120 ? p.description.slice(0, 120) + '…' : p.description}
              </p>
            )}

            {p.salary && (
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--primary)' }}>{p.salary}</div>
            )}

            <div className="row gap-2" style={{ marginTop: 'auto', paddingTop: 6, borderTop: '1px solid var(--glass-border)' }}>
              <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(p)}>Editar</Button>
              <Button size="sm" variant="ghost" icon={Trash2} onClick={() => remove(p.id)} />
              {p.status !== 'cerrada' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => update(p.id, { ...p, status: p.status === 'activa' ? 'pausada' : 'activa' })}
                  style={{ marginLeft: 'auto' }}
                >
                  {p.status === 'activa' ? 'Pausar' : 'Activar'}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar vacante' : 'Nueva vacante'} size="lg">
        <div className="col gap-3">
          <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Field label="Título del cargo" required style={{ gridColumn: '1 / -1' }}>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ej: Analista de selección" autoFocus />
            </Field>
            <Field label="Área / Departamento">
              <Input value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="Ej: Recursos Humanos" />
            </Field>
            <Field label="Ubicación">
              <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Ej: Bogotá, Colombia" />
            </Field>
            <Field label="Tipo de contrato">
              <Select value={form.contractType} onChange={(e) => set('contractType', e.target.value)} options={CONTRACT_TYPES} />
            </Field>
            <Field label="Modalidad">
              <Select value={form.modality} onChange={(e) => set('modality', e.target.value)} options={MODALITIES} />
            </Field>
            <Field label="Salario / Honorarios">
              <Input value={form.salary} onChange={(e) => set('salary', e.target.value)} placeholder="Ej: $2.500.000 / mes" />
            </Field>
            <Field label="N.º de vacantes">
              <Input type="number" min={1} value={form.vacancies} onChange={(e) => set('vacancies', Number(e.target.value))} />
            </Field>
          </div>

          <Field label="Descripción del cargo">
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe las responsabilidades principales del cargo…"
            />
          </Field>

          <Field label="Requisitos">
            <textarea
              className="input"
              rows={3}
              value={form.requirements}
              onChange={(e) => set('requirements', e.target.value)}
              placeholder="Experiencia, formación académica, habilidades requeridas…"
            />
          </Field>

          {editing && (
            <Field label="Estado">
              <Select value={form.status} onChange={(e) => set('status', e.target.value)} options={STATUS_OPTIONS} />
            </Field>
          )}

          <div className="row gap-2" style={{ justifyContent: 'flex-end', paddingTop: 8 }}>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={save} disabled={!form.title.trim()}>
              {editing ? 'Guardar cambios' : 'Publicar vacante'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
