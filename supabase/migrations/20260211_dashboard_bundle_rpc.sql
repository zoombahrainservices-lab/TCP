-- Dashboard Bundle RPC
-- Single query to fetch all dashboard data (chapters + user progress)
-- Reduces multiple roundtrips to a single optimized query

CREATE OR REPLACE FUNCTION get_dashboard_bundle(p_user_id UUID)
RETURNS TABLE(
  chapters_data JSONB,
  progress_data JSONB,
  gamification_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- All published chapters with metadata
    COALESCE(
      (SELECT jsonb_agg(c.* ORDER BY c.order_index)
       FROM chapters c
       WHERE c.is_published = true),
      '[]'::jsonb
    ) as chapters_data,
    
    -- User's chapter progress
    COALESCE(
      (SELECT jsonb_agg(cp.*)
       FROM chapter_progress cp
       WHERE cp.user_id = p_user_id),
      '[]'::jsonb
    ) as progress_data,
    
    -- User's gamification stats (XP, streak, level)
    COALESCE(
      (SELECT to_jsonb(g.*)
       FROM gamification g
       WHERE g.user_id = p_user_id
       LIMIT 1),
      jsonb_build_object(
        'user_id', p_user_id,
        'total_xp', 0,
        'level', 1,
        'current_streak', 0,
        'longest_streak', 0,
        'last_activity', NULL
      )
    ) as gamification_data;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON FUNCTION get_dashboard_bundle(UUID) IS 
'Fetches all dashboard data in a single optimized query: chapters, user progress, and gamification stats';
