-- Migration: Create public.sponsors table for Partners / Apoiadores
CREATE TABLE IF NOT EXISTS public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  alt TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS & Policies
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select sponsors" ON public.sponsors;
CREATE POLICY "Public select sponsors" ON public.sponsors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert sponsors" ON public.sponsors;
CREATE POLICY "Public insert sponsors" ON public.sponsors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update sponsors" ON public.sponsors;
CREATE POLICY "Public update sponsors" ON public.sponsors FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete sponsors" ON public.sponsors;
CREATE POLICY "Public delete sponsors" ON public.sponsors FOR DELETE USING (true);
