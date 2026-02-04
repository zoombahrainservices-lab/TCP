-- ============================================================================
-- Verify XP & Gamification Tables
-- ============================================================================
-- Run this in Supabase SQL Editor after completing Chapter 1
-- Replace 'YOUR_USER_ID' with your actual auth.users id (see query below to get it)
-- ============================================================================

-- Get your user ID (run this first, copy the id, use in queries below):
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 1. Check user_gamification (XP, level, streak)
SELECT 
  'user_gamification' as table_name,
  total_xp,
  level,
  current_streak,
  longest_streak,
  last_active_date
FROM user_gamification
WHERE user_id = 'YOUR_USER_ID';

-- 2. Check xp_logs (should have ~7 entries for full Chapter 1)
SELECT 
  'xp_logs' as table_name,
  reason,
  amount,
  chapter_id,
  created_at
FROM xp_logs
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;

-- 3. Check chapter_progress (all sections should be complete)
SELECT 
  'chapter_progress' as table_name,
  chapter_id,
  reading_complete,
  assessment_complete,
  framework_complete,
  techniques_complete,
  proof_complete,
  follow_through_complete,
  chapter_complete,
  updated_at
FROM chapter_progress
WHERE user_id = 'YOUR_USER_ID'
ORDER BY chapter_id;

-- 4. Summary counts
SELECT 
  (SELECT COUNT(*) FROM xp_logs WHERE user_id = 'YOUR_USER_ID') as xp_logs_count,
  (SELECT COALESCE(SUM(amount), 0) FROM xp_logs WHERE user_id = 'YOUR_USER_ID') as total_xp_awarded,
  (SELECT total_xp FROM user_gamification WHERE user_id = 'YOUR_USER_ID') as user_total_xp,
  (SELECT level FROM user_gamification WHERE user_id = 'YOUR_USER_ID') as user_level;
