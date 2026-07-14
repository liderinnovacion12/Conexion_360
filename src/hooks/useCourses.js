import { useLocalStorage } from './useLocalStorage.js'
import { COURSES, COURSE_PROGRESS, SAMPLE_QUIZ } from '../data/mockCourses.js'

// Cursos, evaluaciones y progreso — persistidos, para que crear un curso o
// evaluación realmente quede guardado (antes el constructor era solo visual).
export function useCourses() {
  const [courses, setCourses] = useLocalStorage('cx360.courses', COURSES)
  const [quizzes, setQuizzes] = useLocalStorage('cx360.quizzes', {})
  const [progress, setProgress] = useLocalStorage('cx360.courseProgress', COURSE_PROGRESS)

  const createCourse = ({ title, type, duration, description, passScore }) => {
    const item = { id: `crs-${Date.now()}`, title, type, duration, description, passScore: passScore || 70, assigned: [] }
    setCourses((list) => [item, ...list])
    return item
  }

  const getQuiz = (courseId) => quizzes[courseId] || SAMPLE_QUIZ

  const saveQuiz = (courseId, questions) => {
    setQuizzes((q) => ({ ...q, [courseId]: questions }))
  }

  const assignToCandidates = (courseId, candidateIds) => {
    setCourses((list) => list.map((c) => (c.id === courseId ? { ...c, assigned: candidateIds } : c)))
  }

  const recordProgress = (candidateId, courseId, patch) => {
    setProgress((list) => {
      const idx = list.findIndex((p) => p.candidateId === candidateId && p.courseId === courseId)
      if (idx === -1) return [...list, { candidateId, courseId, progress: 0, score: null, status: 'en curso', ...patch }]
      return list.map((p, i) => (i === idx ? { ...p, ...patch } : p))
    })
  }

  return { courses, progress, getQuiz, saveQuiz, createCourse, assignToCandidates, recordProgress }
}
