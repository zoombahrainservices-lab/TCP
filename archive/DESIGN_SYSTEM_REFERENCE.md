# TCP Design System - Quick Reference

## Color Palette

```
┌─────────────────────────────────────────────────┐
│ CHARCOAL                                        │
│ #111111                                         │
│ --color-charcoal                                │
│ Usage: Headlines, primary text, serious content │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ OFF-WHITE                                       │
│ #F5F5F2                                         │
│ --color-offwhite                                │
│ Usage: Page backgrounds, reading areas          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ AMBER                                           │
│ #F5B301                                         │
│ --color-amber                                   │
│ Usage: CTAs, buttons, attention, dopamine hits  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ RED                                             │
│ #E63946                                         │
│ --color-red                                     │
│ Usage: Danger, warnings, relapse alerts         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ BLUE                                            │
│ #4A90E2                                         │
│ --color-blue                                    │
│ Usage: Reflection, recovery, calm states        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ GRAY                                            │
│ #9A9A9A                                         │
│ --color-gray                                    │
│ Usage: Secondary text, borders, metadata        │
└─────────────────────────────────────────────────┘
```

## Typography

### Headlines (Bebas Neue)
- **Always uppercase**
- Used for: Section titles, page headings, labels
- Classes: `.headline`, `.headline-xl`, `.headline-lg`, `.headline-md`

```tsx
<h1 className="headline-xl">WELCOME, STUDENT!</h1>
<h2 className="headline-lg">YOUR PROGRESS</h2>
<h3 className="headline-md">READING</h3>
<span className="headline text-sm">DAY 1 OF 30</span>
```

### Body Text (Inter)
- Used for: All paragraphs, descriptions, UI text
- Applied automatically to body
- Clean, readable, professional

### Data/Mono (JetBrains Mono)
- Used for: Scores, statistics, technical data
- Class: `.text-data`

## Button Variants

```tsx
<Button variant="primary">   {/* Amber - Main CTAs */}
<Button variant="secondary"> {/* Gray - Back/Cancel */}
<Button variant="calm">      {/* Blue - Reflection */}
<Button variant="danger">    {/* Red - Delete/Warning */}
<Button variant="ghost">     {/* Transparent - Subtle actions */}
```

## Usage Guidelines

### Color Distribution
- **~70%** Off-white + Gray (neutral backgrounds, secondary text)
- **~20%** Charcoal (primary text, important content)
- **~10%** Accent colors (amber, blue, red for specific actions)

### When to Use Each Accent

#### Amber (#F5B301)
- ✅ Primary action buttons ("Begin", "Continue", "Submit")
- ✅ PDF download buttons
- ✅ Positive progress indicators
- ✅ "Start" or "Next" actions

#### Blue (#4A90E2)
- ✅ Reading mode headers
- ✅ Progress bars
- ✅ Self-check selected states
- ✅ Reflection and calm actions
- ✅ "Complete" buttons

#### Red (#E63946)
- ✅ Delete/Remove actions
- ✅ Warning messages
- ✅ Danger zone indicators (score 43-49)
- ✅ Error states

#### Gray (#9A9A9A)
- ✅ Secondary buttons ("Back", "Cancel")
- ✅ Metadata labels
- ✅ Helper text
- ✅ Disabled states

## Component Examples

### ScoreReport
```tsx
import ScoreReport, { defaultDay1Bands } from '@/components/student/ScoreReport'

<ScoreReport 
  title="SCORE:"
  bands={defaultDay1Bands}
/>
```

### ChapterReader
- Blue header with "READING" title
- Amber PDF button (rounded pill)
- Blue progress bar
- Gray back button, Amber next button

### Progress Indicator
```tsx
<span className="headline text-sm text-[var(--color-charcoal)]">
  DAY {dayNumber} OF 30
</span>
<div className="w-full bg-gray-200 rounded-full h-2">
  <div className="bg-[var(--color-blue)] h-2 rounded-full" />
</div>
```

## CSS Variables

Use these in your components:

```css
/* Colors */
var(--color-charcoal)
var(--color-offwhite)
var(--color-amber)
var(--color-red)
var(--color-blue)
var(--color-gray)

/* Typography */
var(--font-headline)  /* Bebas Neue */
var(--font-body)      /* Inter */
var(--font-mono)      /* JetBrains Mono */
```

## Tailwind Usage

```tsx
/* Preferred method using CSS variables */
className="bg-[var(--color-amber)] text-[var(--color-charcoal)]"

/* Typography */
className="headline-xl"          // 2.5rem, uppercase
className="headline-lg"          // 2rem, uppercase
className="headline-md"          // 1.5rem, uppercase
className="headline text-sm"    // Base size, uppercase
className="text-data"           // Monospace font
```

## Accessibility

- All colors meet WCAG AA contrast requirements
- Headlines are semantic (h1, h2, h3)
- Button states have clear visual feedback
- Color is not the only indicator (text labels included)

## Design Principles

1. **Clarity Over Decoration** - Clean, purposeful design
2. **Hierarchy Through Typography** - Headlines guide the eye
3. **Color With Purpose** - Each accent has meaning
4. **Consistency** - Same patterns across all pages
5. **Readability First** - Off-white reduces eye strain

---

**Quick Start:** Just use the utility classes (`.headline-lg`, `.text-[var(--color-amber)]`) and the Button component variants. The design system handles the rest!
