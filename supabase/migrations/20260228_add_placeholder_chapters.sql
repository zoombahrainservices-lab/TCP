-- Add placeholder chapters 3-30 for map display
-- These chapters will show "Coming Soon" until content is added

-- Get the first existing part_id to use for placeholder chapters
DO $$
DECLARE
  default_part_id UUID;
BEGIN
  -- Get the first part's ID (or create one if none exists)
  SELECT id INTO default_part_id FROM parts ORDER BY order_index LIMIT 1;
  
  -- If no parts exist, create a default one
  IF default_part_id IS NULL THEN
    INSERT INTO parts (title, slug, order_index)
    VALUES ('Main Journey', 'main-journey', 0)
    RETURNING id INTO default_part_id;
  END IF;

  -- Insert chapters 3-30 as placeholders using the existing part_id
  INSERT INTO chapters (
    part_id,
    chapter_number,
    slug,
    title,
    subtitle,
    order_index,
    level_min,
    is_published,
    thumbnail_url
  )
  SELECT
    default_part_id,
    n,
    'chapter-' || n,
    'Chapter ' || n,
    'Coming Soon',
    n,
    1,
    true,
    '/placeholder.png'
  FROM generate_series(3, 30) AS n
  WHERE NOT EXISTS (
    SELECT 1 FROM chapters WHERE chapter_number = n
  );
END $$;

-- Create a single "read" step for each placeholder chapter with a "Coming Soon" page
DO $$
DECLARE
  chapter_rec RECORD;
  new_step_id UUID;
BEGIN
  FOR chapter_rec IN 
    SELECT id, slug, chapter_number 
    FROM chapters 
    WHERE chapter_number BETWEEN 3 AND 30
  LOOP
    -- Insert the "read" step
    INSERT INTO chapter_steps (
      chapter_id,
      step_type,
      slug,
      title,
      order_index,
      is_required
    )
    VALUES (
      chapter_rec.id,
      'read',
      'read',
      'Reading',
      0,
      true
    )
    RETURNING id INTO new_step_id;

    -- Insert a "Coming Soon" page for this step
    INSERT INTO step_pages (
      step_id,
      slug,
      title,
      order_index,
      estimated_minutes,
      xp_award,
      content
    )
    VALUES (
      new_step_id,
      'coming-soon',
      'Coming Soon',
      0,
      1,
      0,
      jsonb_build_array(
        jsonb_build_object(
          'type', 'heading',
          'level', 2,
          'text', 'Chapter ' || chapter_rec.chapter_number || ' - Coming Soon'
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'text', 'This chapter is currently being developed. Check back soon for exciting new content!'
        ),
        jsonb_build_object(
          'type', 'callout',
          'variant', 'tip',
          'title', 'Stay Tuned',
          'text', 'New chapters are added regularly. Continue with the available chapters to keep making progress!'
        ),
        jsonb_build_object(
          'type', 'cta',
          'title', 'Return to Dashboard',
          'text', 'Explore other chapters while this one is being prepared.',
          'variant', 'primary'
        )
      )
    );
  END LOOP;
END $$;

COMMENT ON TABLE chapters IS 'Chapters 3-30 are placeholders with Coming Soon content until fully developed';
