-- ============================================================================
-- RESET ALL USER PROGRESS (for testing)
-- ============================================================================
-- Run this in Supabase SQL Editor to wipe all progress. All users will appear
-- as new (no steps, no chapter progress, no XP, no streaks, no assessments).
-- Auth users and profiles are NOT deleted.
-- ============================================================================

-- Plan tasks reference plans; truncate plans with CASCADE to clear plan_tasks
TRUNCATE TABLE public.plans CASCADE;

-- All other progress tables (order: any, they only reference auth.users)
TRUNCATE TABLE public.plan_tasks CASCADE;
TRUNCATE TABLE public.step_completions CASCADE;
TRUNCATE TABLE public.chapter_progress CASCADE;
TRUNCATE TABLE public.chapter_sessions CASCADE;
TRUNCATE TABLE public.assessments CASCADE;
TRUNCATE TABLE public.artifacts CASCADE;
TRUNCATE TABLE public.commitments CASCADE;
TRUNCATE TABLE public.routines CASCADE;
TRUNCATE TABLE public.recovery_tools CASCADE;
TRUNCATE TABLE public.scripts CASCADE;
TRUNCATE TABLE public.weekly_focus CASCADE;
TRUNCATE TABLE public.xp_logs CASCADE;
TRUNCATE TABLE public.chapter_skill_scores CASCADE;
TRUNCATE TABLE public.streak_history CASCADE;
TRUNCATE TABLE public.user_badges CASCADE;
TRUNCATE TABLE public.user_gamification CASCADE;

-- Voice messages: uncomment if you have this table
-- TRUNCATE TABLE public.voice_messages CASCADE;

-- Optional: reset sequences so new IDs start from 1 (cleaner for testing)
ALTER SEQUENCE IF EXISTS public.step_completions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.chapter_progress_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.chapter_sessions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.assessments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.artifacts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.commitments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.routines_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.plans_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.plan_tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.recovery_tools_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.scripts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.weekly_focus_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.xp_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.chapter_skill_scores_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.streak_history_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.user_badges_id_seq RESTART WITH 1;
