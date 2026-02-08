-- ============================================================================
-- CLEAR ALL USER INPUT (keep XP and streaks)
-- ============================================================================
-- Run this in Supabase SQL Editor to wipe all user-submitted responses so
-- users can re-do self-check, Your Turn, proof, and identity resolution.
-- XP logs, streak history, and user_gamification are NOT touched.
-- step_completions and chapter_progress are NOT touched (completion state
-- remains; re-submitting will typically award 0 XP / repeat_completion).
-- ============================================================================

-- Self-check (baseline/after) responses and scores
DELETE FROM public.assessments;

-- Your Turn responses, proof submissions, identity resolution
DELETE FROM public.artifacts
WHERE type IN (
  'your_turn_response',
  'proof',
  'identity_resolution'
);

-- Optional: reset sequences so new IDs start from 1 (uncomment if desired)
-- ALTER SEQUENCE IF EXISTS public.assessments_id_seq RESTART WITH 1;
-- (artifacts table may have other types; do not restart sequence if you keep other rows)
