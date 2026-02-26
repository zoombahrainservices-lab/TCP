-- Add DB-driven asset URLs for chapters (replaces hardcoded chapter-1 paths)
-- pdf_url: optional PDF download path (e.g. /chapter/Chapter 1_ From Stage Star...pdf)
-- hero_image_url: optional fallback hero image when page has no image block

ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

COMMENT ON COLUMN chapters.pdf_url IS 'Optional PDF download URL for chapter (e.g. /chapter/Chapter1.pdf)';
COMMENT ON COLUMN chapters.hero_image_url IS 'Optional fallback hero image when page content has no image block';

-- Populate Chapter 1 with existing hardcoded values so it continues to work
UPDATE chapters SET
  pdf_url = '/chapter/Chapter 1_ From Stage Star to Silent Struggles - Printable (1).pdf',
  hero_image_url = '/slider-work-on-quizz/chapter1/chaper1-1.jpeg'
WHERE chapter_number = 1;
