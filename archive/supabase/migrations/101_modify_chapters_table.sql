-- Modify chapters table for Zone → Chapter → Phase hierarchy
-- Migration: 101_modify_chapters_table.sql

-- Drop old constraint on day_number (1-30 CHECK)
ALTER TABLE chapters DROP CONSTRAINT IF EXISTS chapters_day_number_check;

-- Drop unique constraint on day_number (will keep column for reference but allow nulls)
ALTER TABLE chapters DROP CONSTRAINT IF EXISTS chapters_day_number_key;

-- Make day_number nullable (for new chapters that don't map to old days)
ALTER TABLE chapters ALTER COLUMN day_number DROP NOT NULL;

-- Add new columns for zone hierarchy
ALTER TABLE chapters
  ADD COLUMN IF NOT EXISTS zone_id BIGINT REFERENCES zones(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS chapter_number INT, -- 1-7 within each zone
  ADD COLUMN IF NOT EXISTS legacy_day_number INT; -- for content migration reference

-- Create compound unique constraint (zone_id + chapter_number must be unique)
-- But allow NULL zone_id temporarily during migration
ALTER TABLE chapters
  ADD CONSTRAINT chapters_zone_chapter_unique UNIQUE (zone_id, chapter_number) DEFERRABLE INITIALLY DEFERRED;

-- Create index for faster zone-based queries
CREATE INDEX IF NOT EXISTS idx_chapters_zone_id ON chapters(zone_id);
CREATE INDEX IF NOT EXISTS idx_chapters_legacy_day_number ON chapters(legacy_day_number);

-- Add comments for documentation
COMMENT ON COLUMN chapters.zone_id IS 'Reference to parent zone';
COMMENT ON COLUMN chapters.chapter_number IS 'Sequential chapter number within zone (1-7)';
COMMENT ON COLUMN chapters.legacy_day_number IS 'Original day number from old 30-day structure (for migration reference)';
COMMENT ON COLUMN chapters.day_number IS 'DEPRECATED: Legacy field, use legacy_day_number instead';
