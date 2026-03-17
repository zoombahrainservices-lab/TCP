-- Migration: Add questionsTitle and questionsSubtitle to self_check_defaults
-- This updates the existing site_settings record to include the new fields

BEGIN;

-- Update the self_check_defaults to include questionsTitle and questionsSubtitle
UPDATE public.site_settings
SET 
  value = jsonb_set(
    jsonb_set(
      value,
      '{intro,questionsTitle}',
      '"Chapter X Self-Check"'
    ),
    '{intro,questionsSubtitle}',
    '"Rate each statement from 1 to 7. Be honest—only you see this."'
  ),
  updated_at = now()
WHERE key = 'self_check_defaults';

COMMIT;
