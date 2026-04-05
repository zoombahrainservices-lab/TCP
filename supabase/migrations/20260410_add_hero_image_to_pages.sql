-- Add hero_image_url column to step_pages for page-specific images
ALTER TABLE step_pages
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

COMMENT ON COLUMN step_pages.hero_image_url IS 'Optional hero/cover image URL for this specific page';
