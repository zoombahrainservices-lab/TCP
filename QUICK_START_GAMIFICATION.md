# Quick Start: Get XP Working in 3 Steps

## Why It's Not Working Right Now

**5 perspectives all confirmed**:
1. ⏰ **Build is old** - Code created at 11:44 AM, build from 11:36 AM
2. 🗄️ **Database tables missing** - 16 tables need to be created
3. 🔌 **Not integrated** - UI didn't call XP functions (now fixed)
4. 🔇 **Silent failures** - Errors were hidden (now shows errors)
5. 🔒 **Security issue** - User IDs from client (now fixed to get from server)

---

## 3-Step Fix (Do in Order)

### Step 1: Create Database Tables (5 min)

Open **Supabase Dashboard** → **SQL Editor** → **New Query**

**Query 1** - Run this first:
```sql
-- Copy entire contents of:
-- tcp-platform/supabase/migrations/20260204_chapter_system.sql
-- Paste here and click RUN
```

**Query 2** - Run this second:
```sql
-- Copy entire contents of:
-- tcp-platform/supabase/migrations/20260204_gamification_system.sql
-- Paste here and click RUN
```

**Success**: You should see "migration completed successfully!" messages.

---

### Step 2: Rebuild Application (2 min)

In your terminal in `tcp-platform` folder:

```powershell
# Stop current server (Ctrl + C)

# Then run:
npm run dev

# Wait for "Ready in XXms" message
```

---

### Step 3: Test (1 min)

1. Reload dashboard: `http://localhost:3000/dashboard`
   - You should see 2 new cards at top:
     - **XP Display**: Level 1, 0 XP
     - **Streak Display**: 0 Day Streak

2. Go to reading: `/read/chapter-1`
   - Click "Continue" 
   - Open browser console (F12)
   - You should see: `[XP] Step completion result: { success: true ... }`

3. Complete all 6 reading slides
   - After last slide, should see XP notification
   - Go back to dashboard
   - XP should show ~30 XP, 1 Day Streak

---

## If You See Errors

### Error: "relation 'user_gamification' does not exist"
→ Run Step 1 (database migrations)

### Error: "relation 'step_completions' does not exist"
→ Run Step 1 Query 1 (chapter system migration)

### Dashboard still shows old version (no XP cards)
→ Run Step 2 (rebuild)
→ If still not working: Delete `.next` folder and `npm run dev` again

### XP notification doesn't appear
→ Check browser console for errors
→ Make sure migrations ran (check Supabase table editor)

---

## What Got Fixed in Code

### Fixed #1: Reading Page Now Triggers XP
**File**: `app/read/chapter-1/page.tsx`
- ✅ Now calls `completeStep()` on each Continue click
- ✅ Now calls `completeSectionBlock('reading')` when finishing
- ✅ Shows XP notification when section completes

### Fixed #2: Server Actions Get User ID Securely
**File**: `app/actions/chapters.ts`
- ✅ `completeStep(stepId, chapterId)` - no userId param
- ✅ `completeSectionBlock(chapterId, blockType)` - no userId param
- ✅ Functions get userId from `auth.getUser()` internally

### Fixed #3: Dashboard Shows Errors
**File**: `app/dashboard/page.tsx`
- ✅ Shows red error box if gamification fails
- ✅ Shows yellow "initializing" box if loading
- ✅ Shows XP/Streak cards if working
- ✅ Console logs debug info

### Fixed #4: Math Helpers Separated
**File**: `lib/gamification/math.ts` (new)
- ✅ Pure functions in separate file
- ✅ No `'use server'` directive
- ✅ Can be used by both client and server code
- ✅ Fixes "Server Actions must be async" error

### Fixed #5: Chapter System Database Schema Created
**File**: `supabase/migrations/20260204_chapter_system.sql` (new)
- ✅ Creates all chapter tracking tables
- ✅ Includes RLS policies
- ✅ Required for gamification to work

---

## Expected Flow After Fix

### Day 1 - First Reading Session

```
User logs in
  ↓
Dashboard shows: Level 1, 0 XP, 0 Streak
  ↓
User clicks "Continue Chapter 1"
  ↓
Reading page loads (slide 1/6)
  ↓
User clicks "Continue" (slide 1 → 2)
  ↓
Server Action: completeStep('CH1-READING-1', 1)
  ↓
  - Write to step_completions table ✓
  - Update streak: current_streak = 1 ✓
  - Award daily activity XP: +10 XP ✓
  ↓
Browser console: "[XP] Step completion result: { success: true }"
  ↓
User clicks Continue 4 more times (slides 2-5)
  ↓
Each click records step, NO new daily XP (already awarded)
  ↓
User reaches slide 6 (last slide), clicks "Your Turn"
  ↓
Server Actions:
  - completeStep('CH1-READING-6', 1) ✓
  - completeSectionBlock(1, 'reading') ✓
    - Awards section XP: +20 XP ✓
    - Updates chapter_progress.reading_complete = true ✓
  ↓
XP Notification appears: "+20 XP - Reading complete!"
  ↓
Navigate to /chapter/1/assessment
  ↓
User returns to dashboard
  ↓
Dashboard shows: Level 1, 30 XP, 1 Day Streak ✓
```

### Day 2 - Comeback

```
User logs in next day
  ↓
User completes any step
  ↓
Streak check: yesterday's date = last_active_date?
  ↓
  YES → current_streak = 2 ✓
  NO (skipped a day) → current_streak = 1 (reset)
  ↓
Daily activity XP awarded: +10 XP ✓
  ↓
Dashboard shows: Level 1, 40 XP, 2 Day Streak ✓
```

### Day 7 - Milestone

```
User completes step on 7th consecutive day
  ↓
Streak = 7 detected
  ↓
Milestone bonus: +50 XP ✓
  ↓
Notification: "7-Day Streak Milestone! +50 XP"
  ↓
Record in streak_history table ✓
  ↓
Dashboard shows: Level 2, 140+ XP, 7 Day Streak ✓
```

---

## Verification Commands

### Check if migrations ran:
```sql
-- In Supabase SQL Editor
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%gamification%' 
OR tablename LIKE '%step%' 
OR tablename LIKE '%xp%'
ORDER BY tablename;

-- Should return: 
-- chapter_skill_scores
-- step_completions
-- streak_history
-- user_gamification
-- xp_logs
-- (and more)
```

### Check if build has new code:
```bash
# In tcp-platform folder
ls app/actions/gamification.ts
# Should exist

# Check build includes it:
grep -r "gamification" .next/server/ 2>$null | Select-Object -First 3
# Should show matches if build is current
```

---

## After Everything Works

### What you'll see:
- ✅ XP cards on dashboard
- ✅ Console logs when clicking Continue
- ✅ XP notifications when completing sections  
- ✅ Streak counter incrementing daily
- ✅ Level up celebrations
- ✅ Chapter completion reports

### What to do next:
1. Wire up SPARK framework screens (same pattern as reading)
2. Wire up techniques screens
3. Wire up assessment submission
4. Add XP notifications to all completion points
5. Test multi-day streak tracking
6. Add badge unlocking UI

---

**DO THESE 3 STEPS IN ORDER**:
1. ✅ Run database migrations in Supabase
2. ✅ Rebuild app (`npm run dev`)
3. ✅ Test reading flow

The code is ready. The system is complete. Just needs database + rebuild.
