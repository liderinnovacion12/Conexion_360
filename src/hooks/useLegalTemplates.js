import { useLocalStorage } from './useLocalStorage.js'
import { LEGAL_TEMPLATES } from '../data/mockLegalTemplates.js'

// Biblioteca de plantillas de contrato, editable desde Jurídica > Plantillas.
export function useLegalTemplates() {
  const [templates, setTemplates] = useLocalStorage('cx360.legalTemplates', LEGAL_TEMPLATES)

  const addTemplate = (tpl) => {
    const item = { ...tpl, id: `tpl-${Date.now()}` }
    setTemplates((list) => [item, ...list])
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
