-- Columna para contratos subidos directamente como PDF
-- (modo "Subir PDF" en ContractIssuance — sin usar plantilla del sistema)
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS pdf_url text;
