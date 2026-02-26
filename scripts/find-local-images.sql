-- Find all image blocks in the database with local paths
-- Run this in Supabase SQL Editor to see what images need to be uploaded

WITH image_blocks AS (
  SELECT 
    p.id as page_id,
    p.title as page_title,
    p.order_index,
    s.slug as step_slug,
    c.slug as chapter_slug,
    c.chapter_number,
    jsonb_array_elements(p.content) as block
  FROM step_pages p
  JOIN chapter_steps s ON p.step_id = s.id
  JOIN chapters c ON s.chapter_id = c.id
  WHERE p.content IS NOT NULL
)
SELECT 
  chapter_number,
  chapter_slug,
  step_slug,
  page_title,
  order_index,
  block->>'src' as image_url,
  block->>'alt' as alt_text,
  block->>'caption' as caption
FROM image_blocks
WHERE block->>'type' = 'image'
  AND block->>'src' IS NOT NULL
  AND block->>'src' != ''
  -- Filter for local paths (not storage URLs)
  AND (
    block->>'src' LIKE '/chapter/%'
    OR block->>'src' LIKE '/public/%'
    OR block->>'src' LIKE '/slider-%'
    OR (block->>'src' NOT LIKE 'http%' AND block->>'src' NOT LIKE '/storage/%')
  )
ORDER BY chapter_number, order_index;
