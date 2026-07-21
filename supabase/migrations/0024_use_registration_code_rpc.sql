-- RPC para marcar el código de registro como usado.
-- SECURITY DEFINER permite que un candidato recién registrado
-- invalide su propio código sin necesidad de permisos UPDATE en la tabla.
CREATE OR REPLACE FUNCTION public.use_registration_code(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.job_applications
  SET code_used = true
  WHERE registration_code = p_code
    AND code_used = false;
END;
$$;

-- Solo usuarios autenticados pueden invocarla
REVOKE ALL ON FUNCTION public.use_registration_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.use_registration_code(text) TO authenticated;
