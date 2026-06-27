// Registros de auditoría (quién hizo qué y cuándo).
export const AUDIT_LOGS = [
  { id: 'a-001', actor: 'Daniela Ortiz', role: 'Reclutamiento', action: 'Aprobó documento', target: 'Hoja de vida · Andrés Pérez', ts: '2025-06-12T14:30:00', ip: '190.85.12.40' },
  { id: 'a-002', actor: 'Daniela Ortiz', role: 'Reclutamiento', action: 'Devolvió documento', target: 'Certificado académico · Andrés Pérez', ts: '2025-06-13T10:05:00', ip: '190.85.12.40' },
  { id: 'a-003', actor: 'Andrés Pérez', role: 'Aspirante', action: 'Cargó documento', target: 'Seguridad social', ts: '2025-06-18T16:40:00', ip: '181.49.33.10' },
  { id: 'a-004', actor: 'Carlos Ríos', role: 'Finanzas', action: 'Generó certificado laboral', target: 'María Gómez', ts: '2025-06-19T08:15:00', ip: '190.85.12.55' },
  { id: 'a-005', actor: 'Laura Mendoza', role: 'Admin', action: 'Creó usuario', target: 'reclutamiento@conexion360.co', ts: '2025-06-01T09:00:00', ip: '190.85.12.01' },
  { id: 'a-006', actor: 'Andrés Pérez', role: 'Aspirante', action: 'Firmó autorización de datos', target: 'Ley 1581/2012', ts: '2025-06-11T08:55:00', ip: '181.49.33.10' },
  { id: 'a-007', actor: 'Daniela Ortiz', role: 'Reclutamiento', action: 'Asignó curso', target: 'Inducción · Camila Restrepo', ts: '2025-06-05T11:20:00', ip: '190.85.12.40' },
  { id: 'a-008', actor: 'Camila Restrepo', role: 'Aspirante', action: 'Completó evaluación', target: 'Protección de Datos · 78/100', ts: '2025-06-14T09:40:00', ip: '186.30.55.21' },
  { id: 'a-009', actor: 'Patricia León', role: 'Auditor', action: 'Exportó reporte', target: 'Cumplimiento documental Q2', ts: '2025-06-20T16:00:00', ip: '190.85.12.77' },
  { id: 'a-010', actor: 'Carlos Ríos', role: 'Finanzas', action: 'Actualizó nómina', target: 'Periodo junio 2025', ts: '2025-06-22T10:30:00', ip: '190.85.12.55' },
]
