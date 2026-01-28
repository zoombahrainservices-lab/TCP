-- Seed new Zone → Chapter → Phase structure
-- Migration: 106_seed_new_structure.sql
-- This populates zones, updates chapters with zone assignments, and creates 150 phases

-- ====================
-- STEP 1: Insert 5 Zones
-- ====================

INSERT INTO zones (zone_number, name, description, icon, color, unlock_condition) VALUES
  (1, 'THE ATTENTION HEIST', 'Reclaiming Your Focus from the Digital Void - Days 1-7', '🔴', '#FF2D2D', 'always_unlocked'),
  (2, 'The Connection Hub', 'Develop deep listening skills, empathy, and authentic relationship building', '🟠', '#ea580c', 'complete_previous_zone'),
  (3, 'The Alliance Forge', 'Learn collaboration, teamwork, and how to bring people together', '🟡', '#ca8a04', 'complete_previous_zone'),
  (4, 'The Influence Vault', 'Master persuasion, leadership, and inspiring others to action', '🟢', '#16a34a', 'complete_previous_zone'),
  (5, 'The Mastery Peak', 'Synthesize all skills and become a master communicator', '🔵', '#2563eb', 'complete_previous_zone')
ON CONFLICT (zone_number) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  unlock_condition = EXCLUDED.unlock_condition;

-- ====================
-- STEP 2: Update existing chapters with zone assignments
-- ====================

-- Copy day_number to legacy_day_number for reference
UPDATE chapters 
SET legacy_day_number = day_number 
WHERE legacy_day_number IS NULL;

-- Zone 1: Days 1-7 → Chapters 1-7
UPDATE chapters SET 
  zone_id = (SELECT id FROM zones WHERE zone_number = 1),
  chapter_number = day_number
WHERE day_number BETWEEN 1 AND 7;

-- Zone 2: Days 8-14 → Chapters 1-7
UPDATE chapters SET 
  zone_id = (SELECT id FROM zones WHERE zone_number = 2),
  chapter_number = day_number - 7
WHERE day_number BETWEEN 8 AND 14;

-- Zone 3: Days 15-21 → Chapters 1-7
UPDATE chapters SET 
  zone_id = (SELECT id FROM zones WHERE zone_number = 3),
  chapter_number = day_number - 14
WHERE day_number BETWEEN 15 AND 21;

-- Zone 4: Days 22-28 → Chapters 1-7
UPDATE chapters SET 
  zone_id = (SELECT id FROM zones WHERE zone_number = 4),
  chapter_number = day_number - 21
WHERE day_number BETWEEN 22 AND 28;

-- Zone 5: Days 29-30 → Chapters 1-2
UPDATE chapters SET 
  zone_id = (SELECT id FROM zones WHERE zone_number = 5),
  chapter_number = day_number - 28
WHERE day_number BETWEEN 29 AND 30;

-- ====================
-- STEP 3: Create 150 phases (30 chapters × 5 phases each)
-- ====================

-- For each existing chapter, create 5 phases
-- Phase 1: power-scan (before assessment)
-- Phase 2: secret-intel (reading/learning)
-- Phase 3: visual-guide (visual content - NEW)
-- Phase 4: field-mission (task)
-- Phase 5: level-up (after assessment + reflection)

INSERT INTO phases (chapter_id, phase_number, phase_type, title, content, metadata)
SELECT 
  c.id as chapter_id,
  1 as phase_number,
  'power-scan' as phase_type,
  'Power Scan' as title,
  'Complete the self-assessment questions before diving into the content.' as content,
  jsonb_build_object(
    'questions', c.before_questions,
    'instructions', 'Rate yourself honestly on each question. This helps track your growth.'
  ) as metadata
FROM chapters c
WHERE c.zone_id IS NOT NULL
ON CONFLICT (chapter_id, phase_number) DO NOTHING;

INSERT INTO phases (chapter_id, phase_number, phase_type, title, content, metadata)
SELECT 
  c.id as chapter_id,
  2 as phase_number,
  'secret-intel' as phase_type,
  'Secret Intel' as title,
  c.content as content,
  jsonb_build_object(
    'hasChunks', CASE WHEN c.chunks IS NOT NULL THEN true ELSE false END,
    'chunks', COALESCE(c.chunks, '[]'::jsonb)
  ) as metadata
FROM chapters c
WHERE c.zone_id IS NOT NULL
ON CONFLICT (chapter_id, phase_number) DO NOTHING;

INSERT INTO phases (chapter_id, phase_number, phase_type, title, content, metadata)
SELECT 
  c.id as chapter_id,
  3 as phase_number,
  'visual-guide' as phase_type,
  'Visual Guide' as title,
  'Explore visual resources and examples to deepen your understanding.' as content,
  jsonb_build_object(
    'images', '[]'::jsonb,
    'videos', '[]'::jsonb,
    'note', 'Visual content to be added for each chapter'
  ) as metadata
FROM chapters c
WHERE c.zone_id IS NOT NULL
ON CONFLICT (chapter_id, phase_number) DO NOTHING;

INSERT INTO phases (chapter_id, phase_number, phase_type, title, content, metadata)
SELECT 
  c.id as chapter_id,
  4 as phase_number,
  'field-mission' as phase_type,
  'Field Mission' as title,
  c.task_description as content,
  jsonb_build_object(
    'task_deadline_hours', COALESCE(c.task_deadline_hours, 24),
    'upload_types', '["audio", "image", "text"]'::jsonb,
    'instructions', 'Complete the mission and upload your proof.'
  ) as metadata
FROM chapters c
WHERE c.zone_id IS NOT NULL
ON CONFLICT (chapter_id, phase_number) DO NOTHING;

INSERT INTO phases (chapter_id, phase_number, phase_type, title, content, metadata)
SELECT 
  c.id as chapter_id,
  5 as phase_number,
  'level-up' as phase_type,
  'Level Up' as title,
  'Reflect on your experience and complete the post-assessment.' as content,
  jsonb_build_object(
    'questions', c.after_questions,
    'reflection_required', true,
    'min_reflection_length', 50,
    'instructions', 'Answer the questions and write a reflection on what you learned.'
  ) as metadata
FROM chapters c
WHERE c.zone_id IS NOT NULL
ON CONFLICT (chapter_id, phase_number) DO NOTHING;

-- ====================
-- Verification Queries (for manual testing)
-- ====================

-- Verify zone count
-- SELECT COUNT(*) as zone_count FROM zones; -- Should be 5

-- Verify chapter assignments
-- SELECT z.zone_number, z.name, COUNT(c.id) as chapter_count
-- FROM zones z
-- LEFT JOIN chapters c ON z.id = c.zone_id
-- GROUP BY z.zone_number, z.name
-- ORDER BY z.zone_number;
-- Should show: Zone 1-4 with 7 chapters each, Zone 5 with 2 chapters

-- Verify phase count
-- SELECT COUNT(*) as phase_count FROM phases; -- Should be 150 (30 chapters × 5 phases)

-- Verify phases per chapter
-- SELECT c.id, c.title, COUNT(p.id) as phase_count
-- FROM chapters c
-- LEFT JOIN phases p ON c.id = p.chapter_id
-- WHERE c.zone_id IS NOT NULL
-- GROUP BY c.id, c.title
-- ORDER BY c.id;
-- Each chapter should have exactly 5 phases
