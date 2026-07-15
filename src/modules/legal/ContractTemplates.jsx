import { useState } from 'react'
import { Plus, Pencil, Trash2, Scale } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input } from '../../components/ui/Form.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import RichTextEditor from '../../components/feature/RichTextEditor.jsx'
import { useLegalTemplates } from '../../hooks/useLegalTemplates.js'

const emptyForm = { name: '', category: '', body: '<p>Escribe el contenido de la plantilla…</p>' }

export default function ContractTemplates() {
  const { templates, addTemplate, updateTemplate, removeTemplate } = useLegalTemplates()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editorKey, setEditorKey] = useState(0)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setEditorKey((k) => k + 1)
    setOpen(true)
  }
  const openEdit = (tpl) => {
    setEditing(tpl)
    setForm({ name: tpl.name, category: tpl.category, body: tpl.body })
    setEditorKey((k) => k + 1)
    setOpen(true)
  }
  const save = async () => {
    if (!form.name.trim()) return
    if (editing) await updateTemplate(editing.id, form)
    else await addTemplate({ ...form, key: form.name.toLowerCase().replace(/\s+/g, '_'), placeholders: extractPlaceholders(form.body) })
    setOpen(false)
  }

  const extractPlaceholders = (html) => {
    const found = [...html.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])
    return [...new Set(found)].map((key) => ({ key, label: key }))
  }

  const columns = [
    { key: 'name', header: 'Plantilla', strong: true, render: (t) => (
      <div className="row gap-2"><Scale size={15} className="dim" /><span style={{ color: 'var(--text)' }}>{t.name}</span></div>
    )},
    { key: 'category', header: 'Categoría', render: (t) => <Badge variant="violet">{t.category}</Badge> },
    { key: 'placeholders', header: 'Campos', render: (t) => <span className="card-sub">{t.placeholders?.length || 0} campos</span> },
    {
      key: 'actions', header: '', sortable: false, render: (t) => (
        <div className="row gap-1">
          <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(t)} />
          <Button size="sm" variant="ghost" icon={Trash2} onClick={() => removeTemplate(t.id)} />
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Plantillas de contrato"
        subtitle="Biblioteca editable con norma colombiana. Usa {{campo}} para insertar datos al emitir."
        actions={<Button variant="primary" icon={Plus} onClick={openCreate}>Nueva plantilla</Button>}
      />

      <Card className="anim-up">
        <DataTable columns={columns} data={templates} searchKeys={['name', 'category']} pageSize={8} />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar plantilla' : 'Nueva plantilla'}
        width={720}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button variant="primary" onClick={save}>Guardar</Button></>}
      >
        <div className="col gap-3">
          <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <Field label="Nombre" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Categoría"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ej: Laboral Término Fijo" /></Field>
          </div>
          <AlertBanner variant="info">
            Escribe <b>{'{{nombre}}'}</b>, <b>{'{{documento}}'}</b>, <b>{'{{cargo}}'}</b>, etc. Se detectan automáticamente como campos a completar al emitir.
          </AlertBanner>
          <RichTextEditor key={editorKey} value={form.body} onChange={(body) => setForm((f) => ({ ...f, body }))} />
        </div>
      </Modal>
    </div>
  )
}
