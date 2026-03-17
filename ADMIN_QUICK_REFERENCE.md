# Self-Check Customization - Admin Quick Reference

## 🎯 What You Can Customize

### Every Chapter Can Have Unique:
- Colors (buttons, backgrounds, text)
- Titles and subtitles
- Body text
- Highlight boxes
- Button text

---

## 📍 Where Everything Is

### 1. Global Defaults (Affects ALL Chapters)

**URL**: `/admin/self-check-defaults`

**What it does**: Sets the default look for ALL self-check pages

**When to use**: 
- First time setup
- Rebrand the entire platform
- Change default colors site-wide

**Example**: Change button from yellow to orange for all chapters

---

### 2. Chapter-Specific Overrides

**Path**: 
```
/admin/chapters 
→ Click any chapter (e.g., "Chapter 7: Taking Responsibility")
→ Click "Steps" tab
→ Find "Self Check" step
→ Click "Self-Check Intro" page
→ Edit blocks at bottom
```

**What it does**: Override specific colors/text for JUST that chapter

**When to use**:
- Chapter 7 needs to be blue themed
- Chapter 3 needs different wording
- Special chapter needs unique branding

**Important**: Empty fields = uses global default

---

## 🎨 Quick Color Guide

### Recommended Color Palettes

#### Professional Blue
```
Title: #1e40af
Button: #3b82f6
Highlight: #dbeafe
```

#### Energetic Orange  
```
Title: #c2410c
Button: #f97316
Highlight: #fed7aa
```

#### Calm Green
```
Title: #166534
Button: #22c55e
Highlight: #d1fae5
```

#### Bold Purple
```
Title: #7c3aed
Button: #a78bfa
Highlight: #ede9fe
```

---

## ⚡ Common Tasks

### Task: Change Button Color for All Chapters
1. Go to `/admin/self-check-defaults`
2. Find "Button BG" field
3. Enter hex color (e.g., `#3b82f6` for blue)
4. Click "Save Changes"
5. ✅ Done! All chapters now use blue button

### Task: Make Chapter 7 Unique
1. Go to `/admin/chapters`
2. Click "Chapter 7"
3. Click "Steps" tab
4. Find "Self Check" → "Self-Check Intro" page
5. Scroll to "Self-Check Intro" block
6. Click "Edit" (pencil icon)
7. Expand "Custom Styling (Optional)"
8. Set Title Color: `#1e40af` (blue)
9. Set Button BG: `#3b82f6` (blue)
10. Leave other fields EMPTY (uses global)
11. Click "Done"
12. Click "Save Changes" (top right)
13. ✅ Done! Chapter 7 is now blue

### Task: Change Intro Text for Chapter 3
1. Navigate to Chapter 3 → Steps → Self-Check Intro page
2. Find "Self-Check Intro" block
3. Click "Edit"
4. Change "Intro Title" to whatever you want
5. Click "Done" → "Save Changes"
6. ✅ Done! Chapter 3 has custom text

---

## 🔍 How to Check Your Changes

### Check Global Defaults
1. Save your changes in `/admin/self-check-defaults`
2. Open ANY chapter (e.g., Chapter 1)
3. Go to `/read/chapter-1/assessment`
4. Your changes should appear

### Check Chapter Override
1. Save your changes in Chapter 7's self-check page
2. Go to `/read/chapter-7/assessment`
3. Chapter 7 should show YOUR colors
4. Go to `/read/chapter-6/assessment`
5. Chapter 6 should show GLOBAL colors

---

## 💡 Pro Tips

### Tip 1: Override Only What You Need
❌ Don't fill in all fields if you just want to change button color
✅ Only fill in "Button BG" field, leave rest empty

### Tip 2: Use Color Pickers
- Click the colored square next to hex input
- Visual color picker appears
- Easier than remembering hex codes

### Tip 3: Test on One Chapter First
- Make changes to Chapter 1
- Verify it looks good
- Then apply to other chapters or global

### Tip 4: Keep a Style Guide
Create a doc with your color palette:
```
Primary: #f7b418 (yellow)
Secondary: #ff6a38 (orange)
Accent: #3b82f6 (blue)
Background: #ffffff (white)
```

### Tip 5: Refresh to See Changes
- After saving, refresh the page (F5)
- Use Ctrl+Shift+R for hard refresh
- Clears cache

---

## 🐛 Troubleshooting

### Problem: Changes Not Showing

**Solution 1**: Clear Browser Cache
- Press Ctrl+Shift+R (Windows)
- Or Cmd+Shift+R (Mac)

**Solution 2**: Check You Saved
- Look for green "saved successfully" toast
- Verify in database table changed

**Solution 3**: Check Right Chapter
- Make sure you're viewing the chapter you edited
- `/read/chapter-7/assessment` for Chapter 7

### Problem: Chapter Uses Wrong Colors

**Check 1**: Does chapter have overrides?
- If ANY field is filled in chapter block → uses that
- If field is EMPTY → uses global default

**Check 2**: Check global defaults
- Visit `/admin/self-check-defaults`
- Verify global colors are what you expect

### Problem: Can't Find Self-Check Page

**Solution**: Auto-create missing pages
1. Go to chapter admin page
2. Click "Ensure Required Steps" button
3. System creates missing pages automatically

---

## 📋 Field Reference

### Text Fields (What They Control)

| Field | Where It Appears | Example |
|-------|------------------|---------|
| Intro Title | Big heading at top | "Self-Check" |
| Intro Subtitle | Gray text under title | "Take a quick snapshot..." |
| Body Paragraph 1 | First explanation | "This check is just for you..." |
| Body Paragraph 2 | Second explanation | "It's not a test or grade..." |
| Highlight Title | Bold text in yellow box | "You'll rate 5 statements..." |
| Highlight Body | Small text in yellow box | "Takes about a minute..." |
| Results Title | Results page heading | "Self-Check Results" |
| Results Subtitle | Under results heading | "This is your starting point..." |

### Color Fields (What They Control)

| Field | What It Colors |
|-------|----------------|
| Title Color | Main heading text |
| Subtitle Color | Subtitle text (usually gray) |
| Body BG | White card background |
| Body Text | Paragraph text color |
| Highlight BG | Yellow callout box background |
| Highlight Border | Box border color |
| Highlight Text | Text inside callout |
| Button BG | Button background |
| Button Hover | Button color when mouse over |
| Button Text | Button text color |
| Score BG | Results score card background |
| Score Text | Score number color |
| Explanation BG | "Score Bands" box background |
| Explanation Text | Explanation text color |

---

## 🎓 Learning Path

### Beginner
1. Change one global color (button)
2. Save and view on any chapter
3. Experiment with different colors

### Intermediate
1. Override colors for one chapter
2. Use color picker for easier selection
3. Test that other chapters still use global

### Advanced
1. Create themed chapters (blue chapter 7, green chapter 3)
2. Customize text for each chapter
3. Build a cohesive experience across all chapters

---

## 📞 Need Help?

1. Read `SELF_CHECK_CUSTOMIZATION.md` for technical details
2. Read `QUICK_START_SELF_CHECK.md` for step-by-step guide
3. Read `IMPLEMENTATION_SUMMARY.md` for architecture overview

**Remember**: You can always reset to defaults using the "Reset" button!

---

**Last Updated**: March 2026
**Version**: 1.0
