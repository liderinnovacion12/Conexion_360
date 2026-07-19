-- Chat interno entre usuarios autenticados de la plataforma.
-- channel_id: 'general' = canal de equipo
--             'dm:{uuid_a}:{uuid_b}' (UUIDs ordenados) = mensajes directos
CREATE TABLE IF NOT EXISTS public.internal_chat_messages (
  id          bigint      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  channel_id  text        NOT NULL,
  from_id     uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  from_name   text        NOT NULL,
  from_role   text        NOT NULL,
  content     text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_channel_created
  ON public.internal_chat_messages (channel_id, created_at);

ALTER TABLE public.internal_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_authenticated_read" ON public.internal_chat_messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "chat_authenticated_insert" ON public.internal_chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND from_id = auth.uid()
  );

-- Realtime: los mensajes nuevos llegan en tiempo real a todos los suscriptores
ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_chat_messages;
