-- Check if user has Your Turn data
-- Replace 'YOUR_USER_ID' with actual user ID from the screenshot logs

-- 1. Check user_prompt_answers table
SELECT 
  prompt_key,
  answer,
  chapter_id,
  created_at
FROM user_prompt_answers 
WHERE user_id = 'YOUR_USER_ID' 
AND chapter_id = 1
AND prompt_key NOT LIKE '%self_check%'
ORDER BY created_at;

-- 2. Check artifacts table
SELECT 
  type,
  data,
  chapter_id,
  created_at
FROM artifacts 
WHERE user_id = 'YOUR_USER_ID' 
AND chapter_id = 1
AND type = 'your_turn_response'
ORDER BY created_at;

-- 3. Check what steps exist for chapter 1
SELECT 
  id,
  step_type,
  title,
  slug
FROM steps
WHERE chapter_id = 1
ORDER BY order_index;

-- 4. Check what pages exist for Framework step
SELECT 
  sp.id,
  sp.title,
  sp.content
FROM step_pages sp
JOIN steps s ON sp.step_id = s.id
WHERE s.chapter_id = 1
AND s.step_type = 'framework'
LIMIT 5;
