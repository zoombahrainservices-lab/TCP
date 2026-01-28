-- Enhanced Workflow Migration
-- Adds program baseline, workflow tracking, and notifications support

-- 1. Create program_baselines table
CREATE TABLE IF NOT EXISTS program_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on student_id
CREATE UNIQUE INDEX IF NOT EXISTS program_baselines_student_id_idx 
  ON program_baselines(student_id);

-- 2. Add workflow tracking columns to daily_records
ALTER TABLE daily_records
  ADD COLUMN IF NOT EXISTS content_finished_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS task_acknowledged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS task_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS proof_uploaded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_feedback TEXT,
  ADD COLUMN IF NOT EXISTS task_reminder_sent_at TIMESTAMPTZ;

-- Create index for reminder queries
CREATE INDEX IF NOT EXISTS idx_daily_records_task_due_at 
  ON daily_records(task_due_at) 
  WHERE task_acknowledged_at IS NOT NULL AND proof_uploaded_at IS NULL;

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON notifications(user_id, read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
  ON notifications(created_at DESC);

-- 4. Add task_deadline_hours to chapters table
ALTER TABLE chapters
  ADD COLUMN IF NOT EXISTS task_deadline_hours INTEGER DEFAULT 24;

-- 5. Enable RLS on new tables
ALTER TABLE program_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for program_baselines (mirror daily_records patterns)

-- Students can view their own baseline
CREATE POLICY IF NOT EXISTS "Students can view their own baseline"
  ON program_baselines FOR SELECT
  USING (student_id = auth.uid());

-- Students can insert their own baseline
CREATE POLICY IF NOT EXISTS "Students can insert their own baseline"
  ON program_baselines FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Students can update their own baseline
CREATE POLICY IF NOT EXISTS "Students can update their own baseline"
  ON program_baselines FOR UPDATE
  USING (student_id = auth.uid());

-- Parents can view their children's baselines
CREATE POLICY IF NOT EXISTS "Parents can view their children's baselines"
  ON program_baselines FOR SELECT
  USING (
    student_id IN (
      SELECT child_id FROM parent_child_links WHERE parent_id = auth.uid()
    )
  );

-- Admins can view all baselines
CREATE POLICY IF NOT EXISTS "Admins can view all baselines"
  ON program_baselines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. RLS Policies for notifications

-- Users can view their own notifications
CREATE POLICY IF NOT EXISTS "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY IF NOT EXISTS "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Service role can insert notifications (for system/automated notifications)
-- Note: This will be handled via service role key in server actions

-- Admins can view all notifications
CREATE POLICY IF NOT EXISTS "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Add notification preferences to profiles (optional, using JSONB)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_enabled": true, "reminder_enabled": true, "review_enabled": true}'::jsonb;

-- Add comment for documentation
COMMENT ON TABLE program_baselines IS 'Stores one-time program baseline assessment for each student';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON COLUMN daily_records.content_finished_at IS 'Timestamp when student marked content as finished';
COMMENT ON COLUMN daily_records.task_acknowledged_at IS 'Timestamp when student acknowledged the task';
COMMENT ON COLUMN daily_records.task_due_at IS 'Calculated deadline for task completion';
COMMENT ON COLUMN daily_records.proof_uploaded_at IS 'Timestamp when student uploaded proof';
COMMENT ON COLUMN daily_records.reviewed_at IS 'Timestamp when parent/mentor reviewed the submission';
COMMENT ON COLUMN daily_records.review_feedback IS 'Feedback text from reviewer';
COMMENT ON COLUMN daily_records.task_reminder_sent_at IS 'Timestamp when reminder was sent (prevents duplicates)';
COMMENT ON COLUMN chapters.task_deadline_hours IS 'Number of hours student has to complete task after acknowledgment';
