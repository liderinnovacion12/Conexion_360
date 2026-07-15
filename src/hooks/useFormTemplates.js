import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { FORM_TEMPLATES } from '../data/mockFormTemplates.js'
import {
  USE_SUPABASE,
  listFormTemplates,
  createFormTemplate,
  updateFormTemplate as apiUpdateTemplate,
  removeFormTemplate as apiRemoveTemplate,
} from '../services/api.js'

// Plantillas de formulario/documentos por vía y grupo, editables en tiempo real.
export function useFormTemplates() {
  const [mockTemplates, setMockTemplates] = useLocalStorage('cx360.formTemplates', FORM_TEMPLATES)
  const [remoteTemplates, setRemoteTemplates] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    listFormTemplates().then(setRemoteTemplates).finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  const templates = USE_SUPABASE ? remoteTemplates : mockTemplates

  const addTemplate = async (tpl) => {
    if (USE_SUPABASE) {
      const item = await createFormTemplate(tpl)
      setRemoteTemplates((list) => [...list, item])
      return item
    }
    const item = { ...tpl, id: `ft-${Date.now()}` }
    setMockTemplates((list) => [...list, item])
    return item
  }

  const updateTemplate = async (id, patch) => {
    if (USE_SUPABASE) {
      const item = await apiUpdateTemplate(id, patch)
      setRemoteTemplates((list) => list.map((t) => (t.id === id ? item : t)))
      return
    }
    setMockTemplates((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const removeTemplate = async (id) => {
    if (USE_SUPABASE) {
      await apiRemoveTemplate(id)
      setRemoteTemplates((list) => list.filter((t) => t.id !== id))
      return
    }
    setMockTemplates((list) => list.filter((t) => t.id !== id))
  }

  return { templates, loading, addTemplate, updateTemplate, removeTemplate }
}
