// Módulo de cursos y evaluaciones.
// La gestión (creación/asignación/evaluaciones/evidencia webcam) vive en
// reclutamiento; la experiencia del aspirante vive en el portal de candidato.
export { default as CourseAssignment } from '../recruitment/CourseAssignment.jsx'
export { default as CandidateCourses } from '../candidate/CandidateCourses.jsx'
export { COURSES, COURSE_PROGRESS, SAMPLE_QUIZ, WEBCAM_EVIDENCE } from '../../data/mockCourses.js'
