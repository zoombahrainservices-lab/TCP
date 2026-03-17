-- ⚡ RUN THIS SQL IN SUPABASE DASHBOARD ⚡
-- Link: https://supabase.com/dashboard/project/qwunorikhvsckdagkfao/sql/new
--
-- Instructions:
-- 1. Click the link above
-- 2. Copy this ENTIRE file
-- 3. Paste into SQL Editor
-- 4. Click "Run" button
-- 5. Should see "Success. No rows returned"
-- 6. Restart dev server
-- 7. Hard refresh browser
-- 8. Visit /read/chapter-7/assessment
-- 9. ✅ Your changes will now show!

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

INSERT INTO site_settings (key, value, description)
VALUES (
  'self_check_defaults',
  '{"intro":{"title":"Self-Check","subtitle":"Take a quick snapshot of where you are in this chapter.","body1":"This check is just for you. Answer based on how things feel right now, not how you wish they were.","body2":"It''s not a test or a grade. It''s a baseline for this chapter so you can see your progress as you move through the lessons.","highlightTitle":"You''ll rate 5 statements from 1 to 7.","highlightBody":"Takes about a minute. Your score shows which zone you''re in and what to focus on next.","styles":{"titleColor":"#111827","titleSize":"5xl","subtitleColor":"#6b7280","bodyBgColor":"#ffffff","bodyTextColor":"#1f2937","highlightBgColor":"#fef3c7","highlightBorderColor":"#f59e0b","highlightTextColor":"#111827","buttonBgColor":"#f7b418","buttonHoverColor":"#e5a309","buttonTextColor":"#000000"}},"result":{"title":"Self-Check Results","subtitle":"This is your starting point for this chapter—not your ending point.","styles":{"titleColor":"#111827","subtitleColor":"#6b7280","scoreBgColor":"#ffffff","scoreTextColor":"#111827","explanationBgColor":"#fef3c7","explanationTextColor":"#111827","buttonBgColor":"#ff6a38","buttonHoverColor":"#e55a28","buttonTextColor":"#ffffff"}}}'::jsonb,
  'Default self-check intro and result page configuration (text and styles)'
)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public read access to site_settings"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Admin write access to site_settings"
  ON site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ✅ After running, verify with:
-- SELECT * FROM site_settings WHERE key = 'self_check_defaults';
