import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { GENERATED_DOCUMENTS } from '../data/mockGeneratedDocuments.js'
import {
  USE_SUPABASE,
  listGeneratedDocuments,
  createGeneratedDocument,
  updateGeneratedDocumentStatus as apiUpdateDocStatus,
} from '../services/api.js'

// Documentos genéricos creados desde el Editor de documentos y enviados a
// una ruta de aprobación (mismo patrón que useContracts).
export function useGeneratedDocuments() {
  const [mockDocuments, setMockDocuments] = useLocalStorage('cx360.generatedDocuments', GENERATED_DOCUMENTS)
  const [remoteDocuments, setRemoteDocuments] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    listGeneratedDocuments().then(setRemoteDocuments).finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  const documents = USE_SUPABASE ? remoteDocuments : mockDocuments

  const addDocument = async (doc) => {
    if (USE_SUPABASE) {
      const item = await createGeneratedDocument(doc)
      setRemoteDocuments((list) => [item, ...list])
      return item
    }
    const item = { ...doc, id: `doc-${Date.now()}` }
    setMockDocuments((list) => [item, ...list])
    return item
  }

  const updateDocumentStatus = async (id, status) => {
    if (USE_SUPABASE) {
      await apiUpdateDocStatus(id, status)
      setRemoteDocuments((list) => list.map((d) => (d.id === id ? { ...d, status } : d)))
      return
    }
    setMockDocuments((list) => list.map((d) => (d.id === id ? { ...d, status } : d)))
  }

  return { documents, loading, addDocument, updateDocumentStatus }
}
