# 🚀 Quick Start: Questions Page Customization

## What Changed?

The questions page title and subtitle (the screen where users answer assessment questions) are now fully customizable!

## ⚡ Quick Setup (2 Minutes)

### Step 1: Update Database
Pick ONE option:

**Option A - Easy (No SQL):**
1. Go to `/admin/self-check-defaults`
2. Fill in the "Questions Page" fields
3. Click "Save Changes"
4. Done! ✅

**Option B - Fast (SQL):**
```sql
UPDATE public.site_settings
SET 
  value = jsonb_set(
    jsonb_set(value, '{intro,questionsTitle}', '"Chapter X Self-Check"'),
    '{intro,questionsSubtitle}', '"Rate each statement from 1 to 7. Be honest—only you see this."'
  ),
  updated_at = now()
WHERE key = 'self_check_defaults';
```
Run in Supabase SQL Editor, done! ✅

### Step 2: Restart Server
```bash
# If your dev server is running:
npm run dev
```

### Step 3: Test It
1. Visit any chapter's self-check assessment
2. You should see the customized questions page title/subtitle
3. ✅ It works!

## 🎨 Where to Customize

### Global Defaults (All Chapters)
`/admin/self-check-defaults` → "Questions Page" section

### Per-Chapter Override
`/admin/chapters` → Select chapter → "Steps" → Edit "Self-Check Intro" page → "Questions Page (During Assessment)" section

## 📋 Default Values

If you're not sure what to enter, use these:

**Questions Page Title:**
```
Chapter X Self-Check
```
(The "X" will auto-populate with the chapter number)

**Questions Page Subtitle:**
```
Rate each statement from 1 to 7. Be honest—only you see this.
```

## 🔍 Verify It's Working

1. Open browser console (F12)
2. Visit a self-check assessment page
3. Look for: `[SelfCheck] Failed to load copy:` ❌ (should NOT see this)
4. If you see the custom title/subtitle → ✅ Working!

## 🎯 All Pages Now Customizable

- ✅ Intro Page (before questions)
- ✅ Questions Page (during assessment) **← NEW**
- ✅ Results Page (after completion)

## 📚 Full Documentation

- `QUESTIONS_PAGE_CUSTOMIZATION.md` - Detailed guide
- `IMPLEMENTATION_COMPLETE.md` - Technical details
- `READY_TO_USE.md` - Complete setup instructions

## 🆘 Troubleshooting

**Title still shows "Chapter N Self-Check" (generic)?**
- Database not updated yet → Apply Step 1 above
- Server not restarted → Restart dev server
- Hard refresh browser (Ctrl+Shift+R)

**Changes not appearing in admin UI?**
- Clear browser cache
- Check Network tab for 200 response on `/api/admin/site-settings/self-check-defaults`

**API errors in console?**
- Database migration not applied
- Run the SQL from Step 1, Option B

---

That's it! You're ready to customize your self-check questions pages. 🎉
