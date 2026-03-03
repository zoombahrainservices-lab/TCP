# Framework Cover Page Template Guide

## Overview

This template creates a beautiful, animated introduction page for framework chapters (like SPARK, VOICE, etc.). It matches the exact design shown in your reference screenshot with:

- ✅ Cream/beige background (#FFF8E7)
- ✅ Red "FRAMEWORK:" label at top
- ✅ Framework title
- ✅ Large yellow framework letters
- ✅ Yellow square badges for each letter
- ✅ Clean white cards with meanings
- ✅ Orange "Continue" button

---

## Template Structure

```json
{
  "type": "framework_cover",
  "frameworkCode": "SPARK",
  "frameworkTitle": "The SPARK Framework",
  "frameworkLabel": "FRAMEWORK: SPARK",
  "accentColor": "#f7b418",
  "backgroundColor": "#FFF8E7",
  "letters": [
    {
      "letter": "S",
      "meaning": "Surface the Pattern",
      "color": "#f7b418"
    }
  ]
}
```

---

## How to Use in Admin Panel

### Method 1: Copy Existing Template

1. **Navigate to:** `/admin/chapters/[chapter-id]/pages/[page-id]/edit`
2. **Find the template at:** `public/templates/framework-cover-template.json`
3. **Copy the entire JSON content**
4. **Paste into the content editor**
5. **Customize as needed**

### Method 2: Manual Creation

1. Open the content editor for a framework step's first page
2. Add a new block of type `framework_cover`
3. Fill in the properties:
   - `frameworkCode`: The acronym (e.g., "SPARK", "VOICE")
   - `frameworkTitle`: Full title (e.g., "The SPARK Framework")
   - `frameworkLabel`: Top label (e.g., "FRAMEWORK: SPARK")
   - `accentColor`: Main color for letters (hex code)
   - `backgroundColor`: Page background (hex code)
   - `letters`: Array of letter objects

---

## Customization Options

### 1. **Change Framework Name**

```json
{
  "frameworkCode": "GROWTH",
  "frameworkTitle": "The GROWTH Framework",
  "frameworkLabel": "FRAMEWORK: GROWTH"
}
```

### 2. **Change Colors**

**Yellow/Gold (like SPARK):**
```json
{
  "accentColor": "#f7b418",
  "backgroundColor": "#FFF8E7"
}
```

**Blue (like VOICE):**
```json
{
  "accentColor": "#3b82f6",
  "backgroundColor": "#eff6ff"
}
```

**Green:**
```json
{
  "accentColor": "#10b981",
  "backgroundColor": "#f0fdf4"
}
```

**Purple:**
```json
{
  "accentColor": "#8b5cf6",
  "backgroundColor": "#faf5ff"
}
```

**Red:**
```json
{
  "accentColor": "#ef4444",
  "backgroundColor": "#fef2f2"
}
```

### 3. **Change Number of Letters**

You can have **any number** of letters (2-10 recommended):

**3-Letter Framework:**
```json
{
  "frameworkCode": "ACT",
  "letters": [
    { "letter": "A", "meaning": "Acknowledge the Issue" },
    { "letter": "C", "meaning": "Create a Plan" },
    { "letter": "T", "meaning": "Take Action" }
  ]
}
```

**7-Letter Framework:**
```json
{
  "frameworkCode": "SUCCESS",
  "letters": [
    { "letter": "S", "meaning": "Set Clear Goals" },
    { "letter": "U", "meaning": "Understand Your Values" },
    { "letter": "C", "meaning": "Create Accountability" },
    { "letter": "C", "meaning": "Cultivate Discipline" },
    { "letter": "E", "meaning": "Execute Daily" },
    { "letter": "S", "meaning": "Support Others" },
    { "letter": "S", "meaning": "Sustain Progress" }
  ]
}
```

### 4. **Individual Letter Colors**

Each letter can have its own color:

```json
{
  "letters": [
    { "letter": "S", "meaning": "Surface the Pattern", "color": "#f7b418" },
    { "letter": "P", "meaning": "Pinpoint the Why", "color": "#f59e0b" },
    { "letter": "A", "meaning": "Anchor to Identity", "color": "#ef4444" },
    { "letter": "R", "meaning": "Rebuild with Micro-Commitments", "color": "#8b5cf6" },
    { "letter": "K", "meaning": "Kindle Community", "color": "#10b981" }
  ]
}
```

---

## Example Templates

### SPARK Framework (Yellow/Gold)

```json
{
  "type": "framework_cover",
  "frameworkCode": "SPARK",
  "frameworkTitle": "The SPARK Framework",
  "frameworkLabel": "FRAMEWORK: SPARK",
  "accentColor": "#f7b418",
  "backgroundColor": "#FFF8E7",
  "letters": [
    { "letter": "S", "meaning": "Surface the Pattern", "color": "#f7b418" },
    { "letter": "P", "meaning": "Pinpoint the Why", "color": "#f7b418" },
    { "letter": "A", "meaning": "Anchor to Identity", "color": "#f7b418" },
    { "letter": "R", "meaning": "Rebuild with Micro-Commitments", "color": "#f7b418" },
    { "letter": "K", "meaning": "Kindle Community", "color": "#f7b418" }
  ]
}
```

### VOICE Framework (Blue)

```json
{
  "type": "framework_cover",
  "frameworkCode": "VOICE",
  "frameworkTitle": "The VOICE Framework",
  "frameworkLabel": "FRAMEWORK: VOICE",
  "accentColor": "#3b82f6",
  "backgroundColor": "#eff6ff",
  "letters": [
    { "letter": "V", "meaning": "Validate the Experience", "color": "#3b82f6" },
    { "letter": "O", "meaning": "Open Communication Channels", "color": "#3b82f6" },
    { "letter": "I", "meaning": "Identify Support Networks", "color": "#3b82f6" },
    { "letter": "C", "meaning": "Create Action Plans", "color": "#3b82f6" },
    { "letter": "E", "meaning": "Empower Through Education", "color": "#3b82f6" }
  ]
}
```

### CLEAR Framework (Green)

```json
{
  "type": "framework_cover",
  "frameworkCode": "CLEAR",
  "frameworkTitle": "The CLEAR Framework",
  "frameworkLabel": "FRAMEWORK: CLEAR",
  "accentColor": "#10b981",
  "backgroundColor": "#f0fdf4",
  "letters": [
    { "letter": "C", "meaning": "Clarify Your Purpose", "color": "#10b981" },
    { "letter": "L", "meaning": "Learn from Experience", "color": "#10b981" },
    { "letter": "E", "meaning": "Execute with Intention", "color": "#10b981" },
    { "letter": "A", "meaning": "Adapt as Needed", "color": "#10b981" },
    { "letter": "R", "meaning": "Reflect and Grow", "color": "#10b981" }
  ]
}
```

---

## Color Palette Suggestions

### Warm Colors (Energetic, Action-Oriented)
- **Yellow/Gold:** `#f7b418` on `#FFF8E7` (SPARK)
- **Orange:** `#f97316` on `#fff7ed`
- **Red:** `#ef4444` on `#fef2f2`

### Cool Colors (Calm, Reflective)
- **Blue:** `#3b82f6` on `#eff6ff` (VOICE)
- **Teal:** `#14b8a6` on `#f0fdfa`
- **Purple:** `#8b5cf6` on `#faf5ff`

### Natural Colors (Growth, Balance)
- **Green:** `#10b981` on `#f0fdf4`
- **Forest:** `#059669` on `#ecfdf5`

---

## Design Best Practices

### 1. **Letter Meanings Length**
- ✅ Keep meanings **3-5 words** for best readability
- ✅ Use action verbs when possible
- ❌ Avoid long sentences (breaks the visual flow)

**Good:**
- "Surface the Pattern"
- "Anchor to Identity"
- "Create Action Plans"

**Too Long:**
- "Take time to carefully surface and identify the underlying behavioral pattern"

### 2. **Framework Code Length**
- ✅ **3-5 letters** works best visually
- ✅ **6-7 letters** acceptable
- ❌ **8+ letters** may need font size adjustment

### 3. **Color Contrast**
- Ensure letter badges have good contrast with white cards
- Light backgrounds work best (#FFF8E7, #eff6ff, etc.)
- Test in both light and dark mode

### 4. **Consistent Theming**
- Use same accent color throughout the chapter
- Match the framework theme (warm = energetic, cool = reflective)

---

## Technical Details

### Component Used
`components/content/FrameworkCoverPage.tsx`

### Block Type
`framework_cover`

### Animation Features
- Fade-in on load
- Staggered letter card animations
- Hover effects on cards
- Scale animation on continue button

### Responsive Design
- Mobile: Single column, smaller text
- Tablet: Single column, medium text
- Desktop: Single column, large text
- Max width: 4xl (896px)

---

## Troubleshooting

### Issue: Letters not showing
**Solution:** Ensure the `letters` array is properly formatted with all required fields

### Issue: Colors not applying
**Solution:** Use hex codes (`#f7b418`) not color names (`yellow`)

### Issue: Background not visible
**Solution:** Check backgroundColor is set and uses hex code format

### Issue: Continue button not working
**Solution:** The button automatically advances to the next page - ensure there's a next page in the sequence

---

## Where Templates Are Stored

```
tcp-platform/public/templates/
  ├── framework-cover-template.json         (SPARK - Yellow)
  ├── framework-cover-voice-example.json    (VOICE - Blue)
  └── FRAMEWORK_COVER_GUIDE.md             (This guide)
```

---

## Quick Start Checklist

- [ ] Copy template from `public/templates/framework-cover-template.json`
- [ ] Change `frameworkCode` to your framework acronym
- [ ] Update `frameworkTitle` with full framework name
- [ ] Update `frameworkLabel` (format: "FRAMEWORK: [CODE]")
- [ ] Choose `accentColor` (hex code)
- [ ] Choose `backgroundColor` (hex code)
- [ ] Update `letters` array with your framework's letters
- [ ] Test in the reading view
- [ ] Verify mobile responsiveness
- [ ] Check dark mode appearance

---

## Need Help?

If you need to create a new framework template:

1. **Copy** `framework-cover-template.json`
2. **Rename** to match your framework
3. **Edit** all the fields
4. **Test** in the content editor
5. **Save** and publish

The design will automatically match the screenshot you provided! 🎉
