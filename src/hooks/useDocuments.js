import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { DOCUMENTS, DOCUMENT_VERSIONS } from '../data/mockDocuments.js'
import { USE_SUPABASE, listDocuments, createDocument as apiCreateDocument, reviewDocument as apiReviewDocument, listDocumentVersions } from '../services/api.js'
import { uploadDocumentFile } from '../services/supabaseClient.js'

const slug = (label) => label.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

// Documentos cargados por los aspirantes.
// Pasa `candidateId` para traer solo los de una persona (portal del
// aspirante) u omítelo para traer todos (revisión documental / auditoría).
export function useDocuments(candidateId) {
  const [mockDocs, setMockDocs] = useLocalStorage('cx360.documents', DOCUMENTS)
  const [remote, setRemote] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    listDocuments(candidateId)
      .then((data) => setRemote(data))
      .finally(() => setLoading(false))
  }, [candidateId])

  useEffect(() => {
    reload()
  }, [reload])

  const documents = USE_SUPABASE
    ? remote
    : candidateId
      ? mockDocs.filter((d) => d.candidateId === candidateId)
      : mockDocs

  // Sube el PDF real a Storage (bucket `documentos`) y crea/reemplaza la
  // fila del documento. `existingVersion` es la versión previa (si la
  // persona ya había cargado ese tipo de documento antes).
  const uploadDocument = async ({ candidateId: cid, type, required, visibility = 'ambos', uploadedByName, file, existingVersion = 0 }) => {
    if (USE_SUPABASE) {
      const version = existingVersion + 1
      const path = await uploadDocumentFile(cid, slug(type), file, version)
      const item = await apiCreateDocument({ candidateId: cid, type, required, visibility, uploadedByName, filePath: path })
      setRemote((list) => [item, ...list.filter((d) => !(d.type === type && d.candidateId === cid))])
      return item
    }
    let created
    setMockDocs((ds) => {
      const idx = ds.findIndex((d) => d.type === type && d.candidateId === cid)
      const base = {
        id: `d-${Date.now()}`, candidateId: cid, type, status: 'pendiente', required, visibility,
        uploadedBy: uploadedByName, uploadedAt: new Date().toISOString(), reviewedBy: null, reviewedAt: null,
        comment: '', version: 1, expires: null, file: file.name,
      }
      if (idx >= 0) {
        const copy = [...ds]
        copy[idx] = { ...copy[idx], status: 'pendiente', file: file.name, uploadedAt: new Date().toISOString(), version: copy[idx].version + 1, comment: '' }
        created = copy[idx]
        return copy
      }
      created = base
      return [...ds, base]
    })
    return created
  }

  const reviewDocument = async (id, { status, comment = '', reviewedByName }) => {
    if (USE_SUPABASE) {
      const updated = await apiReviewDocument(id, { status, comment, reviewedByName })
      setRemote((list) => list.map((d) => (d.id === id ? updated : d)))
      return updated
    }
    let updated
    setMockDocs((ds) =>
      ds.map((d) => {
        if (d.id !== id) return d
        updated = { ...d, status, comment, reviewedBy: reviewedByName, reviewedAt: new Date().toISOString() }
        return updated
      })
    )
    return updated
  }

  const getVersions = async (documentId) => {
    if (USE_SUPABASE) return listDocumentVersions(documentId)
    return DOCUMENT_VERSIONS[documentId] || null
  }

  return { documents, loading, uploadDocument, reviewDocument, getVersions, reload }
}
