# Complete XP Fix - Your Action Checklist

Follow these 3 steps in order. The dev server is already running.

---

## Step 1: Run Chapter System Migration (Required First)

**Without this, XP will not work** – the `step_completions` table is missing.

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Click **+ New query**
3. Copy the entire contents of: `supabase/migrations/20260204_chapter_system.sql`
4. Paste and click **Run**
5. Confirm you see: `Chapter system migration completed successfully!`

Full details: [RUN_CHAPTER_MIGRATION.md](RUN_CHAPTER_MIGRATION.md)

---

## Step 2: Test the Chapter 1 Flow

With the dev server running (`npm run dev`), go through:

1. **Reading** → `/read/chapter-1` – complete all 6 slides
2. **Assessment** → `/chapter/1/assessment` – answer, continue to framework
3. **Framework** → `/read/chapter-1/framework` – complete, continue to techniques
4. **Techniques** → `/read/chapter-1/techniques` – complete, continue to proof
5. **Proof** → `/chapter/1/proof` – add proof, Save & Continue
6. **Follow-through** → complete, continue to dashboard

**Expected**: ~180 XP total, Level 2, XP notifications at each section

Full details: [TEST_CHAPTER1_FLOW.md](TEST_CHAPTER1_FLOW.md)

---

## Step 3: Verify Database Records

After completing the flow:

1. Supabase → **SQL Editor**
2. Get your user ID: `SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;`
3. Open `scripts/verify_xp_tables.sql`
4. Replace `YOUR_USER_ID` with your ID (including quotes)
5. Run the script

**Expected**:
- `xp_logs`: 7+ entries
- `chapter_progress`: all sections `TRUE`, `chapter_complete = TRUE`
- `user_gamification`: `total_xp` ≈ 180, `level` = 2
