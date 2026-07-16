import { useState, useMemo } from 'react'
import { Plus, Trash2, Pencil, ListChecks, X, Check, User, Settings2 } from 'lucide-react'
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
import { useCandidates } from '../../hooks/useCandidates.js'
import { DOCUMENT_TYPES } from '../../data/mockDocuments.js'
import { resolveRequiredFields } from '../../utils/formTemplates.js'

const NEW_TRACK_VALUE = '__new_track__'
const NEW_GROUP_VALUE = '__new_group__'

const FIELD_TYPES = [
  { value: 'document', label: 'Documento (PDF)' },
  { value: 'text', label: 'Texto' },
  { value: 'select', label: 'Selección' },
  { value: 'date', label: 'Fecha' },
]

const emptyForm = () => ({ name: '', track: '', groupId: '', fields: [{ key: '', label: '', type: 'document', required: true }] })

// ─── Pestaña: Por aspirante ───────────────────────────────────────────────────

function CandidatesTab({ templates, addTemplate, updateTemplate }) {
  const { candidates } = useCandidates()
  const { groupsForCandidate } = useCandidateGroups()
  const { trackLabel } = useTracks()

  const [configFor, setConfigFor] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const openConfig = (c) => { setConfigFor(c); setModalOpen(true) }

  const hasOverride = (c) => templates.some((t) => t.candidateId === c.id)

  const columns = [
    {
      key: 'name', header: 'Aspirante', strong: true,
      render: (c) => (
        <div className="row gap-2">
          <User size={15} className="dim" />
          <span style={{ color: 'var(--text)' }}>{c.name}</span>
        </div>
      ),
    },
    {
      key: 'track', header: 'Vía',
      render: (c) => c.track ? <Badge variant="info">{trackLabel(c.track)}</Badge> : <span className="dim">—</span>,
    },
    {
      key: 'groups', header: 'Grupos',
      render: (c) => {
        const g = groupsForCandidate(c.id)
        return g.length ? g.map((grp) => <Badge key={grp.id} variant="violet" style={{ marginRight: 4 }}>{grp.name}</Badge>) : <span className="dim">Sin grupo</span>
      },
    },
    {
      key: 'config', header: 'Config. individual',
      render: (c) => hasOverride(c)
        ? <Badge variant="success" dot>Personalizado</Badge>
        : <Badge variant="neutral">Plantilla base</Badge>,
    },
    {
      key: 'actions', header: '', sortable: false,
      render: (c) => (
        <Button size="sm" variant={hasOverride(c) ? 'ghost' : 'primary'} icon={Settings2} onClick={() => openConfig(c)}>
          Configurar
        </Button>
      ),
    },
  ]

  return (
    <>
      <Card className="anim-up">
        <DataTable columns={columns} data={candidates} searchKeys={['name']} pageSize={10} />
      </Card>

      {configFor && (
        <CandidateConfigModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          candidate={configFor}
          templates={templates}
          addTemplate={addTemplate}
          updateTemplate={updateTemplate}
        />
      )}
    </>
  )
}

function CandidateConfigModal({ open, onClose, candidate, templates, addTemplate, updateTemplate }) {
  const { groupsForCandidate } = useCandidateGroups()
  const { trackLabel } = useTracks()
  const groupIds = groupsForCandidate(candidate.id).map((g) => g.id)

  const baseFields = useMemo(() =>
    resolveRequiredFields(candidate.track, groupIds, templates, DOCUMENT_TYPES).filter(
      (f) => f.type === 'document' || !f.type
    ),
    [candidate, groupIds, templates]
  )

  const existingOverride = templates.find((t) => t.candidateId === candidate.id)

  const buildInitialFields = () => {
    const byKey = new Map(baseFields.map((f) => [f.key, { ...f }]))
    if (existingOverride) {
      existingOverride.fields.forEach((f) => {
        byKey.set(f.key, { ...byKey.get(f.key), ...f })
      })
    }
    return [...byKey.values()]
  }

  const [fields, setFields] = useState(buildInitialFields)
  const [saving, setSaving] = useState(false)

  const toggleRequired = (key) => {
    setFields((prev) => prev.map((f) => f.key === key ? { ...f, required: !f.required } : f))
  }

  const addField = () => {
    setFields((prev) => [...prev, { key: `campo_${Date.now()}`, label: '', type: 'document', required: false }])
  }

  const updateFieldAt = (idx, patch) => {
    setFields((prev) => prev.map((f, i) => i === idx ? { ...f, ...patch } : f))
  }

  const removeField = (idx) => {
    setFields((prev) => prev.filter((_, i) => i !== idx))
  }

  const save = async () => {
    const finalFields = fields
      .filter((f) => f.label.trim())
      .map((f) => ({ ...f, key: f.key || f.label.toLowerCase().replace(/\s+/g, '_') }))

    setSaving(true)
    const payload = {
      name: `Config documental · ${candidate.name}`,
      candidateId: candidate.id,
      track: candidate.track || null,
      groupId: null,
      fields: finalFields,
    }
    if (existingOverride) {
      await updateTemplate(existingOverride.id, payload)
    } else {
      await addTemplate(payload)
    }
    setSaving(false)
    onClose()
  }

  const candidateGroups = groupsForCandidate(candidate.id)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Documentos · ${candidate.name}`}
      width={700}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar configuración'}</Button>
        </>
      }
    >
      <div className="col gap-3">
        {/* Info del candidato */}
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          {candidate.track && <Badge variant="info">{trackLabel(candidate.track)}</Badge>}
          {candidateGroups.map((g) => <Badge key={g.id} variant="violet">{g.name}</Badge>)}
          {!candidate.track && !candidateGroups.length && <span className="dim card-sub">Sin vía ni grupo asignados</span>}
        </div>

        <AlertBanner variant="info">
          Activa <b>Obligatorio</b> para que ese documento sea requerido en el perfil del aspirante. Los campos marcados como opcionales aparecerán como secundarios.
        </AlertBanner>

        <div className="divider" />
        <b style={{ fontSize: '0.85rem' }}>Documentos</b>

        {/* Cabecera de columnas */}
        <div className="grid" style={{ gridTemplateColumns: '2fr 1fr 110px 32px', gap: 10, paddingBottom: 4, borderBottom: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nombre del documento</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tipo</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>Obligatorio</span>
          <span />
        </div>

        {fields.map((f, idx) => (
          <div key={f.key || idx} className="grid" style={{ gridTemplateColumns: '2fr 1fr 110px 32px', gap: 10, alignItems: 'center' }}>
            <Input
              value={f.label}
              onChange={(e) => updateFieldAt(idx, { label: e.target.value })}
              placeholder="Ej: Tarjeta profesional"
            />
            <Select
              value={f.type || 'document'}
              onChange={(e) => updateFieldAt(idx, { type: e.target.value })}
              options={FIELD_TYPES}
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Switch
                checked={!!f.required}
                onChange={() => toggleRequired(f.key || idx)}
                label={`${f.label || 'Campo'} obligatorio`}
              />
            </div>
            <Button size="sm" variant="ghost" icon={Trash2} onClick={() => removeField(idx)} disabled={fields.length === 1} />
          </div>
        ))}

        <Button variant="ghost" icon={Plus} onClick={addField}>Agregar documento</Button>
      </div>
    </Modal>
  )
}

// ─── Pestaña: Plantillas globales ─────────────────────────────────────────────

function TemplatesTab({ templates, groups, addTemplate, updateTemplate, removeTemplate }) {
  const { tracks, addTrack, trackLabel } = useTracks()
  const { addGroup } = useCandidateGroups()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [newTrackName, setNewTrackName] = useState('')
  const [newGroupName, setNewGroupName] = useState('')

  // Only show non-candidate templates
  const globalTemplates = templates.filter((t) => !t.candidateId)

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setNewTrackName(''); setNewGroupName(''); setOpen(true) }
  const openEdit = (tpl) => { setEditing(tpl); setForm({ name: tpl.name, track: tpl.track || '', groupId: tpl.groupId || '', fields: tpl.fields }); setNewTrackName(''); setNewGroupName(''); setOpen(true) }

  const confirmNewTrack = () => {
    if (!newTrackName.trim()) return
    const created = addTrack(newTrackName.trim())
    if (created) setForm((f) => ({ ...f, track: created.id }))
    setNewTrackName('')
  }
  const confirmNewGroup = async () => {
    if (!newGroupName.trim()) return
    const created = await addGroup(newGroupName.trim())
    setForm((f) => ({ ...f, groupId: created.id }))
    setNewGroupName('')
  }

  const updateField = (idx, patch) => {
    setForm((f) => ({ ...f, fields: f.fields.map((fld, i) => (i === idx ? { ...fld, ...patch } : fld)) }))
  }
  const addField = () => setForm((f) => ({ ...f, fields: [...f.fields, { key: '', label: '', type: 'document', required: false }] }))
  const removeField = (idx) => setForm((f) => ({ ...f, fields: f.fields.filter((_, i) => i !== idx) }))

  const save = async () => {
    if (!form.name.trim() || form.fields.some((f) => !f.label.trim())) return
    if (form.track === NEW_TRACK_VALUE || form.groupId === NEW_GROUP_VALUE) return
    const fields = form.fields.map((f) => ({ ...f, key: f.key || f.label.toLowerCase().replace(/\s+/g, '_') }))
    const payload = { name: form.name, track: form.track || null, groupId: form.groupId || null, fields }
    if (editing) await updateTemplate(editing.id, payload)
    else await addTemplate(payload)
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
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button variant="primary" icon={Plus} onClick={openCreate}>Nueva plantilla</Button>
      </div>
      <Card className="anim-up">
        <DataTable columns={columns} data={globalTemplates} searchKeys={['name']} pageSize={8} />
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
                  <Input value={newTrackName} onChange={(e) => setNewTrackName(e.target.value)} placeholder="Ej: Practicantes…" onKeyDown={(e) => e.key === 'Enter' && confirmNewTrack()} autoFocus />
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
                  <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Ej: Ingenieros…" onKeyDown={(e) => e.key === 'Enter' && confirmNewGroup()} autoFocus />
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
    </>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function FormBuilder() {
  const { templates, addTemplate, updateTemplate, removeTemplate } = useFormTemplates()
  const { groups } = useCandidateGroups()
  const [tab, setTab] = useState('candidates')

  const TAB_STYLES = (active) => ({
    padding: '7px 18px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    fontSize: '0.875rem',
    background: active ? 'var(--primary)' : 'transparent',
    color: active ? '#fff' : 'var(--text-soft)',
    transition: 'all 0.15s',
  })

  return (
    <div className="page">
      <PageHeader
        title="Constructor de formularios"
        subtitle="Configura qué documentos debe cargar cada aspirante y si son obligatorios u opcionales."
      />

      {/* Tabs */}
      <div className="row gap-2" style={{ marginBottom: 18, background: 'var(--surface)', borderRadius: 10, padding: 4, display: 'inline-flex' }}>
        <button style={TAB_STYLES(tab === 'candidates')} onClick={() => setTab('candidates')}>
          Por aspirante
        </button>
        <button style={TAB_STYLES(tab === 'templates')} onClick={() => setTab('templates')}>
          Plantillas globales
        </button>
      </div>

      {tab === 'candidates' ? (
        <CandidatesTab
          templates={templates}
          addTemplate={addTemplate}
          updateTemplate={updateTemplate}
        />
      ) : (
        <TemplatesTab
          templates={templates}
          groups={groups}
          addTemplate={addTemplate}
          updateTemplate={updateTemplate}
          removeTemplate={removeTemplate}
        />
      )}
    </div>
  )
}
