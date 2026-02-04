# XP & Gamification System - Setup Instructions

## Problem Analysis (5 Perspectives)

### 1. **Build Perspective**
- **Issue**: Your gamification code was created at **11:44 AM**
- **Build time**: Last build was at **11:36 AM** (8 minutes BEFORE the code existed)
- **Result**: `npm start` is serving old code that doesn't include any gamification logic
- **Evidence**: Timeline proves new code isn't in the running app

### 2. **Database Schema Perspective**
- **Issue**: Required tables don't exist in Supabase
- **Missing gamification tables**: user_gamification, xp_logs, chapter_skill_scores, streak_history, badges, user_badges
- **Missing chapter tables**: chapter_sessions, step_completions, chapter_progress, assessments, artifacts, commitments, routines, plans, etc.
- **Result**: Even if code ran, database queries would fail
- **Evidence**: fresh_schema.sql only has `profiles` table

### 3. **Integration Perspective**
- **Issue**: UI components never called gamification functions (until now)
- **Before fix**: Reading page only did `router.push()` with no database interaction
- **Now fixed**: Reading page now calls `completeStep()` and `completeSectionBlock()`
- **Result**: XP will now be awarded when user completes reading
- **Evidence**: Grep search showed zero matches for gamification function calls in UI

### 4. **Error Handling Perspective**
- **Issue**: Dashboard silently hid errors with `{gamificationData && ...}`
- **Before**: If `getGamificationData` failed, nothing showed (no error, no widget)
- **Now fixed**: Dashboard shows error messages when tables are missing
- **Result**: You'll now see exactly what's wrong instead of blank space
- **Evidence**: No error logs despite missing data = silent failure

### 5. **Server Action Perspective**
- **Issue**: Functions required `userId` parameter but UI couldn't pass it securely
- **Before**: Functions expected `userId` to be passed from client (insecure)
- **Now fixed**: Functions get `userId` internally via `auth.getUser()` (secure)
- **Result**: Client just calls `completeStep(stepId, chapterId)` without exposing user ID
- **Evidence**: Server actions should never trust client-provided user IDs

---

## What You Need to Do (In Order)

### Step 1: Run Database Migrations in Supabase

You have **TWO** migration files that need to be run **in order**:

#### 1A. Chapter System Migration (Run First)
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy the **entire contents** of:
   ```
   supabase/migrations/20260204_chapter_system.sql
   ```
5. Paste into SQL editor
6. Click **Run**
7. You should see:
   ```
   Chapter system migration completed successfully!
   sessions_count | steps_count | progress_count | assessments_count
   0             | 0           | 0              | 0
   ```

#### 1B. Gamification System Migration (Run Second)
1. Still in Supabase SQL Editor
2. Create another new query
3. Copy the **entire contents** of:
   ```
   supabase/migrations/20260204_gamification_system.sql
   ```
4. Paste into SQL editor
5. Click **Run**
6. You should see:
   ```
   Gamification system migration completed successfully!
   user_gamification_count | xp_logs_count | skill_scores_count | badges_count
   0                       | 0             | 0                  | 9
   ```

**Why this order matters**: The gamification system references user data, so chapter tables should exist first.

---

### Step 2: Rebuild Your Application

The code changes won't appear until you rebuild:

```bash
# In tcp-platform folder

# Stop the current server (Ctrl + C in the terminal)

# Option A: Development mode (recommended for testing)
npm run dev

# Option B: Production mode (if you prefer)
npm run build
npm start
```

**What this does**:
- Compiles all the new gamification code
- Includes the XP display, streak tracking, and server actions
- Makes the code changes actually run

---

### Step 3: Test the System

Once rebuilt and migrations are run:

1. **Reload Dashboard** (`http://localhost:3000/dashboard`)
   - You should now see:
     - **XP Display** card (Level 1, 0 XP)
     - **Streak Display** card (0 Day Streak)
   - If you see an error message instead, copy it and we'll fix it

2. **Complete a Reading Step**
   - Go to Chapter 1 reading
   - Click "Continue" on any slide
   - **Check browser console** (`F12` → Console tab)
   - You should see: `[XP] Step completion result: { success: true, ... }`

3. **Finish Reading Section**
   - Complete all 6 reading slides
   - You should see an XP notification appear
   - Go back to dashboard
   - XP should now show ~30-40 XP and Level 1

4. **Check Streak**
   - Come back tomorrow
   - Complete another step
   - Streak should show "1 Day Streak" → "2 Day Streak"

---

### Step 4: Verify Database Records

After completing reading, check Supabase:

```sql
-- Check your user's gamification data
SELECT * FROM user_gamification 
WHERE user_id = 'your-user-id';
-- Should show: total_xp > 0, current_streak >= 1

-- Check XP logs
SELECT * FROM xp_logs 
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;
-- Should show entries for 'daily_activity' and 'section_completion'

-- Check step completions
SELECT * FROM step_completions 
WHERE user_id = 'your-user-id'
ORDER BY completed_at DESC
LIMIT 10;
-- Should show CH1-READING-1, CH1-READING-2, etc.
```

---

## Common Issues & Solutions

### Issue: "relation 'user_gamification' does not exist"
**Cause**: Gamification migration not run
**Fix**: Run Step 1B above

### Issue: "relation 'step_completions' does not exist"
**Cause**: Chapter system migration not run
**Fix**: Run Step 1A above

### Issue: XP widgets still don't appear on dashboard
**Cause**: Old build still running
**Fix**: 
1. Stop server (Ctrl + C)
2. Delete `.next` folder
3. Run `npm run dev`

### Issue: Console shows "Not authenticated" error
**Cause**: Session expired or auth cookies issue
**Fix**: Log out and log back in

### Issue: XP is awarded but not updating in dashboard
**Cause**: Dashboard caching
**Fix**: Hard reload browser (Ctrl + Shift + R)

---

## What Was Fixed in the Code

1. **Created chapter system migration** (`20260204_chapter_system.sql`)
   - All tables for tracking steps, progress, assessments, artifacts, etc.

2. **Server actions now get userId internally**
   - `completeStep(stepId, chapterId)` - no userId needed
   - `completeSectionBlock(chapterId, blockType)` - no userId needed
   - More secure (client can't fake user ID)

3. **Reading page now triggers XP**
   - Each "Continue" click calls `completeStep()`
   - Finishing reading calls `completeSectionBlock('reading')`
   - XP notification appears when section completes

4. **Dashboard shows errors instead of hiding them**
   - If gamification fails, you see red error box with details
   - If loading, you see yellow "initializing" box
   - If working, you see XP and streak cards

5. **Console logging added**
   - Browser console: `[XP] Step completion result: ...`
   - Server logs: User ID, gamification data, errors

---

## Expected XP Flow (After Setup)

**First time user completes reading:**

1. User clicks "Continue" on slide 1
   - `completeStep('CH1-READING-1', 1)` called
   - Streak updated: `current_streak = 1`
   - Daily activity XP awarded: **+10 XP**
   - Record in `step_completions` table

2. User clicks "Continue" on slide 2-5
   - Each calls `completeStep('CH1-READING-X', 1)`
   - NO additional daily XP (already awarded today)
   - Records in `step_completions` table

3. User finishes slide 6 (last reading slide)
   - `completeStep('CH1-READING-6', 1)` called
   - `completeSectionBlock(1, 'reading')` called
   - Section completion XP awarded: **+20 XP** (with streak multiplier if applicable)
   - `chapter_progress.reading_complete = true`
   - XP notification appears
   - Router navigates to `/chapter/1/assessment`

4. User returns to dashboard
   - XP Display shows: **Level 1, 30 XP**
   - Streak Display shows: **1 Day Streak**
   - Progress bar updated

**Next day:**
- User completes any step
- Streak continues: `current_streak = 2`
- Daily XP with 1.0x multiplier (streak < 5): **+10 XP**

**Day 5:**
- Streak = 5
- Daily XP with 1.2x multiplier: **+12 XP**

**Day 7:**
- Streak = 7
- Milestone bonus: **+50 XP**
- Notification shows "7-Day Streak Milestone!"

---

## Verification Checklist

After completing all steps, verify:

- [ ] Both migrations ran successfully in Supabase
- [ ] `npm run dev` or rebuild completed without errors
- [ ] Dashboard loads without errors
- [ ] XP Display and Streak Display cards visible on dashboard
- [ ] Browser console shows `[XP] Step completion result` when clicking Continue in reading
- [ ] XP number increases after completing reading section
- [ ] Streak shows "1 Day Streak" after first activity
- [ ] Supabase tables contain data (user_gamification, xp_logs, step_completions)

---

## If Still Not Working

If after completing all steps above it still doesn't work:

1. **Check browser console (F12)** for errors - copy the full error
2. **Check server terminal** for errors - copy any red errors
3. **Check Supabase logs** - look for failed queries
4. **Provide these to continue debugging**

The 5-perspective analysis confirms the issue is:
- ❌ Missing database tables (both migrations)
- ❌ Old build running (rebuild needed)
- ✅ Integration now wired up (fixed in code)
- ✅ Error handling now visible (fixed in code)

Once you run the migrations and rebuild, XP should start working immediately.

---

**Last Updated**: 2026-02-04 11:54 AM
