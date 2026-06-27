// Cursos y evaluaciones.
export const COURSES = [
  {
    id: 'crs-01',
    title: 'Inducción Corporativa Conexión 360',
    type: 'video',
    duration: '25 min',
    description: 'Bienvenida, valores, estructura organizacional y políticas internas.',
    assigned: ['c-101', 'c-102', 'c-111'],
    passScore: 70,
  },
  {
    id: 'crs-02',
    title: 'Seguridad y Salud en el Trabajo (HSE)',
    type: 'pdf',
    duration: '40 min',
    description: 'Normativa de seguridad, uso de EPP y protocolos de emergencia.',
    assigned: ['c-101', 'c-103', 'c-107'],
    passScore: 80,
  },
  {
    id: 'crs-03',
    title: 'Protección de Datos Personales (Ley 1581)',
    type: 'pdf',
    duration: '20 min',
    description: 'Tratamiento de datos, derechos de los titulares y deberes del personal.',
    assigned: ['c-102', 'c-104', 'c-109'],
    passScore: 75,
  },
]

// Progreso por aspirante / curso.
export const COURSE_PROGRESS = [
  { candidateId: 'c-101', courseId: 'crs-01', progress: 100, score: 85, status: 'aprobado' },
  { candidateId: 'c-101', courseId: 'crs-02', progress: 60, score: null, status: 'en curso' },
  { candidateId: 'c-102', courseId: 'crs-01', progress: 100, score: 92, status: 'aprobado' },
  { candidateId: 'c-102', courseId: 'crs-03', progress: 100, score: 78, status: 'aprobado' },
  { candidateId: 'c-103', courseId: 'crs-02', progress: 30, score: null, status: 'en curso' },
  { candidateId: 'c-111', courseId: 'crs-01', progress: 45, score: null, status: 'en curso' },
]

// Banco de preguntas de ejemplo para el constructor de evaluaciones.
export const SAMPLE_QUIZ = [
  {
    id: 'q1',
    type: 'multiple',
    question: '¿Cuál es el objetivo principal de la inducción corporativa?',
    options: ['Asignar salario', 'Conocer valores y políticas de la empresa', 'Firmar el contrato', 'Solicitar vacaciones'],
    answer: 1,
  },
  {
    id: 'q2',
    type: 'boolean',
    question: 'El uso de elementos de protección personal (EPP) es obligatorio en planta.',
    answer: true,
  },
  {
    id: 'q3',
    type: 'open',
    question: 'Describe brevemente qué harías ante una situación de emergencia en tu área.',
    answer: null,
  },
]

// Capturas de webcam registradas (evidencia).
export const WEBCAM_EVIDENCE = [
  { id: 'w-01', candidateId: 'c-101', courseId: 'crs-01', timestamp: '2025-06-15T10:32:00', user: 'Andrés Pérez' },
  { id: 'w-02', candidateId: 'c-102', courseId: 'crs-03', timestamp: '2025-06-14T09:05:00', user: 'Camila Restrepo' },
]
