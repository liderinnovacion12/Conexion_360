import { useState } from 'react'
import { Plus, Trash2, Pencil, ListChecks, X, Check } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select, Switch } from '../../components/ui/Form.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { useFormTemplates } from '../../hooks/useFormTemplates.js'
import { useCandidateGroups } from '../../hooks/useCandidateGroups.js'
import { useTracks } from '../../hooks/useTracks.js'

const NEW_TRACK_VALUE = '__new_track__'
const NEW_GROUP_VALUE = '__new_group__'

const FIELD_TYPES = [
  { value: 'document', label: 'Documento (PDF)' },
  { value: 'text', label: 'Texto' },
  { value: 'select', label: 'Selección' },
  { value: 'date', label: 'Fecha' },
]

const emptyForm = () => ({ name: '', track: '', groupId: '', fields: [{ key: '', label: '', type: 'document', required: true }] })

export default function FormBuilder() {
  const { templates, addTemplate, updateTemplate, removeTemplate } = useFormTemplates()
  const { groups, addGroup } = useCandidateGroups()
  const { tracks, addTrack, trackLabel } = useTracks()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [newTrackName, setNewTrackName] = useState('')
  const [newGroupName, setNewGroupName] = useState('')

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setNewTrackName(''); setNewGroupName(''); setOpen(true) }
  const openEdit = (tpl) => { setEditing(tpl); setForm({ name: tpl.name, track: tpl.track || '', groupId: tpl.groupId || '', fields: tpl.fields }); setNewTrackName(''); setNewGroupName(''); setOpen(true) }

  const confirmNewTrack = () => {
    if (!newTrackName.trim()) return
    const created = addTrack(newTrackName.trim())
    if (created) setForm((f) => ({ ...f, track: created.id }))
    setNewTrackName('')
  }
  const confirmNewGroup = () => {
    if (!newGroupName.trim()) return
    const created = addGroup(newGroupName.trim())
    setForm((f) => ({ ...f, groupId: created.id }))
    setNewGroupName('')
  }

  const updateField = (idx, patch) => {
    setForm((f) => ({ ...f, fields: f.fields.map((fld, i) => (i === idx ? { ...fld, ...patch } : fld)) }))
  }
  const addField = () => setForm((f) => ({ ...f, fields: [...f.fields, { key: '', label: '', type: 'document', required: false }] }))
  const removeField = (idx) => setForm((f) => ({ ...f, fields: f.fields.filter((_, i) => i !== idx) }))

  const save = () => {
    if (!form.name.trim() || form.fields.some((f) => !f.label.trim())) return
    if (form.track === NEW_TRACK_VALUE || form.groupId === NEW_GROUP_VALUE) return
    const fields = form.fields.map((f) => ({ ...f, key: f.key || f.label.toLowerCase().replace(/\s+/g, '_') }))
    const payload = { name: form.name, track: form.track || null, groupId: form.groupId || null, fields }
    if (editing) updateTemplate(editing.id, payload)
    else addTemplate(payload)
    setOpen(false)
  }

  const scopeLabel = (t) => {
    if (t.groupId) return groups.find((g) => g.id === t.groupId)?.name || 'Grupo'
    if (t.track) return trackLabel(t.track)
    return 'General'
  }

  const columns = [
    { key: 'name', header: 'Plantilla', strong: true, render: (t) => (
      <div className="row gap-2"><ListChecks size={15} className="dim" /><span style={{ color: 'var(--text)' }}>{t.name}</span></div>
    )},
    { key: 'scope', header: 'Aplica a', render: (t) => <Badge variant={t.groupId ? 'violet' : 'info'}>{scopeLabel(t)}</Badge> },
    { key: 'fields', header: 'Campos', render: (t) => <span className="card-sub">{t.fields.length} campos · {t.fields.filter((f) => f.required).length} obligatorios</span> },
    { key: 'actions', header: '', sortable: false, render: (t) => (
      <div className="row gap-1">
        <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(t)} />
        <Button size="sm" variant="ghost" icon={Trash2} onClick={() => removeTemplate(t.id)} />
      </div>
    )},
  ]

  return (
    <div className="page">
      <PageHeader
        title="Constructor de formularios"
        subtitle="Define documentos y campos por vía o por grupo — libre de crear, marca lo obligatorio."
        actions={<Button variant="primary" icon={Plus} onClick={openCreate}>Nueva plantilla</Button>}
      />

      <Card className="anim-up">
        <DataTable columns={columns} data={templates} searchKeys={['name']} pageSize={8} />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar plantilla' : 'Nueva plantilla'}
        width={680}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button variant="primary" onClick={save}>Guardar</Button></>}
      >
        <div className="col gap-3">
          <Field label="Nombre de la plantilla" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Vía (opcional)" hint="Se aplica a toda la vía si no eliges un grupo">
              <Select
                value={form.track}
                onChange={(e) => setForm({ ...form, track: e.target.value })}
                placeholder="Todas"
                options={[...tracks.map((t) => ({ value: t.id, label: t.label })), { value: NEW_TRACK_VALUE, label: '+ Crear nueva vía…' }]}
              />
              {form.track === NEW_TRACK_VALUE && (
                <div className="row gap-2" style={{ marginTop: 8 }}>
                  <Input
                    value={newTrackName}
                    onChange={(e) => setNewTrackName(e.target.value)}
                    placeholder="Ej: Practicantes, Temporales…"
                    onKeyDown={(e) => e.key === 'Enter' && confirmNewTrack()}
                    autoFocus
                  />
                  <Button size="sm" variant="primary" icon={Check} onClick={confirmNewTrack} disabled={!newTrackName.trim()} />
                  <Button size="sm" variant="ghost" icon={X} onClick={() => setForm((f) => ({ ...f, track: '' }))} />
                </div>
              )}
            </Field>
            <Field label="Grupo (opcional)" hint="Si eliges grupo, se suma a la plantilla base de su vía">
              <Select
                value={form.groupId}
                onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                placeholder="Ninguno"
                options={[...groups.map((g) => ({ value: g.id, label: g.name })), { value: NEW_GROUP_VALUE, label: '+ Crear nuevo grupo…' }]}
              />
              {form.groupId === NEW_GROUP_VALUE && (
                <div className="row gap-2" style={{ marginTop: 8 }}>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ej: Ingenieros, Diseñadores…"
                    onKeyDown={(e) => e.key === 'Enter' && confirmNewGroup()}
                    autoFocus
                  />
                  <Button size="sm" variant="primary" icon={Check} onClick={confirmNewGroup} disabled={!newGroupName.trim()} />
                  <Button size="sm" variant="ghost" icon={X} onClick={() => setForm((f) => ({ ...f, groupId: '' }))} />
                </div>
              )}
            </Field>
          </div>

          <AlertBanner variant="info">Si es requerido, el aspirante no podrá avanzar sin completarlo.</AlertBanner>

          <div className="divider" />
          <b style={{ fontSize: '0.85rem' }}>Campos</b>
          {form.fields.map((f, idx) => (
            <div key={idx} className="grid" style={{ gridTemplateColumns: '2fr 1fr 90px 32px', gap: 10, alignItems: 'end' }}>
              <Field label={idx === 0 ? 'Nombre del campo' : undefined}>
                <Input value={f.label} onChange={(e) => updateField(idx, { label: e.target.value })} placeholder="Ej: Tarjeta profesional" />
              </Field>
              <Field label={idx === 0 ? 'Tipo' : undefined}>
                <Select value={f.type} onChange={(e) => updateField(idx, { type: e.target.value })} options={FIELD_TYPES} />
              </Field>
              <div className="col" style={{ alignItems: 'center' }}>
                {idx === 0 && <label style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: 6 }}>Obligatorio</label>}
                <Switch checked={f.required} onChange={(v) => updateField(idx, { required: v })} label={`${f.label || 'Campo'} obligatorio`} />
              </div>
              <Button size="sm" variant="ghost" icon={Trash2} onClick={() => removeField(idx)} disabled={form.fields.length === 1} />
            </div>
          ))}
          <Button variant="ghost" icon={Plus} onClick={addField}>Agregar campo</Button>
        </div>
      </Modal>
    </div>
  )
}
