-- ==============================================================================
-- ELITE NAGÔ - DATABASE SCHEMA & REALTIME CONFIGURATION
-- ==============================================================================

-- 1. Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- Table 1: NEWS (Notícias & Eventos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    tag TEXT NOT NULL DEFAULT 'EVENTOS & CERIMÔNIAS',
    category TEXT NOT NULL DEFAULT 'Eventos & Oficinas',
    author TEXT NOT NULL DEFAULT 'Mestre Pinheiro',
    date TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT,
    image TEXT NOT NULL DEFAULT 'https://i.imgur.com/A46hzMt.jpeg',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- Table 2: STUDENT APPROVALS (Aprovações de Alunos: Músicas MP3 com Capa Opcional & Mídias)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('music', 'image')),
    title TEXT NOT NULL,
    student_name TEXT NOT NULL,
    academy TEXT NOT NULL DEFAULT 'Juiz de Fora (Matriz)',
    date TEXT NOT NULL,
    audio_url TEXT,                     -- Arquivo MP3/WAV da música
    thumbnail_url TEXT,                 -- Thumbnail/Capa opcional da música
    image_url TEXT,                     -- Foto de registro (se for tipo 'image')
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- Table 3: CONTACT REQUESTS (Solicitações & Formulário de Contato)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- Table 4: MEDIAS & MUSIC (Músicas MP3 com Capa Opcional e Mídias do Site Principal)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('music', 'media')),
    author TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Toques & Cantigas',
    description TEXT,
    url TEXT NOT NULL,                  -- URL do áudio MP3 ou da foto de mídia
    thumbnail_url TEXT,                 -- Thumbnail/Capa da música ou miniatura da mídia (opcional)
    is_featured BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- Table 5: ACADEMIES (Polos e Unidades)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.academies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    teacher TEXT NOT NULL,
    students_count INT NOT NULL DEFAULT 0,
    max_capacity INT NOT NULL DEFAULT 100,
    growth_rate TEXT DEFAULT '+10%',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- Table 6: DONATIONS STATS (Histórico Mensal de Doações em R$)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT NOT NULL,
    value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    visits INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Allow Public Read/Write with Safe Policies
CREATE POLICY "Public Read News" ON public.news FOR SELECT USING (true);
CREATE POLICY "Public Insert News" ON public.news FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update News" ON public.news FOR UPDATE USING (true);
CREATE POLICY "Public Delete News" ON public.news FOR DELETE USING (true);

CREATE POLICY "Public Read Approvals" ON public.student_approvals FOR SELECT USING (true);
CREATE POLICY "Public Insert Approvals" ON public.student_approvals FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Approvals" ON public.student_approvals FOR UPDATE USING (true);
CREATE POLICY "Public Delete Approvals" ON public.student_approvals FOR DELETE USING (true);

CREATE POLICY "Public Read Requests" ON public.contact_requests FOR SELECT USING (true);
CREATE POLICY "Public Insert Requests" ON public.contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Requests" ON public.contact_requests FOR UPDATE USING (true);
CREATE POLICY "Public Delete Requests" ON public.contact_requests FOR DELETE USING (true);

CREATE POLICY "Public Read Medias" ON public.medias FOR SELECT USING (true);
CREATE POLICY "Public Insert Medias" ON public.medias FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Medias" ON public.medias FOR UPDATE USING (true);
CREATE POLICY "Public Delete Medias" ON public.medias FOR DELETE USING (true);

CREATE POLICY "Public Read Academies" ON public.academies FOR SELECT USING (true);
CREATE POLICY "Public Insert Academies" ON public.academies FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Academies" ON public.academies FOR UPDATE USING (true);
CREATE POLICY "Public Delete Academies" ON public.academies FOR DELETE USING (true);

CREATE POLICY "Public Read Donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Public Insert Donations" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Donations" ON public.donations FOR UPDATE USING (true);
CREATE POLICY "Public Delete Donations" ON public.donations FOR DELETE USING (true);

-- ==============================================================================
-- REALTIME PUBLICATION SETUP
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.news, public.student_approvals, public.contact_requests, public.medias;

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

INSERT INTO public.news (title, category, author, date, excerpt, image, status)
VALUES
  ('3º Batizado e Troca de Cordéis - Elite Nagô 2026', 'Eventos & Cerimônias', 'Mestre Pinheiro', '18/09/2026', 'Grande encontro nacional de capoeiristas com mestres convidados de toda a região.', 'https://i.imgur.com/A46hzMt.jpeg', 'published'),
  ('Projeto Capoeira nas Escolas alcança 200 crianças', 'Projetos Sociais', 'Prof. Dom Ruan', '05/09/2026', 'Aulas gratuitas de capoeira promovem disciplina, cultura e cidadania para jovens da rede pública.', 'https://i.imgur.com/phPJ0Qh.jpeg', 'published')
ON CONFLICT DO NOTHING;

INSERT INTO public.student_approvals (type, title, student_name, academy, date, audio_url, thumbnail_url, image_url, description, status)
VALUES
  ('music', 'Toque de São Bento Grande com Cantiga Nova', 'Lucas Ferreira (Graduado)', 'Juiz de Fora (Matriz)', '10/09/2026', 'https://cdn.freesound.org/previews/518/518884_10672049-lq.mp3', 'https://i.imgur.com/A46hzMt.jpeg', NULL, 'Gravação feita após o treino de sexta com cantiga de roda tradicional e toques rápidos de berimbau.', 'pending'),
  ('image', 'Foto da Roda de Rua em Benfica', 'Beatriz Vasconcelos', 'Polo Benfica', '09/09/2026', NULL, NULL, 'https://i.imgur.com/RWa2XaP.jpeg', 'Registro em alta resolução dos alunos na roda aberta no Parque de Benfica.', 'pending'),
  ('music', 'Corrido do Nagô Guerreiro', 'Marcio Silva (Monitor)', 'Polo São Pedro', '08/09/2026', 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3', 'https://i.imgur.com/phPJ0Qh.jpeg', NULL, 'Áudio gravado em estúdio com coro de alunos e atabaque de marcação.', 'pending'),
  ('image', 'Apresentação no Colégio Estadual', 'Camila Duarte', 'Polo Santos Dumont', '07/09/2026', NULL, NULL, 'https://i.imgur.com/TOTCg4x.jpeg', 'Foto coletiva com os novos alunos iniciantes da oficina de capoeira.', 'approved')
ON CONFLICT DO NOTHING;

INSERT INTO public.medias (title, type, author, category, description, url, thumbnail_url, is_featured)
VALUES
  ('São Bento Grande de Angola', 'music', 'Mestre Pinheiro', 'Toques & Cantigas', 'Toque tradicional com cadência marcante e mandinga nagô.', 'https://cdn.freesound.org/previews/518/518884_10672049-lq.mp3', 'https://i.imgur.com/A46hzMt.jpeg', true),
  ('Iúna e Floreios', 'music', 'Contramestre Soldado', 'Toques & Cantigas', 'Toque reservado para formados e mestres demonstrarem agilidade e equilíbrio.', 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3', 'https://i.imgur.com/phPJ0Qh.jpeg', true),
  ('Roda de Rua em Juiz de Fora', 'media', 'Elite Nagô', 'Galeria', 'Registro da grande roda aberta no centro da cidade.', 'https://i.imgur.com/RWa2XaP.jpeg', 'https://i.imgur.com/RWa2XaP.jpeg', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.contact_requests (name, email, phone, subject, message, date, status)
VALUES
  ('Rodrigo Mendonça', 'rodrigo.m@email.com', '(32) 99882-1144', 'Matrícula para meu filho de 8 anos', 'Gostaria de saber os horários das turmas infantis na academia de Benfica e os valores mensais.', '11/09/2026', 'pending'),
  ('Secretaria de Cultura de Santos Dumont', 'cultura@santosdumont.mg.gov.br', '(32) 3251-8800', 'Convite para Apresentação Cultural no Festival', 'Convidamos o Grupo Elite Nagô para realizar a roda de abertura do Festival de Primavera no dia 28/09.', '10/09/2026', 'pending'),
  ('Juliana Costa', 'juliana.capoeira@gmail.com', '(31) 98744-2231', 'Apoio e Parceria de Vestuário', 'Temos uma confecção de abadás personalizados e gostaríamos de propor uma cota de patrocínio.', '08/09/2026', 'answered')
ON CONFLICT DO NOTHING;

INSERT INTO public.academies (name, city, teacher, students_count, max_capacity, growth_rate)
VALUES
  ('Matriz Juiz de Fora (Centro)', 'Juiz de Fora - MG', 'Mestre Pinheiro', 165, 180, '+18%'),
  ('Polo Benfica (Zona Norte)', 'Juiz de Fora - MG', 'Contramestre Soldado', 92, 100, '+12%'),
  ('Polo São Pedro (Cidade Alta)', 'Juiz de Fora - MG', 'Prof. Dom Ruan', 78, 90, '+24%'),
  ('Polo Santos Dumont', 'Santos Dumont - MG', 'Instrutor Curió', 54, 70, '+8%'),
  ('Polo Laranjal', 'Laranjal - MG', 'Professor Dom Ruan', 39, 50, '+15%')
ON CONFLICT DO NOTHING;

INSERT INTO public.donations (month, value, visits)
VALUES
  ('Jan', 4200.00, 9800),
  ('Fev', 5800.00, 11200),
  ('Mar', 6400.00, 12500),
  ('Abr', 7900.00, 13900),
  ('Mai', 7100.00, 14200),
  ('Jun', 9600.00, 15800),
  ('Jul', 11400.00, 16900),
  ('Ago', 13200.00, 17800),
  ('Set', 14850.00, 18450)
ON CONFLICT DO NOTHING;
