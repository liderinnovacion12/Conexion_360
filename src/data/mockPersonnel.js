// Registro de personal para el módulo financiero / nómina.
export const CONTRACT_TYPES = ['Indefinido', 'Fijo', 'Obra labor', 'Prestación de servicios']
export const PAYROLL_STATES = ['Activo', 'Inactivo', 'Suspendido']

export const PERSONNEL = [
  { id: 'p-001', doc: '1.018.456.789', name: 'María Gómez Restrepo', position: 'Analista de Operaciones', contract: 'Indefinido', salary: 3200000, state: 'Activo', start: '2022-03-01', end: null, area: 'Operaciones' },
  { id: 'p-002', doc: '1.020.112.334', name: 'Felipe Cárdenas Ruiz', position: 'Coordinador Logístico', contract: 'Indefinido', salary: 4500000, state: 'Activo', start: '2021-07-15', end: null, area: 'Logística' },
  { id: 'p-003', doc: '52.998.221', name: 'Sandra Villalba Mora', position: 'Auxiliar Administrativo', contract: 'Fijo', salary: 1800000, state: 'Activo', start: '2023-01-10', end: '2025-01-10', area: 'Administración' },
  { id: 'p-004', doc: '79.554.120', name: 'Ricardo Peña Solís', position: 'Jefe de Planta', contract: 'Indefinido', salary: 6200000, state: 'Activo', start: '2019-05-02', end: null, area: 'Producción' },
  { id: 'p-005', doc: '1.032.667.901', name: 'Laura Beltrán Niño', position: 'Analista de Calidad', contract: 'Indefinido', salary: 3400000, state: 'Activo', start: '2022-09-12', end: null, area: 'Calidad' },
  { id: 'p-006', doc: '80.221.554', name: 'Andrés Mejía Tovar', position: 'Operario de Producción', contract: 'Obra labor', salary: 1500000, state: 'Activo', start: '2024-02-01', end: '2024-12-31', area: 'Producción' },
  { id: 'p-007', doc: '1.144.778.220', name: 'Diana Forero Cruz', position: 'Asistente de RRHH', contract: 'Fijo', salary: 2100000, state: 'Suspendido', start: '2023-06-01', end: '2025-06-01', area: 'Talento Humano' },
  { id: 'p-008', doc: '94.556.331', name: 'Camilo Restrepo Díaz', position: 'Conductor', contract: 'Indefinido', salary: 1900000, state: 'Activo', start: '2020-11-20', end: null, area: 'Logística' },
  { id: 'p-009', doc: '1.077.889.443', name: 'Paola Sánchez Lemus', position: 'Contadora', contract: 'Indefinido', salary: 5200000, state: 'Activo', start: '2021-02-18', end: null, area: 'Financiera' },
  { id: 'p-010', doc: '79.112.667', name: 'Hernán Acosta Vega', position: 'Supervisor HSE', contract: 'Indefinido', salary: 3900000, state: 'Activo', start: '2022-04-25', end: null, area: 'HSE' },
  { id: 'p-011', doc: '52.334.889', name: 'Carolina Pinzón Roa', position: 'Recepcionista', contract: 'Fijo', salary: 1500000, state: 'Inactivo', start: '2022-08-01', end: '2024-08-01', area: 'Administración' },
  { id: 'p-012', doc: '1.090.556.778', name: 'Julián Moreno Ariza', position: 'Desarrollador', contract: 'Indefinido', salary: 5800000, state: 'Activo', start: '2023-03-15', end: null, area: 'Tecnología' },
  { id: 'p-013', doc: '80.667.221', name: 'Natalia Quintero Báez', position: 'Diseñadora', contract: 'Prestación de servicios', salary: 2800000, state: 'Activo', start: '2024-01-08', end: '2024-12-31', area: 'Mercadeo' },
  { id: 'p-014', doc: '1.012.998.776', name: 'Jorge Salazar Méndez', position: 'Consultor TI', contract: 'Prestación de servicios', salary: 6500000, state: 'Activo', start: '2024-03-01', end: '2025-08-31', area: 'Tecnología' },
  { id: 'p-015', doc: '53.778.112', name: 'Ángela Rodríguez Sáenz', position: 'Analista de Compras', contract: 'Indefinido', salary: 3100000, state: 'Activo', start: '2021-10-04', end: null, area: 'Compras' },
]
