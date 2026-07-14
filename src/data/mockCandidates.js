// Aspirantes en proceso de reclutamiento.
// `track` indica la vía de vinculación: 'funcionario' (planta) o 'contratista' (prestación de servicios).
export const CANDIDATES = [
  { id: 'c-101', name: 'Andrés Pérez Ladino', doc: '1.022.334.556', email: 'aspirante@conexion360.co', phone: '300 456 7890', position: 'Operario de Producción', stage: 'doc_revision', status: 'pendiente', progress: 45, createdAt: '2025-06-10', city: 'Bogotá', track: 'funcionario' },
  { id: 'c-102', name: 'Camila Restrepo Ávila', doc: '1.033.778.221', email: 'camila.r@example.com', phone: '301 223 4455', position: 'Analista de Calidad', stage: 'curso_completado', status: 'pendiente', progress: 78, createdAt: '2025-06-05', city: 'Medellín', track: 'funcionario' },
  { id: 'c-103', name: 'Sebastián Gómez Páez', doc: '1.044.112.998', email: 'sebas.g@example.com', phone: '302 998 1122', position: 'Auxiliar Logístico', stage: 'doc_aprobados', status: 'pendiente', progress: 60, createdAt: '2025-06-12', city: 'Cali', track: 'funcionario' },
  { id: 'c-104', name: 'Valentina Ríos Cano', doc: '1.055.667.334', email: 'valen.rios@example.com', phone: '310 445 6677', position: 'Asistente Administrativo', stage: 'apto', status: 'aprobado', progress: 92, createdAt: '2025-05-28', city: 'Bogotá', track: 'contratista' },
  { id: 'c-105', name: 'Mateo Hernández Ruiz', doc: '1.066.221.778', email: 'mateo.h@example.com', phone: '311 778 9900', position: 'Conductor', stage: 'doc_devueltos', status: 'pendiente', progress: 30, createdAt: '2025-06-14', city: 'Barranquilla', track: 'funcionario' },
  { id: 'c-106', name: 'Isabella Marín Soto', doc: '1.077.334.556', email: 'isa.marin@example.com', phone: '312 334 5566', position: 'Analista de Compras', stage: 'contratado', status: 'contratado', progress: 100, createdAt: '2025-05-15', city: 'Bogotá', track: 'contratista' },
  { id: 'c-107', name: 'Samuel Torres Vega', doc: '1.088.556.112', email: 'samuel.t@example.com', phone: '313 556 7788', position: 'Operario', stage: 'doc_pendientes', status: 'pendiente', progress: 15, createdAt: '2025-06-18', city: 'Bucaramanga', track: 'funcionario' },
  { id: 'c-108', name: 'Daniela Castro Lemus', doc: '1.099.778.334', email: 'dani.castro@example.com', phone: '314 778 1122', position: 'Recepcionista', stage: 'registro', status: 'pendiente', progress: 5, createdAt: '2025-06-22', city: 'Pereira', track: 'funcionario' },
  { id: 'c-109', name: 'Tomás Rojas Ariza', doc: '1.011.998.556', email: 'tomas.r@example.com', phone: '315 112 3344', position: 'Supervisor', stage: 'eval_aprobada', status: 'aprobado', progress: 88, createdAt: '2025-06-01', city: 'Medellín', track: 'contratista' },
  { id: 'c-110', name: 'Luciana Vargas Niño', doc: '1.022.667.889', email: 'luciana.v@example.com', phone: '316 667 8899', position: 'Auxiliar Contable', stage: 'rechazado', status: 'rechazado', progress: 40, createdAt: '2025-05-20', city: 'Bogotá', track: 'contratista' },
  { id: 'c-111', name: 'Emiliano Díaz Polo', doc: '1.033.221.445', email: 'emi.diaz@example.com', phone: '317 221 4455', position: 'Operario', stage: 'curso_asignado', status: 'pendiente', progress: 55, createdAt: '2025-06-08', city: 'Cartagena', track: 'funcionario' },
  { id: 'c-112', name: 'Antonia Mejía Roa', doc: '1.044.556.778', email: 'antonia.m@example.com', phone: '318 556 9900', position: 'Analista', stage: 'doc_revision', status: 'pendiente', progress: 48, createdAt: '2025-06-16', city: 'Bogotá', track: 'contratista' },
]

export const STATUS_VARIANT = {
  pendiente: 'warning',
  aprobado: 'success',
  rechazado: 'danger',
  contratado: 'violet',
}

export const TRACKS = [
  { id: 'funcionario', label: 'Funcionarios' },
  { id: 'contratista', label: 'Contratistas' },
]
