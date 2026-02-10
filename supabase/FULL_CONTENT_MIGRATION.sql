-- =============================================================================
-- FULL CONTENT MIGRATION - Copy this ENTIRE file into Supabase SQL Editor, Run
-- =============================================================================
-- No markdown. No backticks. Pure SQL only.
-- =============================================================================

-- Add profiles.role if profiles exists but has no role column (required for RLS)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
      ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'student';
    END IF;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  chapter_number INTEGER UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  thumbnail_url TEXT,
  order_index INTEGER NOT NULL,
  level_min INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chapter_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  step_type TEXT NOT NULL CHECK (step_type IN ('read', 'self_check', 'framework', 'techniques', 'resolution', 'follow_through')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  unlock_rule JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(chapter_id, slug)
);

CREATE TABLE IF NOT EXISTS step_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID REFERENCES chapter_steps(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT,
  order_index INTEGER NOT NULL,
  estimated_minutes INTEGER,
  xp_award INTEGER DEFAULT 0,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(step_id, slug)
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'step_completions') THEN
    ALTER TABLE step_completions ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES step_pages(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_parts_order ON parts(order_index);
CREATE INDEX IF NOT EXISTS idx_chapters_part_id ON chapters(part_id);
CREATE INDEX IF NOT EXISTS idx_chapters_chapter_number ON chapters(chapter_number);
CREATE INDEX IF NOT EXISTS idx_chapters_slug ON chapters(slug);
CREATE INDEX IF NOT EXISTS idx_chapters_published ON chapters(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(order_index);
CREATE INDEX IF NOT EXISTS idx_chapter_steps_chapter_id ON chapter_steps(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_steps_order ON chapter_steps(chapter_id, order_index);
CREATE INDEX IF NOT EXISTS idx_chapter_steps_type ON chapter_steps(step_type);
CREATE INDEX IF NOT EXISTS idx_step_pages_step_id ON step_pages(step_id);
CREATE INDEX IF NOT EXISTS idx_step_pages_order ON step_pages(step_id, order_index);
CREATE INDEX IF NOT EXISTS idx_step_pages_slug ON step_pages(step_id, slug);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'step_completions') THEN
    CREATE INDEX IF NOT EXISTS idx_step_completions_page_id ON step_completions(page_id) WHERE page_id IS NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_step_pages_content_gin ON step_pages USING gin(content);

DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_step_pages_updated_at ON step_pages;
CREATE TRIGGER update_step_pages_updated_at BEFORE UPDATE ON step_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Parts are viewable by everyone" ON parts;
CREATE POLICY "Parts are viewable by everyone" ON parts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Parts are insertable by admins" ON parts;
CREATE POLICY "Parts are insertable by admins" ON parts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
DROP POLICY IF EXISTS "Parts are updatable by admins" ON parts;
CREATE POLICY "Parts are updatable by admins" ON parts FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
DROP POLICY IF EXISTS "Parts are deletable by admins" ON parts;
CREATE POLICY "Parts are deletable by admins" ON parts FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Published chapters are viewable by everyone" ON chapters;
CREATE POLICY "Published chapters are viewable by everyone" ON chapters FOR SELECT USING (is_published = true OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
DROP POLICY IF EXISTS "Chapters are insertable by admins" ON chapters;
CREATE POLICY "Chapters are insertable by admins" ON chapters FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
DROP POLICY IF EXISTS "Chapters are updatable by admins" ON chapters;
CREATE POLICY "Chapters are updatable by admins" ON chapters FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
DROP POLICY IF EXISTS "Chapters are deletable by admins" ON chapters;
CREATE POLICY "Chapters are deletable by admins" ON chapters FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Chapter steps are viewable if chapter is published" ON chapter_steps;
CREATE POLICY "Chapter steps are viewable if chapter is published" ON chapter_steps FOR SELECT USING (EXISTS (SELECT 1 FROM chapters WHERE chapters.id = chapter_steps.chapter_id AND (chapters.is_published = true OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))));
DROP POLICY IF EXISTS "Chapter steps are insertable by admins" ON chapter_steps;
CREATE POLICY "Chapter steps are insertable by admins" ON chapter_steps FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
DROP POLICY IF EXISTS "Chapter steps are updatable by admins" ON chapter_steps;
CREATE POLICY "Chapter steps are updatable by admins" ON chapter_steps FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
DROP POLICY IF EXISTS "Chapter steps are deletable by admins" ON chapter_steps;
CREATE POLICY "Chapter steps are deletable by admins" ON chapter_steps FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Step pages are viewable if chapter is published" ON step_pages;
CREATE POLICY "Step pages are viewable if chapter is published" ON step_pages FOR SELECT USING (EXISTS (SELECT 1 FROM chapter_steps cs JOIN chapters c ON c.id = cs.chapter_id WHERE cs.id = step_pages.step_id AND (c.is_published = true OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))));
DROP POLICY IF EXISTS "Step pages are insertable by admins" ON step_pages;
CREATE POLICY "Step pages are insertable by admins" ON step_pages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
DROP POLICY IF EXISTS "Step pages are updatable by admins" ON step_pages;
CREATE POLICY "Step pages are updatable by admins" ON step_pages FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
DROP POLICY IF EXISTS "Step pages are deletable by admins" ON step_pages;
CREATE POLICY "Step pages are deletable by admins" ON step_pages FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE OR REPLACE FUNCTION get_chapter_by_slug(chapter_slug TEXT)
RETURNS TABLE (id UUID, part_id UUID, chapter_number INTEGER, slug TEXT, title TEXT, subtitle TEXT, thumbnail_url TEXT, order_index INTEGER, level_min INTEGER, is_published BOOLEAN) AS $$
BEGIN
  RETURN QUERY SELECT c.id, c.part_id, c.chapter_number, c.slug, c.title, c.subtitle, c.thumbnail_url, c.order_index, c.level_min, c.is_published FROM chapters c WHERE c.slug = chapter_slug AND (c.is_published = true OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_chapter_steps(chapter_uuid UUID)
RETURNS TABLE (id UUID, chapter_id UUID, step_type TEXT, title TEXT, slug TEXT, order_index INTEGER, is_required BOOLEAN) AS $$
BEGIN
  RETURN QUERY SELECT cs.id, cs.chapter_id, cs.step_type, cs.title, cs.slug, cs.order_index, cs.is_required FROM chapter_steps cs WHERE cs.chapter_id = chapter_uuid ORDER BY cs.order_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_step_pages(step_uuid UUID)
RETURNS TABLE (id UUID, step_id UUID, slug TEXT, title TEXT, order_index INTEGER, estimated_minutes INTEGER, xp_award INTEGER, content JSONB) AS $$
BEGIN
  RETURN QUERY SELECT sp.id, sp.step_id, sp.slug, sp.title, sp.order_index, sp.estimated_minutes, sp.xp_award, sp.content FROM step_pages sp WHERE sp.step_id = step_uuid ORDER BY sp.order_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE parts IS 'Organizational groupings of chapters';
COMMENT ON TABLE chapters IS 'Individual chapters with metadata and publishing status';
COMMENT ON TABLE chapter_steps IS 'Steps within a chapter';
COMMENT ON TABLE step_pages IS 'Individual pages within a step, content stored as JSONB blocks';
COMMENT ON COLUMN step_pages.content IS 'Array of block objects defining page content';

INSERT INTO parts (slug, title, order_index) VALUES ('foundation', 'PART I: FOUNDATION', 1), ('connection', 'PART II: CONNECTION', 2), ('mastery', 'PART III: MASTERY', 3) ON CONFLICT (slug) DO NOTHING;

INSERT INTO chapters (part_id, chapter_number, slug, title, subtitle, thumbnail_url, order_index, is_published)
SELECT p.id, 1, 'stage-star-silent-struggles', 'The Stage Star with Silent Struggles', 'Reclaiming your attention in the age of infinite scroll', '/chapter/chapter 1/Nightmare.png', 1, true FROM parts p WHERE p.slug = 'foundation' ON CONFLICT (chapter_number) DO NOTHING;

INSERT INTO chapter_steps (chapter_id, step_type, title, slug, order_index, is_required)
SELECT c.id, steps.step_type, steps.title, steps.slug, steps.order_index, steps.is_required FROM chapters c, (VALUES ('read', 'Reading', 'reading', 1, true), ('self_check', 'Self-Check', 'assessment', 2, true), ('framework', 'Framework: SPARK', 'framework', 3, true), ('techniques', 'Techniques', 'techniques', 4, true), ('resolution', 'Your Identity', 'proof', 5, true), ('follow_through', 'Follow-Through', 'follow-through', 6, true)) AS steps(step_type, title, slug, order_index, is_required) WHERE c.chapter_number = 1 ON CONFLICT (chapter_id, slug) DO NOTHING;

INSERT INTO chapters (part_id, chapter_number, slug, title, subtitle, thumbnail_url, order_index, is_published)
SELECT p.id, 2, 'genius-who-couldnt-speak', 'The Genius Who Couldn''t Speak', 'Overcoming stage fright and reclaiming your voice', '/chapter/chapter 2/Nightmare.png', 2, true FROM parts p WHERE p.slug = 'foundation' ON CONFLICT (chapter_number) DO NOTHING;

INSERT INTO chapter_steps (chapter_id, step_type, title, slug, order_index, is_required)
SELECT c.id, steps.step_type, steps.title, steps.slug, steps.order_index, steps.is_required FROM chapters c, (VALUES ('read', 'Reading', 'reading', 1, true), ('self_check', 'Self-Check', 'assessment', 2, true), ('framework', 'Framework: VOICE', 'framework', 3, true), ('techniques', 'Techniques', 'techniques', 4, true), ('resolution', 'Your Resolution', 'proof', 5, true), ('follow_through', 'Follow-Through', 'follow-through', 6, true)) AS steps(step_type, title, slug, order_index, is_required) WHERE c.chapter_number = 2 ON CONFLICT (chapter_id, slug) DO NOTHING;
