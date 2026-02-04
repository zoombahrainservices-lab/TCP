-- ============================================================================
-- XP EVENT KEY - Prevent double-awarding
-- ============================================================================
-- Adds xp_event_key (nullable) to xp_logs with UNIQUE constraint.
-- Callers pass event keys like daily_activity:userId:date.
-- ON CONFLICT (xp_event_key) -> treat as "already awarded", no double XP.
-- ============================================================================

ALTER TABLE xp_logs ADD COLUMN IF NOT EXISTS xp_event_key TEXT;

-- Partial unique index: only enforce uniqueness for non-null keys
CREATE UNIQUE INDEX IF NOT EXISTS idx_xp_logs_event_key_unique
  ON xp_logs (xp_event_key)
  WHERE xp_event_key IS NOT NULL;
