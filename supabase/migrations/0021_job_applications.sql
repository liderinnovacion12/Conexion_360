-- Aplicaciones públicas a vacantes (sin cuenta requerida).
-- El reclutador aprueba y genera un código único que el aspirante
-- usa en /registro para crear su cuenta. El código se invalida al usarse.
CREATE TABLE IF NOT EXISTS public.job_applications (
  id                  text        PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  job_id              text        REFERENCES public.job_postings(id) ON DELETE SET NULL,
  job_title           text        NOT NULL,
  name                text        NOT NULL,
  email               text        NOT NULL,
  phone               text,
  message             text,
  cv_url              text,
  status              text        NOT NULL DEFAULT 'pendiente'
                                  CHECK (status IN ('pendiente','aprobado','rechazado')),
  registration_code   text        UNIQUE,
  code_used           boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Formulario público: cualquiera puede enviar una aplicación
CREATE POLICY "job_applications_public_insert" ON public.job_applications
  FOR INSERT WITH CHECK (true);

-- Admin y reclutador gestionan todas las aplicaciones
CREATE POLICY "job_applications_staff_all" ON public.job_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'recruitment')
    )
  );

-- Validación de código en /registro (sin auth requerida)
CREATE POLICY "job_applications_code_validate" ON public.job_applications
  FOR SELECT USING (registration_code IS NOT NULL);

CREATE TRIGGER job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
