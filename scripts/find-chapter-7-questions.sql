-- Debug script to find Chapter 7 pages and questions
-- Run this in Supabase SQL Editor

-- APPROACH 1: Check if Chapter 7 exists
SELECT id, chapter_number, title, slug FROM chapters WHERE chapter_number = 7;

-- APPROACH 2: Find ALL pages (sample)
SELECT 
  id, 
  title, 
  slug,
  page_type,
  step_id,
  LEFT(CAST(content AS TEXT), 100) as content_preview
FROM step_pages 
ORDER BY created_at DESC
LIMIT 20;

-- APPROACH 3: Search for pages with "7" or "seven" in metadata
SELECT 
  id, 
  title, 
  slug
FROM step_pages 
WHERE 
  title ILIKE '%chapter 7%' OR 
  title ILIKE '%seven%' OR
  slug ILIKE '%7%' OR
  slug ILIKE '%seven%'
LIMIT 20;

-- APPROACH 4: Find pages with "framework", "technique", "follow" keywords
SELECT 
  id, 
  title, 
  slug,
  page_type
FROM step_pages 
WHERE 
  lower(title) LIKE '%framework%' OR
  lower(title) LIKE '%technique%' OR
  lower(title) LIKE '%follow%' OR
  lower(slug) LIKE '%framework%' OR
  lower(slug) LIKE '%technique%' OR
  lower(slug) LIKE '%follow%'
ORDER BY created_at DESC
LIMIT 30;

-- APPROACH 5: Check content for prompts with ch7_
SELECT 
  id, 
  title, 
  slug
FROM step_pages 
WHERE content::text LIKE '%ch7_%'
LIMIT 20;

-- APPROACH 6: Check what step_ids exist for pages
SELECT DISTINCT step_id FROM step_pages WHERE step_id IS NOT NULL LIMIT 20;

-- APPROACH 7: If steps table exists, check Chapter 7 steps
-- SELECT id, title, slug, step_type FROM steps WHERE chapter_id = 7;
