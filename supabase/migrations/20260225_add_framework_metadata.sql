-- Add framework metadata to chapters table
-- This allows each chapter to have an associated framework (e.g., SPARK, VOICE)

ALTER TABLE chapters 
ADD COLUMN IF NOT EXISTS framework_code TEXT,
ADD COLUMN IF NOT EXISTS framework_letters TEXT[];

-- Add index for queries
CREATE INDEX IF NOT EXISTS idx_chapters_framework_code ON chapters(framework_code);

-- Update existing chapters with their frameworks
UPDATE chapters SET 
  framework_code = 'SPARK',
  framework_letters = ARRAY['S','P','A','R','K']
WHERE chapter_number = 1;

UPDATE chapters SET 
  framework_code = 'VOICE',
  framework_letters = ARRAY['V','O','I','C','E']
WHERE chapter_number = 2;

-- Add comments for documentation
COMMENT ON COLUMN chapters.framework_code IS 'Framework acronym (e.g., SPARK, VOICE)';
COMMENT ON COLUMN chapters.framework_letters IS 'Array of framework letters for UI display';
