-- Verification Script: Check Chapter Image URLs
-- Purpose: Verify that chapter chunks have proper Supabase Storage URLs
-- Date: 2026-01-28

-- ============================================================================
-- STEP 1: Check which chapters have chunks
-- ============================================================================
SELECT 
  day_number, 
  title,
  CASE 
    WHEN chunks IS NULL THEN 'No chunks'
    ELSE jsonb_array_length(chunks)::text || ' chunks'
  END as chunk_info,
  CASE 
    WHEN chunks IS NULL THEN 0
    ELSE (SELECT COUNT(*) 
          FROM jsonb_array_elements(chunks) chunk 
          WHERE chunk->>'imageUrl' IS NOT NULL 
          AND chunk->>'imageUrl' != 'null')
  END as chunks_with_images
FROM chapters 
ORDER BY day_number;

-- ============================================================================
-- STEP 2: Display actual image URLs for verification
-- ============================================================================
SELECT 
  c.day_number,
  c.title,
  chunk_elem.ordinality as chunk_number,
  chunk_elem.value->>'id' as chunk_id,
  chunk_elem.value->>'title' as chunk_title,
  chunk_elem.value->>'imageUrl' as image_url
FROM chapters c
CROSS JOIN LATERAL jsonb_array_elements(c.chunks) WITH ORDINALITY AS chunk_elem
WHERE c.chunks IS NOT NULL
  AND chunk_elem.value->>'imageUrl' IS NOT NULL
  AND chunk_elem.value->>'imageUrl' != 'null'
ORDER BY c.day_number, chunk_elem.ordinality;

-- ============================================================================
-- STEP 3: Check if URLs follow expected pattern
-- ============================================================================
SELECT 
  c.day_number,
  c.title,
  chunk_elem.value->>'imageUrl' as image_url,
  CASE 
    WHEN chunk_elem.value->>'imageUrl' LIKE '%supabase.co/storage/v1/object/public/chunk-images/%' 
      THEN '✓ Valid Supabase Storage URL'
    WHEN chunk_elem.value->>'imageUrl' LIKE '/chapters/%' 
      THEN '⚠ Local file path (needs migration)'
    ELSE '✗ Unknown URL format'
  END as url_status
FROM chapters c
CROSS JOIN LATERAL jsonb_array_elements(c.chunks) WITH ORDINALITY AS chunk_elem
WHERE c.chunks IS NOT NULL
  AND chunk_elem.value->>'imageUrl' IS NOT NULL
  AND chunk_elem.value->>'imageUrl' != 'null'
ORDER BY c.day_number;

-- ============================================================================
-- STEP 4: Summary statistics
-- ============================================================================
SELECT 
  COUNT(DISTINCT c.id) as total_chapters,
  COUNT(DISTINCT CASE WHEN c.chunks IS NOT NULL THEN c.id END) as chapters_with_chunks,
  SUM(jsonb_array_length(c.chunks)) as total_chunks,
  SUM(CASE 
    WHEN c.chunks IS NOT NULL THEN
      (SELECT COUNT(*) 
       FROM jsonb_array_elements(c.chunks) chunk 
       WHERE chunk->>'imageUrl' IS NOT NULL 
       AND chunk->>'imageUrl' != 'null')
    ELSE 0
  END) as total_chunks_with_images
FROM chapters c;
