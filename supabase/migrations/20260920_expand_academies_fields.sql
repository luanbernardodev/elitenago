-- ==============================================================================
-- MIGRATION: EXPAND ACADEMIES TABLE FIELDS FOR FULL CRUD MANAGEMENT
-- Description: Adiciona colunas para Bairro, Endereço completo, Responsável,
--              Dias de treino, Horários, Link do Google Maps, WhatsApp,
--              Políticas RLS (Insert, Update, Delete) e habilita sincronização Realtime.
-- ==============================================================================

-- 1. Adiciona as novas colunas na tabela public.academies
ALTER TABLE public.academies 
ADD COLUMN IF NOT EXISTS neighborhood TEXT DEFAULT 'Centro',
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS responsible TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS days TEXT DEFAULT 'Segunda, Quarta e Sexta',
ADD COLUMN IF NOT EXISTS hours TEXT DEFAULT '19:00 às 20:30',
ADD COLUMN IF NOT EXISTS maps_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS embed_query TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS whatsapp TEXT DEFAULT '5532984077391';

-- 2. Preenche campos vazios com base nos registros existentes
UPDATE public.academies 
SET 
  responsible = COALESCE(NULLIF(responsible, ''), teacher, 'Responsável'),
  address = COALESCE(NULLIF(address, ''), name);

-- 3. Habilita Políticas RLS para Inserção, Atualização e Deleção
ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Academies" ON public.academies;
DROP POLICY IF EXISTS "Public Insert Academies" ON public.academies;
DROP POLICY IF EXISTS "Public Update Academies" ON public.academies;
DROP POLICY IF EXISTS "Public Delete Academies" ON public.academies;

CREATE POLICY "Public Read Academies" ON public.academies FOR SELECT USING (true);
CREATE POLICY "Public Insert Academies" ON public.academies FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Academies" ON public.academies FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete Academies" ON public.academies FOR DELETE USING (true);

-- 4. Habilita Realtime na tabela academies se ainda não estiver habilitada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'academies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.academies;
  END IF;
END $$;
