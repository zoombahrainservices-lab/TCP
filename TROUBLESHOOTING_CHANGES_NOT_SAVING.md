# TROUBLESHOOTING: Changes Not Saving

## 🔍 ROOT CAUSE ANALYSIS

After systematic investigation, the issue was identified:

**THE DATABASE MIGRATION WAS NOT RUN** ❌

### Evidence Chain:
1. ✅ Admin can edit and save pages (POST requests succeed)
2. ✅ User can visit self-check pages
3. ✅ API `/api/chapter/7/self-check-copy` is being called
4. ❌ BUT: `site_settings` table doesn't exist
5. ❌ API falls back to hardcoded defaults
6. ❌ Changes in admin aren't reflected to users

---

## ✅ SOLUTION: Run the Migration

### Method 1: Automatic (Recommended)

```bash
cd tcp-platform
npm run setup:self-check
```

This will:
- Create `site_settings` table
- Insert default configuration
- Verify installation
- Show next steps

### Method 2: Manual (If automatic fails)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy entire contents of `RUN_THIS_MIGRATION.sql`
4. Paste and click **Run**
5. Verify table created:
   ```sql
   SELECT * FROM site_settings WHERE key = 'self_check_defaults';
   ```

---

## ✅ VERIFICATION

After running migration, verify it worked:

```bash
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

## 🐛 Symptom vs. Root Cause

| Symptom | What It Means | Root Cause |
|---------|---------------|------------|
| Changes disappear after refresh | Not saving to DB | ❌ Migration not run |
| User sees old defaults | API fallback active | ❌ Migration not run |
| Admin saves successfully | step_pages works | ✅ Normal (but migration still needed) |
| No toast error in admin | Frontend works | ✅ Normal |

---

## 📊 How to Diagnose Future Issues

### Check 1: Does table exist?

**Supabase Dashboard → Table Editor → Look for `site_settings`**

- ❌ Not listed → Run migration
- ✅ Listed → Continue to Check 2

### Check 2: Does default data exist?

**SQL Editor:**
```sql
SELECT * FROM site_settings WHERE key = 'self_check_defaults';
```

- Returns 0 rows → Run: `npm run setup:self-check`
- Returns 1 row → Continue to Check 3

### Check 3: Is API working?

**Visit (while dev server running):**
```
http://localhost:3000/api/chapter/7/self-check-copy
```

**Expected JSON:**
```json
{
  "success": true,
  "intro": { "title": "Self-Check", "styles": {...} },
  "result": { "title": "Self-Check Results", "styles": {...} },
  "hasOverride": false
}
```

- `intro` and `result` have data → ✅ Working
- Returns error or null → ❌ Problem with API

### Check 4: Is admin saving?

**Browser DevTools → Network tab → Click Save in admin**

Look for:
- POST request to `/admin/chapters/.../pages/.../edit`
- Status: 200
- Response: Success

- ✅ 200 response → Saving works
- ❌ Error → Check auth/permissions

### Check 5: Are changes in database?

**Supabase Dashboard → Table Editor → `step_pages`**

Find the self-check intro page and check `content` column:
- Should contain `self_check_intro` and `self_check_result` blocks
- Check if your edits are there

---

## 🔧 Common Issues & Fixes

### Issue: "Table doesn't exist" error in console

**Fix:** Run migration
```bash
npm run setup:self-check
```

### Issue: Changes save but user doesn't see them

**Diagnosis:**
1. Check browser console for API errors
2. Verify API returns your changes:
   ```
   GET /api/chapter/7/self-check-copy
   ```
3. If API returns old defaults → Migration not run
4. If API returns your changes → Clear browser cache (Ctrl+Shift+R)

**Fix:** Run migration + hard refresh

### Issue: "Cannot read property 'intro' of undefined"

**Cause:** API returning null because table missing

**Fix:**
1. Run migration
2. Restart dev server
3. Hard refresh browser

### Issue: Global defaults editor returns 404

**Cause:** Table doesn't exist

**Fix:**
```bash
npm run setup:self-check
# Then visit /admin/self-check-defaults
```

### Issue: Per-chapter overrides not working

**Diagnosis:**
1. Verify global defaults work first
2. Check if `self_check_intro` block has `styles` property
3. Verify non-empty style fields in admin

**Fix:**
```
1. Ensure migration ran
2. Edit chapter's self-check intro page
3. Expand "Custom Styling" section
4. Set at least one color
5. Save
6. Hard refresh user page
```

---

## 🎯 Quick Fix Checklist

When changes aren't showing:

- [ ] 1. Run: `npm run setup:self-check`
- [ ] 2. Verify: `npm run verify:self-check`
- [ ] 3. Restart dev server
- [ ] 4. Hard refresh browser (Ctrl+Shift+R)
- [ ] 5. Test API directly: `/api/chapter/7/self-check-copy`
- [ ] 6. Check browser console for errors
- [ ] 7. Verify `site_settings` table exists in Supabase
- [ ] 8. Check row exists: `SELECT * FROM site_settings WHERE key = 'self_check_defaults';`

---

## 📝 Prevention

To avoid this in future:

1. **After pulling new code that adds tables:**
   - Always check for migration files
   - Run `npm run setup:self-check` or equivalent
   - Run verification scripts

2. **Document dependencies:**
   - README should list required tables
   - Setup scripts should auto-check

3. **Better error messages:**
   - API should return specific error if table missing
   - Admin UI should show setup instructions

---

## 🔗 Related Files

- `RUN_THIS_MIGRATION.sql` - The SQL migration
- `scripts/run-migration.js` - Automated setup
- `scripts/verify-self-check.ts` - Verification tool
- `app/api/chapter/[chapterId]/self-check-copy/route.ts` - API that reads from site_settings

---

## 🎓 Understanding the System

### Data Flow (Normal):
```
1. Admin edits global defaults → site_settings table
2. Admin edits chapter override → step_pages.content
3. User visits page → API reads both
4. API merges: global + override → final config
5. Component renders with merged config
```

### Data Flow (Without Migration):
```
1. Admin edits chapter override → step_pages.content ✅
2. User visits page → API tries site_settings ❌
3. API catches error → falls back to hardcoded defaults
4. Component renders hardcoded defaults (WRONG!)
```

### The Fix:
```
RUN MIGRATION → site_settings table created
              → Global defaults inserted
              → API can read from DB
              → User sees admin changes ✅
```

---

**Last Updated:** March 2026
**Status:** RESOLVED
**Solution:** Run `npm run setup:self-check`
