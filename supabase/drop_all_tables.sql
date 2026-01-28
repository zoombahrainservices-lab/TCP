-- ============================================================================
-- DROP ALL CUSTOM TABLES
-- ============================================================================
-- DANGER: This drops ALL custom tables.
-- Only auth.users (managed by Supabase) will remain.
-- Run this in Supabase SQL Editor.
-- ============================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_student_progress_updated_at ON student_progress;
DROP TRIGGER IF EXISTS update_phases_updated_at ON phases;
DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
DROP TRIGGER IF EXISTS update_zones_updated_at ON zones;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop views
DROP VIEW IF EXISTS student_progress_summary CASCADE;

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS xp_events CASCADE;
DROP TABLE IF EXISTS phase_uploads CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;
DROP TABLE IF EXISTS uploads CASCADE;
DROP TABLE IF EXISTS daily_records CASCADE;
DROP TABLE IF EXISTS phases CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS parent_child_links CASCADE;
DROP TABLE IF EXISTS program_baselines CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop archived tables
DROP TABLE IF EXISTS archived_chapters CASCADE;
DROP TABLE IF EXISTS archived_daily_records CASCADE;

-- Optionally delete storage bucket contents (uncomment if needed)
-- DELETE FROM storage.objects WHERE bucket_id IN ('student-uploads', 'chunk-images');
-- DELETE FROM storage.buckets WHERE id IN ('student-uploads', 'chunk-images');

-- Verification
SELECT 'All custom tables dropped successfully!' as status;
