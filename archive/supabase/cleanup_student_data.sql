-- Database Cleanup Script
-- Purpose: Delete all student progress and related test data while preserving structure
-- Date: 2026-01-28
-- WARNING: This will delete all student progress, XP events, and phase uploads

-- ============================================================================
-- STEP 1: Delete all XP events
-- ============================================================================
DELETE FROM xp_events;

-- ============================================================================
-- STEP 2: Delete all phase uploads 
-- (Will also be cascade deleted from student_progress, but explicit for clarity)
-- ============================================================================
DELETE FROM phase_uploads;

-- ============================================================================
-- STEP 3: Delete all student progress records
-- ============================================================================
DELETE FROM student_progress;

-- ============================================================================
-- STEP 4: Reset XP and level for all student profiles
-- (Keep the profiles, just reset their progress)
-- ============================================================================
UPDATE profiles SET 
  xp = 0, 
  level = 1, 
  badges = '[]'::jsonb
WHERE role = 'student';

-- ============================================================================
-- VERIFICATION QUERIES (uncomment to run after cleanup)
-- ============================================================================

-- Verify no student progress remains
-- SELECT COUNT(*) as student_progress_count FROM student_progress;
-- SELECT COUNT(*) as phase_uploads_count FROM phase_uploads;
-- SELECT COUNT(*) as xp_events_count FROM xp_events;

-- Verify profiles are reset
-- SELECT id, role, xp, level, badges FROM profiles WHERE role = 'student';

-- Verify content structure is intact
-- SELECT COUNT(*) as zones_count FROM zones;
-- SELECT COUNT(*) as chapters_count FROM chapters;
-- SELECT COUNT(*) as phases_count FROM phases;

-- Display success message
SELECT 
  'Database cleanup completed successfully!' as status,
  NOW() as completed_at;
