// Series y agregados para los tableros analíticos.

export const PAYROLL_TREND = [
  { month: 'Ene', costo: 48.2, contrataciones: 3 },
  { month: 'Feb', costo: 49.1, contrataciones: 2 },
  { month: 'Mar', costo: 51.5, contrataciones: 5 },
  { month: 'Abr', costo: 52.0, contrataciones: 4 },
  { month: 'May', costo: 53.8, contrataciones: 6 },
  { month: 'Jun', costo: 55.4, contrataciones: 4 },
]

export const HIRING_TREND = [
  { month: 'Ene', planta: 142 },
  { month: 'Feb', planta: 144 },
  { month: 'Mar', planta: 149 },
  { month: 'Abr', planta: 151 },
  { month: 'May', planta: 156 },
  { month: 'Jun', planta: 159 },
]

export const PAYROLL_BY_AREA = [
  { name: 'Producción', value: 16.4 },
  { name: 'Logística', value: 9.1 },
  { name: 'Tecnología', value: 12.3 },
  { name: 'Administración', value: 6.8 },
  { name: 'Financiera', value: 5.2 },
  { name: 'Otras', value: 5.6 },
]

export const DOC_COMPLIANCE = [
  { name: 'Aprobados', value: 64, color: '#2EE6A6' },
  { name: 'Pendientes', value: 21, color: '#FFC857' },
  { name: 'Devueltos', value: 9, color: '#9B5DE5' },
  { name: 'Rechazados', value: 6, color: '#FF5D73' },
]

export const PERSONNEL_DISTRIBUTION = [
  { name: 'Personal activo', value: 159, color: '#19E3D9' },
  { name: 'Contratistas', value: 28, color: '#9B5DE5' },
  { name: 'Aspirantes', value: 12, color: '#FFC857' },
  { name: 'Inactivos', value: 7, color: '#6b7793' },
]

export const RECRUITMENT_FUNNEL = [
  { label: 'Registro creado', value: 48 },
  { label: 'Documentos en revisión', value: 36 },
  { label: 'Documentos aprobados', value: 27 },
  { label: 'Curso completado', value: 19 },
  { label: 'Evaluación aprobada', value: 14 },
  { label: 'Apto para contratación', value: 9 },
  { label: 'Contratado', value: 6 },
]

export const COURSE_STATUS = [
  { name: 'Completados', value: 38, color: '#2EE6A6' },
  { name: 'En curso', value: 17, color: '#19E3D9' },
  { name: 'Sin iniciar', value: 11, color: '#6b7793' },
]
