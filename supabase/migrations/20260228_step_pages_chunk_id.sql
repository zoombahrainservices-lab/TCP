-- Add chunk_id column to step_pages for tracking content grouping/organization
ALTER TABLE step_pages
ADD COLUMN IF NOT EXISTS chunk_id INTEGER;

COMMENT ON COLUMN step_pages.chunk_id IS 'Optional chunk identifier for grouping pages or tracking content sections';
