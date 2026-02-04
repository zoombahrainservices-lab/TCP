-- ============================================================================
-- XP QUALITY IMPROVEMENTS
-- ============================================================================
-- 1. Timezone for day boundaries (streak fairness)
-- 2. Per-streak-run milestone policy
-- 3. step_completions deduplication
-- ============================================================================

-- 1. Add timezone and streak_run_id to user_gamification
ALTER TABLE user_gamification ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE user_gamification ADD COLUMN IF NOT EXISTS streak_run_id INTEGER NOT NULL DEFAULT 1;

-- 2. Deduplicate step_completions before adding UNIQUE
-- Keep one row per (user_id, step_id), delete the rest
WITH duplicates AS (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, step_id ORDER BY id) AS rn
    FROM step_completions
  ) sub WHERE rn > 1
)
DELETE FROM step_completions WHERE id IN (SELECT id FROM duplicates);

-- 3. Add UNIQUE constraint on step_completions
ALTER TABLE step_completions ADD CONSTRAINT step_completions_user_step_unique UNIQUE (user_id, step_id);
