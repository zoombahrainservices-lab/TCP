# Content migration plan

## Existing tables (your DB)

From your migrations, you already have:

| Table | Source | Notes |
|-------|--------|--------|
| **profiles** | fresh_schema.sql or Supabase Auth | Columns: id, email, full_name, avatar_url, created_at, updated_at. **No `role` column.** |
| chapter_sessions | 20260204_chapter_system | user_id, chapter_id (integer) |
| step_completions | 20260204_chapter_system | user_id, step_id (text) |
| chapter_progress | 20260204_chapter_system | user_id, chapter_id (integer), reading_complete, etc. |
| assessments | 20260204_chapter_system | user_id, chapter_id, kind, responses, score, band |
| artifacts | 20260204_chapter_system | user_id, chapter_id, type, data |
| commitments, routines, plans, plan_tasks | 20260204_chapter_system | |
| recovery_tools, scripts, weekly_focus | 20260204_chapter_system | |
| user_gamification | 20260204_gamification_system | total_xp, level, streaks |
| xp_logs | 20260204_gamification_system | |
| chapter_skill_scores | 20260204_gamification_system | |
| badges, user_badges | 20260204_gamification_system | |
| streak_history | 20260204_gamification_system | |

## What the content migration does

1. **Adds `profiles.role`** if missing (default `'student'`). Required for RLS policies that check admin.
2. **Creates new tables:** parts, chapters, chapter_steps, step_pages.
3. **Optionally** adds column step_completions.page_id if step_completions exists.
4. **Inserts seed data:** 3 parts, Chapter 1 + 6 steps, Chapter 2 + 6 steps.

## Dependencies

- **profiles** must exist (it does from Auth/fresh_schema). We add `role` if not present.
- **step_completions** is optional; we only alter it if it exists.
- No other existing tables are modified.

## Run order

1. Run **one** script: `FULL_CONTENT_MIGRATION.sql` (copy entire file into Supabase SQL Editor, run once).

## After migration

- To make a user an admin:  
  `UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';`
- New users get `role = 'student'` by default.
