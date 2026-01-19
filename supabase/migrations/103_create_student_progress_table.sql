-- Create student_progress table for Zone → Chapter → Phase hierarchy
-- Migration: 103_create_student_progress_table.sql
-- Replaces the old daily_records table with phase-based tracking

CREATE TABLE IF NOT EXISTS student_progress (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_id BIGINT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  chapter_id BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  phase_id BIGINT NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  
  -- Phase-specific data
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Store answers/responses (flexible JSONB for different phase types)
  responses JSONB DEFAULT '{}',
  
  -- Task-related (for field-mission phase)
  task_acknowledged_at TIMESTAMPTZ,
  task_due_at TIMESTAMPTZ,
  task_reminder_sent_at TIMESTAMPTZ,
  
  -- Review (for level-up phase)
  reflection_text TEXT,
  reviewed_at TIMESTAMPTZ,
  review_feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one progress record per student per phase
  UNIQUE (student_id, phase_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_zone_id ON student_progress(zone_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_chapter_id ON student_progress(chapter_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_phase_id ON student_progress(phase_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_completed ON student_progress(student_id, completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_student_progress_task_due ON student_progress(task_due_at) WHERE task_acknowledged_at IS NOT NULL AND completed_at IS NULL;

-- Enable RLS
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_progress
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

-- Create trigger for updated_at
CREATE TRIGGER update_student_progress_updated_at BEFORE UPDATE ON student_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE student_progress IS 'Tracks student progress through zones, chapters, and phases';
COMMENT ON COLUMN student_progress.student_id IS 'Reference to student user';
COMMENT ON COLUMN student_progress.zone_id IS 'Reference to zone (denormalized for easier queries)';
COMMENT ON COLUMN student_progress.chapter_id IS 'Reference to chapter (denormalized for easier queries)';
COMMENT ON COLUMN student_progress.phase_id IS 'Reference to specific phase';
COMMENT ON COLUMN student_progress.started_at IS 'Timestamp when student started this phase';
COMMENT ON COLUMN student_progress.completed_at IS 'Timestamp when student completed this phase (NULL = in progress)';
COMMENT ON COLUMN student_progress.responses IS 'Phase-specific responses (questions, reflections, etc.)';
COMMENT ON COLUMN student_progress.task_acknowledged_at IS 'For field-mission: when student acknowledged the task';
COMMENT ON COLUMN student_progress.task_due_at IS 'For field-mission: calculated deadline for task';
COMMENT ON COLUMN student_progress.reflection_text IS 'For level-up: student reflection text';
COMMENT ON COLUMN student_progress.reviewed_at IS 'Timestamp when parent/mentor reviewed the submission';
COMMENT ON COLUMN student_progress.review_feedback IS 'Feedback from parent/mentor';
