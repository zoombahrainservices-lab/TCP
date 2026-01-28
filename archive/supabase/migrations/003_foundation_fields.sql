-- Foundation Fields Migration
-- Extends program_baselines to store full Foundation data
-- (self-check scores, score bands, identity statements, and chosen actions)

-- Ensure program_baselines table exists (in case migration 002 wasn't run)
-- Create with base columns only (matching migration 002)
CREATE TABLE IF NOT EXISTS program_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on student_id if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS program_baselines_student_id_idx 
  ON program_baselines(student_id);

-- Add Foundation-specific columns to program_baselines (if they don't exist)
-- Using DO block to check for column existence since ALTER TABLE IF NOT EXISTS doesn't work for columns
DO $$
BEGIN
  -- Add self_check_score if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='program_baselines' AND column_name='self_check_score') THEN
    ALTER TABLE program_baselines ADD COLUMN self_check_score INT;
  END IF;

  -- Add score_band if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='program_baselines' AND column_name='score_band') THEN
    ALTER TABLE program_baselines ADD COLUMN score_band TEXT 
      CHECK (score_band IN ('good', 'danger_zone', 'tom_start', 'counselor'));
  END IF;

  -- Add identity_statement if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='program_baselines' AND column_name='identity_statement') THEN
    ALTER TABLE program_baselines ADD COLUMN identity_statement TEXT;
  END IF;

  -- Add chosen_action if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='program_baselines' AND column_name='chosen_action') THEN
    ALTER TABLE program_baselines ADD COLUMN chosen_action TEXT 
      CHECK (chosen_action IN ('identity', 'accountability_text', 'delete_app'));
  END IF;

  -- Add accountability_person if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='program_baselines' AND column_name='accountability_person') THEN
    ALTER TABLE program_baselines ADD COLUMN accountability_person TEXT;
  END IF;

  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='program_baselines' AND column_name='updated_at') THEN
    ALTER TABLE program_baselines ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_program_baselines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_program_baselines_updated_at ON program_baselines;
CREATE TRIGGER update_program_baselines_updated_at
  BEFORE UPDATE ON program_baselines
  FOR EACH ROW
  EXECUTE FUNCTION update_program_baselines_updated_at();

-- Add index on score_band for analytics
CREATE INDEX IF NOT EXISTS idx_program_baselines_score_band 
  ON program_baselines(score_band);

-- Add comments for documentation
COMMENT ON COLUMN program_baselines.self_check_score IS 'Sum of 7 self-check questions (7-49 range)';
COMMENT ON COLUMN program_baselines.score_band IS 'Score interpretation: good (7-14), danger_zone (15-28), tom_start (29-42), counselor (43-49)';
COMMENT ON COLUMN program_baselines.identity_statement IS 'Student identity statement: I am a ___ who ___';
COMMENT ON COLUMN program_baselines.chosen_action IS 'Foundation action chosen by student';
COMMENT ON COLUMN program_baselines.accountability_person IS 'Person for accountability action (if chosen_action = accountability_text)';
