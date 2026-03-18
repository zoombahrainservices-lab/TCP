# ⚠️ URGENT: FIX FOR "CHANGES NOT SAVING" ISSUE

## 🔍 What's Wrong?

**Your changes ARE saving to the database** ✅  
**BUT users don't see them because the `site_settings` table doesn't exist** ❌

## 🚀 IMMEDIATE FIX (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: `qwunorikhvsckdagkfao`
3. Click **SQL Editor** in left sidebar

### Step 2: Run This SQL

Click **"+ New Query"**, paste this ENTIRE block, and click **Run**:

```sql
-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Insert defaults
INSERT INTO site_settings (key, value, description)
VALUES (
  'self_check_defaults',
  '{"intro":{"title":"Self-Check","subtitle":"Take a quick snapshot of where you are in this chapter.","body1":"This check is just for you. Answer based on how things feel right now, not how you wish they were.","body2":"It''s not a test or a grade. It''s a baseline for this chapter so you can see your progress as you move through the lessons.","highlightTitle":"You''ll rate 5 statements from 1 to 7.","highlightBody":"Takes about a minute. Your score shows which zone you''re in and what to focus on next.","styles":{"titleColor":"#111827","titleSize":"5xl","subtitleColor":"#6b7280","bodyBgColor":"#ffffff","bodyTextColor":"#1f2937","highlightBgColor":"#fef3c7","highlightBorderColor":"#f59e0b","highlightTextColor":"#111827","buttonBgColor":"#f7b418","buttonHoverColor":"#e5a309","buttonTextColor":"#000000"}},"result":{"title":"Self-Check Results","subtitle":"This is your starting point for this chapter—not your ending point.","styles":{"titleColor":"#111827","subtitleColor":"#6b7280","scoreBgColor":"#ffffff","scoreTextColor":"#111827","explanationBgColor":"#fef3c7","explanationTextColor":"#111827","buttonBgColor":"#ff6a38","buttonHoverColor":"#e55a28","buttonTextColor":"#ffffff"}}}'::jsonb,
  'Default self-check intro and result page configuration (text and styles)'
)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read
DROP POLICY IF EXISTS "Public read access to site_settings" ON public.site_settings;
CREATE POLICY "Public read access to site_settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Admin write only
DROP POLICY IF EXISTS "Admin write access to site_settings" ON public.site_settings;
CREATE POLICY "Admin write access to site_settings"
  ON public.site_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid()
      AND public.profiles.role = 'admin'
    )
  );
```

### Step 3: Verify It Worked

In the same SQL Editor, run:

```sql
SELECT * FROM site_settings WHERE key = 'self_check_defaults';
```

**Expected:** You should see 1 row with all the default configuration.

### Step 4: Test It

1. **Restart your dev server** (stop and run `npm run dev` again)
2. Visit: http://localhost:3000/read/chapter-7/assessment
3. **Hard refresh:** Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. You should now see your customized text/colors!

---

## ✅ Verification Checklist

After running SQL:

- [ ] Table `site_settings` exists in Table Editor
- [ ] Row with key `self_check_defaults` exists
- [ ] Dev server restarted
- [ ] Browser hard-refreshed
- [ ] Chapter 7 self-check shows your changes
- [ ] Admin changes persist after refresh

---

## 🎯 What This Fixed

| Before | After |
|--------|-------|
| ❌ Changes disappear after refresh | ✅ Changes persist |
| ❌ User sees old defaults | ✅ User sees your customizations |
| ❌ API falls back to hardcoded values | ✅ API reads from database |
| ✅ Admin saves successfully | ✅ Admin saves successfully |

---

## 🔧 Optional: Run Automated Verification

After SQL is run, verify everything works:

```bash
cd tcp-platform
npm run verify:self-check
```

Expected output:
```
✅ Table exists
✅ Defaults exist  
✅ API works!
🎉 All checks passed!
```

---

## 📍 Next Steps After Fix

1. **Edit Global Defaults:**
   - Visit `/admin/self-check-defaults`
   - Change colors, text as needed
   - Click "Save Changes"
   - All chapters will use these defaults

2. **Override Specific Chapters:**
   - Go to chapter admin
   - Edit "Self-Check Intro" page
   - Expand "Custom Styling"
   - Set colors for just that chapter

3. **Test:**
   - Visit `/read/chapter-N/assessment`
   - Verify your colors show up
   - Try different chapters

---

## 💡 Why This Happened

The self-check customization system was added but requires a database table. The code was deployed but the database migration wasn't run yet. That's why:

1. ✅ Admin UI worked (uses `step_pages` table which already exists)
2. ✅ Saves worked (writes to `step_pages` successfully)
3. ❌ Users didn't see changes (API couldn't find `site_settings` table)

Now that the table exists, everything works end-to-end!

---

## 🆘 Still Not Working?

If after running the SQL you still don't see changes:

1. **Check browser console** for errors (F12 → Console tab)
2. **Verify API works:** Visit `http://localhost:3000/api/chapter/7/self-check-copy`
   - Should return JSON with `intro` and `result` objects
3. **Clear browser cache:** Settings → Privacy → Clear browsing data
4. **Restart dev server:** Stop (Ctrl+C) and run `npm run dev` again

Still stuck? Check `TROUBLESHOOTING_CHANGES_NOT_SAVING.md` for detailed diagnostics.

---

**Status:** ✅ FIXED after running SQL migration  
**Time to fix:** ~5 minutes  
**One-time operation:** Yes (migration only needs to run once)
