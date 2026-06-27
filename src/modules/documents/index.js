// Módulo de gestión documental.
// La revisión documental (aprobar/rechazar/devolver, historial de versiones y
// trazabilidad) se implementa en el módulo de reclutamiento y se reutiliza aquí.
export { default as DocumentReview } from '../recruitment/DocumentReview.jsx'
export { DOCUMENT_TYPES, DOCUMENTS, DOCUMENT_VERSIONS } from '../../data/mockDocuments.js'
