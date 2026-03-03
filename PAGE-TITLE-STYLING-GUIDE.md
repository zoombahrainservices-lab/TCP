# 📝 Page Title Styling Guide

## Overview

You can now customize the **color, size, weight, and alignment** of page titles in your reading content. Each page can have its own unique title styling!

---

## ✨ Features Added

### 1. **Title Color**
- Pick any color using color picker
- Or enter hex code manually
- Default: `#1f2937` (dark gray)

### 2. **Title Size**
- **Small**: `text-2xl` (perfect for sub-sections)
- **Medium**: `text-3xl` (standard page title)
- **Large**: `text-4xl` (emphasis title) ← **Default**
- **Extra Large**: `text-5xl` (hero title)

### 3. **Font Weight**
- **Normal**: Light weight text
- **Medium**: Slightly heavier
- **Semi Bold**: Medium-heavy weight
- **Bold**: Strong emphasis ← **Default**
- **Extra Bold**: Maximum impact

### 4. **Text Alignment**
- **Left**: Standard alignment ← **Default**
- **Center**: Centered title
- **Right**: Right-aligned title

---

## 🎯 How to Use

### Step 1: Open Admin Panel

1. Navigate to: `/admin/chapters/[your-chapter-id]`
2. Click on the **Steps** tab
3. Expand the step containing your page
4. Find the page you want to style

### Step 2: Edit Page Metadata

1. Click the **"Metadata"** button on the page card
2. You'll see a new **"Page Title Styling"** section with a yellow/amber background
3. This section contains all the styling controls

### Step 3: Customize Title Style

**Color:**
- Click the color picker (colored square)
- Choose your color
- OR type hex code in the text field (e.g., `#3b82f6` for blue)

**Size:**
- Select from dropdown: Small, Medium, Large, or Extra Large

**Font Weight:**
- Select from dropdown: Normal, Medium, Semi Bold, Bold, or Extra Bold

**Alignment:**
- Select from dropdown: Left, Center, or Right

### Step 4: Save Changes

1. Click the **"Save"** button
2. Changes are applied instantly (optimistic update)
3. Title will appear with new styling in the reading view

---

## 🎨 Example Styling Combinations

### Example 1: Hero Title (Chapter Opening)
```
Title: "THE GENIUS WHO COULDNT SPEAK"
Color: #f7b418 (amber/gold)
Size: Extra Large
Weight: Extra Bold
Alignment: Center
```
**Use for:** Chapter introductions, major section headers

---

### Example 2: Calm Reading Title
```
Title: "Understanding Your Patterns"
Color: #6366f1 (indigo)
Size: Large
Weight: Semi Bold
Alignment: Left
```
**Use for:** Standard reading pages

---

### Example 3: Energetic Action Title
```
Title: "Take Action Now!"
Color: #ef4444 (red)
Size: Large
Weight: Extra Bold
Alignment: Center
```
**Use for:** Action steps, important calls-to-action

---

### Example 4: Subtle Sub-Section
```
Title: "Key Points to Remember"
Color: #64748b (slate gray)
Size: Medium
Weight: Semi Bold
Alignment: Left
```
**Use for:** Sub-sections, summaries

---

## 🎨 Color Palette Suggestions

### Brand Colors
```
Amber (TCP Brand):  #f7b418
Orange Accent:      #ff6b35
Dark Gray:          #1f2937
```

### Warm Colors (Energetic, Action)
```
Red:      #ef4444
Orange:   #f97316
Yellow:   #f7b418
Amber:    #f59e0b
```

### Cool Colors (Calm, Reflective)
```
Blue:     #3b82f6
Indigo:   #6366f1
Purple:   #8b5cf6
Teal:     #14b8a6
```

### Neutral Colors (Professional)
```
Dark Gray:    #1f2937
Medium Gray:  #6b7280
Slate:        #64748b
Zinc:         #71717a
```

### Success/Positive
```
Green:        #10b981
Emerald:      #059669
Lime:         #84cc16
```

---

## 💡 Best Practices

### 1. **Consistency Within Chapters**
- Use similar styling for pages within the same step
- Match colors to chapter theme

### 2. **Hierarchy**
- **Extra Large + Extra Bold** = Chapter titles
- **Large + Bold** = Main page titles
- **Medium + Semi Bold** = Sub-sections

### 3. **Readability**
- Dark colors work best: `#1f2937`, `#374151`
- Avoid light colors on light backgrounds
- Test in both light and dark mode

### 4. **Color Psychology**
- **Red/Orange** = Urgency, action, energy
- **Blue/Purple** = Trust, calm, wisdom
- **Green** = Growth, success, positive
- **Yellow/Amber** = Attention, optimism, warmth
- **Gray/Black** = Professional, serious, formal

### 5. **Accessibility**
- Ensure good contrast ratio (at least 4.5:1)
- Don't rely on color alone to convey meaning
- Test readability at different sizes

---

## 📐 Size Guidelines

### When to Use Each Size

**Extra Large (text-5xl)**
- Chapter opening pages
- Major framework introductions
- Hero sections

**Large (text-4xl)** ← **Most Common**
- Standard page titles
- Reading page headers
- Main content sections

**Medium (text-3xl)**
- Sub-sections
- Secondary headers
- Content blocks

**Small (text-2xl)**
- Minor sections
- Sidebar content
- Supplementary information

---

## 🔧 Technical Details

### Default Values
If you don't set custom styling, pages use:
```
Color: #1f2937 (dark gray)
Size: large (text-4xl)
Weight: bold
Alignment: left
```

### Database Fields
The following fields are stored in the `step_pages` table:
- `title_color` (string, hex code)
- `title_size` (enum: 'small', 'medium', 'large', 'xl')
- `title_font_weight` (enum: 'normal', 'medium', 'semibold', 'bold', 'extrabold')
- `title_alignment` (enum: 'left', 'center', 'right')

### Component Used
`components/content/PageTitle.tsx` handles the rendering with custom styles

---

## 🆘 Troubleshooting

### Issue: Color not showing
**Fix:** Make sure you're using hex format (#rrggbb), not color names

### Issue: Changes not saving
**Fix:** Click "Save" button after editing metadata

### Issue: Title too small on mobile
**Fix:** Sizes are responsive - they automatically scale down on mobile

### Issue: Color too light in dark mode
**Fix:** The component auto-adjusts for dark mode, but test your color choice

---

## 🎯 Quick Reference

| Property | Options | Default |
|----------|---------|---------|
| **Color** | Any hex code | `#1f2937` |
| **Size** | small, medium, large, xl | `large` |
| **Weight** | normal, medium, semibold, bold, extrabold | `bold` |
| **Alignment** | left, center, right | `left` |

---

## 📱 Example: Complete Page Setup

Let's style a page from start to finish:

### Page: "The SPARK Framework"

**Step 1:** Click "Metadata" button on the page

**Step 2:** Set Title Styling:
```
Color: #f7b418 (amber - matches SPARK brand)
Size: Extra Large
Weight: Extra Bold
Alignment: Center
```

**Step 3:** Set Basic Info:
```
Title: The SPARK Framework
Slug: spark-framework
Minutes: 10
XP Award: 50
```

**Step 4:** Click "Save"

**Result:** Beautiful centered, large, bold, amber title that matches your framework theme!

---

## 🎉 You're Ready!

Now you can create visually stunning, professionally styled page titles that match your content's mood and importance. Mix and match colors, sizes, and weights to create the perfect look for each page!

**Location of Styling Controls:**
`Admin Panel → Chapters → [Chapter] → Steps Tab → [Step] → [Page] → Metadata Button → "Page Title Styling" Section`
