import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { LEGAL_TEMPLATES } from '../data/mockLegalTemplates.js'
import {
  USE_SUPABASE,
  listLegalTemplates,
  createLegalTemplate,
  updateLegalTemplate as apiUpdateTemplate,
  removeLegalTemplate as apiRemoveTemplate,
} from '../services/api.js'

// Biblioteca de plantillas de contrato, editable desde Jurídica > Plantillas.
export function useLegalTemplates() {
  const [mockTemplates, setMockTemplates] = useLocalStorage('cx360.legalTemplates', LEGAL_TEMPLATES)
  const [remoteTemplates, setRemoteTemplates] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    listLegalTemplates().then(setRemoteTemplates).finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  const templates = USE_SUPABASE ? remoteTemplates : mockTemplates

  const addTemplate = async (tpl) => {
    if (USE_SUPABASE) {
      const item = await createLegalTemplate(tpl)
      setRemoteTemplates((list) => [item, ...list])
      return item
    }
    const item = { ...tpl, id: `tpl-${Date.now()}` }
    setMockTemplates((list) => [item, ...list])
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
