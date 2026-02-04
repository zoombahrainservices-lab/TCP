# Run Chapter System Migration - Required for XP

## Why This Is Needed

The plan identified: **"Could not find the table 'public.step_completions'"**

- ✅ Gamification tables exist (`user_gamification`) – dashboard shows Level 1, 0 XP
- ❌ Chapter system tables are **missing** (`step_completions`, `chapter_progress`, etc.)
- **You ran only the gamification migration** – the chapter system migration was never run

**Without this migration, all XP tracking will fail** with "table not found" errors.

---

## Steps to Run the Migration

### 1. Open Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your project
3. Click **SQL Editor** in the left sidebar

### 2. Run the Chapter System Migration

1. Click **+ New query**
2. Open this file in your project:
   ```
   tcp-platform/supabase/migrations/20260204_chapter_system.sql
   ```
3. Copy the **entire contents** of the file
4. Paste into the Supabase SQL Editor
5. Click **Run** (or press Ctrl+Enter)

### 3. Verify Success

You should see output similar to:

```
status
-------------------------------------------
Chapter system migration completed successfully!

sessions_count | steps_count | progress_count | assessments_count
0              | 0           | 0              | 0
```

### 4. Rebuild the App (if not already running)

```bash
cd tcp-platform
npm run dev
```

---

## Tables Created by This Migration

- `chapter_sessions` – chapter journey tracking
- `step_completions` – every screen/step (required for XP)
- `chapter_progress` – section completion (reading, assessment, framework, etc.)
- `assessments` – baseline & after assessments
- `artifacts` – SPARK outputs & toolbox items
- `commitments`, `routines`, `plans`, `plan_tasks`
- `recovery_tools`, `scripts`, `weekly_focus`

---

## After Running

Once the migration completes successfully:

1. **Restart your dev server** if it was running
2. **Complete the Chapter 1 flow** to earn ~180 XP
3. **Verify in Supabase** using `scripts/verify_xp_tables.sql`
