import { useLocalStorage } from './useLocalStorage.js'
import { FORM_TEMPLATES } from '../data/mockFormTemplates.js'

// Plantillas de formulario/documentos por vía y grupo, editables en tiempo real.
export function useFormTemplates() {
  const [templates, setTemplates] = useLocalStorage('cx360.formTemplates', FORM_TEMPLATES)

  const addTemplate = (tpl) => {
    const item = { ...tpl, id: `ft-${Date.now()}` }
    setTemplates((list) => [...list, item])
    return item
  }

  const updateTemplate = (id, patch) => {
    setTemplates((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const removeTemplate = (id) => {
    setTemplates((list) => list.filter((t) => t.id !== id))
  }

  return { templates, addTemplate, updateTemplate, removeTemplate }
}
