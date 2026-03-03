# 📋 Framework Cover Template - Usage Guide

## 🎯 Quick Start

You now have **exact duplicates** of the Chapter 1 SPARK framework intro page that you can use as templates.

---

## 📁 Template Files Created

### 1. **EXACT-SPARK-TEMPLATE.json**
This is an **exact copy** of your Chapter 1 framework SPARK intro page.
- Use this when you want the SPARK framework design
- Already configured with perfect colors and layout
- Ready to copy-paste into admin

### 2. **BLANK-FRAMEWORK-TEMPLATE.json**
This is a **blank template** you can customize for any framework.
- Change the framework name
- Update letter meanings
- Customize colors

---

## 🚀 How to Use These Templates

### Method 1: Copy Existing SPARK Design

1. **Open:** `tcp-platform/public/templates/EXACT-SPARK-TEMPLATE.json`

2. **Copy the entire JSON content**

3. **Navigate to Admin Panel:**
   - Go to: `/admin/chapters/[your-chapter-id]`
   - Click on your framework step
   - Click "Add Page" or edit the first page
   - Click "Edit Content"

4. **Paste the JSON** into the content editor

5. **Save** - it will render exactly like your screenshot!

---

### Method 2: Create New Framework from Blank Template

1. **Open:** `tcp-platform/public/templates/BLANK-FRAMEWORK-TEMPLATE.json`

2. **Edit the template:**

```json
{
  "frameworkCode": "VOICE",              // ← Change to your framework acronym
  "frameworkTitle": "The VOICE Framework", // ← Change to your title
  "frameworkLabel": "FRAMEWORK: VOICE",   // ← Match your framework
  "accentColor": "#3b82f6",              // ← Choose your color
  "backgroundColor": "#eff6ff",          // ← Choose background
  "letters": [
    { "letter": "V", "meaning": "Validate Experience" },
    { "letter": "O", "meaning": "Open Channels" },
    // ... add your letters
  ]
}
```

3. **Save as new template** (optional):
   - Save as: `your-framework-template.json`

4. **Use in admin panel** (same as Method 1)

---

## ✏️ Customization Examples

### Example 1: Change to Blue Theme (VOICE Framework)

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
    { "letter": "O", "meaning": "Open Communication", "color": "#3b82f6" },
    { "letter": "I", "meaning": "Identify Solutions", "color": "#3b82f6" },
    { "letter": "C", "meaning": "Create Action Plans", "color": "#3b82f6" },
    { "letter": "E", "meaning": "Empower Growth", "color": "#3b82f6" }
  ]
}
```

### Example 2: Short Framework (3 Letters)

```json
{
  "frameworkCode": "ACT",
  "frameworkTitle": "The ACT Framework",
  "frameworkLabel": "FRAMEWORK: ACT",
  "accentColor": "#10b981",
  "backgroundColor": "#f0fdf4",
  "letters": [
    { "letter": "A", "meaning": "Acknowledge the Issue", "color": "#10b981" },
    { "letter": "C", "meaning": "Create a Plan", "color": "#10b981" },
    { "letter": "T", "meaning": "Take Action", "color": "#10b981" }
  ]
}
```

### Example 3: Longer Framework (7 Letters)

```json
{
  "frameworkCode": "SUCCESS",
  "frameworkTitle": "The SUCCESS Framework",
  "frameworkLabel": "FRAMEWORK: SUCCESS",
  "accentColor": "#8b5cf6",
  "backgroundColor": "#faf5ff",
  "letters": [
    { "letter": "S", "meaning": "Set Clear Goals", "color": "#8b5cf6" },
    { "letter": "U", "meaning": "Understand Values", "color": "#8b5cf6" },
    { "letter": "C", "meaning": "Create Accountability", "color": "#8b5cf6" },
    { "letter": "C", "meaning": "Cultivate Discipline", "color": "#8b5cf6" },
    { "letter": "E", "meaning": "Execute Daily", "color": "#8b5cf6" },
    { "letter": "S", "meaning": "Support Others", "color": "#8b5cf6" },
    { "letter": "S", "meaning": "Sustain Progress", "color": "#8b5cf6" }
  ]
}
```

---

## 🎨 Color Presets

Copy these color combinations for different themes:

### Yellow/Gold (Like SPARK)
```json
"accentColor": "#f7b418",
"backgroundColor": "#FFF8E7"
```

### Blue
```json
"accentColor": "#3b82f6",
"backgroundColor": "#eff6ff"
```

### Green
```json
"accentColor": "#10b981",
"backgroundColor": "#f0fdf4"
```

### Purple
```json
"accentColor": "#8b5cf6",
"backgroundColor": "#faf5ff"
```

### Red/Orange
```json
"accentColor": "#ef4444",
"backgroundColor": "#fef2f2"
```

### Teal
```json
"accentColor": "#14b8a6",
"backgroundColor": "#f0fdfa"
```

---

## 📐 Template Structure Explained

```json
{
  "type": "framework_cover",           // ← Don't change this
  "frameworkCode": "SPARK",            // ← The big letters (3-7 letters recommended)
  "frameworkTitle": "The SPARK Framework",  // ← Title shown at top
  "frameworkLabel": "FRAMEWORK: SPARK",     // ← Red label at very top
  "accentColor": "#f7b418",            // ← Color of letters and badges
  "backgroundColor": "#FFF8E7",        // ← Page background color
  "letters": [                         // ← Array of letter meanings
    {
      "letter": "S",                   // ← Single letter
      "meaning": "Surface the Pattern", // ← What it means (3-5 words)
      "color": "#f7b418"              // ← Optional: custom color per letter
    }
  ]
}
```

---

## 🔧 Step-by-Step: Add to Your Chapter

### Step 1: Prepare Your Framework Info
Write down:
- Framework acronym (e.g., "SPARK")
- Full title (e.g., "The SPARK Framework")
- Each letter's meaning
- Preferred colors

### Step 2: Choose Template
- **Already have SPARK?** → Use `EXACT-SPARK-TEMPLATE.json`
- **New framework?** → Use `BLANK-FRAMEWORK-TEMPLATE.json`

### Step 3: Customize (if needed)
- Open template in text editor
- Replace placeholders with your info
- Save your changes

### Step 4: Add to Admin Panel
1. Login to admin panel
2. Navigate to your chapter
3. Find the framework step
4. Click on the first page (or add new page)
5. Click "Edit Content"
6. Delete any existing content
7. Paste your JSON
8. Click "Save"

### Step 5: Preview
- Click the preview button
- Check it looks like your screenshot
- Make adjustments if needed

---

## ✅ What You Get

When you use these templates, you'll get exactly what you see in your screenshot:

- ✅ Red "FRAMEWORK: [NAME]" label at top
- ✅ Black framework title
- ✅ **Giant yellow letters** (or your color choice)
- ✅ Yellow square badges with rounded corners
- ✅ Clean white cards for each letter meaning
- ✅ Orange "Continue" button
- ✅ Smooth animations on load
- ✅ Mobile responsive
- ✅ Dark mode support

---

## 🎯 Pro Tips

1. **Keep letter meanings short** (3-5 words)
   - ✅ "Surface the Pattern"
   - ❌ "Take time to surface and identify the pattern"

2. **Use consistent colors** throughout your chapter
   - All badges same color = professional look
   - Rainbow colors = more playful (also supported)

3. **Test on mobile** after creating
   - Everything should scale nicely
   - Tap "Continue" to proceed

4. **Match your chapter theme**
   - Warm colors (yellow/orange) = energy, action
   - Cool colors (blue/green) = calm, reflection

5. **Framework length**
   - 3-5 letters: Perfect, easy to remember
   - 6-7 letters: Good, still readable
   - 8+ letters: Possible but might need adjustments

---

## 🆘 Troubleshooting

### Issue: Colors not showing
**Fix:** Make sure you're using hex codes (`#f7b418`) not names (`yellow`)

### Issue: Layout looks wrong
**Fix:** Ensure you copied the entire JSON including opening and closing braces `{ }`

### Issue: Letters not displaying
**Fix:** Check that each letter object has `"letter"` and `"meaning"` fields

### Issue: Background not visible
**Fix:** Verify `backgroundColor` has a hex code

### Issue: Not rendering at all
**Fix:** Ensure `"type": "framework_cover"` is present

---

## 📂 Where to Store Your Templates

Recommended location:
```
tcp-platform/public/templates/
  ├── EXACT-SPARK-TEMPLATE.json
  ├── BLANK-FRAMEWORK-TEMPLATE.json
  ├── your-custom-framework-1.json
  ├── your-custom-framework-2.json
  └── ...
```

---

## 🎉 You're Ready!

You now have:
- ✅ Exact duplicate of Chapter 1 SPARK page
- ✅ Blank template for new frameworks
- ✅ Complete customization guide
- ✅ Color presets
- ✅ Examples and troubleshooting

Just copy, customize, and paste into your admin panel! 🚀
