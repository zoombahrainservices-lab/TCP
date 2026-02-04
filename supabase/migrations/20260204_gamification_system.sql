-- ============================================================================
-- GAMIFICATION SYSTEM MIGRATION
-- ============================================================================
-- Creates comprehensive gamification system with XP, streaks, skill scores,
-- badges, and all supporting functions and policies.
-- ============================================================================

-- ============================================================================
-- TABLE: user_gamification
-- ============================================================================
-- Core gamification data per user (XP, level, streaks)

CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_level ON user_gamification(level DESC);

-- ============================================================================
-- TABLE: xp_logs
-- ============================================================================
-- Detailed XP event history

CREATE TABLE IF NOT EXISTS xp_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN (
    'daily_activity',
    'section_completion',
    'chapter_completion',
    'improvement',
    'streak_bonus',
    'milestone'
  )),
  amount INTEGER NOT NULL CHECK (amount >= 0),
  metadata JSONB DEFAULT '{}',
  chapter_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for queries
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_id ON xp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_logs_created_at ON xp_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_reason ON xp_logs(user_id, reason);

-- ============================================================================
-- TABLE: chapter_skill_scores
-- ============================================================================
-- Performance tracking per chapter (lower is better)

CREATE TABLE IF NOT EXISTS chapter_skill_scores (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL,
  score_before INTEGER CHECK (score_before >= 0 AND score_before <= 100),
  score_after INTEGER CHECK (score_after >= 0 AND score_after <= 100),
  best_score INTEGER CHECK (best_score >= 0 AND best_score <= 100),
  improvement INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_chapter_skill_scores_user_id ON chapter_skill_scores(user_id);

-- ============================================================================
-- TABLE: streak_history
-- ============================================================================
-- Track streak milestones

CREATE TABLE IF NOT EXISTS streak_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_length INTEGER NOT NULL,
  milestone_reached INTEGER,
  bonus_xp_awarded INTEGER,
  achieved_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for queries
CREATE INDEX IF NOT EXISTS idx_streak_history_user_id ON streak_history(user_id);

-- ============================================================================
-- TABLE: badges
-- ============================================================================
-- Achievement system definitions

CREATE TABLE IF NOT EXISTS badges (
  id BIGSERIAL PRIMARY KEY,
  badge_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  requirement_type TEXT,
  requirement_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: user_badges
-- ============================================================================
-- Badges earned by users

CREATE TABLE IF NOT EXISTS user_badges (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id BIGINT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all gamification tables
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_skill_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- user_gamification policies
CREATE POLICY "Users can view own gamification data"
  ON user_gamification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification data"
  ON user_gamification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification data"
  ON user_gamification FOR UPDATE
  USING (auth.uid() = user_id);

-- xp_logs policies
CREATE POLICY "Users can view own XP logs"
  ON xp_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own XP logs"
  ON xp_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- chapter_skill_scores policies
CREATE POLICY "Users can view own skill scores"
  ON chapter_skill_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill scores"
  ON chapter_skill_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill scores"
  ON chapter_skill_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- streak_history policies
CREATE POLICY "Users can view own streak history"
  ON streak_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak history"
  ON streak_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- user_badges policies
CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- badges table (public read)
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  USING (true);

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function to calculate level from XP (exponential curve)
-- Level 1: 0-100, Level 2: 100-250, Level 3: 250-500, etc.
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF xp <= 0 THEN
    RETURN 1;
  END IF;
  RETURN FLOOR(POWER(xp::numeric / 100.0, 0.45)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get streak multiplier
CREATE OR REPLACE FUNCTION get_streak_multiplier(streak INTEGER)
RETURNS DECIMAL AS $$
BEGIN
  -- Day 1-4: 1.0x, Day 5-9: 1.2x, Day 10-19: 1.5x, Day 20+: 2.0x (capped)
  CASE
    WHEN streak >= 20 THEN RETURN 2.0;
    WHEN streak >= 10 THEN RETURN 1.5;
    WHEN streak >= 5 THEN RETURN 1.2;
    ELSE RETURN 1.0;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get XP threshold for a specific level
CREATE OR REPLACE FUNCTION get_level_threshold(level_num INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF level_num <= 1 THEN
    RETURN 0;
  END IF;
  -- Inverse of calculate_level formula
  RETURN FLOOR(100 * POWER(level_num - 1, 2.22));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp on user_gamification
CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON user_gamification
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at timestamp on chapter_skill_scores
CREATE TRIGGER update_chapter_skill_scores_updated_at
  BEFORE UPDATE ON chapter_skill_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED INITIAL BADGES
-- ============================================================================

INSERT INTO badges (badge_key, name, description, icon, requirement_type, requirement_value) VALUES
('first_step', 'First Step', 'Complete your first chapter step', '🚀', 'step_count', 1),
('week_warrior', 'Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', 7),
('month_master', 'Month Master', 'Maintain a 30-day streak', '⭐', 'streak', 30),
('chapter_champion', 'Chapter Champion', 'Complete your first chapter', '🎓', 'chapter_count', 1),
('improvement_star', 'Improvement Star', 'Improve by 20+ points in any chapter', '📈', 'improvement', 20),
('level_5', 'Rising Star', 'Reach Level 5', '✨', 'level', 5),
('level_10', 'Shining Bright', 'Reach Level 10', '💫', 'level', 10),
('level_20', 'Champion', 'Reach Level 20', '👑', 'level', 20),
('streak_100', 'Century Club', 'Maintain a 100-day streak', '💯', 'streak', 100)
ON CONFLICT (badge_key) DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Gamification system migration completed successfully!' as status;
SELECT 
  (SELECT COUNT(*) FROM user_gamification) as user_gamification_count,
  (SELECT COUNT(*) FROM xp_logs) as xp_logs_count,
  (SELECT COUNT(*) FROM chapter_skill_scores) as skill_scores_count,
  (SELECT COUNT(*) FROM badges) as badges_count;
