-- Migration: Add hero_image_url to step_pages table

-- Add hero_image_url column to step_pages
ALTER TABLE step_pages 
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Add comment
COMMENT ON COLUMN step_pages.hero_image_url IS 'URL for the main hero/featured image shown on the left side of the page';
