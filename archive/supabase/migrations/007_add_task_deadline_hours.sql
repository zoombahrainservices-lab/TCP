-- Add task_deadline_hours column to chapters table
-- This migration ensures the column exists even if 002_enhanced_workflow.sql wasn't run

ALTER TABLE chapters
  ADD COLUMN IF NOT EXISTS task_deadline_hours INTEGER DEFAULT 24;

COMMENT ON COLUMN chapters.task_deadline_hours IS 'Number of hours student has to complete task after acknowledgment';
