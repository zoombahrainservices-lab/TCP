-- ============================================================================
-- CHAPTER SYSTEM MIGRATION
-- ============================================================================
-- Creates all tables needed for Chapter 1 block-based learning system
-- Run this BEFORE the gamification migration
-- ============================================================================

-- Create updated_at trigger function (required by chapter_progress trigger)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE: chapter_sessions
-- ============================================================================
-- Tracks user's chapter journey

CREATE TABLE IF NOT EXISTS chapter_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chapter_sessions_user_id ON chapter_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_sessions_chapter_id ON chapter_sessions(chapter_id);

-- ============================================================================
-- TABLE: step_completions
-- ============================================================================
-- Every screen/step tracked

CREATE TABLE IF NOT EXISTS step_completions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  data JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_step_completions_user_id ON step_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_step_completions_step_id ON step_completions(step_id);
CREATE INDEX IF NOT EXISTS idx_step_completions_user_step ON step_completions(user_id, step_id);

-- ============================================================================
-- TABLE: chapter_progress
-- ============================================================================
-- Milestone tracking per chapter

CREATE TABLE IF NOT EXISTS chapter_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL,
  reading_complete BOOLEAN DEFAULT FALSE,
  reading_completed_at TIMESTAMPTZ,
  assessment_complete BOOLEAN DEFAULT FALSE,
  assessment_completed_at TIMESTAMPTZ,
  framework_complete BOOLEAN DEFAULT FALSE,
  framework_completed_at TIMESTAMPTZ,
  techniques_complete BOOLEAN DEFAULT FALSE,
  techniques_completed_at TIMESTAMPTZ,
  proof_complete BOOLEAN DEFAULT FALSE,
  proof_completed_at TIMESTAMPTZ,
  follow_through_complete BOOLEAN DEFAULT FALSE,
  follow_through_completed_at TIMESTAMPTZ,
  chapter_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_chapter_progress_user_id ON chapter_progress(user_id);

-- ============================================================================
-- TABLE: assessments
-- ============================================================================
-- Baseline & after assessments

CREATE TABLE IF NOT EXISTS assessments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('baseline', 'after')),
  responses JSONB DEFAULT '{}',
  score INTEGER,
  band TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_chapter_id ON assessments(chapter_id);

-- ============================================================================
-- TABLE: artifacts
-- ============================================================================
-- SPARK outputs & toolbox items

CREATE TABLE IF NOT EXISTS artifacts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_user_id ON artifacts(user_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);

-- ============================================================================
-- TABLE: commitments
-- ============================================================================
-- Active habits/micro-commitments

CREATE TABLE IF NOT EXISTS commitments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  minutes INTEGER,
  frequency TEXT,
  reminder_on BOOLEAN DEFAULT FALSE,
  reminder_time TIME,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commitments_user_id ON commitments(user_id);

-- ============================================================================
-- TABLE: routines
-- ============================================================================
-- Daily/nightly routines

CREATE TABLE IF NOT EXISTS routines (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  reminder_time TIME,
  start_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);

-- ============================================================================
-- TABLE: plans
-- ============================================================================
-- 90-day structured plans

CREATE TABLE IF NOT EXISTS plans (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  mode TEXT DEFAULT 'standard',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);

-- ============================================================================
-- TABLE: plan_tasks
-- ============================================================================
-- Generated weekly tasks for plans

CREATE TABLE IF NOT EXISTS plan_tasks (
  id BIGSERIAL PRIMARY KEY,
  plan_id BIGINT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_tasks_plan_id ON plan_tasks(plan_id);

-- ============================================================================
-- TABLE: recovery_tools
-- ============================================================================
-- Recovery mode toggle

CREATE TABLE IF NOT EXISTS recovery_tools (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- ============================================================================
-- TABLE: scripts
-- ============================================================================
-- Conversation templates

CREATE TABLE IF NOT EXISTS scripts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL,
  target TEXT NOT NULL CHECK (target IN ('parent', 'friend', 'self')),
  custom_text TEXT,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id, target)
);

CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON scripts(user_id);

-- ============================================================================
-- TABLE: weekly_focus
-- ============================================================================
-- One thing to focus on this week

CREATE TABLE IF NOT EXISTS weekly_focus (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  set_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE chapter_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_focus ENABLE ROW LEVEL SECURITY;

-- chapter_sessions policies
CREATE POLICY "Users can view own chapter sessions"
  ON chapter_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chapter sessions"
  ON chapter_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chapter sessions"
  ON chapter_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- step_completions policies
CREATE POLICY "Users can view own step completions"
  ON step_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own step completions"
  ON step_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- chapter_progress policies
CREATE POLICY "Users can view own chapter progress"
  ON chapter_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chapter progress"
  ON chapter_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chapter progress"
  ON chapter_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- assessments policies
CREATE POLICY "Users can view own assessments"
  ON assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- artifacts policies
CREATE POLICY "Users can view own artifacts"
  ON artifacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own artifacts"
  ON artifacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- commitments policies
CREATE POLICY "Users can view own commitments"
  ON commitments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own commitments"
  ON commitments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commitments"
  ON commitments FOR UPDATE
  USING (auth.uid() = user_id);

-- routines policies
CREATE POLICY "Users can view own routines"
  ON routines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines"
  ON routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
  ON routines FOR UPDATE
  USING (auth.uid() = user_id);

-- plans policies
CREATE POLICY "Users can view own plans"
  ON plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- plan_tasks policies (anyone can view their plan's tasks)
CREATE POLICY "Users can view own plan tasks"
  ON plan_tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM plans WHERE plans.id = plan_tasks.plan_id AND plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own plan tasks"
  ON plan_tasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM plans WHERE plans.id = plan_tasks.plan_id AND plans.user_id = auth.uid()
  ));

-- recovery_tools policies
CREATE POLICY "Users can view own recovery tools"
  ON recovery_tools FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recovery tools"
  ON recovery_tools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recovery tools"
  ON recovery_tools FOR UPDATE
  USING (auth.uid() = user_id);

-- scripts policies
CREATE POLICY "Users can view own scripts"
  ON scripts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scripts"
  ON scripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scripts"
  ON scripts FOR UPDATE
  USING (auth.uid() = user_id);

-- weekly_focus policies
CREATE POLICY "Users can view own weekly focus"
  ON weekly_focus FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly focus"
  ON weekly_focus FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly focus"
  ON weekly_focus FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at on chapter_progress
CREATE TRIGGER update_chapter_progress_updated_at
  BEFORE UPDATE ON chapter_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Chapter system migration completed successfully!' as status;
SELECT 
  (SELECT COUNT(*) FROM chapter_sessions) as sessions_count,
  (SELECT COUNT(*) FROM step_completions) as steps_count,
  (SELECT COUNT(*) FROM chapter_progress) as progress_count,
  (SELECT COUNT(*) FROM assessments) as assessments_count;
