-- Migration: Add XP and Level tracking to profiles table
-- This enables gamification features with XP rewards and agent levels

-- Add XP and level columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0 CHECK (xp >= 0),
  ADD COLUMN IF NOT EXISTS level INT DEFAULT 1 CHECK (level >= 1),
  ADD COLUMN IF NOT EXISTS total_xp_earned INT DEFAULT 0 CHECK (total_xp_earned >= 0);

-- Create indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC) WHERE role = 'student';
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level DESC) WHERE role = 'student';

-- Function to calculate level from XP
-- Formula: level = floor(sqrt(xp / 100)) + 1
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp_amount INT)
RETURNS INT AS $$
BEGIN
  IF xp_amount <= 0 THEN
    RETURN 1;
  END IF;
  RETURN FLOOR(SQRT(xp_amount::numeric / 100)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get XP needed for a specific level
CREATE OR REPLACE FUNCTION get_xp_for_level(level_num INT)
RETURNS INT AS $$
BEGIN
  IF level_num <= 1 THEN
    RETURN 0;
  END IF;
  RETURN (POWER(level_num - 1, 2) * 100)::INT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get XP needed for next level
CREATE OR REPLACE FUNCTION get_xp_for_next_level(level_num INT)
RETURNS INT AS $$
BEGIN
  RETURN (POWER(level_num, 2) * 100)::INT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function to auto-update level when XP changes
CREATE OR REPLACE FUNCTION update_level_from_xp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := calculate_level_from_xp(NEW.xp);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update level
DROP TRIGGER IF EXISTS trigger_update_level_from_xp ON profiles;
CREATE TRIGGER trigger_update_level_from_xp
  BEFORE INSERT OR UPDATE OF xp ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_level_from_xp();

-- Update existing students to have calculated levels
UPDATE profiles
SET level = calculate_level_from_xp(COALESCE(xp, 0))
WHERE role = 'student';
