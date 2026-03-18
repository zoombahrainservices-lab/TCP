# 🎯 SOLUTION: Fix Self-Check Intro/Result Editing

## The Root Cause (Confirmed)

Self-check intro/result edits aren't working because **your chapters are missing the "Self-Check Intro" configuration page** that holds the `self_check_intro` and `self_check_result` blocks.

Without this page, the system has nowhere to save your edits!

---

## ✅ THE FIX (Choose One Method)

### Method 1: Automatic Setup for ALL Chapters (RECOMMENDED)

**Run this function in browser console:**

1. Open browser console (F12)
2. Navigate to: `http://localhost:3000/admin/chapters`
3. Click on any chapter that has a "Self Check" step
4. In the console, paste and run:

```javascript
// This will setup self-check intro pages for ALL chapters
async function setupAllSelfChecks() {
  const response = await fetch('/admin/chapters');
  const html = await response.text();
  
  // Get all chapter IDs from the page
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  console.log('Setting up self-check pages for all chapters...');
  
  // You'll need to manually get chapter IDs
  // Or run the server action directly
  alert('Please use Method 2 instead - it\'s simpler!');
}

setupAllSelfChecks();
```

Actually, use Method 2 - it's simpler!

### Method 2: Manual Setup Per Chapter (SIMPLE & RELIABLE)

**For EACH chapter that needs self-check customization:**

1. **Go to:** `http://localhost:3000/admin/chapters`

2. **Click on the chapter** (e.g., "Chapter 7")

3. **Click "Steps" tab**

4. **Find "Self Check" step** in the list

5. **Check if "Self-Check Intro" page exists:**
   - Look for a page with that exact name under the Self Check step
   - If you see it, **GREAT! Edit that page** (skip to step 8)
   - If NOT, continue to step 6

6. **Create the "Self-Check Intro" page:**
   - Click "Add Page" button (in the Self Check step section)
   - **Title:** `Self-Check Intro`
   - **Slug:** `self-check-intro`
   - **Order:** `0` (make it the first page)
   - Click "Create"

7. **Open the new page for editing:**
   - Click the pencil/edit icon on the "Self-Check Intro" page

8. **Add the configuration blocks:**
   
   **Add Block #1 - Self-Check Intro:**
   - Scroll to bottom of page editor
   - Click "Add Block" button
   - Select **"Self-Check Intro"** from the list
   - Fill in the fields:
     * **Intro Title:** (e.g., "Self-Check")
     * **Intro Subtitle:** (e.g., "Take a quick snapshot...")
     * **Body Paragraph 1:** (your custom text)
     * **Body Paragraph 2:** (your custom text)
     * **Highlight Title:** (e.g., "You'll rate 5 statements...")
     * **Highlight Body:** (e.g., "Takes about a minute...")
     * **Questions Page Title:** (e.g., "Chapter 7 Self-Check")
     * **Questions Page Subtitle:** (e.g., "Rate each statement...")
   - Optionally expand "Custom Styling" and set colors
   
   **Add Block #2 - Self-Check Result:**
   - Click "Add Block" again
   - Select **"Self-Check Result"** from the list
   - Fill in:
     * **Results Title:** (e.g., "Self-Check Results")
     * **Results Subtitle:** (e.g., "This is your starting point...")
   - Optionally set result page colors

9. **SAVE THE PAGE** (click "Save Changes" button at top right)

10. **Verify it works:**
    - Visit the user-facing self-check: `http://localhost:3000/read/chapter-7/assessment`
    - You should see your custom text!

---

## How to Verify Setup is Complete

### Check if Config Page Exists:

1. **Admin → Chapters → [Chapter] → Steps tab**
2. **Expand "Self Check" step**
3. **Look for pages under it:**
   - ✅ **"Self-Check Intro"** (slug: `self-check-intro`) ← THIS IS THE CONFIG PAGE
   - ✅ **"Assessment Questions"** or similar (has the actual questions)

### If Both Exist:

**Perfect!** Now you can:
- Edit the "Self-Check Intro" page
- Modify the `self_check_intro` and `self_check_result` blocks
- Save
- Changes will appear on user-facing pages immediately!

---

## Why This Happens

**The system is designed with two types of pages:**

### 1. Config Page ("Self-Check Intro")
- Holds `self_check_intro` block (controls intro screen)
- Holds `self_check_result` block (controls result screen)
- **This is what you edit to customize appearance**

### 2. Questions Pages
- Hold `scale_questions` blocks (the actual assessment questions)
- User answers these during the assessment

**You were probably editing the questions page, not the config page!**

---

## After Setup

Once the "Self-Check Intro" page exists with both blocks:

1. **Edit it** from admin panel
2. **Modify the block fields** (title, subtitle, body text, colors)
3. **Save**
4. **Visit user-facing page** - changes appear instantly!

**This matches how reflection works**, except reflection uses `prompt` blocks directly in pages, while self-check uses special config blocks.

---

## Quick Reference

| Page Type | Purpose | Blocks It Should Have |
|-----------|---------|----------------------|
| Self-Check Intro | Configuration | `self_check_intro`, `self_check_result` |
| Assessment Questions | Actual questions | `scale_questions`, `mcq` |

**Edit the "Self-Check Intro" page to customize how the assessment looks!**

---

## Still Not Working?

If you follow Method 2 and it still doesn't work:

1. **Check browser console** (F12) for errors
2. **Verify blocks saved:**
   - Edit the "Self-Check Intro" page
   - Check that both blocks are visible
   - Re-save if needed

3. **Check API response:**
   - Visit: `http://localhost:3000/api/chapter/7/self-check-copy`
   - Should return JSON with your custom text
   - If returns defaults, blocks aren't saving properly

4. **Hard refresh user page:**
   - Ctrl+Shift+R (Windows)
   - Cmd+Shift+R (Mac)
   - Clears cache to show fresh data

---

**Summary:** Create "Self-Check Intro" page → Add two config blocks → Edit them → Save → Done!
