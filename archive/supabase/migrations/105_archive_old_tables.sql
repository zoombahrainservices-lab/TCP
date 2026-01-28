-- Archive old daily_records structure before migration
-- Migration: 105_archive_old_tables.sql
-- This creates backup tables and prepares for clean break

-- Archive daily_records table (contains all old student progress)
CREATE TABLE IF NOT EXISTS archived_daily_records AS 
SELECT * FROM daily_records;

-- Add timestamp column to archive
ALTER TABLE archived_daily_records 
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NOW();

-- Archive old chapters structure (before zone_id addition)
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

-- Archive uploads table (linked to daily_records)
CREATE TABLE IF NOT EXISTS archived_uploads AS 
SELECT * FROM uploads;

ALTER TABLE archived_uploads 
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes on archived tables for reference queries
CREATE INDEX IF NOT EXISTS idx_archived_daily_records_student ON archived_daily_records(student_id);
CREATE INDEX IF NOT EXISTS idx_archived_daily_records_day ON archived_daily_records(day_number);
CREATE INDEX IF NOT EXISTS idx_archived_chapters_day ON archived_chapters(day_number);

-- Add comments for documentation
COMMENT ON TABLE archived_daily_records IS 'Archived student progress from old 30-day model (before Zone migration)';
COMMENT ON TABLE archived_chapters IS 'Archived chapters from old 30-day model (before Zone migration)';
COMMENT ON TABLE archived_uploads IS 'Archived uploads from old daily_records (before Phase migration)';

-- Note: We do NOT drop the original tables yet - that will happen after successful migration validation
-- Original tables: daily_records, uploads remain for now
