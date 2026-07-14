// Resuelve los campos/documentos requeridos para un aspirante según su vía
// (funcionario/contratista) y los grupos a los que pertenece. Las plantillas
// de grupo agregan o ajustan campos sobre la plantilla base de la vía.
// Si no hay plantilla base para la vía, se usa `fallbackFields` (compatibilidad
// con el antiguo DOCUMENT_TYPES fijo, para no romper candidatos existentes).
export function resolveRequiredFields(track, groupIds = [], templates = [], fallbackFields = []) {
  const base = templates.find((t) => t.track === track && !t.groupId)
  const groupTemplates = templates.filter((t) => t.groupId && groupIds.includes(t.groupId))

  const fields = [...(base ? base.fields : fallbackFields)]
  const byKey = new Map(fields.map((f) => [f.key, f]))

  groupTemplates.forEach((tpl) => {
    tpl.fields.forEach((f) => {
      byKey.set(f.key, { ...byKey.get(f.key), ...f })
    })
  })

  return [...byKey.values()]
}
