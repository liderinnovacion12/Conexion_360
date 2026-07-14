import { useLocalStorage } from './useLocalStorage.js'
import { GENERATED_DOCUMENTS } from '../data/mockGeneratedDocuments.js'

// Documentos genéricos creados desde el Editor de documentos y enviados a
// una ruta de aprobación (mismo patrón que useContracts).
export function useGeneratedDocuments() {
  const [documents, setDocuments] = useLocalStorage('cx360.generatedDocuments', GENERATED_DOCUMENTS)

  const addDocument = (doc) => {
    const item = { ...doc, id: `doc-${Date.now()}` }
    setDocuments((list) => [item, ...list])
    return item
  }

  const updateDocumentStatus = (id, status) => {
    setDocuments((list) => list.map((d) => (d.id === id ? { ...d, status } : d)))
  }

  return { documents, addDocument, updateDocumentStatus }
}
