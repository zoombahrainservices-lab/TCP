# Complete XP System Setup Guide

## ✅ What's Been Fixed (Already Done)

All 6 sections have been wired up with XP tracking:

1. **Reading** ✅ - Awards +10 daily XP (first step) + +20 section XP
2. **Self-Check Assessment** ✅ - Awards +20 section XP + improvement XP
3. **Framework** ✅ - Awards +20 section XP
4. **Techniques** ✅ - Awards +20 section XP
5. **Resolution/Proof** ✅ - Awards +20 section XP
6. **Follow-through** ✅ - Awards +20 section XP + +50 chapter bonus

**Total for completing Chapter 1**: ~180 XP (→ Level 2)

---

## 🚨 CRITICAL: What You MUST Do Now

### Step 1: Run Database Migration (REQUIRED)

**The XP system will NOT work until you do this!**

Your server logs show:
```
Error: "Could not find the table 'public.step_completions'"
```

This means the chapter system tables don't exist yet.

#### How to Fix:

1. **Open Supabase Dashboard**
   - Go to your project at https://supabase.com/dashboard

2. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy & Run This Migration**
   - Open file: `tcp-platform/supabase/migrations/20260204_chapter_system.sql`
   - Copy the **entire contents** (all ~450 lines)
   - Paste into the SQL Editor
   - Click **RUN**

4. **Verify Success**
   - You should see: `"Chapter system migration completed successfully!"`
   - You should see a table with counts showing 0 (which is correct for new install)

#### What This Creates:

This migration creates these tables:
- `step_completions` - Tracks each step/slide completed
- `chapter_progress` - Tracks section completions (reading, assessment, etc.)
- `chapter_sessions` - Tracks when user starts/finishes chapters
- `assessments` - Stores self-check scores
- `artifacts` - Stores proof entries
- Plus 8 more supporting tables

**Without these tables, every XP action will fail with "table not found" error.**

---

### Step 2: Restart Your Dev Server (REQUIRED)

Your app is currently running the old build. You need to restart it:

```powershell
# In your terminal running npm start:
# 1. Press Ctrl + C to stop the server

# 2. Start dev server:
npm run dev

# 3. Wait for "Ready in X ms" message
```

**Why?** The code changes I made need to be compiled into the running app.

---

### Step 3: Test the Complete XP Flow

Once migration is run and server is restarted:

#### 3.1 Start Fresh
1. Go to `http://localhost:3000/dashboard`
2. You should see:
   - **XP Display**: Level 1, 0 XP (or current XP if you've done steps before)
   - **Streak Display**: Current streak number
3. Open browser console (F12 → Console tab)

#### 3.2 Complete Reading Section
1. Click "Continue Chapter 1"
2. Go through all 6 reading slides
3. Click "Continue" on each slide
4. **Check console**: Should see `[XP] Step completion result: { success: true }`
5. On last slide, you should see XP notification appear
6. Go back to dashboard
7. **Verify**: XP should now show ~30 XP (10 daily + 20 reading)

#### 3.3 Complete Self-Check Assessment
1. From dashboard, click "Continue Chapter 1" or go directly to `/chapter/1/assessment`
2. Click "Let's Begin"
3. Answer all 7 questions (move sliders)
4. Click "See My Score"
5. Click "Continue to Framework" (this now triggers XP)
6. **Check console**: Should see `[XP] Assessment submission result` and `[XP] Assessment section completion result`
7. Should see XP notification
8. Go back to dashboard
9. **Verify**: XP should now show ~50 XP

#### 3.4 Complete Framework
1. Go through all framework slides
2. On last slide, click "Continue"
3. **Check console**: Should see `[XP] Framework section completion result`
4. Should see "Framework Complete! +20 XP" notification
5. **Verify**: Dashboard shows ~70 XP

#### 3.5 Complete Techniques
1. Go through all technique slides
2. On last slide, click "Continue"
3. **Check console**: Should see `[XP] Techniques section completion result`
4. Should see "Techniques Complete! +20 XP" notification
5. **Verify**: Dashboard shows ~90 XP

#### 3.6 Complete Resolution
1. Go to Resolution page
2. Add at least one proof entry (optional: fill in title/notes)
3. Click "Save & Continue to Follow-through"
4. **Check console**: Should see `[XP] Resolution section completion result`
5. Should see "Resolution Complete! +20 XP" notification
6. **Verify**: Dashboard shows ~110 XP

#### 3.7 Complete Follow-through (FINAL)
1. Go through all follow-through slides
2. On last slide, click "Continue"
3. **Check console**: Should see TWO results:
   - `[XP] Follow-through section completion result`
   - `[XP] Chapter completion result`
4. Should see "Chapter 1 Complete! 🎉 +70 XP" notification
5. Redirected to dashboard
6. **FINAL VERIFY**: Dashboard should show:
   - **Level 2** (or Level 3 depending on streak)
   - **~180 XP** total
   - **1 Day Streak** (or higher if you had one already)

---

### Step 4: Verify Database Records

After completing the full flow, check your Supabase database:

#### 4.1 Check User Gamification
```sql
-- Run in Supabase SQL Editor
SELECT * FROM user_gamification 
WHERE user_id = 'a53e1b3b-36d8-45c9-a580-ffacfc0a84e7'
LIMIT 1;
```

**Expected result**:
- `total_xp`: ~180 (or higher with streak multipliers)
- `level`: 2 (or 3)
- `current_streak`: 1 (or higher)
- `last_active_date`: Today's date

#### 4.2 Check XP Logs
```sql
SELECT reason, amount, created_at 
FROM xp_logs 
WHERE user_id = 'a53e1b3b-36d8-45c9-a580-ffacfc0a84e7'
ORDER BY created_at DESC 
LIMIT 10;
```

**Expected result** (at least 7 entries):
1. `chapter_completion` - 50 XP
2. `section_completion` - 20 XP (follow-through)
3. `section_completion` - 20 XP (resolution)
4. `section_completion` - 20 XP (techniques)
5. `section_completion` - 20 XP (framework)
6. `section_completion` - 20 XP (assessment)
7. `section_completion` - 20 XP (reading)
8. `daily_activity` - 10 XP

#### 4.3 Check Chapter Progress
```sql
SELECT * FROM chapter_progress 
WHERE user_id = 'a53e1b3b-36d8-45c9-a580-ffacfc0a84e7'
AND chapter_id = 1
LIMIT 1;
```

**Expected result** (all should be TRUE):
- `reading_complete`: true
- `assessment_complete`: true
- `framework_complete`: true
- `techniques_complete`: true
- `proof_complete`: true
- `follow_through_complete`: true
- `chapter_complete`: true

#### 4.4 Check Step Completions
```sql
SELECT COUNT(*) as total_steps
FROM step_completions 
WHERE user_id = 'a53e1b3b-36d8-45c9-a580-ffacfc0a84e7';
```

**Expected result**: At least 6 (one for each reading slide)

---

## 🎯 Expected XP Breakdown

### First-Time Completion (No Streak)

| Action | XP Awarded | Running Total |
|--------|-----------|---------------|
| First step (daily activity) | +10 XP | 10 XP |
| Reading section complete | +20 XP | 30 XP |
| Assessment complete | +20 XP | 50 XP |
| Framework complete | +20 XP | 70 XP |
| Techniques complete | +20 XP | 90 XP |
| Resolution complete | +20 XP | 110 XP |
| Follow-through complete | +20 XP | 130 XP |
| Chapter 1 complete bonus | +50 XP | **180 XP** |

**Level**: 2 (Level 2 starts at 100 XP)

### With 5-Day Streak (1.2x Multiplier)

| Action | XP Awarded | Running Total |
|--------|-----------|---------------|
| First step (daily activity) | +12 XP | 12 XP |
| Reading section complete | +24 XP | 36 XP |
| Assessment complete | +24 XP | 60 XP |
| Framework complete | +24 XP | 84 XP |
| Techniques complete | +24 XP | 108 XP |
| Resolution complete | +24 XP | 132 XP |
| Follow-through complete | +24 XP | 156 XP |
| Chapter 1 complete bonus | +60 XP | **216 XP** |

**Level**: 2 (closer to Level 3 at 250 XP)

---

## 📊 How to Check If It's Working

### In Browser Console (F12)
Look for these log messages:
- `[XP] Step completion result: { success: true, ... }`
- `[XP] Assessment submission result: { success: true, ... }`
- `[XP] Framework section completion result: { success: true, ... }`
- `[XP] Chapter completion result: { success: true, ... }`

### Visual Confirmations
- XP notification toasts appear after each section
- Dashboard XP number increases after each section
- Level up animation when reaching Level 2
- Streak counter increments next day

### Server Logs
Check your terminal running `npm run dev`:
- Should NOT see "Could not find the table" errors
- Should see successful POST requests to `/read/chapter-1`, `/chapter/1/assessment`, etc.

---

## 🐛 Troubleshooting

### Issue: "Could not find the table 'step_completions'"
**Cause**: Migration not run
**Fix**: Go back to Step 1 and run the migration

### Issue: Console shows "[XP] Error: Not authenticated"
**Cause**: Session expired
**Fix**: Log out and log back in

### Issue: XP notification doesn't appear
**Cause**: `showXPNotification` function might not be imported correctly
**Check**: Open browser console (F12) - you should still see the log messages even if notification doesn't show

### Issue: Dashboard still shows 0 XP after completing reading
**Possible causes**:
1. Migration not run → Check server logs for "table not found" errors
2. Old build still running → Stop server (Ctrl+C) and run `npm run dev`
3. Database query failing → Check Supabase dashboard for any connection issues

### Issue: XP awarded but dashboard doesn't update
**Cause**: Browser cache
**Fix**: Hard reload (Ctrl + Shift + R) or close/reopen dashboard tab

---

## 📝 Summary Checklist

Before testing, make sure:

- [ ] ✅ Chapter system migration run in Supabase (`20260204_chapter_system.sql`)
- [ ] ✅ Gamification migration already run (tables exist, that's why dashboard shows Level 1, 0 XP)
- [ ] ✅ Dev server restarted with `npm run dev`
- [ ] ✅ Browser console open (F12) to see log messages
- [ ] ✅ Dashboard loads without errors

During testing, verify:

- [ ] Reading completion → +30 XP
- [ ] Assessment completion → +50 XP
- [ ] Framework completion → +70 XP
- [ ] Techniques completion → +90 XP
- [ ] Resolution completion → +110 XP
- [ ] Follow-through completion → +180 XP, Level 2
- [ ] XP notifications appear for each section
- [ ] Console shows success messages
- [ ] No errors in server terminal

After testing, verify in Supabase:

- [ ] `user_gamification` table shows ~180 XP, Level 2, streak ≥1
- [ ] `xp_logs` table has at least 7 entries
- [ ] `chapter_progress` table shows all sections complete
- [ ] `step_completions` table has entries for each slide

---

## 🎉 Success Criteria

You'll know the system is working correctly when:

1. ✅ Complete all 6 sections without errors
2. ✅ Dashboard shows **Level 2, ~180 XP**
3. ✅ Each section completion triggered an XP notification
4. ✅ Browser console shows success messages for all actions
5. ✅ Supabase tables contain all the expected data
6. ✅ No "table not found" errors in server logs
7. ✅ Come back tomorrow, complete a step, see streak increment

---

**Last Updated**: 2026-02-04
**Status**: Code complete, awaiting user migration + testing
