import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { COURSES, COURSE_PROGRESS, SAMPLE_QUIZ } from '../data/mockCourses.js'
import {
  USE_SUPABASE,
  listCourses,
  createCourse as apiCreateCourse,
  assignCourseToCandidates,
  listCourseProgress,
  recordProgress as apiRecordProgress,
  getQuiz as apiGetQuiz,
  saveQuiz as apiSaveQuiz,
} from '../services/api.js'

// Cursos, evaluaciones y progreso.
export function useCourses() {
  const [mockCourses, setMockCourses] = useLocalStorage('cx360.courses', COURSES)
  const [mockQuizzes, setMockQuizzes] = useLocalStorage('cx360.quizzes', {})
  const [mockProgress, setMockProgress] = useLocalStorage('cx360.courseProgress', COURSE_PROGRESS)
  const [remoteCourses, setRemoteCourses] = useState([])
  const [remoteProgress, setRemoteProgress] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    Promise.all([listCourses(), listCourseProgress()])
      .then(([c, p]) => {
        setRemoteCourses(c)
        setRemoteProgress(p)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const courses = USE_SUPABASE ? remoteCourses : mockCourses
  const progress = USE_SUPABASE ? remoteProgress : mockProgress

  const createCourse = async ({ title, type, duration, description, passScore }) => {
    if (USE_SUPABASE) {
      const item = await apiCreateCourse({ title, type, duration, description, passScore })
      setRemoteCourses((list) => [item, ...list])
      return item
    }
    const item = { id: `crs-${Date.now()}`, title, type, duration, description, passScore: passScore || 70, assigned: [] }
    setMockCourses((list) => [item, ...list])
    return item
  }

  // Async siempre (incluso en modo mock) para que los componentes puedan
  // usar la misma forma `await getQuiz(id)` sin importar el modo.
  const getQuiz = async (courseId) => {
    if (USE_SUPABASE) return apiGetQuiz(courseId)
    return mockQuizzes[courseId] || SAMPLE_QUIZ
  }

  const saveQuiz = async (courseId, questions) => {
    if (USE_SUPABASE) return apiSaveQuiz(courseId, questions)
    setMockQuizzes((q) => ({ ...q, [courseId]: questions }))
  }

  const assignToCandidates = async (courseId, candidateIds) => {
    if (USE_SUPABASE) {
      await assignCourseToCandidates(courseId, candidateIds)
      setRemoteCourses((list) => list.map((c) => (c.id === courseId ? { ...c, assigned: candidateIds } : c)))
      return
    }
    setMockCourses((list) => list.map((c) => (c.id === courseId ? { ...c, assigned: candidateIds } : c)))
  }

  const recordProgress = async (candidateId, courseId, patch) => {
    if (USE_SUPABASE) {
      await apiRecordProgress(candidateId, courseId, patch)
      setRemoteProgress((list) => {
        const idx = list.findIndex((p) => p.candidateId === candidateId && p.courseId === courseId)
        if (idx === -1) return [...list, { candidateId, courseId, progress: 0, score: null, status: 'en curso', ...patch }]
        return list.map((p, i) => (i === idx ? { ...p, ...patch } : p))
      })
      return
    }
    setMockProgress((list) => {
      const idx = list.findIndex((p) => p.candidateId === candidateId && p.courseId === courseId)
      if (idx === -1) return [...list, { candidateId, courseId, progress: 0, score: null, status: 'en curso', ...patch }]
      return list.map((p, i) => (i === idx ? { ...p, ...patch } : p))
    })
  }

  return { courses, progress, loading, getQuiz, saveQuiz, createCourse, assignToCandidates, recordProgress }
}
