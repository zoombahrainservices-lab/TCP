-- Additional RLS policies and permissions for new structure
-- Migration: 107_rls_policies.sql
-- This ensures proper security for the Zone → Chapter → Phase hierarchy

-- ====================
-- Mentor Access Policies
-- ====================

-- Allow mentors to view their assigned students' progress
CREATE POLICY IF NOT EXISTS "Mentors can view assigned students' progress"
  ON student_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mentor'
    )
    -- Note: Mentor-student assignment logic to be implemented later
    -- For now, mentors can see all students (similar to parents)
  );

-- Mentors can view uploads from their students
CREATE POLICY IF NOT EXISTS "Mentors can view student uploads"
  ON phase_uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mentor'
    )
  );

-- ====================
-- Review/Feedback Policies
-- ====================

-- Allow parents and mentors to add review feedback
CREATE POLICY IF NOT EXISTS "Parents can update review feedback for their children"
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

CREATE POLICY IF NOT EXISTS "Mentors can update review feedback"
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

-- ====================
-- Admin Full Access
-- ====================

-- Admins can insert/update/delete progress (for testing/debugging)
CREATE POLICY IF NOT EXISTS "Admins can insert progress"
  ON student_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can update progress"
  ON student_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can delete progress"
  ON student_progress FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage uploads
CREATE POLICY IF NOT EXISTS "Admins can insert uploads"
  ON phase_uploads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can delete uploads"
  ON phase_uploads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ====================
-- Performance: Indexes for common queries
-- ====================

-- Index for "get all completed phases for a student"
CREATE INDEX IF NOT EXISTS idx_student_progress_student_completed 
  ON student_progress(student_id, completed_at) 
  WHERE completed_at IS NOT NULL;

-- Index for "get current phase for a student"
CREATE INDEX IF NOT EXISTS idx_student_progress_student_current 
  ON student_progress(student_id, started_at) 
  WHERE completed_at IS NULL;

-- Index for "get all progress for a zone"
CREATE INDEX IF NOT EXISTS idx_student_progress_zone_student 
  ON student_progress(zone_id, student_id);

-- Index for "get all progress for a chapter"
CREATE INDEX IF NOT EXISTS idx_student_progress_chapter_student 
  ON student_progress(chapter_id, student_id);

-- Composite index for phase completion queries
CREATE INDEX IF NOT EXISTS idx_student_progress_composite 
  ON student_progress(student_id, zone_id, chapter_id, phase_id, completed_at);

-- ====================
-- Views for easier querying
-- ====================

-- View: Student progress summary
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

-- Grant access to the view
GRANT SELECT ON student_progress_summary TO authenticated;

-- ====================
-- Comments for documentation
-- ====================

COMMENT ON VIEW student_progress_summary IS 'Aggregated view of student progress across all zones, chapters, and phases';

-- Final verification message
DO $$
BEGIN
  RAISE NOTICE 'RLS policies and indexes created successfully';
  RAISE NOTICE 'Total zones: %', (SELECT COUNT(*) FROM zones);
  RAISE NOTICE 'Total chapters: %', (SELECT COUNT(*) FROM chapters WHERE zone_id IS NOT NULL);
  RAISE NOTICE 'Total phases: %', (SELECT COUNT(*) FROM phases);
END $$;
