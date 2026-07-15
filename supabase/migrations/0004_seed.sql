-- ============================================================
-- Conexión 360 · Datos semilla (equivalentes a los mocks actuales)
-- Aplica DESPUÉS de 0001, 0002 y 0003.
--
-- Nota: los 8 usuarios de demostración (admin@conexion360.co, etc.) NO se
-- crean aquí porque Supabase Auth necesita la API de administración para
-- generar la contraseña de forma segura. Ejecuta después:
--   node scripts/seed-supabase-users.mjs
-- (crea los usuarios en auth.users; el trigger `handle_new_auth_user`
-- genera su fila en `profiles` automáticamente).
-- ============================================================

-- ------------------------------------------------------------
-- Catálogo de tipos de documento
-- ------------------------------------------------------------
insert into document_types (key, label, required) values
  ('hv', 'Hoja de vida actualizada', true),
  ('cedula', 'Documento de identidad', true),
  ('academico', 'Certificados académicos', true),
  ('laboral', 'Certificados laborales', false),
  ('profesional', 'Tarjeta profesional', false),
  ('seguridad', 'Seguridad social (EPS, pensión, ARL)', true),
  ('bancaria', 'Certificación bancaria', false),
  ('rut', 'RUT', false),
  ('vacunacion', 'Carnet de vacunación', false);

-- ------------------------------------------------------------
-- Aspirantes (candidates)
-- ------------------------------------------------------------
insert into candidates (id, name, doc, email, phone, position, stage, status, progress, city, track, created_at) values
  ('c-101', 'Andrés Pérez Ladino', '1.022.334.556', 'aspirante@conexion360.co', '300 456 7890', 'Operario de Producción', 'doc_revision', 'pendiente', 45, 'Bogotá', 'funcionario', '2025-06-10'),
  ('c-102', 'Camila Restrepo Ávila', '1.033.778.221', 'camila.r@example.com', '301 223 4455', 'Analista de Calidad', 'curso_completado', 'pendiente', 78, 'Medellín', 'funcionario', '2025-06-05'),
  ('c-103', 'Sebastián Gómez Páez', '1.044.112.998', 'sebas.g@example.com', '302 998 1122', 'Auxiliar Logístico', 'doc_aprobados', 'pendiente', 60, 'Cali', 'funcionario', '2025-06-12'),
  ('c-104', 'Valentina Ríos Cano', '1.055.667.334', 'valen.rios@example.com', '310 445 6677', 'Asistente Administrativo', 'apto', 'aprobado', 92, 'Bogotá', 'contratista', '2025-05-28'),
  ('c-105', 'Mateo Hernández Ruiz', '1.066.221.778', 'mateo.h@example.com', '311 778 9900', 'Conductor', 'doc_devueltos', 'pendiente', 30, 'Barranquilla', 'funcionario', '2025-06-14'),
  ('c-106', 'Isabella Marín Soto', '1.077.334.556', 'isa.marin@example.com', '312 334 5566', 'Analista de Compras', 'contratado', 'contratado', 100, 'Bogotá', 'contratista', '2025-05-15'),
  ('c-107', 'Samuel Torres Vega', '1.088.556.112', 'samuel.t@example.com', '313 556 7788', 'Operario', 'doc_pendientes', 'pendiente', 15, 'Bucaramanga', 'funcionario', '2025-06-18'),
  ('c-108', 'Daniela Castro Lemus', '1.099.778.334', 'dani.castro@example.com', '314 778 1122', 'Recepcionista', 'registro', 'pendiente', 5, 'Pereira', 'funcionario', '2025-06-22'),
  ('c-109', 'Tomás Rojas Ariza', '1.011.998.556', 'tomas.r@example.com', '315 112 3344', 'Supervisor', 'eval_aprobada', 'aprobado', 88, 'Medellín', 'contratista', '2025-06-01'),
  ('c-110', 'Luciana Vargas Niño', '1.022.667.889', 'luciana.v@example.com', '316 667 8899', 'Auxiliar Contable', 'rechazado', 'rechazado', 40, 'Bogotá', 'contratista', '2025-05-20'),
  ('c-111', 'Emiliano Díaz Polo', '1.033.221.445', 'emi.diaz@example.com', '317 221 4455', 'Operario', 'curso_asignado', 'pendiente', 55, 'Cartagena', 'funcionario', '2025-06-08'),
  ('c-112', 'Antonia Mejía Roa', '1.044.556.778', 'antonia.m@example.com', '318 556 9900', 'Analista', 'doc_revision', 'pendiente', 48, 'Bogotá', 'contratista', '2025-06-16');

-- ------------------------------------------------------------
-- Documentos cargados
-- ------------------------------------------------------------
insert into documents (id, candidate_id, type, status, required, visibility, uploaded_by_name, uploaded_at, reviewed_at, comment, version, expires, file_path) values
  ('d-001', 'c-101', 'Hoja de vida actualizada', 'aprobado', true, 'ambos', 'Andrés Pérez', '2025-06-11T09:12:00', '2025-06-12T14:30:00', '', 1, null, 'c-101/hv/v1.pdf'),
  ('d-002', 'c-101', 'Documento de identidad', 'aprobado', true, 'interno', 'Andrés Pérez', '2025-06-11T09:15:00', '2025-06-12T14:32:00', '', 1, null, 'c-101/cedula/v1.pdf'),
  ('d-003', 'c-101', 'Certificados académicos', 'devuelto', true, 'ambos', 'Andrés Pérez', '2025-06-11T09:20:00', '2025-06-13T10:05:00', 'El acta de grado está ilegible. Por favor vuelve a cargar el documento escaneado en buena calidad.', 2, null, 'c-101/academico/v2.pdf'),
  ('d-004', 'c-101', 'Seguridad social (EPS, pensión, ARL)', 'pendiente', true, 'interno', 'Andrés Pérez', '2025-06-18T16:40:00', null, '', 1, '2025-07-15', 'c-101/seguridad/v1.pdf'),
  ('d-005', 'c-102', 'Hoja de vida actualizada', 'aprobado', true, 'ambos', 'Camila Restrepo', '2025-06-06T08:00:00', '2025-06-06T15:00:00', '', 1, null, 'c-102/hv/v1.pdf'),
  ('d-006', 'c-102', 'Certificados laborales', 'aprobado', false, 'interno', 'Camila Restrepo', '2025-06-06T08:10:00', '2025-06-07T09:00:00', '', 1, null, 'c-102/laboral/v1.pdf'),
  ('d-007', 'c-105', 'Documento de identidad', 'rechazado', true, 'interno', 'Mateo Hernández', '2025-06-15T11:00:00', '2025-06-16T09:30:00', 'El documento no corresponde al titular registrado.', 1, null, 'c-105/cedula/v1.pdf'),
  ('d-008', 'c-107', 'Hoja de vida actualizada', 'pendiente', true, 'ambos', 'Samuel Torres', '2025-06-19T10:20:00', null, '', 1, null, 'c-107/hv/v1.pdf'),
  ('d-009', 'c-103', 'Seguridad social (EPS, pensión, ARL)', 'vencido', true, 'interno', 'Sebastián Gómez', '2025-05-01T10:00:00', '2025-05-02T10:00:00', 'Documento venció, requiere actualización.', 1, '2025-06-15', 'c-103/seguridad/v1.pdf'),
  ('d-010', 'c-112', 'Certificados académicos', 'pendiente', true, 'ambos', 'Antonia Mejía', '2025-06-17T13:00:00', null, '', 1, null, 'c-112/academico/v1.pdf');

insert into document_versions (document_id, version, uploaded_at, action, by_name) values
  ('d-003', 1, '2025-06-11T09:20:00', 'Carga inicial', 'Andrés Pérez'),
  ('d-003', 2, '2025-06-13T18:00:00', 'Reemplazo tras devolución', 'Andrés Pérez');

-- ------------------------------------------------------------
-- Cursos, asignaciones, progreso, evaluación, evidencia
-- ------------------------------------------------------------
insert into courses (id, title, type, duration, description, pass_score) values
  ('crs-01', 'Inducción Corporativa Conexión 360', 'video', '25 min', 'Bienvenida, valores, estructura organizacional y políticas internas.', 70),
  ('crs-02', 'Seguridad y Salud en el Trabajo (HSE)', 'pdf', '40 min', 'Normativa de seguridad, uso de EPP y protocolos de emergencia.', 80),
  ('crs-03', 'Protección de Datos Personales (Ley 1581)', 'pdf', '20 min', 'Tratamiento de datos, derechos de los titulares y deberes del personal.', 75);

insert into course_assignments (course_id, candidate_id) values
  ('crs-01', 'c-101'), ('crs-01', 'c-102'), ('crs-01', 'c-111'),
  ('crs-02', 'c-101'), ('crs-02', 'c-103'), ('crs-02', 'c-107'),
  ('crs-03', 'c-102'), ('crs-03', 'c-104'), ('crs-03', 'c-109');

insert into course_progress (course_id, candidate_id, progress, score, status) values
  ('crs-01', 'c-101', 100, 85, 'aprobado'),
  ('crs-02', 'c-101', 60, null, 'en curso'),
  ('crs-01', 'c-102', 100, 92, 'aprobado'),
  ('crs-03', 'c-102', 100, 78, 'aprobado'),
  ('crs-02', 'c-103', 30, null, 'en curso'),
  ('crs-01', 'c-111', 45, null, 'en curso');

insert into quiz_questions (id, course_id, type, question, options, answer) values
  ('q1', 'crs-01', 'multiple', '¿Cuál es el objetivo principal de la inducción corporativa?',
    '["Asignar salario", "Conocer valores y políticas de la empresa", "Firmar el contrato", "Solicitar vacaciones"]', '1'),
  ('q2', 'crs-02', 'boolean', 'El uso de elementos de protección personal (EPP) es obligatorio en planta.', null, 'true'),
  ('q3', 'crs-01', 'open', 'Describe brevemente qué harías ante una situación de emergencia en tu área.', null, null);

-- webcam_evidence requiere profile_id (usuario aspirante autenticado);
-- se inserta desde la app cuando exista el perfil real, no en la semilla.

-- ------------------------------------------------------------
-- Grupos de aspirantes
-- ------------------------------------------------------------
insert into candidate_groups (id, name, color, created_at) values
  ('grp-abogados', 'Abogados', '#9B5DE5', '2025-05-10'),
  ('grp-ingenieros', 'Ingenieros', '#19E3D9', '2025-05-12'),
  ('grp-operativo', 'Personal Operativo', '#FFC857', '2025-05-15');

insert into candidate_group_members (candidate_id, group_id) values
  ('c-104', 'grp-abogados'), ('c-110', 'grp-abogados'),
  ('c-102', 'grp-ingenieros'), ('c-109', 'grp-ingenieros'),
  ('c-101', 'grp-operativo'), ('c-103', 'grp-operativo'),
  ('c-105', 'grp-operativo'), ('c-107', 'grp-operativo'), ('c-111', 'grp-operativo');

-- ------------------------------------------------------------
-- Plantillas de formulario
-- ------------------------------------------------------------
insert into form_templates (id, name, track, group_id, fields) values
  ('ft-funcionario-base', 'Documentos base · Funcionarios', 'funcionario', null, '[
    {"key":"hv","label":"Hoja de vida actualizada","type":"document","required":true},
    {"key":"cedula","label":"Documento de identidad","type":"document","required":true},
    {"key":"academico","label":"Certificados académicos","type":"document","required":true},
    {"key":"laboral","label":"Certificados laborales","type":"document","required":false},
    {"key":"profesional","label":"Tarjeta profesional","type":"document","required":false},
    {"key":"seguridad","label":"Seguridad social (EPS, pensión, ARL)","type":"document","required":true},
    {"key":"bancaria","label":"Certificación bancaria","type":"document","required":false},
    {"key":"rut","label":"RUT","type":"document","required":false},
    {"key":"vacunacion","label":"Carnet de vacunación","type":"document","required":false}
  ]'),
  ('ft-contratista-base', 'Documentos base · Contratistas', 'contratista', null, '[
    {"key":"hv","label":"Hoja de vida actualizada","type":"document","required":true},
    {"key":"cedula","label":"Documento de identidad","type":"document","required":true},
    {"key":"academico","label":"Certificados académicos","type":"document","required":true},
    {"key":"laboral","label":"Certificados laborales","type":"document","required":false},
    {"key":"profesional","label":"Tarjeta profesional","type":"document","required":false},
    {"key":"seguridad","label":"Seguridad social (EPS, pensión, ARL)","type":"document","required":true},
    {"key":"bancaria","label":"Certificación bancaria","type":"document","required":true},
    {"key":"rut","label":"RUT","type":"document","required":true},
    {"key":"vacunacion","label":"Carnet de vacunación","type":"document","required":false}
  ]'),
  ('ft-grupo-abogados', 'Requisitos adicionales · Abogados', null, 'grp-abogados', '[
    {"key":"profesional","label":"Tarjeta profesional","type":"document","required":true},
    {"key":"tarjeta_cpc","label":"Certificado del Consejo Superior de la Judicatura","type":"document","required":true}
  ]');

-- ------------------------------------------------------------
-- Personal / nómina
-- ------------------------------------------------------------
insert into personnel (id, doc, name, position, contract, salary, state, start_date, end_date, area) values
  ('p-001', '1.018.456.789', 'María Gómez Restrepo', 'Analista de Operaciones', 'Indefinido', 3200000, 'Activo', '2022-03-01', null, 'Operaciones'),
  ('p-002', '1.020.112.334', 'Felipe Cárdenas Ruiz', 'Coordinador Logístico', 'Indefinido', 4500000, 'Activo', '2021-07-15', null, 'Logística'),
  ('p-003', '52.998.221', 'Sandra Villalba Mora', 'Auxiliar Administrativo', 'Fijo', 1800000, 'Activo', '2023-01-10', '2025-01-10', 'Administración'),
  ('p-004', '79.554.120', 'Ricardo Peña Solís', 'Jefe de Planta', 'Indefinido', 6200000, 'Activo', '2019-05-02', null, 'Producción'),
  ('p-005', '1.032.667.901', 'Laura Beltrán Niño', 'Analista de Calidad', 'Indefinido', 3400000, 'Activo', '2022-09-12', null, 'Calidad'),
  ('p-006', '80.221.554', 'Andrés Mejía Tovar', 'Operario de Producción', 'Obra labor', 1500000, 'Activo', '2024-02-01', '2024-12-31', 'Producción'),
  ('p-007', '1.144.778.220', 'Diana Forero Cruz', 'Asistente de RRHH', 'Fijo', 2100000, 'Suspendido', '2023-06-01', '2025-06-01', 'Talento Humano'),
  ('p-008', '94.556.331', 'Camilo Restrepo Díaz', 'Conductor', 'Indefinido', 1900000, 'Activo', '2020-11-20', null, 'Logística'),
  ('p-009', '1.077.889.443', 'Paola Sánchez Lemus', 'Contadora', 'Indefinido', 5200000, 'Activo', '2021-02-18', null, 'Financiera'),
  ('p-010', '79.112.667', 'Hernán Acosta Vega', 'Supervisor HSE', 'Indefinido', 3900000, 'Activo', '2022-04-25', null, 'HSE'),
  ('p-011', '52.334.889', 'Carolina Pinzón Roa', 'Recepcionista', 'Fijo', 1500000, 'Inactivo', '2022-08-01', '2024-08-01', 'Administración'),
  ('p-012', '1.090.556.778', 'Julián Moreno Ariza', 'Desarrollador', 'Indefinido', 5800000, 'Activo', '2023-03-15', null, 'Tecnología'),
  ('p-013', '80.667.221', 'Natalia Quintero Báez', 'Diseñadora', 'Prestación de servicios', 2800000, 'Activo', '2024-01-08', '2024-12-31', 'Mercadeo'),
  ('p-014', '1.012.998.776', 'Jorge Salazar Méndez', 'Consultor TI', 'Prestación de servicios', 6500000, 'Activo', '2024-03-01', '2025-08-31', 'Tecnología'),
  ('p-015', '53.778.112', 'Ángela Rodríguez Sáenz', 'Analista de Compras', 'Indefinido', 3100000, 'Activo', '2021-10-04', null, 'Compras');

-- ------------------------------------------------------------
-- Clientes y facturación
-- ------------------------------------------------------------
insert into clients (id, name, nit, contact_name, email, phone, address, city, status) values
  ('cli-001', 'Distribuidora Andina S.A.S.', '900.123.456-1', 'Marcela Duarte', 'compras@andina.co', '601 745 2200', 'Cra 15 # 88-64', 'Bogotá', 'Activo'),
  ('cli-002', 'Grupo Logístico del Pacífico', '900.223.117-5', 'Iván Castaño', 'facturacion@glpacifico.co', '602 331 9080', 'Cl 5 # 40-12', 'Cali', 'Activo'),
  ('cli-003', 'Textiles Medellín Ltda.', '890.334.221-8', 'Luz Elena Restrepo', 'contabilidad@textilesmed.co', '604 444 7890', 'Cra 48 # 23-11', 'Medellín', 'Activo'),
  ('cli-004', 'Constructora del Norte S.A.', '901.556.882-2', 'Felipe Ordóñez', 'pagos@constructoranorte.co', '605 210 3344', 'Av. Circunvalar # 10-20', 'Barranquilla', 'Inactivo'),
  ('cli-005', 'Agroindustrias del Valle', '900.778.990-6', 'Diana Salazar', 'diana.salazar@agrovalle.co', '602 556 1200', 'Km 8 vía Palmira', 'Palmira', 'Activo');

insert into invoices (id, number, client_id, issue_date, due_date, status, notes) values
  ('inv-001', 'FE-2026-0001', 'cli-001', '2026-05-04', '2026-06-03', 'pagada', ''),
  ('inv-002', 'FE-2026-0002', 'cli-002', '2026-05-12', '2026-06-11', 'pagada', ''),
  ('inv-003', 'FE-2026-0003', 'cli-003', '2026-06-02', '2026-07-02', 'emitida', ''),
  ('inv-004', 'FE-2026-0004', 'cli-005', '2026-06-10', '2026-07-10', 'emitida', ''),
  ('inv-005', 'FE-2026-0005', 'cli-004', '2026-04-15', '2026-05-15', 'vencida', 'Pendiente por confirmar pago.'),
  ('inv-006', 'FE-2026-0006', 'cli-001', '2026-06-25', '2026-07-25', 'borrador', ''),
  ('inv-007', 'FE-2026-0007', 'cli-002', '2026-07-01', '2026-07-31', 'emitida', '');

insert into invoice_items (invoice_id, description, qty, unit_price) values
  ('inv-001', 'Servicio de consultoría operativa', 1, 8500000),
  ('inv-002', 'Gestión logística mensual', 1, 5200000),
  ('inv-003', 'Soporte técnico', 20, 180000),
  ('inv-004', 'Licencia plataforma (mensual)', 1, 3100000),
  ('inv-005', 'Auditoría documental', 1, 4200000),
  ('inv-006', 'Capacitación equipo comercial', 2, 1500000),
  ('inv-007', 'Transporte de carga', 4, 950000);

-- ------------------------------------------------------------
-- Vitrina de servicios (rol Cliente)
-- ------------------------------------------------------------
insert into services (id, icon, category, name, tagline, description, highlight) values
  ('srv-reclutamiento', 'UserPlus', 'Talento humano', 'Reclutamiento y selección',
   'Encontramos y validamos el talento que tu operación necesita.',
   'Búsqueda, filtro, entrevistas y verificación documental de candidatos para tus vacantes, con seguimiento del proceso hasta la contratación.', true),
  ('srv-outsourcing', 'Briefcase', 'Talento humano', 'Outsourcing de personal',
   'Tu operación crece sin la carga administrativa de contratar.',
   'Contratamos, administramos y respaldamos al personal que opera para ti bajo la modalidad de prestación de servicios u obra labor.', false),
  ('srv-nomina', 'Wallet', 'Nómina y ERP', 'Administración de nómina',
   'Nómina liquidada a tiempo, sin errores, con reportes claros.',
   'Liquidación de nómina, seguridad social y prestaciones sociales de tu personal, con analítica y certificados bajo demanda.', false),
  ('srv-facturacion', 'Receipt', 'Nómina y ERP', 'Facturación electrónica',
   'Factura y controla tu cartera desde un solo lugar.',
   'Emisión de facturación electrónica y control de clientes integrado, listo para tu contabilidad.', false),
  ('srv-juridico', 'Scale', 'Jurídico', 'Asesoría y contratos laborales',
   'Contratos con respaldo jurídico, sin riesgos ocultos.',
   'Elaboración, revisión y aprobación de contratos laborales y civiles con plantillas ajustadas a la normativa colombiana vigente.', true),
  ('srv-cumplimiento', 'ShieldCheck', 'Cumplimiento', 'Gestión documental y cumplimiento',
   'Documentación completa, trazable y siempre a tiempo.',
   'Recolección, aprobación y control de vigencia de documentos legales, certificaciones y cursos obligatorios de tu personal.', false);

-- ------------------------------------------------------------
-- Plantillas legales (contratos)
-- ------------------------------------------------------------
insert into legal_templates (id, key, category, name, placeholders, body) values
('tpl-fijo', 'laboral_fijo', 'Laboral Término Fijo', 'Contrato Laboral a Término Fijo',
 '[{"key":"nombre","label":"Nombre completo"},{"key":"documento","label":"N.° de documento"},{"key":"cargo","label":"Cargo / objeto"},{"key":"ciudad","label":"Ciudad"},{"key":"fecha","label":"Fecha"},{"key":"salario","label":"Salario mensual"},{"key":"duracion","label":"Duración del contrato"}]',
 '<p>Entre los suscritos, <b>CONEXIÓN 360 · TODO ÁGIL CTA</b>, identificada con NIT 900.000.000-0, en adelante “EL EMPLEADOR”, y <b>{{nombre}}</b>, identificado(a) con documento No. <b>{{documento}}</b>, en adelante “EL TRABAJADOR”, se celebra el presente <b>CONTRATO DE TRABAJO A TÉRMINO FIJO</b>, regido por el Código Sustantivo del Trabajo, en especial los artículos 46 y siguientes, bajo las cláusulas que se enuncian a continuación:</p><h2>PRIMERA. Objeto</h2><p>EL TRABAJADOR se obliga a prestar sus servicios personales como <b>{{cargo}}</b>.</p><h2>SEGUNDA. Duración</h2><p>El presente contrato tendrá una duración de <b>{{duracion}}</b>, prorrogable en los términos de ley.</p><h2>TERCERA. Salario</h2><p>EL EMPLEADOR pagará a EL TRABAJADOR un salario mensual de <b>{{salario}}</b>.</p><h2>CUARTA. Lugar y fecha</h2><p>Se firma en {{ciudad}}, a los {{fecha}}.</p>'),
('tpl-indefinido', 'laboral_indefinido', 'Laboral Término Indefinido', 'Contrato Laboral a Término Indefinido',
 '[{"key":"nombre","label":"Nombre completo"},{"key":"documento","label":"N.° de documento"},{"key":"cargo","label":"Cargo / objeto"},{"key":"ciudad","label":"Ciudad"},{"key":"fecha","label":"Fecha"},{"key":"salario","label":"Salario mensual"}]',
 '<p>Entre los suscritos, <b>CONEXIÓN 360 · TODO ÁGIL CTA</b>, identificada con NIT 900.000.000-0, en adelante “EL EMPLEADOR”, y <b>{{nombre}}</b>, identificado(a) con documento No. <b>{{documento}}</b>, en adelante “EL TRABAJADOR”, se celebra el presente <b>CONTRATO DE TRABAJO A TÉRMINO INDEFINIDO</b>, conforme al artículo 47 del Código Sustantivo del Trabajo.</p><h2>PRIMERA. Objeto</h2><p>EL TRABAJADOR se obliga a prestar sus servicios personales como <b>{{cargo}}</b>.</p><h2>SEGUNDA. Vigencia</h2><p>El contrato rige por tiempo indefinido a partir de la fecha de firma.</p><h2>TERCERA. Salario</h2><p>EL EMPLEADOR pagará a EL TRABAJADOR un salario mensual de <b>{{salario}}</b>.</p><h2>CUARTA. Lugar y fecha</h2><p>Se firma en {{ciudad}}, a los {{fecha}}.</p>'),
('tpl-prestacion', 'prestacion_servicios', 'Prestación de Servicios', 'Contrato de Prestación de Servicios',
 '[{"key":"nombre","label":"Nombre completo"},{"key":"documento","label":"N.° de documento"},{"key":"cargo","label":"Cargo / objeto"},{"key":"ciudad","label":"Ciudad"},{"key":"fecha","label":"Fecha"},{"key":"honorarios","label":"Valor de honorarios"},{"key":"duracion","label":"Plazo de ejecución"}]',
 '<p>Entre <b>CONEXIÓN 360 · TODO ÁGIL CTA</b>, NIT 900.000.000-0, en adelante “EL CONTRATANTE”, y <b>{{nombre}}</b>, identificado(a) con documento No. <b>{{documento}}</b>, en adelante “EL CONTRATISTA”, se celebra el presente <b>CONTRATO DE PRESTACIÓN DE SERVICIOS</b>, de naturaleza civil e independiente, sin subordinación laboral, conforme al artículo 1495 del Código Civil.</p><h2>PRIMERA. Objeto</h2><p>EL CONTRATISTA prestará sus servicios profesionales como <b>{{cargo}}</b>, de manera autónoma e independiente.</p><h2>SEGUNDA. Plazo</h2><p>El plazo de ejecución será de <b>{{duracion}}</b>.</p><h2>TERCERA. Honorarios</h2><p>EL CONTRATANTE pagará honorarios por valor de <b>{{honorarios}}</b>.</p><h2>CUARTA. Independencia</h2><p>EL CONTRATISTA no tendrá vínculo laboral con EL CONTRATANTE, conservando plena autonomía técnica y administrativa.</p><h2>QUINTA. Lugar y fecha</h2><p>Se firma en {{ciudad}}, a los {{fecha}}.</p>'),
('tpl-otrosi', 'otrosi', 'OTROSÍ', 'OTROSÍ Modificatorio',
 '[{"key":"nombre","label":"Nombre completo"},{"key":"documento","label":"N.° de documento"},{"key":"cargo","label":"Cargo / objeto"},{"key":"ciudad","label":"Ciudad"},{"key":"fecha","label":"Fecha"},{"key":"contrato_original","label":"Contrato que se modifica"},{"key":"clausula_modificada","label":"Cláusula modificada"}]',
 '<p>Entre <b>CONEXIÓN 360 · TODO ÁGIL CTA</b> y <b>{{nombre}}</b>, identificado(a) con documento No. <b>{{documento}}</b>, se suscribe el presente <b>OTROSÍ</b> al contrato <b>{{contrato_original}}</b>.</p><h2>PRIMERA. Modificación</h2><p>Se modifica la siguiente cláusula: <b>{{clausula_modificada}}</b>.</p><h2>SEGUNDA. Vigencia</h2><p>Las demás condiciones del contrato original permanecen sin modificación.</p><h2>TERCERA. Lugar y fecha</h2><p>Se firma en {{ciudad}}, a los {{fecha}}.</p>'),
('tpl-aprendizaje', 'aprendizaje', 'Contrato de Aprendizaje', 'Contrato de Aprendizaje',
 '[{"key":"nombre","label":"Nombre completo"},{"key":"documento","label":"N.° de documento"},{"key":"cargo","label":"Cargo / objeto"},{"key":"ciudad","label":"Ciudad"},{"key":"fecha","label":"Fecha"},{"key":"apoyo_sostenimiento","label":"Apoyo de sostenimiento mensual"},{"key":"duracion","label":"Duración de la etapa práctica"}]',
 '<p>Entre <b>CONEXIÓN 360 · TODO ÁGIL CTA</b>, en calidad de patrocinador, y <b>{{nombre}}</b>, identificado(a) con documento No. <b>{{documento}}</b>, en calidad de aprendiz, se celebra el presente <b>CONTRATO DE APRENDIZAJE</b>, conforme a la Ley 789 de 2002.</p><h2>PRIMERA. Objeto</h2><p>El aprendiz realizará su etapa práctica como <b>{{cargo}}</b>.</p><h2>SEGUNDA. Duración</h2><p>La etapa práctica tendrá una duración de <b>{{duracion}}</b>.</p><h2>TERCERA. Apoyo de sostenimiento</h2><p>El patrocinador reconocerá un apoyo de sostenimiento mensual de <b>{{apoyo_sostenimiento}}</b>, con afiliación a riesgos laborales según la ley.</p><h2>CUARTA. Lugar y fecha</h2><p>Se firma en {{ciudad}}, a los {{fecha}}.</p>');

-- ------------------------------------------------------------
-- Áreas → aprobador sugerido (se completa con IDs reales tras crear
-- los usuarios de demostración; ver scripts/seed-supabase-users.mjs)
-- ------------------------------------------------------------
-- insert into area_approvers (area, approver_profile_id) values
--   ('Jurídica / Contratos', '<uuid de juridica@conexion360.co>'),
--   ('Financiera / Nómina', '<uuid de finanzas@conexion360.co>'),
--   ('Talento Humano', '<uuid de reclutamiento@conexion360.co>'),
--   ('Dirección General', '<uuid de admin@conexion360.co>');
