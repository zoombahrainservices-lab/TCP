# 🔧 Self-Check Save Issue - Root Cause Found

## The Problem

You're trying to edit self-check intro/result content, but changes aren't saving or showing on the user-facing page.

## Root Cause

**The self-check system has a specific page structure that must exist for edits to work:**

### How It's SUPPOSED to Work:

1. **Self-Check Step** has multiple pages:
   - Page 1: "Self-Check Intro" (slug: `self-check-intro`) ← **This is the config page**
   - Page 2: "Assessment Questions" (has `scale_questions` blocks) ← **This is the questions**

2. **The "Self-Check Intro" page** should contain:
   - `self_check_intro` block (controls intro screen text/colors)
   - `self_check_result` block (controls result screen text/colors)

3. **When user visits the self-check**, the system:
   - Loads the `self_check_intro` and `self_check_result` blocks from that page
   - Uses them to customize the assessment UI
   - Shows the questions from the other pages

## The Issue

**Your chapter might not have the "Self-Check Intro" page with those config blocks!**

Looking at your server logs:
- You saved a page with `scale_questions` block ✓
- But NO `self_check_intro` or `self_check_result` blocks were saved

This means you're editing the QUESTIONS page, not the CONFIG page!

## The Solution

### Option 1: Run the Auto-Setup Function

There's a function that automatically creates the missing self-check intro page:

```typescript
// Function: adminEnsureRequiredSteps (in app/actions/admin.ts, lines 1837-1887)
// This creates:
// - A "Self-Check Intro" page
// - With self_check_intro and self_check_result blocks
```

### Option 2: Manual Setup

1. **Go to the chapter's Steps tab in admin**
2. **Find the "Self Check" step**
3. **Check if there's a page called "Self-Check Intro"**
   - If YES: Edit that page
   - If NO: Create it (continue below)

4. **Create the "Self-Check Intro" page:**
   - Add new page to Self Check step
   - Title: "Self-Check Intro"
   - Slug: "self-check-intro"
   - Order: 0 (first page)

5. **Add the config blocks:**
   - Click "Add Block"
   - Select "Self-Check Intro"
   - Fill in the fields (title, subtitle, body, etc.)
   - Add another block
   - Select "Self-Check Result"
   - Fill in those fields too

6. **Save the page**

7. **Now when you edit those blocks**, changes will save and appear on user-facing page!

## How to Verify

### Check if Config Page Exists:

1. Admin → Chapters → [Your Chapter] → Steps tab
2. Expand "Self Check" step
3. Look for a page with slug `self-check-intro` or title "Self-Check Intro"

### If It Doesn't Exist:

Run this function to create it automatically:
```
adminEnsureRequiredSteps(chapterId)
```

Or create it manually as described above.

## Why This Is Different from Reflection

**Reflection:**
- Uses `prompt` blocks directly in page content
- Each prompt saves responses to database
- No special config blocks needed

**Self-Check:**
- Uses special config blocks (`self_check_intro`, `self_check_result`)
- These blocks must be on a specific "intro" page
- The assessment component reads these blocks to customize its appearance
- Separate pages have the actual questions (`scale_questions` blocks)

## Next Steps

1. Check if your chapter has the "Self-Check Intro" page
2. If not, create it (or run the auto-setup function)
3. Add the `self_check_intro` and `self_check_result` blocks to that page
4. Edit those blocks with your desired text
5. Save
6. Visit the user-facing self-check page
7. Changes should now appear!

---

The key insight: **You were editing the questions page, but the intro/result customization lives on a separate config page!**
