import { useState } from 'react'
import { Plus, FileVideo, FileText, Users, Camera, ClipboardList, Trash2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { ProgressBar } from '../../components/ui/Badge.jsx'
import { Tabs } from '../../components/ui/Feedback.jsx'
import { Field, Input, Select, Textarea } from '../../components/ui/Form.jsx'
import { COURSES, COURSE_PROGRESS, WEBCAM_EVIDENCE } from '../../data/mockCourses.js'
import { CANDIDATES } from '../../data/mockCandidates.js'
import { formatDateTime } from '../../utils/format.js'

const candName = (id) => CANDIDATES.find((c) => c.id === id)?.name || id

export default function CourseAssignment() {
  const [tab, setTab] = useState('cursos')
  const [assignFor, setAssignFor] = useState(null)
  const [quizOpen, setQuizOpen] = useState(false)
  const [questions, setQuestions] = useState([{ type: 'multiple', text: '', options: ['', ''] }])

  const addQuestion = () => setQuestions((q) => [...q, { type: 'multiple', text: '', options: ['', ''] }])
  const removeQuestion = (i) => setQuestions((q) => q.filter((_, idx) => idx !== i))

  return (
    <div className="page">
      <PageHeader
        title="Cursos y evaluaciones"
        subtitle="Crea contenido, asígnalo a aspirantes y controla su avance."
        actions={
          <>
            <Button variant="ghost" icon={ClipboardList} onClick={() => setQuizOpen(true)}>Crear evaluación</Button>
            <Button variant="primary" icon={Plus}>Nuevo curso</Button>
          </>
        }
      />

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { value: 'cursos', label: 'Cursos' },
          { value: 'progreso', label: 'Progreso' },
          { value: 'evidencia', label: 'Evidencia webcam' },
        ]}
      />
      <div style={{ height: 16 }} />

      {tab === 'cursos' && (
        <div className="grid grid-3 stagger">
          {COURSES.map((c) => (
            <Card key={c.id}>
              <div className="row gap-2" style={{ marginBottom: 10 }}>
                <div className="kpi-icon" style={{ margin: 0, width: 38, height: 38, '--kpi-icon-bg': c.type === 'video' ? 'var(--grad-violet)' : 'var(--grad-teal)' }}>
                  {c.type === 'video' ? <FileVideo size={18} /> : <FileText size={18} />}
                </div>
                <Badge variant="neutral">{c.type === 'video' ? 'Video' : 'PDF'} · {c.duration}</Badge>
              </div>
              <div className="card-title">{c.title}</div>
              <p className="card-sub" style={{ margin: '6px 0 12px' }}>{c.description}</p>
              <div className="row between">
                <span className="muted row gap-1" style={{ fontSize: '0.82rem' }}><Users size={14} /> {c.assigned.length} asignados</span>
                <Badge variant="info">Aprob. {c.passScore}%</Badge>
              </div>
              <div className="divider" />
              <Button size="sm" variant="ghost" icon={Users} className="full" onClick={() => setAssignFor(c)}>Asignar aspirantes</Button>
            </Card>
          ))}
        </div>
      )}

      {tab === 'progreso' && (
        <Card>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Aspirante</th><th>Curso</th><th>Avance</th><th>Puntaje</th><th>Estado</th></tr></thead>
              <tbody>
                {COURSE_PROGRESS.map((p, i) => {
                  const course = COURSES.find((c) => c.id === p.courseId)
                  return (
                    <tr key={i}>
                      <td className="strong">{candName(p.candidateId)}</td>
                      <td>{course?.title}</td>
                      <td><div style={{ width: 130 }}><ProgressBar value={p.progress} /></div></td>
                      <td>{p.score != null ? `${p.score}/100` : '—'}</td>
                      <td><Badge variant={p.status === 'aprobado' ? 'success' : 'info'} dot>{p.status}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'evidencia' && (
        <Card title="Capturas de webcam" subtitle="Evidencia con timestamp y metadata del usuario">
          <div className="grid grid-3">
            {WEBCAM_EVIDENCE.map((e) => (
              <div key={e.id} className="glass-soft" style={{ padding: 12 }}>
                <div className="webcam-frame" style={{ aspectRatio: '4/3', marginBottom: 10 }}>
                  <div className="webcam-placeholder"><Camera size={26} /></div>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{e.user}</div>
                <div className="card-sub">{COURSES.find((c) => c.id === e.courseId)?.title}</div>
                <div className="dim" style={{ fontSize: '0.74rem', marginTop: 4 }}>{formatDateTime(e.timestamp)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Asignar aspirantes */}
      <Modal
        open={!!assignFor}
        onClose={() => setAssignFor(null)}
        title={`Asignar: ${assignFor?.title || ''}`}
        footer={<Button variant="primary" onClick={() => setAssignFor(null)}>Guardar asignación</Button>}
      >
        <div className="col gap-2">
          <p className="card-sub">Selecciona los aspirantes que tomarán este curso.</p>
          {CANDIDATES.slice(0, 8).map((c) => (
            <label key={c.id} className="stat-row" style={{ cursor: 'pointer' }}>
              <span className="row gap-2"><div className="avatar avatar--sm">{c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>{c.name}</span>
              <input type="checkbox" defaultChecked={assignFor?.assigned.includes(c.id)} />
            </label>
          ))}
        </div>
      </Modal>

      {/* Constructor de evaluaciones */}
      <Modal
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        title="Constructor de evaluación"
        width={640}
        footer={<><Button variant="ghost" onClick={() => setQuizOpen(false)}>Cancelar</Button><Button variant="primary">Guardar evaluación</Button></>}
      >
        <div className="col gap-3">
          <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <Field label="Título de la evaluación"><Input placeholder="Ej: Evaluación de inducción" /></Field>
            <Field label="Puntaje mínimo (%)"><Input type="number" defaultValue={70} /></Field>
          </div>
          <div className="divider" />
          {questions.map((q, i) => (
            <div key={i} className="glass-soft" style={{ padding: 14 }}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <b style={{ fontSize: '0.85rem' }}>Pregunta {i + 1}</b>
                {questions.length > 1 && <Button size="sm" variant="ghost" icon={Trash2} onClick={() => removeQuestion(i)} />}
              </div>
              <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                <Field label="Enunciado"><Input placeholder="Escribe la pregunta" /></Field>
                <Field label="Tipo">
                  <Select
                    defaultValue={q.type}
                    options={[
                      { value: 'multiple', label: 'Opción múltiple' },
                      { value: 'boolean', label: 'Verdadero / Falso' },
                      { value: 'open', label: 'Respuesta abierta' },
                    ]}
                  />
                </Field>
              </div>
            </div>
          ))}
          <Button variant="ghost" icon={Plus} onClick={addQuestion}>Agregar pregunta</Button>
        </div>
      </Modal>
    </div>
  )
}
