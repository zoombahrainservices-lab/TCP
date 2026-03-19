-- Check what pages exist and their structure
-- Run this in Supabase SQL Editor to see Chapter 7 pages

-- 1. Find all pages that might be related to chapter 7
SELECT 
  id,
  title,
  slug,
  page_type,
  step_id,
  jsonb_array_length(content) as content_blocks
FROM step_pages
WHERE title ILIKE '%chapter%7%'
   OR slug ILIKE '%chapter%7%'
   OR slug ILIKE '%7%'
ORDER BY title;

-- 2. Check steps table to see chapter 7 structure
SELECT 
  id,
  title,
  slug,
  step_type,
  chapter_id
FROM steps
WHERE chapter_id = 7
ORDER BY order_index;

-- 3. Find pages by step_id for chapter 7
SELECT 
  sp.id,
  sp.title,
  sp.slug,
  s.step_type,
  s.title as step_title
FROM step_pages sp
JOIN steps s ON sp.step_id = s.id
WHERE s.chapter_id = 7
ORDER BY s.order_index, sp.order_index;

-- 4. Look at actual content of one page
SELECT 
  sp.id,
  sp.title,
  sp.content
FROM step_pages sp
JOIN steps s ON sp.step_id = s.id
WHERE s.chapter_id = 7
  AND sp.title ILIKE '%framework%'
LIMIT 1;
