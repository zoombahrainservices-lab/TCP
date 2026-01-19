-- Disable Row Level Security (RLS) on all tables
-- Migration: 107_disable_rls.sql
-- This removes all RLS restrictions from database tables

-- Disable RLS on all tables
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS parent_child_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chapters DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS uploads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS phases DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS phase_uploads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS archived_chapters DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS archived_daily_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS archived_uploads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS program_baselines DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_progress_events DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies (optional cleanup)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Enable all operations" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Enable read access for all users" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Enable update for users based on email" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Enable delete for users based on email" ON %I', r.tablename);
    END LOOP;
END $$;

-- Verify RLS is disabled (commented out - uncomment to check)
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;
