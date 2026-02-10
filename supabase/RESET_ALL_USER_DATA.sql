-- ============================================================================
-- RESET ALL USER DATA (all users)
-- ============================================================================
-- Run this in Supabase SQL Editor to wipe ALL progress for ALL users.
-- Auth users and profiles are NOT deleted. Content (chapters, steps, pages) is NOT deleted.
-- ============================================================================

-- Progress & gamification (order doesn't matter for TRUNCATE)
TRUNCATE TABLE public.step_completions CASCADE;
TRUNCATE TABLE public.chapter_progress CASCADE;
TRUNCATE TABLE public.chapter_sessions CASCADE;
TRUNCATE TABLE public.assessments CASCADE;
TRUNCATE TABLE public.artifacts CASCADE;
TRUNCATE TABLE public.xp_logs CASCADE;
TRUNCATE TABLE public.chapter_skill_scores CASCADE;
TRUNCATE TABLE public.streak_history CASCADE;
TRUNCATE TABLE public.user_badges CASCADE;
TRUNCATE TABLE public.user_gamification CASCADE;

-- Optional: reset sequences (cleaner IDs for testing)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'xp_logs_id_seq') THEN
    ALTER SEQUENCE public.xp_logs_id_seq RESTART WITH 1;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'chapter_skill_scores_id_seq') THEN
    ALTER SEQUENCE public.chapter_skill_scores_id_seq RESTART WITH 1;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'streak_history_id_seq') THEN
    ALTER SEQUENCE public.streak_history_id_seq RESTART WITH 1;
  END IF;
END $$;
