// Tipos de documento requeridos para aspirantes (PDF).
export const DOCUMENT_TYPES = [
  { key: 'hv', label: 'Hoja de vida actualizada', required: true },
  { key: 'cedula', label: 'Documento de identidad', required: true },
  { key: 'academico', label: 'Certificados académicos', required: true },
  { key: 'laboral', label: 'Certificados laborales', required: false },
  { key: 'profesional', label: 'Tarjeta profesional', required: false },
  { key: 'seguridad', label: 'Seguridad social (EPS, pensión, ARL)', required: true },
  { key: 'bancaria', label: 'Certificación bancaria', required: false },
  { key: 'rut', label: 'RUT', required: false },
  { key: 'vacunacion', label: 'Carnet de vacunación', required: false },
]

// Documentos cargados (con trazabilidad / audit trail).
export const DOCUMENTS = [
  { id: 'd-001', candidateId: 'c-101', type: 'Hoja de vida actualizada', status: 'aprobado', required: true, visibility: 'ambos', uploadedBy: 'Andrés Pérez', uploadedAt: '2025-06-11T09:12:00', reviewedBy: 'Daniela Ortiz', reviewedAt: '2025-06-12T14:30:00', comment: '', version: 1, expires: null, file: 'hoja_vida_andres.pdf' },
  { id: 'd-002', candidateId: 'c-101', type: 'Documento de identidad', status: 'aprobado', required: true, visibility: 'interno', uploadedBy: 'Andrés Pérez', uploadedAt: '2025-06-11T09:15:00', reviewedBy: 'Daniela Ortiz', reviewedAt: '2025-06-12T14:32:00', comment: '', version: 1, expires: null, file: 'cedula_andres.pdf' },
  { id: 'd-003', candidateId: 'c-101', type: 'Certificados académicos', status: 'devuelto', required: true, visibility: 'ambos', uploadedBy: 'Andrés Pérez', uploadedAt: '2025-06-11T09:20:00', reviewedBy: 'Daniela Ortiz', reviewedAt: '2025-06-13T10:05:00', comment: 'El acta de grado está ilegible. Por favor vuelve a cargar el documento escaneado en buena calidad.', version: 2, expires: null, file: 'diploma_andres.pdf' },
  { id: 'd-004', candidateId: 'c-101', type: 'Seguridad social (EPS, pensión, ARL)', status: 'pendiente', required: true, visibility: 'interno', uploadedBy: 'Andrés Pérez', uploadedAt: '2025-06-18T16:40:00', reviewedBy: null, reviewedAt: null, comment: '', version: 1, expires: '2025-07-15', file: 'eps_andres.pdf' },
  { id: 'd-005', candidateId: 'c-102', type: 'Hoja de vida actualizada', status: 'aprobado', required: true, visibility: 'ambos', uploadedBy: 'Camila Restrepo', uploadedAt: '2025-06-06T08:00:00', reviewedBy: 'Daniela Ortiz', reviewedAt: '2025-06-06T15:00:00', comment: '', version: 1, expires: null, file: 'hv_camila.pdf' },
  { id: 'd-006', candidateId: 'c-102', type: 'Certificados laborales', status: 'aprobado', required: false, visibility: 'interno', uploadedBy: 'Camila Restrepo', uploadedAt: '2025-06-06T08:10:00', reviewedBy: 'Daniela Ortiz', reviewedAt: '2025-06-07T09:00:00', comment: '', version: 1, expires: null, file: 'lab_camila.pdf' },
  { id: 'd-007', candidateId: 'c-105', type: 'Documento de identidad', status: 'rechazado', required: true, visibility: 'interno', uploadedBy: 'Mateo Hernández', uploadedAt: '2025-06-15T11:00:00', reviewedBy: 'Daniela Ortiz', reviewedAt: '2025-06-16T09:30:00', comment: 'El documento no corresponde al titular registrado.', version: 1, expires: null, file: 'cc_mateo.pdf' },
  { id: 'd-008', candidateId: 'c-107', type: 'Hoja de vida actualizada', status: 'pendiente', required: true, visibility: 'ambos', uploadedBy: 'Samuel Torres', uploadedAt: '2025-06-19T10:20:00', reviewedBy: null, reviewedAt: null, comment: '', version: 1, expires: null, file: 'hv_samuel.pdf' },
  { id: 'd-009', candidateId: 'c-103', type: 'Seguridad social (EPS, pensión, ARL)', status: 'vencido', required: true, visibility: 'interno', uploadedBy: 'Sebastián Gómez', uploadedAt: '2025-05-01T10:00:00', reviewedBy: 'Daniela Ortiz', reviewedAt: '2025-05-02T10:00:00', comment: 'Documento venció, requiere actualización.', version: 1, expires: '2025-06-15', file: 'eps_sebastian.pdf' },
  { id: 'd-010', candidateId: 'c-112', type: 'Certificados académicos', status: 'pendiente', required: true, visibility: 'ambos', uploadedBy: 'Antonia Mejía', uploadedAt: '2025-06-17T13:00:00', reviewedBy: null, reviewedAt: null, comment: '', version: 1, expires: null, file: 'acad_antonia.pdf' },
]

// Historial de versiones (cuando un documento se reemplaza).
export const DOCUMENT_VERSIONS = {
  'd-003': [
    { version: 1, uploadedAt: '2025-06-11T09:20:00', action: 'Carga inicial', by: 'Andrés Pérez' },
    { version: 2, uploadedAt: '2025-06-13T18:00:00', action: 'Reemplazo tras devolución', by: 'Andrés Pérez' },
  ],
}
