-- Vacantes publicadas por reclutador/admin en el sitio público
CREATE TABLE IF NOT EXISTS public.job_postings (
  id            text        PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  title         text        NOT NULL,
  area          text,
  location      text,
  contract_type text,
  modality      text,
  description   text,
  requirements  text,
  salary        text,
  vacancies     integer     NOT NULL DEFAULT 1,
  status        text        NOT NULL DEFAULT 'activa' CHECK (status IN ('activa','pausada','cerrada')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_postings_public_read" ON public.job_postings
  FOR SELECT USING (true);

CREATE POLICY "job_postings_staff_write" ON public.job_postings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'recruitment')
    )
  );

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
