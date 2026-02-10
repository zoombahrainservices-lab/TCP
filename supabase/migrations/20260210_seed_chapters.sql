-- Seed Chapters Migration
-- This migration populates the content system with Chapter 1 and Chapter 2 metadata
-- Actual content blocks will be migrated separately via script

-- ============================================
-- 1. Insert Parts
-- ============================================

INSERT INTO parts (slug, title, order_index) 
VALUES 
  ('foundation', 'PART I: FOUNDATION', 1),
  ('connection', 'PART II: CONNECTION', 2),
  ('mastery', 'PART III: MASTERY', 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 2. Insert Chapter 1
-- ============================================

INSERT INTO chapters (part_id, chapter_number, slug, title, subtitle, thumbnail_url, order_index, is_published)
SELECT 
  p.id, 
  1, 
  'stage-star-silent-struggles', 
  'The Stage Star with Silent Struggles',
  'Reclaiming your attention in the age of infinite scroll',
  '/chapter/chapter 1/Nightmare.png',
  1,
  true
FROM parts p 
WHERE p.slug = 'foundation'
ON CONFLICT (chapter_number) DO NOTHING;

-- ============================================
-- 3. Insert Chapter 1 Steps
-- ============================================

INSERT INTO chapter_steps (chapter_id, step_type, title, slug, order_index, is_required)
SELECT 
  c.id,
  step_type,
  title,
  slug,
  order_index,
  is_required
FROM chapters c, (VALUES
  ('read', 'Reading', 'reading', 1, true),
  ('self_check', 'Self-Check', 'assessment', 2, true),
  ('framework', 'Framework: SPARK', 'framework', 3, true),
  ('techniques', 'Techniques', 'techniques', 4, true),
  ('resolution', 'Your Identity', 'proof', 5, true),
  ('follow_through', 'Follow-Through', 'follow-through', 6, true)
) AS steps(step_type, title, slug, order_index, is_required)
WHERE c.chapter_number = 1
ON CONFLICT (chapter_id, slug) DO NOTHING;

-- ============================================
-- 4. Insert Chapter 2
-- ============================================

INSERT INTO chapters (part_id, chapter_number, slug, title, subtitle, thumbnail_url, order_index, is_published)
SELECT 
  p.id, 
  2, 
  'genius-who-couldnt-speak', 
  'The Genius Who Couldn''t Speak',
  'Overcoming stage fright and reclaiming your voice',
  '/chapter/chapter 2/Nightmare.png',
  2,
  true
FROM parts p 
WHERE p.slug = 'foundation'
ON CONFLICT (chapter_number) DO NOTHING;

-- ============================================
-- 5. Insert Chapter 2 Steps
-- ============================================

INSERT INTO chapter_steps (chapter_id, step_type, title, slug, order_index, is_required)
SELECT 
  c.id,
  step_type,
  title,
  slug,
  order_index,
  is_required
FROM chapters c, (VALUES
  ('read', 'Reading', 'reading', 1, true),
  ('self_check', 'Self-Check', 'assessment', 2, true),
  ('framework', 'Framework: VOICE', 'framework', 3, true),
  ('techniques', 'Techniques', 'techniques', 4, true),
  ('resolution', 'Your Resolution', 'proof', 5, true),
  ('follow_through', 'Follow-Through', 'follow-through', 6, true)
) AS steps(step_type, title, slug, order_index, is_required)
WHERE c.chapter_number = 2
ON CONFLICT (chapter_id, slug) DO NOTHING;

-- ============================================
-- 6. Verification Queries (commented out)
-- ============================================

-- Uncomment to verify data:
-- SELECT * FROM parts ORDER BY order_index;
-- SELECT * FROM chapters ORDER BY chapter_number;
-- SELECT c.title, cs.title as step_title, cs.slug, cs.order_index 
-- FROM chapter_steps cs 
-- JOIN chapters c ON c.id = cs.chapter_id 
-- ORDER BY c.chapter_number, cs.order_index;
