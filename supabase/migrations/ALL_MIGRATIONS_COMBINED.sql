-- ============================================================================
-- ZONE → CHAPTERS → PHASES MIGRATION
-- Complete SQL script for Supabase SQL Editor
-- Run this entire script in the Supabase SQL Editor
-- ============================================================================
-- Migration Date: January 2026
-- This combines all 8 migration files (100-107) into a single executable script
-- ============================================================================

-- ============================================================================
-- PREREQUISITES: Ensure base tables exist (from initial schema)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'parent', 'mentor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create parent_child_links table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS parent_child_links (
  id BIGSERIAL PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- Create chapters table (if it doesn't exist - will be modified later)
CREATE TABLE IF NOT EXISTS chapters (
  id BIGSERIAL PRIMARY KEY,
  day_number INT,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  task_description TEXT NOT NULL,
  before_questions JSONB NOT NULL DEFAULT '[]',
  after_questions JSONB NOT NULL DEFAULT '[]',
  task_deadline_hours INTEGER DEFAULT 24,
  chunks JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_records table (if it doesn't exist - will be archived later)
CREATE TABLE IF NOT EXISTS daily_records (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  before_answers JSONB DEFAULT '[]',
  after_answers JSONB DEFAULT '[]',
  reflection_text TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create uploads table (if it doesn't exist - will be archived later)
CREATE TABLE IF NOT EXISTS uploads (
  id BIGSERIAL PRIMARY KEY,
  daily_record_id BIGINT NOT NULL REFERENCES daily_records(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('audio', 'image', 'text')),
  url TEXT,
  text_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on prerequisite tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at on prerequisite tables
DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_records_updated_at ON daily_records;
CREATE TRIGGER update_daily_records_updated_at BEFORE UPDATE ON daily_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Basic RLS policies for prerequisite tables (using DROP/CREATE pattern)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Parents can view their own links" ON parent_child_links;
CREATE POLICY "Parents can view their own links"
  ON parent_child_links FOR SELECT
  USING (parent_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can view chapters" ON chapters;
CREATE POLICY "Authenticated users can view chapters"
  ON chapters FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Students can view their own records" ON daily_records;
CREATE POLICY "Students can view their own records"
  ON daily_records FOR SELECT
  USING (student_id = auth.uid());

-- ============================================================================
-- MIGRATION 100: Create Zones Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS zones (
  id BIGSERIAL PRIMARY KEY,
  zone_number INT NOT NULL UNIQUE CHECK (zone_number >= 1 AND zone_number <= 5),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji or icon identifier
  color TEXT, -- hex color for UI theming
  unlock_condition TEXT DEFAULT 'complete_previous_zone',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zones_zone_number ON zones(zone_number);

ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view zones"
  ON zones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert zones"
  ON zones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update zones"
  ON zones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete zones"
  ON zones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE zones IS 'Zones organize chapters into thematic groups. 5 zones total.';

-- ============================================================================
-- MIGRATION 101: Modify Chapters Table
-- ============================================================================

ALTER TABLE chapters DROP CONSTRAINT IF EXISTS chapters_day_number_check;
ALTER TABLE chapters DROP CONSTRAINT IF EXISTS chapters_day_number_key;
ALTER TABLE chapters ALTER COLUMN day_number DROP NOT NULL;

ALTER TABLE chapters
  ADD COLUMN IF NOT EXISTS zone_id BIGINT REFERENCES zones(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS chapter_number INT,
  ADD COLUMN IF NOT EXISTS legacy_day_number INT;

ALTER TABLE chapters
  ADD CONSTRAINT chapters_zone_chapter_unique UNIQUE (zone_id, chapter_number) DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS idx_chapters_zone_id ON chapters(zone_id);
CREATE INDEX IF NOT EXISTS idx_chapters_legacy_day_number ON chapters(legacy_day_number);

-- ============================================================================
-- MIGRATION 102: Create Phases Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS phases (
  id BIGSERIAL PRIMARY KEY,
  chapter_id BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  phase_number INT NOT NULL CHECK (phase_number >= 1 AND phase_number <= 5),
  phase_type TEXT NOT NULL CHECK (phase_type IN ('power-scan', 'secret-intel', 'visual-guide', 'field-mission', 'level-up')),
  title TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (chapter_id, phase_number)
);

CREATE INDEX IF NOT EXISTS idx_phases_chapter_id ON phases(chapter_id);
CREATE INDEX IF NOT EXISTS idx_phases_phase_type ON phases(phase_type);
CREATE INDEX IF NOT EXISTS idx_phases_chapter_phase ON phases(chapter_id, phase_number);

ALTER TABLE phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view phases"
  ON phases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert phases"
  ON phases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update phases"
  ON phases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete phases"
  ON phases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE TRIGGER update_phases_updated_at BEFORE UPDATE ON phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 103: Create Student Progress Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS student_progress (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_id BIGINT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  chapter_id BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  phase_id BIGINT NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  responses JSONB DEFAULT '{}',
  task_acknowledged_at TIMESTAMPTZ,
  task_due_at TIMESTAMPTZ,
  task_reminder_sent_at TIMESTAMPTZ,
  reflection_text TEXT,
  reviewed_at TIMESTAMPTZ,
  review_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, phase_id)
);

CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_zone_id ON student_progress(zone_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_chapter_id ON student_progress(chapter_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_phase_id ON student_progress(phase_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_completed ON student_progress(student_id, completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_student_progress_task_due ON student_progress(task_due_at) WHERE task_acknowledged_at IS NOT NULL AND completed_at IS NULL;

ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own progress"
  ON student_progress FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own progress"
  ON student_progress FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own progress"
  ON student_progress FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "Parents can view their children's progress"
  ON student_progress FOR SELECT
  USING (
    student_id IN (
      SELECT child_id FROM parent_child_links WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all progress"
  ON student_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE TRIGGER update_student_progress_updated_at BEFORE UPDATE ON student_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 104: Create Phase Uploads Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS phase_uploads (
  id BIGSERIAL PRIMARY KEY,
  progress_id BIGINT NOT NULL REFERENCES student_progress(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('audio', 'image', 'text')),
  url TEXT,
  text_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phase_uploads_progress_id ON phase_uploads(progress_id);

ALTER TABLE phase_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own uploads"
  ON phase_uploads FOR SELECT
  USING (
    progress_id IN (
      SELECT id FROM student_progress WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own uploads"
  ON phase_uploads FOR INSERT
  WITH CHECK (
    progress_id IN (
      SELECT id FROM student_progress WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's uploads"
  ON phase_uploads FOR SELECT
  USING (
    progress_id IN (
      SELECT sp.id FROM student_progress sp
      JOIN parent_child_links pcl ON sp.student_id = pcl.child_id
      WHERE pcl.parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all uploads"
  ON phase_uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- MIGRATION 105: Archive Old Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS archived_daily_records AS 
SELECT * FROM daily_records;

ALTER TABLE archived_daily_records 
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS archived_chapters AS 
SELECT 
  id,
  day_number,
  title,
  subtitle,
  content,
  task_description,
  before_questions,
  after_questions,
  task_deadline_hours,
  created_at,
  updated_at,
  NOW() as archived_at
FROM chapters;

CREATE TABLE IF NOT EXISTS archived_uploads AS 
SELECT * FROM uploads;

ALTER TABLE archived_uploads 
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_archived_daily_records_student ON archived_daily_records(student_id);
CREATE INDEX IF NOT EXISTS idx_archived_daily_records_day ON archived_daily_records(day_number);
CREATE INDEX IF NOT EXISTS idx_archived_chapters_day ON archived_chapters(day_number);

-- ============================================================================
-- MIGRATION 106: Seed New Structure
-- ============================================================================

-- STEP 1: Insert 5 Zones
INSERT INTO zones (zone_number, name, description, icon, color, unlock_condition) VALUES
  (1, 'The Focus Chamber', 'Master the fundamentals of attention, distraction management, and building your foundation', '🔴', '#dc2626', 'always_unlocked'),
  (2, 'The Connection Hub', 'Develop deep listening skills, empathy, and authentic relationship building', '🟠', '#ea580c', 'complete_previous_zone'),
  (3, 'The Alliance Forge', 'Learn collaboration, teamwork, and how to bring people together', '🟡', '#ca8a04', 'complete_previous_zone'),
  (4, 'The Influence Vault', 'Master persuasion, leadership, and inspiring others to action', '🟢', '#16a34a', 'complete_previous_zone'),
  (5, 'The Mastery Peak', 'Synthesize all skills and become a master communicator', '🔵', '#2563eb', 'complete_previous_zone')
ON CONFLICT (zone_number) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  unlock_condition = EXCLUDED.unlock_condition;

-- STEP 2: Update existing chapters with zone assignments
UPDATE chapters 
SET legacy_day_number = day_number 
WHERE legacy_day_number IS NULL;

UPDATE chapters SET 
  zone_id = (SELECT id FROM zones WHERE zone_number = 1),
  chapter_number = day_number
WHERE day_number BETWEEN 1 AND 7;

UPDATE chapters SET 
  zone_id = (SELECT id FROM zones WHERE zone_number = 2),
  chapter_number = day_number - 7
WHERE day_number BETWEEN 8 AND 14;

UPDATE chapters SET 
  zone_id = (SELECT id FROM zones WHERE zone_number = 3),
  chapter_number = day_number - 14
WHERE day_number BETWEEN 15 AND 21;

UPDATE chapters SET 
  zone_id = (SELECT id FROM zones WHERE zone_number = 4),
  chapter_number = day_number - 21
WHERE day_number BETWEEN 22 AND 28;

UPDATE chapters SET 
  zone_id = (SELECT id FROM zones WHERE zone_number = 5),
  chapter_number = day_number - 28
WHERE day_number BETWEEN 29 AND 30;

-- STEP 3: Create 150 phases (30 chapters × 5 phases each)
INSERT INTO phases (chapter_id, phase_number, phase_type, title, content, metadata)
SELECT 
  c.id as chapter_id,
  1 as phase_number,
  'power-scan' as phase_type,
  'Power Scan' as title,
  'Complete the self-assessment questions before diving into the content.' as content,
  jsonb_build_object(
    'questions', c.before_questions,
    'instructions', 'Rate yourself honestly on each question. This helps track your growth.'
  ) as metadata
FROM chapters c
WHERE c.zone_id IS NOT NULL
ON CONFLICT (chapter_id, phase_number) DO NOTHING;

INSERT INTO phases (chapter_id, phase_number, phase_type, title, content, metadata)
SELECT 
  c.id as chapter_id,
  2 as phase_number,
  'secret-intel' as phase_type,
  'Secret Intel' as title,
  c.content as content,
  jsonb_build_object(
    'hasChunks', CASE WHEN c.chunks IS NOT NULL THEN true ELSE false END,
    'chunks', COALESCE(c.chunks, '[]'::jsonb)
  ) as metadata
FROM chapters c
WHERE c.zone_id IS NOT NULL
ON CONFLICT (chapter_id, phase_number) DO NOTHING;

INSERT INTO phases (chapter_id, phase_number, phase_type, title, content, metadata)
SELECT 
  c.id as chapter_id,
  3 as phase_number,
  'visual-guide' as phase_type,
  'Visual Guide' as title,
  'Explore visual resources and examples to deepen your understanding.' as content,
  jsonb_build_object(
    'images', '[]'::jsonb,
    'videos', '[]'::jsonb,
    'note', 'Visual content to be added for each chapter'
  ) as metadata
FROM chapters c
WHERE c.zone_id IS NOT NULL
ON CONFLICT (chapter_id, phase_number) DO NOTHING;

INSERT INTO phases (chapter_id, phase_number, phase_type, title, content, metadata)
SELECT 
  c.id as chapter_id,
  4 as phase_number,
  'field-mission' as phase_type,
  'Field Mission' as title,
  c.task_description as content,
  jsonb_build_object(
    'task_deadline_hours', COALESCE(c.task_deadline_hours, 24),
    'upload_types', '["audio", "image", "text"]'::jsonb,
    'instructions', 'Complete the mission and upload your proof.'
  ) as metadata
FROM chapters c
WHERE c.zone_id IS NOT NULL
ON CONFLICT (chapter_id, phase_number) DO NOTHING;

INSERT INTO phases (chapter_id, phase_number, phase_type, title, content, metadata)
SELECT 
  c.id as chapter_id,
  5 as phase_number,
  'level-up' as phase_type,
  'Level Up' as title,
  'Reflect on your experience and complete the post-assessment.' as content,
  jsonb_build_object(
    'questions', c.after_questions,
    'reflection_required', true,
    'min_reflection_length', 50,
    'instructions', 'Answer the questions and write a reflection on what you learned.'
  ) as metadata
FROM chapters c
WHERE c.zone_id IS NOT NULL
ON CONFLICT (chapter_id, phase_number) DO NOTHING;

-- ============================================================================
-- MIGRATION 107: Additional RLS Policies
-- ============================================================================

-- Drop policies if they exist, then create them
DROP POLICY IF EXISTS "Mentors can view assigned students' progress" ON student_progress;
CREATE POLICY "Mentors can view assigned students' progress"
  ON student_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mentor'
    )
  );

DROP POLICY IF EXISTS "Mentors can view student uploads" ON phase_uploads;
CREATE POLICY "Mentors can view student uploads"
  ON phase_uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mentor'
    )
  );

DROP POLICY IF EXISTS "Parents can update review feedback for their children" ON student_progress;
CREATE POLICY "Parents can update review feedback for their children"
  ON student_progress FOR UPDATE
  USING (
    student_id IN (
      SELECT child_id FROM parent_child_links WHERE parent_id = auth.uid()
    )
  )
  WITH CHECK (
    student_id IN (
      SELECT child_id FROM parent_child_links WHERE parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Mentors can update review feedback" ON student_progress;
CREATE POLICY "Mentors can update review feedback"
  ON student_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mentor'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mentor'
    )
  );

DROP POLICY IF EXISTS "Admins can insert progress" ON student_progress;
CREATE POLICY "Admins can insert progress"
  ON student_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update progress" ON student_progress;
CREATE POLICY "Admins can update progress"
  ON student_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete progress" ON student_progress;
CREATE POLICY "Admins can delete progress"
  ON student_progress FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert uploads" ON phase_uploads;
CREATE POLICY "Admins can insert uploads"
  ON phase_uploads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete uploads" ON phase_uploads;
CREATE POLICY "Admins can delete uploads"
  ON phase_uploads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_student_progress_student_completed 
  ON student_progress(student_id, completed_at) 
  WHERE completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_student_progress_student_current 
  ON student_progress(student_id, started_at) 
  WHERE completed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_student_progress_zone_student 
  ON student_progress(zone_id, student_id);

CREATE INDEX IF NOT EXISTS idx_student_progress_chapter_student 
  ON student_progress(chapter_id, student_id);

CREATE INDEX IF NOT EXISTS idx_student_progress_composite 
  ON student_progress(student_id, zone_id, chapter_id, phase_id, completed_at);

CREATE OR REPLACE VIEW student_progress_summary AS
SELECT 
  sp.student_id,
  p.full_name as student_name,
  COUNT(DISTINCT sp.zone_id) as zones_started,
  COUNT(DISTINCT sp.chapter_id) as chapters_started,
  COUNT(DISTINCT sp.phase_id) as phases_started,
  COUNT(sp.id) FILTER (WHERE sp.completed_at IS NOT NULL) as phases_completed,
  COUNT(sp.id) FILTER (WHERE sp.completed_at IS NULL) as phases_in_progress,
  ROUND(
    (COUNT(sp.id) FILTER (WHERE sp.completed_at IS NOT NULL)::numeric / 150) * 100, 
    2
  ) as completion_percentage,
  MAX(sp.updated_at) as last_activity
FROM student_progress sp
JOIN profiles p ON sp.student_id = p.id
GROUP BY sp.student_id, p.full_name;

GRANT SELECT ON student_progress_summary TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration to verify success)
-- ============================================================================

-- Verify zone count (should be 5)
-- SELECT COUNT(*) as zone_count FROM zones;

-- Verify chapter distribution (should show: Zones 1-4 with 7 chapters, Zone 5 with 2 chapters)
-- SELECT z.zone_number, z.name, COUNT(c.id) as chapter_count
-- FROM zones z
-- LEFT JOIN chapters c ON z.id = c.zone_id
-- GROUP BY z.zone_number, z.name
-- ORDER BY z.zone_number;

-- Verify phase count (should be 150)
-- SELECT COUNT(*) as phase_count FROM phases;

-- Verify phase type distribution (should show 30 of each type)
-- SELECT phase_type, COUNT(*) as count
-- FROM phases
-- GROUP BY phase_type
-- ORDER BY phase_type;

-- Verify phases per chapter (each chapter should have exactly 5 phases)
-- SELECT c.id, c.title, COUNT(p.id) as phase_count
-- FROM chapters c
-- LEFT JOIN phases p ON c.id = p.chapter_id
-- WHERE c.zone_id IS NOT NULL
-- GROUP BY c.id, c.title
-- ORDER BY c.id;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
