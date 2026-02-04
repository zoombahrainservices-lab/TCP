# XP "Failed to Record Step Completion" – Analysis & Streak System

## 5-Angle Analysis of the Failure

### Angle 1: Missing Database Table (Most Likely)
**Symptom**: `[XP] Step completion result: {error: 'Failed to record step completion'}`

**Cause**: The `step_completions` table does not exist. The plan identified: *"Could not find the table 'public.step_completions'"*.

**Why**: You ran only the gamification migration (`20260204_gamification_system.sql`), not the chapter system migration (`20260204_chapter_system.sql`). The chapter migration creates `step_completions`, `chapter_progress`, `chapter_sessions`, etc.

**Fix**: Run `supabase/migrations/20260204_chapter_system.sql` in Supabase SQL Editor. See `RUN_CHAPTER_MIGRATION.md`.

---

### Angle 2: Supabase Error Surfacing
**Symptom**: Generic error with no specifics.

**Cause**: The server action returned only `"Failed to record step completion"` and hid the real Supabase error.

**Fix**: The code now returns `details` and `code`. Check the browser console for:
```
[XP] Error details: <actual Supabase message> Code: <error code>
[XP] FIX: Run supabase/migrations/20260204_chapter_system.sql in Supabase SQL Editor
```

---

### Angle 3: Service Role Key
**Symptom**: Auth or permission failures.

**Cause**: `SUPABASE_SERVICE_ROLE_KEY` missing or wrong in `.env.local`. The admin client uses this to bypass RLS.

**Check**: `.env.local` must have:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

### Angle 4: Auth / Session
**Symptom**: `{error: 'Not authenticated'}` instead of step completion error.

**Cause**: User not logged in or session expired.

**Fix**: Log out and log back in. Ensure cookies are enabled.

---

### Angle 5: RLS Policies
**Cause**: Using anon key instead of service role could cause RLS to block inserts.

**Note**: The code uses `createAdminClient()` (service role), which bypasses RLS. This is correct.

---

## How the Streak System Works

### Core Logic (`updateStreak` in `app/actions/gamification.ts`)

1. **First activity of the day**  
   - If `last_active_date !== today`:  
     - If `last_active_date === yesterday` → streak continues (`current_streak += 1`)
     - Else → streak resets to 1
   - `last_active_date` is set to today.

2. **Already active today**  
   - If `last_active_date === today`: no change. No extra daily XP.

3. **Milestone bonuses**  
   - Streak lengths 3, 7, 30, 100 give bonus XP:
     - 3 days: +20 XP  
     - 7 days: +50 XP  
     - 30 days: +200 XP  
     - 100 days: +500 XP  

### Streak multipliers (from `lib/gamification/math.ts`)

Used for `daily_activity` and `section_completion` XP:

| Streak | Multiplier | Example (10 XP base) |
|--------|------------|----------------------|
| 0–4 days | 1.0x | 10 XP |
| 5–9 days | 1.2x | 12 XP |
| 10–19 days | 1.5x | 15 XP |
| 20+ days | 2.0x | 20 XP |

### Data Flow

1. `completeStep()` → inserts into `step_completions`.
2. `completeStep()` → calls `updateStreak(userId)`:
   - Reads `user_gamification`
   - Compares `last_active_date` with today and yesterday
   - Updates `current_streak`, `longest_streak`, `last_active_date`
   - Awards milestone bonus XP if applicable
3. `completeStep()` → calls `awardXP(userId, 'daily_activity', 10)` if streak continued or streak is 1.
4. `awardXP()` uses `getStreakMultiplier(current_streak)` for the XP amount.

### Tables

- **`user_gamification`**: `current_streak`, `longest_streak`, `last_active_date`
- **`streak_history`**: Milestone events (3, 7, 30, 100 days)
