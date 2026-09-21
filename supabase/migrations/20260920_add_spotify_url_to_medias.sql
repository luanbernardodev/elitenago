-- ==============================================================================
-- MIGRATION: ADD SPOTIFY_URL TO MEDIAS AND STUDENT_APPROVALS TABLES
-- Description: Adiciona a coluna spotify_url para integração com o Spotify
--              na gestão de musicalidade e mídias do site.
-- ==============================================================================

ALTER TABLE public.medias 
ADD COLUMN IF NOT EXISTS spotify_url TEXT;

ALTER TABLE public.student_approvals 
ADD COLUMN IF NOT EXISTS spotify_url TEXT;
