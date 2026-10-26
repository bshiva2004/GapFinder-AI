-- ==============================================================================
-- GapFinder AI — Sphoorthy Engineering College Hackathon 2026
-- Supabase PostgreSQL Schema with pgvector, RLS Policies, and Vector Search
-- ==============================================================================

-- 1. Enable the pgvector extension for semantic retrieval
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  institution TEXT DEFAULT 'Sphoorthy Engineering College',
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'judge', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('syllabus', 'notes', 'textbook', 'pyq', 'other')),
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
  error_message TEXT,
  page_count INT DEFAULT 1,
  chunk_count INT DEFAULT 0,
  content_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own documents"
  ON public.documents FOR ALL
  USING (auth.uid() = user_id);

-- 4. Document Chunks table (pgvector embedding)
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_title TEXT NOT NULL,
  page_number INT,
  section TEXT,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768), -- Supports standard 768-dim embeddings (e.g. Gemini text-embedding-004) or adjust to 1536 for OpenAI
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own chunks"
  ON public.document_chunks FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_user_id ON public.document_chunks(user_id);

-- 5. Topics table (Topic Map)
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  unit TEXT,
  subtopics JSONB DEFAULT '[]'::jsonb,
  source_passage_excerpt TEXT,
  source_doc_title TEXT,
  source_page INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own topics"
  ON public.topics FOR ALL
  USING (auth.uid() = user_id);

-- 6. Quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT,
  document_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own quizzes"
  ON public.quizzes FOR ALL
  USING (auth.uid() = user_id);

-- 7. Quiz Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of 4 options
  correct_option_index INT NOT NULL,
  explanation TEXT NOT NULL,
  source_doc_title TEXT NOT NULL,
  source_page_or_section TEXT NOT NULL,
  source_passage_excerpt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own questions"
  ON public.questions FOR ALL
  USING (auth.uid() = user_id);

-- 8. Quiz Attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_title TEXT NOT NULL,
  total_questions INT NOT NULL,
  correct_answers_count INT NOT NULL,
  score_percentage NUMERIC(5,2) NOT NULL,
  submitted_answers JSONB NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own quiz attempts"
  ON public.quiz_attempts FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.quiz_attempts(user_id, completed_at DESC);

-- 9. Revision Plans table
CREATE TABLE IF NOT EXISTS public.revision_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_available_minutes INT NOT NULL DEFAULT 60,
  exam_date DATE,
  total_planned_minutes INT NOT NULL DEFAULT 0,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.revision_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own revision plans"
  ON public.revision_plans FOR ALL
  USING (auth.uid() = user_id);

-- 10. Vector match function for semantic retrieval
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  document_title text,
  page_number int,
  section text,
  content text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.document_title,
    dc.page_number,
    dc.section,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks dc
  WHERE dc.user_id = p_user_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
