// Etapas del pipeline de reclutamiento (en orden).
export const PIPELINE_STAGES = [
  { id: 'registro', label: 'Registro creado' },
  { id: 'doc_pendientes', label: 'Documentos pendientes' },
  { id: 'doc_revision', label: 'Documentos en revisión' },
  { id: 'doc_devueltos', label: 'Documentos devueltos' },
  { id: 'doc_aprobados', label: 'Documentos aprobados' },
  { id: 'curso_asignado', label: 'Curso asignado' },
  { id: 'curso_completado', label: 'Curso completado' },
  { id: 'eval_aprobada', label: 'Evaluación aprobada' },
  { id: 'apto', label: 'Apto para contratación' },
  { id: 'contratado', label: 'Contratado' },
  { id: 'rechazado', label: 'Rechazado' },
]

export const stageLabel = (id) => PIPELINE_STAGES.find((s) => s.id === id)?.label || id
