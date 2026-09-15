-- ==============================================================================
-- MIGRATION: ADD TAG AND IS_FEATURED TO NEWS TABLE
-- Description: Garante que a tabela public.news possua todas as colunas
--              necessárias (title, tag, category, author, date, excerpt, 
--              content, image, is_featured, status) conforme o layout.
-- ==============================================================================

-- 1. Adiciona coluna 'tag' para rótulos/badges (ex: 'EVENTOS & CERIMÔNIAS', 'DESTAQUE', 'WORKSHOP')
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS tag TEXT NOT NULL DEFAULT 'EVENTOS & CERIMÔNIAS';

-- 2. Adiciona coluna 'is_featured' para controle de matérias principais/banners
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- 3. Atualizar dados existentes para garantir tags e conteúdo válidos
UPDATE public.news
SET 
  tag = CASE 
    WHEN category ILIKE '%Eventos%' OR category ILIKE '%Cerimônias%' THEN 'EVENTOS & CERIMÔNIAS'
    WHEN category ILIKE '%Social%' OR category ILIKE '%Escolas%' THEN 'PROJETO SOCIAL'
    WHEN category ILIKE '%Cultura%' OR category ILIKE '%Música%' THEN 'CULTURA & MÚSICA'
    WHEN category ILIKE '%Gradua%' OR category ILIKE '%Batizado%' THEN 'BATIZADO & GRADUAÇÃO'
    ELSE 'DESTAQUE'
  END,
  is_featured = CASE 
    WHEN title ILIKE '%Batizado%' THEN true
    ELSE false
  END
WHERE tag IS NULL OR tag = '';
