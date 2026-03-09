-- Optional: run in Supabase SQL Editor to enable Page Title Style (color, size, weight) in admin.
-- step_pages.title_style is JSONB: { "color": "#2a2416", "fontSize": "lg", "fontWeight": "bold" }

ALTER TABLE step_pages
ADD COLUMN IF NOT EXISTS title_style jsonb DEFAULT NULL;

COMMENT ON COLUMN step_pages.title_style IS 'Optional style for the page title heading: color (hex), fontSize (sm|md|lg|xl), fontWeight (normal|semibold|bold)';
