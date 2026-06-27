import { useState } from 'react'
import { PlayCircle, FileText, FileVideo, Camera, CheckCircle2, GraduationCap } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { ProgressBar } from '../../components/ui/Badge.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import WebcamCapture from '../../components/feature/WebcamCapture.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { COURSES, COURSE_PROGRESS, SAMPLE_QUIZ } from '../../data/mockCourses.js'
import { generateCourseCertificate } from '../../utils/pdf.js'

export default function CandidateCourses() {
  const { user } = useAuth()
  const cid = user.candidateId
  const assigned = COURSES.filter((c) => c.assigned.includes(cid))
  const [viewer, setViewer] = useState(null)
  const [evalFor, setEvalFor] = useState(null)
  const [answers, setAnswers] = useState({})
  const [evidence, setEvidence] = useState(null)
  const [result, setResult] = useState(null)

  const progressOf = (id) => COURSE_PROGRESS.find((p) => p.candidateId === cid && p.courseId === id)

  const submitEval = () => {
    // Cálculo automático de puntaje (preguntas con respuesta correcta conocida).
    const gradable = SAMPLE_QUIZ.filter((q) => q.answer !== null)
    const correct = gradable.filter((q) => String(answers[q.id]) === String(q.answer)).length
    const score = Math.round((correct / gradable.length) * 100)
    const passed = score >= (evalFor.passScore || 70)
    setResult({ score, passed, course: evalFor.title })
  }

  return (
    <div className="page">
      <PageHeader title="Mis cursos asignados" subtitle="Completa la formación y las evaluaciones requeridas." />

      {assigned.length === 0 ? (
        <Card><AlertBanner variant="info">Aún no tienes cursos asignados.</AlertBanner></Card>
      ) : (
        <div className="grid grid-3 stagger">
          {assigned.map((c) => {
            const p = progressOf(c.id)
            const done = p?.status === 'aprobado'
            return (
              <Card key={c.id}>
                <div className="row gap-2" style={{ marginBottom: 10 }}>
                  <div className="kpi-icon" style={{ margin: 0, width: 38, height: 38, '--kpi-icon-bg': c.type === 'video' ? 'var(--grad-violet)' : 'var(--grad-teal)' }}>
                    {c.type === 'video' ? <FileVideo size={18} /> : <FileText size={18} />}
                  </div>
                  {done ? <Badge variant="success" dot>Aprobado</Badge> : <Badge variant="info" dot>{p ? 'En curso' : 'Sin iniciar'}</Badge>}
                </div>
                <div className="card-title">{c.title}</div>
                <p className="card-sub" style={{ margin: '6px 0 12px' }}>{c.description}</p>
                <ProgressBar value={p?.progress || 0} />
                <div className="card-sub" style={{ marginTop: 6 }}>{p?.progress || 0}% completado · {c.duration}</div>
                <div className="divider" />
                <div className="col gap-2">
                  <Button size="sm" variant="primary" icon={PlayCircle} className="full" onClick={() => setViewer(c)}>
                    {done ? 'Repasar curso' : 'Iniciar curso'}
                  </Button>
                  {done ? (
                    <Button size="sm" variant="ghost" icon={GraduationCap} className="full" onClick={() => generateCourseCertificate(user.name, c.title, p.score)}>
                      Descargar certificado
                    </Button>
                  ) : (
                    <Button size="sm" variant="violet" icon={CheckCircle2} className="full" onClick={() => { setEvalFor(c); setAnswers({}); setEvidence(null); setResult(null) }}>
                      Presentar evaluación
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Visor de curso */}
      <Modal open={!!viewer} onClose={() => setViewer(null)} title={viewer?.title} width={680}>
        <div className="course-viewer">
          <div className="col center gap-2">
            {viewer?.type === 'video' ? <FileVideo size={34} style={{ color: 'var(--violet-light)' }} /> : <FileText size={34} style={{ color: 'var(--teal)' }} />}
            <span className="card-sub">Reproductor de contenido ({viewer?.type === 'video' ? 'video' : 'PDF'}) · {viewer?.duration}</span>
            <PlayCircle size={40} style={{ color: 'var(--text-dim)' }} />
          </div>
        </div>
        <p className="card-sub" style={{ marginTop: 12 }}>{viewer?.description}</p>
      </Modal>

      {/* Evaluación con webcam */}
      <Modal
        open={!!evalFor}
        onClose={() => setEvalFor(null)}
        title={`Evaluación · ${evalFor?.title || ''}`}
        width={680}
        footer={!result && <Button variant="primary" disabled={!evidence} onClick={submitEval}>Enviar evaluación</Button>}
      >
        {result ? (
          <div className="col center gap-2" style={{ textAlign: 'center', padding: 10 }}>
            <CheckCircle2 size={44} style={{ color: result.passed ? 'var(--success)' : 'var(--danger)' }} />
            <h2 className="h2">{result.passed ? '¡Aprobaste!' : 'No alcanzaste el puntaje'}</h2>
            <div className="kpi-value">{result.score}/100</div>
            <Badge variant={result.passed ? 'success' : 'danger'} dot>{result.passed ? 'Aprobado' : 'Reprobado'}</Badge>
            {result.passed && (
              <Button variant="violet" icon={GraduationCap} onClick={() => generateCourseCertificate(user.name, result.course, result.score)} style={{ marginTop: 10 }}>
                Descargar certificado
              </Button>
            )}
          </div>
        ) : (
          <div className="col gap-3">
            <AlertBanner variant="warning" title="Evidencia requerida">
              Esta evaluación requiere captura de cámara. Activa tu cámara y toma una foto antes de enviar.
            </AlertBanner>

            <div className="row gap-2"><Camera size={16} className="dim" /><b style={{ fontSize: '0.85rem' }}>Captura de evidencia</b></div>
            <WebcamCapture userId={user.id} courseId={evalFor?.id} onCapture={setEvidence} />

            <div className="divider" />

            {SAMPLE_QUIZ.map((q, i) => (
              <div key={q.id} className="glass-soft" style={{ padding: 14 }}>
                <b style={{ fontSize: '0.88rem' }}>{i + 1}. {q.question}</b>
                <div className="col gap-1" style={{ marginTop: 10 }}>
                  {q.type === 'multiple' && q.options.map((opt, idx) => (
                    <label key={idx} className="row gap-2" style={{ cursor: 'pointer' }}>
                      <input type="radio" name={q.id} onChange={() => setAnswers({ ...answers, [q.id]: idx })} /> {opt}
                    </label>
                  ))}
                  {q.type === 'boolean' && ['Verdadero', 'Falso'].map((opt, idx) => (
                    <label key={opt} className="row gap-2" style={{ cursor: 'pointer' }}>
                      <input type="radio" name={q.id} onChange={() => setAnswers({ ...answers, [q.id]: idx === 0 })} /> {opt}
                    </label>
                  ))}
                  {q.type === 'open' && (
                    <textarea className="textarea" placeholder="Tu respuesta…" onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
