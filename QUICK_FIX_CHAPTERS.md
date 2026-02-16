# Quick Fix: Chapters Not Showing

## 🚀 Immediate Actions

### 1. Restart Your Dev Server
```bash
cd tcp-platform
npm run dev
```

### 2. Visit Admin Chapters Page
Go to: `http://localhost:3000/admin/chapters`

### 3. Open Browser Console
Press **F12** to open DevTools

## 🔍 What to Check

### Look at the Stats (Top of Page)
You should see:
- **Total Parts:** 1
- **Total Chapters:** 2
- **Published:** 2

If you see these numbers, your data is loading! ✅

### Scroll to the Bottom
Look for a **blue box** titled:
```
🔍 Debug: All Chapters in Database (2)
```

**Your 2 chapters WILL be listed here!** You can click "Edit" on them directly.

### Look for the Part Card
You should see a card with:
- Your part title
- "2 chapters (expanded)" or "(collapsed)"
- A chevron icon (▼ or ▶)

**If it says "(collapsed)"** → Click the chevron to expand!

## ⚡ Quick Fixes

### Fix 1: Click "Expand All"
Top-right corner of the page → Click **"Expand All"** button

### Fix 2: Use Debug Section
Scroll to bottom → Blue box shows all chapters → Click "Edit" on any chapter

### Fix 3: Check Console
Press F12 → Look for:
```
=== ADMIN CHAPTERS DEBUG ===
Loaded parts: 1
Loaded chapters: 2
```

If you see this, data is loading correctly!

## 🔧 If Chapters Still Don't Show in Part

Run this SQL in Supabase:

```sql
-- 1. Get your part ID
SELECT id, title FROM parts;

-- 2. Copy the ID, then update chapters
UPDATE chapters 
SET part_id = 'paste-part-id-here'
WHERE chapter_number IN (1, 2);
```

Then refresh the page!

## ✅ Success Indicators

You'll know it's working when you see:

1. ✅ Stats show "Total Chapters: 2"
2. ✅ Debug section at bottom shows both chapters
3. ✅ Part card shows "2 chapters (expanded)"
4. ✅ Chapter cards appear in a grid below the part

## 🆘 Still Having Issues?

Check the console (F12) and look for:
- "Loaded parts: 0" → Create a part first
- "Loaded chapters: 0" → Check database
- "Chapters grouped by part_id: {}" → Part ID mismatch

**The debug section will ALWAYS show your chapters!** Use it to access them while fixing the part ID issue.

---

**TL;DR:** 
1. Visit `/admin/chapters`
2. Press F12 to see console logs
3. Scroll to bottom to see debug section with all chapters
4. Click "Expand All" button if needed
5. If part IDs don't match, run the SQL fix above
