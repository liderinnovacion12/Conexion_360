import { useState } from 'react'
import { BookOpen, CheckCircle2, Clock } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { useCandidates } from '../../hooks/useCandidates.js'
import { useCourses } from '../../hooks/useCourses.js'

// Columnas del pipeline y las etapas de candidato que caen en cada una.
// `targetStage` es la etapa que se asigna al soltar una tarjeta en esa columna.
const COLUMNS = [
  {
    id: 'registro',
    label: 'Registros creados',
    stages: ['registro'],
    targetStage: 'registro',
    color: '#4A9EFF',
  },
  {
    id: 'documentos',
    label: 'Documentos pendientes',
    stages: ['doc_pendientes', 'doc_revision', 'doc_devueltos'],
    targetStage: 'doc_pendientes',
    color: '#F5A623',
  },
  {
    id: 'cursos',
    label: 'Cursos',
    stages: ['curso_asignado', 'curso_completado'],
    targetStage: 'curso_asignado',
    color: '#9B5DE5',
  },
  {
    id: 'aptos',
    label: 'Aptos a contratación',
    stages: ['apto', 'eval_aprobada'],
    targetStage: 'apto',
    color: '#2ECC71',
  },
  {
    id: 'rechazados',
    label: 'Rechazados',
    stages: ['rechazado'],
    targetStage: 'rechazado',
    color: '#FF4D4D',
  },
]

const DOC_STAGE_LABEL = {
  doc_pendientes: 'Pendiente',
  doc_revision: 'En revisión',
  doc_devueltos: 'Devuelto',
}

export default function Pipeline() {
  const { candidates, moveStage } = useCandidates()
  const { courses, progress } = useCourses()
  const [dragId, setDragId] = useState(null)
  const [overCol, setOverCol] = useState(null)

  const courseOf = (candidateId) => {
    const p = progress.find((x) => x.candidateId === candidateId)
    if (!p) return null
    const course = courses.find((c) => c.id === p.courseId)
    return { name: course?.title || 'Curso', completed: p.status === 'completado', pct: p.progress || 0 }
  }

  return (
    <div className="page">
      <PageHeader
        title="Pipeline de reclutamiento"
        subtitle="Vista del estado actual de cada aspirante en el proceso."
      />

      <div className="pipeline-board">
        {COLUMNS.map((col) => {
          const colItems = candidates.filter((c) => col.stages.includes(c.stage))
          const isOver = overCol === col.id

          return (
            <div
              key={col.id}
              className={`pipeline-col${isOver ? ' pipeline-col--over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setOverCol(col.id) }}
              onDragLeave={() => setOverCol(null)}
              onDrop={() => {
                if (dragId) moveStage(dragId, col.targetStage)
                setDragId(null)
                setOverCol(null)
              }}
            >
              {/* Encabezado de columna */}
              <div className="pipeline-col-head" style={{ borderTopColor: col.color }}>
                <span className="pipeline-col-title">{col.label}</span>
                <span className="pipeline-col-count" style={{ background: col.color + '22', color: col.color }}>
                  {colItems.length}
                </span>
              </div>

              {/* Tarjetas */}
              <div className="pipeline-cards">
                {colItems.length === 0 && (
                  <div className="pipeline-empty">Sin aspirantes</div>
                )}
                {colItems.map((c) => {
                  const info = col.id === 'cursos' ? courseOf(c.id) : null

                  return (
                    <div
                      key={c.id}
                      className={`pipeline-card${dragId === c.id ? ' pipeline-card--dragging' : ''}`}
                      draggable
                      onDragStart={() => setDragId(c.id)}
                      onDragEnd={() => setDragId(null)}
                    >
                      <div className="pipeline-card-name">{c.name}</div>
                      {c.position && (
                        <div className="pipeline-card-pos">{c.position}</div>
                      )}

                      {/* Info contextual según columna */}
                      {col.id === 'documentos' && (
                        <Badge variant="warning" dot style={{ marginTop: 6 }}>
                          {DOC_STAGE_LABEL[c.stage] || c.stage}
                        </Badge>
                      )}

                      {col.id === 'cursos' && (
                        <div className="pipeline-course">
                          <BookOpen size={12} />
                          <span>{info ? info.name : 'Sin curso'}</span>
                          {info && (
                            info.completed
                              ? <CheckCircle2 size={12} style={{ color: '#2ECC71' }} />
                              : <Clock size={12} style={{ color: '#F5A623' }} />
                          )}
                        </div>
                      )}

                      {col.id === 'aptos' && (
                        <Badge variant="success" dot style={{ marginTop: 6 }}>
                          Preaprobado
                        </Badge>
                      )}

                      {col.id === 'rechazados' && (
                        <Badge variant="danger" dot style={{ marginTop: 6 }}>
                          Rechazado
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
