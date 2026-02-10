-- Chapter Bundle RPC Function
-- Fetch chapter + steps in a single query for performance

CREATE OR REPLACE FUNCTION get_chapter_bundle(chapter_slug TEXT)
RETURNS TABLE(
  chapter_data JSONB,
  steps_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(c.*) as chapter_data,
    COALESCE(
      jsonb_agg(s.* ORDER BY s.order_index),
      '[]'::jsonb
    ) as steps_data
  FROM chapters c
  LEFT JOIN chapter_steps s ON s.chapter_id = c.id
  WHERE c.slug = chapter_slug
    AND c.is_published = true
  GROUP BY c.id, c.part_id, c.chapter_number, c.slug, c.title, c.subtitle, 
           c.thumbnail_url, c.order_index, c.level_min, c.is_published, 
           c.created_at, c.updated_at;
END;
$$ LANGUAGE plpgsql;
