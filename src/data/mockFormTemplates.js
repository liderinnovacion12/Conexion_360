// ============================================================
// Plantillas de formulario/documentos, configurables en tiempo real por el
// reclutador. Generalizan el antiguo DOCUMENT_TYPES fijo: ahora se puede
// crear una plantilla por vía (funcionario/contratista) y, opcionalmente,
// una plantilla adicional por grupo que agrega o ajusta campos.
// ============================================================

// Campo: { key, label, type: 'document' | 'text' | 'select' | 'date', required, options? }
export const FORM_TEMPLATES = [
  {
    id: 'ft-funcionario-base',
    name: 'Documentos base · Funcionarios',
    track: 'funcionario',
    groupId: null,
    fields: [
      { key: 'hv', label: 'Hoja de vida actualizada', type: 'document', required: true },
      { key: 'cedula', label: 'Documento de identidad', type: 'document', required: true },
      { key: 'academico', label: 'Certificados académicos', type: 'document', required: true },
      { key: 'laboral', label: 'Certificados laborales', type: 'document', required: false },
      { key: 'profesional', label: 'Tarjeta profesional', type: 'document', required: false },
      { key: 'seguridad', label: 'Seguridad social (EPS, pensión, ARL)', type: 'document', required: true },
      { key: 'bancaria', label: 'Certificación bancaria', type: 'document', required: false },
      { key: 'rut', label: 'RUT', type: 'document', required: false },
      { key: 'vacunacion', label: 'Carnet de vacunación', type: 'document', required: false },
    ],
  },
  {
    id: 'ft-contratista-base',
    name: 'Documentos base · Contratistas',
    track: 'contratista',
    groupId: null,
    fields: [
      { key: 'hv', label: 'Hoja de vida actualizada', type: 'document', required: true },
      { key: 'cedula', label: 'Documento de identidad', type: 'document', required: true },
      { key: 'academico', label: 'Certificados académicos', type: 'document', required: true },
      { key: 'laboral', label: 'Certificados laborales', type: 'document', required: false },
      { key: 'profesional', label: 'Tarjeta profesional', type: 'document', required: false },
      { key: 'seguridad', label: 'Seguridad social (EPS, pensión, ARL)', type: 'document', required: true },
      { key: 'bancaria', label: 'Certificación bancaria', type: 'document', required: true },
      { key: 'rut', label: 'RUT', type: 'document', required: true },
      { key: 'vacunacion', label: 'Carnet de vacunación', type: 'document', required: false },
    ],
  },
  {
    id: 'ft-grupo-abogados',
    name: 'Requisitos adicionales · Abogados',
    track: null,
    groupId: 'grp-abogados',
    fields: [
      { key: 'profesional', label: 'Tarjeta profesional', type: 'document', required: true },
      { key: 'tarjeta_cpc', label: 'Certificado del Consejo Superior de la Judicatura', type: 'document', required: true },
    ],
  },
]
