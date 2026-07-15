-- ============================================================
-- Bug real encontrado al probar el flujo de aprobación de aspirantes:
-- las columnas "de rol" de la cola de aprobaciones (approvals /
-- approval_chain_steps) quedaron creadas en 0001_schema.sql como el
-- enum estricto `user_role` (admin, finance, recruitment, legal,
-- candidate, employee, client, auditor). Pero el código de la app
-- (ContractIssuance.jsx, DocumentEditor.jsx, CandidatesAdmin.jsx,
-- CandidateGroups.jsx) siempre ha guardado ahí una ETIQUETA
-- descriptiva del área/cargo de quien firma — "Área Jurídica", "Líder
-- Jurídica", "Reclutamiento", "Administrador", "Talento Humano" — no
-- el rol de sistema. Como esos valores no existen en el enum, CUALQUIER
-- envío a aprobación (de contratos, documentos o aspirantes) fallaba
-- con: invalid input value for enum user_role: "...".
--
-- Se detectó al probar por primera vez la preaprobación de un
-- aspirante (error visible en el modal: "Reclutamiento"). Como las
-- tablas estaban vacías (nunca hubo un envío exitoso), se pudo
-- corregir el tipo de columna sin pérdida de datos.
-- ============================================================
alter table approvals alter column requested_by_role type text using requested_by_role::text;

-- Columna añadida en un intento anterior (no versionado en este
-- historial de migraciones) como workaround parcial; ya no hace falta
-- una columna aparte ahora que requested_by_role es texto libre.
alter table approvals drop column if exists requested_by_role_text;

alter table approval_chain_steps alter column assigned_to_role type text using assigned_to_role::text;

NOTIFY pgrst, 'reload schema';
