import { useState } from 'react'
import { Plus, FileVideo, FileText, Users, Camera, ClipboardList, Trash2, Check } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { ProgressBar } from '../../components/ui/Badge.jsx'
import { Tabs, AlertBanner } from '../../components/ui/Feedback.jsx'
import { Field, Input, Select, Textarea } from '../../components/ui/Form.jsx'
import { WEBCAM_EVIDENCE } from '../../data/mockCourses.js'
import { useCourses } from '../../hooks/useCourses.js'
import { useCandidates } from '../../hooks/useCandidates.js'
import { formatDateTime } from '../../utils/format.js'

const emptyCourseForm = { title: '', type: 'video', duration: '20 min', description: '', passScore: 70 }
const emptyQuestion = () => ({ id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: 'multiple', question: '', options: ['', ''], answer: null })

export default function CourseAssignment() {
  const { courses, progress, getQuiz, saveQuiz, createCourse, assignToCandidates } = useCourses()
  const { candidates: CANDIDATES } = useCandidates()
  const candName = (id) => CANDIDATES.find((c) => c.id === id)?.name || id
  const [tab, setTab] = useState('cursos')
  const [assignFor, setAssignFor] = useState(null)
  const [assignChecked, setAssignChecked] = useState([])
  const [courseOpen, setCourseOpen] = useState(false)
  const [courseForm, setCourseForm] = useState(emptyCourseForm)
  const [quizFor, setQuizFor] = useState(null)
  const [quizTitle, setQuizTitle] = useState('')
  const [quizPass, setQuizPass] = useState(70)
  const [questions, setQuestions] = useState([emptyQuestion()])

  const addQuestion = () => setQuestions((q) => [...q, emptyQuestion()])
  const removeQuestion = (i) => setQuestions((q) => q.filter((_, idx) => idx !== i))
  const updateQuestion = (i, patch) => setQuestions((q) => q.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))

  const openAssign = (c) => { setAssignFor(c); setAssignChecked(c.assigned || []) }
  const saveAssign = async () => { await assignToCandidates(assignFor.id, assignChecked); setAssignFor(null) }
  const toggleAssign = (id) => setAssignChecked((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  const saveCourse = async () => {
    if (!courseForm.title.trim()) return
    await createCourse(courseForm)
    setCourseForm(emptyCourseForm)
    setCourseOpen(false)
  }

  const openQuiz = async (course) => {
    setQuizFor(course)
    setQuizTitle(`Evaluación · ${course.title}`)
    setQuizPass(course.passScore || 70)
    const q = await getQuiz(course.id)
    setQuestions(q.map((qq) => ({ ...qq, id: qq.id || emptyQuestion().id })))
  }
  const persistQuiz = async () => {
    if (!quizFor) return
    await saveQuiz(quizFor.id, questions.map((q) => ({ ...q, question: q.question || q.text || '' })))
    setQuizFor(null)
  }

  return (
    <div className="page">
      <PageHeader
        title="Cursos y evaluaciones"
        subtitle="Crea contenido, asígnalo a aspirantes y controla su avance."
        actions={<Button variant="primary" icon={Plus} onClick={() => setCourseOpen(true)}>Nuevo curso</Button>}
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
          {courses.map((c) => (
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
              <div className="row gap-2">
                <Button size="sm" variant="ghost" icon={Users} className="full" onClick={() => openAssign(c)}>Asignar</Button>
                <Button size="sm" variant="ghost" icon={ClipboardList} className="full" onClick={() => openQuiz(c)}>Evaluación</Button>
              </div>
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
                {progress.map((p, i) => {
                  const course = courses.find((c) => c.id === p.courseId)
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
                <div className="card-sub">{courses.find((c) => c.id === e.courseId)?.title}</div>
                <div className="dim" style={{ fontSize: '0.74rem', marginTop: 4 }}>{formatDateTime(e.timestamp)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Nuevo curso */}
      <Modal
        open={courseOpen}
        onClose={() => setCourseOpen(false)}
        title="Nuevo curso"
        footer={<><Button variant="ghost" onClick={() => setCourseOpen(false)}>Cancelar</Button><Button variant="primary" onClick={saveCourse}>Crear curso</Button></>}
      >
        <div className="col gap-3">
          <Field label="Título" required><Input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} /></Field>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Tipo de contenido"><Select value={courseForm.type} onChange={(e) => setCourseForm({ ...courseForm, type: e.target.value })} options={[{ value: 'video', label: 'Video' }, { value: 'pdf', label: 'PDF' }]} /></Field>
            <Field label="Duración"><Input value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} /></Field>
          </div>
          <Field label="Descripción"><Textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} /></Field>
          <Field label="Puntaje mínimo de aprobación (%)"><Input type="number" value={courseForm.passScore} onChange={(e) => setCourseForm({ ...courseForm, passScore: Number(e.target.value) })} /></Field>
        </div>
      </Modal>

      {/* Asignar aspirantes */}
      <Modal
        open={!!assignFor}
        onClose={() => setAssignFor(null)}
        title={`Asignar: ${assignFor?.title || ''}`}
        footer={<Button variant="primary" icon={Check} onClick={saveAssign}>Guardar asignación</Button>}
      >
        <div className="col gap-2">
          <p className="card-sub">Selecciona los aspirantes que tomarán este curso.</p>
          {CANDIDATES.map((c) => (
            <label key={c.id} className="stat-row" style={{ cursor: 'pointer' }}>
              <span className="row gap-2"><div className="avatar avatar--sm">{c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>{c.name}</span>
              <input type="checkbox" checked={assignChecked.includes(c.id)} onChange={() => toggleAssign(c.id)} />
            </label>
          ))}
        </div>
      </Modal>

      {/* Constructor de evaluaciones */}
      <Modal
        open={!!quizFor}
        onClose={() => setQuizFor(null)}
        title={`Evaluación · ${quizFor?.title || ''}`}
        width={640}
        footer={<><Button variant="ghost" onClick={() => setQuizFor(null)}>Cancelar</Button><Button variant="primary" onClick={persistQuiz}>Guardar evaluación</Button></>}
      >
        <div className="col gap-3">
          <AlertBanner variant="info">Los cambios quedan guardados para este curso y se verán reflejados en el portal del aspirante.</AlertBanner>
          <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <Field label="Título de la evaluación"><Input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} /></Field>
            <Field label="Puntaje mínimo (%)"><Input type="number" value={quizPass} onChange={(e) => setQuizPass(Number(e.target.value))} /></Field>
          </div>
          <div className="divider" />
          {questions.map((q, i) => (
            <div key={q.id} className="glass-soft" style={{ padding: 14 }}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <b style={{ fontSize: '0.85rem' }}>Pregunta {i + 1}</b>
                {questions.length > 1 && <Button size="sm" variant="ghost" icon={Trash2} onClick={() => removeQuestion(i)} />}
              </div>
              <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                <Field label="Enunciado">
                  <Input value={q.question || ''} onChange={(e) => updateQuestion(i, { question: e.target.value })} placeholder="Escribe la pregunta" />
                </Field>
                <Field label="Tipo">
                  <Select
                    value={q.type}
                    onChange={(e) => updateQuestion(i, { type: e.target.value, options: e.target.value === 'multiple' ? ['', ''] : undefined })}
                    options={[
                      { value: 'multiple', label: 'Opción múltiple' },
                      { value: 'boolean', label: 'Verdadero / Falso' },
                      { value: 'open', label: 'Respuesta abierta' },
                    ]}
                  />
                </Field>
              </div>
              {q.type === 'multiple' && (
                <div className="col gap-2" style={{ marginTop: 10 }}>
                  {(q.options || ['', '']).map((opt, oi) => (
                    <div key={oi} className="row gap-2">
                      <input
                        type="radio"
                        checked={q.answer === oi}
                        onChange={() => updateQuestion(i, { answer: oi })}
                      />
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const opts = [...(q.options || [])]
                          opts[oi] = e.target.value
                          updateQuestion(i, { options: opts })
                        }}
                        placeholder={`Opción ${oi + 1}`}
                      />
                    </div>
                  ))}
                  <Button size="sm" variant="ghost" icon={Plus} onClick={() => updateQuestion(i, { options: [...(q.options || []), ''] })}>Agregar opción</Button>
                </div>
              )}
              {q.type === 'boolean' && (
                <div className="row gap-3" style={{ marginTop: 10 }}>
                  <label className="row gap-2"><input type="radio" checked={q.answer === true} onChange={() => updateQuestion(i, { answer: true })} /> Verdadero</label>
                  <label className="row gap-2"><input type="radio" checked={q.answer === false} onChange={() => updateQuestion(i, { answer: false })} /> Falso</label>
                </div>
              )}
            </div>
          ))}
          <Button variant="ghost" icon={Plus} onClick={addQuestion}>Agregar pregunta</Button>
        </div>
      </Modal>
    </div>
  )
}
