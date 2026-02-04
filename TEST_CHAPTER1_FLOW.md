# Test Chapter 1 Flow - XP Verification

## Prerequisites

1. ✅ Chapter system migration has been run in Supabase
2. ✅ App is running: `npm run dev`
3. ✅ You are logged in

## Expected XP: ~180 Total

| Section        | XP Awarded | Cumulative |
|----------------|------------|------------|
| Reading        | +30 (10 daily + 20 section) | 30   |
| Assessment     | +20        | 50         |
| Framework      | +20        | 70         |
| Techniques     | +20        | 90         |
| Resolution     | +20        | 110        |
| Follow-through | +70 (20 + 50 chapter) | 180  |

## Testing Steps

### 1. Reading Section
- **Path**: `/read/chapter-1` or dashboard → Chapter 1 → Start
- **Action**: Click "Continue" through all 6 slides
- **Verify**: XP notification appears at end; dashboard shows ~30 XP

### 2. Self-Check Assessment
- **Path**: `/chapter/1/assessment`
- **Action**: Answer questions, click "Continue to Framework"
- **Verify**: XP notification; dashboard shows ~50 XP

### 3. Framework
- **Path**: `/read/chapter-1/framework`
- **Action**: Go through framework slides, click through to end
- **Verify**: XP notification; dashboard shows ~70 XP

### 4. Techniques
- **Path**: `/read/chapter-1/techniques`
- **Action**: Complete all technique slides
- **Verify**: XP notification; dashboard shows ~90 XP

### 5. Resolution/Proof
- **Path**: `/chapter/1/proof`
- **Action**: Add proof entries, click "Save & Continue"
- **Verify**: XP notification; dashboard shows ~110 XP

### 6. Follow-through
- **Path**: `/chapter/1/follow-through` (redirects to `/read/chapter-1/follow-through`)
- **Action**: Complete follow-through, click final continue
- **Verify**: XP notification; dashboard shows ~180 XP, Level 2

## Verification Queries

After completing the flow, run `scripts/verify_xp_tables.sql` in Supabase (replace `YOUR_USER_ID` with your user ID from Auth dashboard).

Expected:
- `xp_logs`: 7+ entries
- `chapter_progress`: All sections `TRUE`, `chapter_complete = TRUE`
- `user_gamification`: `total_xp` ≈ 180, `level` = 2
