-- ============================================================
-- Aprobación de aspirantes en dos pasos: Reclutamiento preaprueba,
-- Administrador da la aprobación final (reutiliza la cola de
-- aprobaciones genérica ya usada por contratos y documentos).
-- ============================================================

-- Nuevo dominio de aprobación: 'candidate' (el aspirante como tal, no
-- un documento suyo). No se puede usar en la misma transacción en la
-- que se agrega, así que este archivo solo agrega el valor; el uso
-- ('candidate' como dato) ocurre después, desde la aplicación.
alter type approval_domain add value if not exists 'candidate';
