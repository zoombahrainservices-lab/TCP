-- Create image_references table for tracking image usage
CREATE TABLE IF NOT EXISTS image_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  reference_type TEXT NOT NULL, -- 'chapter_thumbnail', 'chapter_hero', 'step_hero', 'page_block', 'framework_letter'
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  step_id UUID REFERENCES chapter_steps(id) ON DELETE CASCADE,
  page_id UUID REFERENCES step_pages(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for efficient lookups by image URL
CREATE INDEX IF NOT EXISTS idx_image_references_url ON image_references(image_url);

-- Create index for efficient lookups by chapter
CREATE INDEX IF NOT EXISTS idx_image_references_chapter ON image_references(chapter_id);

-- Add comment
COMMENT ON TABLE image_references IS 'Tracks where images are used across chapters, steps, and pages for safe deletion';
