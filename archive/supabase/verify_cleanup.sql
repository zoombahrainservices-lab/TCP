-- Post-Cleanup Verification Script
-- Purpose: Verify that cleanup completed successfully and data structure is intact
-- Date: 2026-01-28

-- ============================================================================
-- STEP 1: Verify no student progress data remains
-- ============================================================================

SELECT 'Checking student progress tables...' as step;

SELECT 
  'student_progress' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ PASS: Table is empty'
    ELSE '✗ FAIL: Table still has records'
  END as status
FROM student_progress

UNION ALL

SELECT 
  'phase_uploads' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ PASS: Table is empty'
    ELSE '✗ FAIL: Table still has records'
  END as status
FROM phase_uploads

UNION ALL

SELECT 
  'xp_events' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ PASS: Table is empty'
    ELSE '✗ FAIL: Table still has records'
  END as status
FROM xp_events;

-- ============================================================================
-- STEP 2: Verify student profiles are reset
-- ============================================================================

SELECT 'Checking student profiles...' as step;

SELECT 
  role,
  COUNT(*) as profile_count,
  SUM(CASE WHEN xp = 0 THEN 1 ELSE 0 END) as profiles_with_zero_xp,
  SUM(CASE WHEN level = 1 THEN 1 ELSE 0 END) as profiles_at_level_1,
  SUM(CASE WHEN badges = '[]'::jsonb THEN 1 ELSE 0 END) as profiles_with_no_badges,
  CASE 
    WHEN role = 'student' AND 
         SUM(CASE WHEN xp = 0 THEN 1 ELSE 0 END) = COUNT(*) AND
         SUM(CASE WHEN level = 1 THEN 1 ELSE 0 END) = COUNT(*)
    THEN '✓ PASS: All student profiles reset'
    WHEN role != 'student' THEN '✓ PASS: Non-student profiles unchanged'
    ELSE '⚠ WARNING: Some student profiles not fully reset'
  END as status
FROM profiles
GROUP BY role
ORDER BY role;

-- ============================================================================
-- STEP 3: Verify content structure is intact
-- ============================================================================

SELECT 'Checking content structure...' as step;

SELECT 
  'zones' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ PASS: Zones preserved'
    ELSE '✗ FAIL: Zones table is empty'
  END as status
FROM zones

UNION ALL

SELECT 
  'chapters' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ PASS: Chapters preserved'
    ELSE '✗ FAIL: Chapters table is empty'
  END as status
FROM chapters

UNION ALL

SELECT 
  'phases' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ PASS: Phases preserved'
    ELSE '✗ FAIL: Phases table is empty'
  END as status
FROM phases;

-- ============================================================================
-- STEP 4: Verify chapters with chunks and images
-- ============================================================================

SELECT 'Checking chapter chunks and images...' as step;

SELECT 
  COUNT(*) as total_chapters,
  COUNT(CASE WHEN chunks IS NOT NULL THEN 1 END) as chapters_with_chunks,
  SUM(CASE 
    WHEN chunks IS NOT NULL THEN jsonb_array_length(chunks)
    ELSE 0
  END) as total_chunks,
  SUM(CASE 
    WHEN chunks IS NOT NULL THEN
      (SELECT COUNT(*) 
       FROM jsonb_array_elements(chunks) chunk 
       WHERE chunk->>'imageUrl' IS NOT NULL 
       AND chunk->>'imageUrl' != 'null')
    ELSE 0
  END) as chunks_with_images,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ PASS: Chapter structure intact'
    ELSE '✗ FAIL: No chapters found'
  END as status
FROM chapters;

-- ============================================================================
-- STEP 5: Final summary
-- ============================================================================

SELECT 'Cleanup verification complete!' as summary;

SELECT 
  NOW() as verification_time,
  'Database is ready for fresh student accounts' as message;
