// Resuelve los campos/documentos requeridos para un aspirante según su vía,
// sus grupos y (opcionalmente) un override individual por aspirante.
// Prioridad: override candidato > grupo > plantilla base > fallback.
export function resolveRequiredFields(track, groupIds = [], templates = [], fallbackFields = [], candidateId = null) {
  const base = templates.find((t) => t.track === track && !t.groupId && !t.candidateId)
  const groupTemplates = templates.filter((t) => t.groupId && groupIds.includes(t.groupId) && !t.candidateId)
  const candidateOverride = candidateId ? templates.find((t) => t.candidateId === candidateId) : null

  const fields = [...(base ? base.fields : fallbackFields)]
  const byKey = new Map(fields.map((f) => [f.key, f]))

  groupTemplates.forEach((tpl) => {
    tpl.fields.forEach((f) => {
      byKey.set(f.key, { ...byKey.get(f.key), ...f })
    })
  })

  if (candidateOverride) {
    candidateOverride.fields.forEach((f) => {
      byKey.set(f.key, { ...byKey.get(f.key), ...f })
    })
  }

  return [...byKey.values()]
}
