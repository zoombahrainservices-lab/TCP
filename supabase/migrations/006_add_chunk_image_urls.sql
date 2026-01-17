-- Document the schema change for chunks
-- Chunks are stored as JSONB in the chapters.chunks column
-- This migration documents that each chunk can now have an optional imageUrl field

-- Add comment to document the schema
COMMENT ON COLUMN chapters.chunks IS 
'JSONB array of chunks. Each chunk: {id: number, title?: string, body: string[], imageUrl?: string}';

-- Example of how to add an image URL to a specific chunk:
-- UPDATE chapters SET chunks = jsonb_set(
--   chunks,
--   '{0,imageUrl}',  -- First chunk (index 0)
--   '"https://example.com/image.jpg"'::jsonb
-- ) WHERE day_number = 1;

-- Example of how to remove an image URL from a chunk:
-- UPDATE chapters SET chunks = jsonb_set(
--   chunks,
--   '{0,imageUrl}',
--   'null'::jsonb
-- ) WHERE day_number = 1;
