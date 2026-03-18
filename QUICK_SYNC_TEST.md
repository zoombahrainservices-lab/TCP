# 🧪 Quick Sync Test: Admin Panel ↔️ User Interface

## 5-Minute Test to Verify Everything is Connected

### Test 1: Global Defaults Sync (2 minutes)

1. **Open Admin Panel:**
   ```
   http://localhost:3000/admin/self-check-defaults
   ```

2. **Make a Bold Change:**
   - Find "Title" field under "Intro Page"
   - Change it to: `"🎯 TEST SYNC"`
   - Click "Save Changes"
   - Wait for success message

3. **Check User Interface:**
   - Open new tab (or refresh existing)
   - Visit: `http://localhost:3000/read/chapter-1/self-check`
   - **Expected:** You should see `"🎯 TEST SYNC"` as the big title
   - **If not:** Hard refresh (Ctrl+Shift+R) to clear cache

4. **✅ PASS if:** Title changed on user page
   **❌ FAIL if:** Still shows "Self-Check"

---

### Test 2: Chapter Override Sync (3 minutes)

1. **Open Chapter Editor:**
   ```
   http://localhost:3000/admin/chapters
   ```
   - Click on "Chapter 1"
   - Click "Steps" tab
   - Find "Self Check" step → "Self-Check Intro" page
   - Click edit (pencil icon)

2. **Scroll Down to Blocks:**
   - You should see the page content editor
   - Look for `self_check_intro` block (usually at the bottom)
   - Click edit on that block

3. **Make a Chapter-Specific Change:**
   - Change "Intro Title" to: `"Chapter 1 Override Test"`
   - Leave other fields empty (they'll use global defaults)
   - Click "Done"
   - Click "Save Changes" (top right of page)

4. **Check User Interface:**
   - Visit Chapter 1: `http://localhost:3000/read/chapter-1/self-check`
   - **Expected:** Should show `"Chapter 1 Override Test"`
   
   - Visit Chapter 2: `http://localhost:3000/read/chapter-2/self-check`
   - **Expected:** Should show `"🎯 TEST SYNC"` (global default)

5. **✅ PASS if:** 
   - Chapter 1 shows custom override
   - Chapter 2 shows global default
   
   **❌ FAIL if:** Both show the same thing

---

### Test 3: Color Sync (1 minute)

1. **Change a Color:**
   - Go to `/admin/self-check-defaults`
   - Find "Button BG" color field
   - Change to bright red: `#FF0000`
   - Save

2. **Check User Interface:**
   - Visit any chapter self-check
   - **Expected:** "Start Self-Check →" button should be RED
   - Hover over it - it should change to the hover color

3. **✅ PASS if:** Button is red
   **❌ FAIL if:** Button is still yellow/orange

---

## What Success Looks Like

### When Synced Correctly:
```
Admin Panel                    User Interface
─────────────                  ──────────────
Edit title                →    Title updates
Edit color                →    Color changes  
Chapter override          →    Only that chapter changes
Leave field empty         →    Uses global default
```

### API Response (What to Check in Network Tab):

Open Browser Console (F12) → Network tab → Visit self-check page

**You should see:**
```
GET /api/chapter/1/self-check-copy
Status: 200 OK

Response:
{
  "success": true,
  "intro": {
    "title": "🎯 TEST SYNC",        ← Your custom value
    "subtitle": "Take a quick...",
    "body1": "This check is...",
    "styles": {
      "buttonBgColor": "#FF0000"   ← Your custom color
    }
  },
  "result": { ... },
  "hasOverride": false              ← true if chapter has override
}
```

---

## Troubleshooting Failed Tests

### Test 1 Failed (Global Default Not Syncing)

**Possible Issues:**
1. **Database not migrated**
   - Run the SQL migration from `migrations/001_add_site_settings.sql`
   - Or manually add data via admin UI

2. **Caching issue**
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Clear browser cache completely
   - Try incognito/private window

3. **API error**
   - Check browser console for errors
   - Look for red 500/404 errors in Network tab
   - Check server logs

**Quick Fix:**
```bash
# Restart dev server
npm run dev
```

### Test 2 Failed (Chapter Override Not Working)

**Possible Issues:**
1. **Didn't save properly**
   - Make sure you clicked "Done" on the block editor
   - AND clicked "Save Changes" on the page editor (top right)
   - Check for green success message

2. **Wrong block type**
   - Make sure you're editing the `self_check_intro` block
   - NOT a different block type
   - Should have fields like "Intro Title", "Subtitle", etc.

3. **Cache issue**
   - Same as above - hard refresh

### Test 3 Failed (Colors Not Applying)

**Possible Issues:**
1. **CSS specificity**
   - Some dark mode styles might override
   - Check in browser DevTools: Inspect element → See computed styles

2. **Invalid color format**
   - Must be hex: `#FF0000` (with #)
   - Not rgb, not color names

3. **Hover state**
   - Make sure you're not hovering when checking color
   - The hover color is different from the base color

---

## Reset to Defaults

If you want to undo all test changes:

### Reset Global Defaults:
```
1. Go to /admin/self-check-defaults
2. Click "Reset" button (top right)
3. Confirms defaults are restored
```

### Reset Chapter Override:
```
1. Edit the chapter's self-check intro page
2. Find the self_check_intro block
3. Delete all text from all fields (make them empty)
4. Save
5. Chapter now uses global defaults
```

---

## Quick Diagnostic Commands

### Check if Site Settings Exist:
```sql
SELECT * FROM public.site_settings WHERE key = 'self_check_defaults';
```
- Should return 1 row with JSON data
- If 0 rows: Database migration not run

### Check if Chapter Has Override:
```sql
SELECT content FROM public.step_pages 
WHERE id = 'YOUR_PAGE_ID';
```
- Look for `{"type": "self_check_intro", ...}` in the JSON
- If not found: Chapter using global defaults

### Test API Directly:
```bash
curl http://localhost:3000/api/chapter/1/self-check-copy
```
- Should return JSON with success: true
- If error: Check server logs

---

## Success Criteria

✅ **All 3 tests pass** = System is 100% synced and working
✅ **API returns correct data** = Backend is working
✅ **User page shows changes instantly** = Frontend is connected
✅ **Chapter overrides work independently** = Merge logic is correct

If all pass, you have a fully dynamic, admin-controlled self-check system! 🎉

---

## After Testing

Don't forget to:
1. Reset test values back to production-ready copy
2. Remove emoji/test text from titles
3. Reset button color to intended color
4. Test on a real chapter with real content

**Remember:** Every change you make in the admin panel appears on the user interface immediately (after page refresh). This is the power of a fully dynamic system!
