-- ============================================================================
-- RESET ONE USER'S PROGRESS (run in Supabase SQL Editor)
-- ============================================================================
-- Replaces YOUR_USER_EMAIL or YOUR_USER_ID below, then run the whole script.
-- Deletes all progress for that user; auth and profile are NOT deleted.
-- ============================================================================

-- Option A: Set the user by email (change to your email)
DO $$
DECLARE
  target_id UUID;
  user_email TEXT := 'YOUR_USER_EMAIL';   -- e.g. 'you@example.com'
BEGIN
  -- Resolve user id from email (profiles table)
  SELECT id INTO target_id FROM public.profiles WHERE LOWER(TRIM(email)) = LOWER(TRIM(user_email)) LIMIT 1;

  IF target_id IS NULL THEN
    RAISE EXCEPTION 'No profile found for email: %', user_email;
  END IF;

  DELETE FROM public.step_completions   WHERE user_id = target_id;
  DELETE FROM public.chapter_progress   WHERE user_id = target_id;
  DELETE FROM public.chapter_sessions   WHERE user_id = target_id;
  DELETE FROM public.assessments        WHERE user_id = target_id;
  DELETE FROM public.artifacts          WHERE user_id = target_id;
  DELETE FROM public.xp_logs            WHERE user_id = target_id;
  DELETE FROM public.chapter_skill_scores WHERE user_id = target_id;
  DELETE FROM public.streak_history    WHERE user_id = target_id;
  DELETE FROM public.user_badges       WHERE user_id = target_id;
  DELETE FROM public.user_gamification WHERE user_id = target_id;

  RAISE NOTICE 'Reset complete for user % (email: %)', target_id, user_email;
END $$;

-- Option B: Set the user by UUID (use this if you know your user id)
-- DO $$
-- DECLARE
--   target_id UUID := 'YOUR_USER_ID';   -- e.g. 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
-- BEGIN
--   DELETE FROM public.step_completions   WHERE user_id = target_id;
--   DELETE FROM public.chapter_progress   WHERE user_id = target_id;
--   DELETE FROM public.chapter_sessions   WHERE user_id = target_id;
--   DELETE FROM public.assessments        WHERE user_id = target_id;
--   DELETE FROM public.artifacts          WHERE user_id = target_id;
--   DELETE FROM public.xp_logs            WHERE user_id = target_id;
--   DELETE FROM public.chapter_skill_scores WHERE user_id = target_id;
--   DELETE FROM public.streak_history    WHERE user_id = target_id;
--   DELETE FROM public.user_badges       WHERE user_id = target_id;
--   DELETE FROM public.user_gamification WHERE user_id = target_id;
--   RAISE NOTICE 'Reset complete for user %', target_id;
-- END $$;
