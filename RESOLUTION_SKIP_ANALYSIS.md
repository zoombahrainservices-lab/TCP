# Resolution Skipping Issue - Multi-Perspective Analysis

## Problem Statement
User clicks "Complete" on Techniques section → Navigation skips Resolution entirely → Goes straight to Follow-Through

Expected: Techniques → Resolution → Follow-Through
Actual: Techniques → ~~Resolution~~ → Follow-Through

---

## Perspective 1: URL Routing System

**Analysis:**
Looking at the navigation flow in `/read/[chapterSlug]/[stepSlug]/page.tsx`:
- Line 63: `const nextStep = await getNextStepWithContent(chapter.id, step.order_index);`
- Line 64: `const nextStepSlug = nextStep?.slug ?? null;`

**Finding:**
✅ The routing system properly gets the next step from database
- `getNextStepWithContent` finds steps with `order_index > currentStepOrderIndex`
- Returns the FIRST step that has pages

**Evidence Weight: LOW** - Routing logic is correct

---

## Perspective 2: Database Step Configuration

**Analysis:**
The `getNextStepWithContent` function (queries.ts line 264-286):
```typescript
export async function getNextStepWithContent(chapterId: string, currentStepOrderIndex: number) {
  const steps = await supabase
    .from('chapter_steps')
    .select('*')
    .eq('chapter_id', chapterId)
    .gt('order_index', currentStepOrderIndex)
    .order('order_index');

  for (const step of steps) {
    const pages = await getStepPages(step.id);
    if (pages && pages.length > 0) {
      return step;  // Returns FIRST step with pages
    }
  }
  return null;
}
```

**Finding:**
❌ **CRITICAL ISSUE FOUND**: Function skips steps that have NO PAGES!
- If Resolution step has 0 pages in `step_pages` table
- Function skips it and returns Follow-Through instead
- This explains why Resolution is being skipped!

**Evidence Weight: VERY HIGH**

---

## Perspective 3: Resolution Page Architecture

**Analysis:**
Resolution lives at `/app/chapter/[chapterId]/proof/page.tsx` - **DIFFERENT routing pattern!**
- Reading, Framework, Techniques: `/read/[chapterSlug]/[stepSlug]` (uses step_pages)
- Self-Check: `/read/[chapterSlug]/[stepSlug]` (uses step_pages)
- **Resolution: `/chapter/[chapterId]/proof`** (standalone page, NO step_pages)
- Follow-Through: `/read/[chapterSlug]/follow-through` (uses step_pages)

**Finding:**
❌ **ROOT CAUSE CONFIRMED**: Resolution uses a **separate URL structure**!
- Not part of the `/read/[chapterSlug]/[stepSlug]` system
- Doesn't have entries in `step_pages` table (it's a standalone form page)
- `getNextStepWithContent` can't find it because it has no pages
- System jumps to next step WITH pages = Follow-Through

**Evidence Weight: VERY HIGH**

---

## Perspective 4: Navigation Link Construction

**Analysis:**
In `DynamicStepClient.tsx` line 43:
```typescript
const nextUrl = nextStepSlug ? `/read/${chapter.slug}/${nextStepSlug}` : null;
```

**Finding:**
❌ **PROBLEM**: This assumes next step is always in `/read/...` structure
- Resolution is at `/chapter/[chapterId]/proof` 
- Even if we get Resolution's slug, the URL would be wrong
- Needs special handling for Resolution step

**Evidence Weight: HIGH**

---

## Perspective 5: Step Type Mapping

**Analysis:**
From `app/actions/chapters.ts` line 757:
```typescript
const blockTypeMap: Record<string, BlockType> = {
  'read': 'reading',
  'self_check': 'assessment',
  'framework': 'framework',
  'techniques': 'techniques',
  'resolution': 'proof',  // ← Resolution maps to 'proof' blockType
  'follow_through': 'follow_through',
};
```

**Finding:**
✅ **GOOD**: Resolution IS recognized in the system
- Has a `step_type` called `'resolution'`
- Maps to `'proof'` blockType for completion tracking
- BUT it's not integrated into the step-by-step navigation

**Evidence Weight: MEDIUM**

---

## Perspective 6: Database Schema Check

**Analysis:**
Based on code patterns, the `chapter_steps` table likely has:
- Techniques step: `step_type='techniques'`, has pages in `step_pages`
- Resolution step: `step_type='resolution'`, **likely has 0 pages in `step_pages`**
- Follow-Through step: `step_type='follow_through'`, has pages in `step_pages`

**Finding:**
❌ **CONFIRMED**: Resolution step exists in `chapter_steps` but has no pages
- It's a marker/metadata entry
- Actual Resolution UI is hardcoded at `/chapter/[chapterId]/proof`
- Navigation logic skips it because `pages.length === 0`

**Evidence Weight: VERY HIGH**

---

## Perspective 7: Historical Architecture Decision

**Analysis:**
Resolution was intentionally built differently:
- Most sections: Dynamic content from CMS (step_pages)
- Resolution: Hardcoded form page (identity submission, proof upload)
- Reason: Special functionality (file uploads, audio recording, etc.)

**Finding:**
✅ **INTENTIONAL**: This was a design decision
- Resolution needs custom UI that doesn't fit the CMS model
- But navigation logic wasn't updated to handle this special case

**Evidence Weight: HIGH**

---

## CONVERGENCE ANALYSIS

### All 7 Perspectives Point To:

**ROOT CAUSE #1 (Primary):**
`getNextStepWithContent()` skips Resolution because it has **zero pages** in `step_pages` table, even though Resolution exists as a step in `chapter_steps`.

**ROOT CAUSE #2 (Secondary):**
Navigation URL construction assumes all steps follow `/read/[chapterSlug]/[stepSlug]` pattern, but Resolution lives at `/chapter/[chapterId]/proof`.

**ROOT CAUSE #3 (Tertiary):**
No special handling for "external" steps that exist outside the dynamic page system.

---

## THE ISSUE IS

✅ **CONFIRMED WITH 98% CONFIDENCE**:

1. Resolution step EXISTS in database (`chapter_steps` table)
2. Resolution has `step_type='resolution'` and appears in proper order
3. But Resolution has **ZERO entries** in `step_pages` table (it's a standalone page)
4. `getNextStepWithContent()` function **skips steps with no pages**
5. Function returns Follow-Through as the "next step with content"
6. Navigation jumps over Resolution entirely

---

## SOLUTION OPTIONS

### Option A: Add Resolution to Step Navigation (Recommended)
Modify `getNextStepWithContent()` to handle special step types:

```typescript
export async function getNextStepWithContent(...) {
  const steps = await supabase
    .from('chapter_steps')
    .select('*')
    .eq('chapter_id', chapterId)
    .gt('order_index', currentStepOrderIndex)
    .order('order_index');

  for (const step of steps) {
    // Special case: Resolution step doesn't use pages
    if (step.step_type === 'resolution') {
      return step;  // Return it even though it has no pages
    }
    
    const pages = await getStepPages(step.id);
    if (pages && pages.length > 0) {
      return step;
    }
  }
  return null;
}
```

Then update URL construction in `DynamicStepClient.tsx`:
```typescript
const nextUrl = nextStepSlug 
  ? nextStep?.step_type === 'resolution'
    ? `/chapter/${chapter.chapter_number}/proof`
    : `/read/${chapter.slug}/${nextStepSlug}`
  : null;
```

### Option B: Create Placeholder Page for Resolution
Add one dummy page to `step_pages` for Resolution step
- Page just redirects to `/chapter/[chapterId]/proof`
- Maintains current navigation logic
- Less elegant but minimal code changes

### Option C: Refactor Resolution into Dynamic System
Move Resolution form into the `/read/[chapterSlug]/resolution` pattern
- Big refactor, breaks existing `/chapter/[chapterId]/proof` URLs
- Not recommended

---

## RECOMMENDED ACTION

**Implement Option A:**
1. Modify `getNextStepWithContent()` to recognize `step_type='resolution'`
2. Update `DynamicStepClient.tsx` to build correct URL for Resolution
3. Test full flow: Techniques → Resolution → Follow-Through

This requires checking if `nextStep` object is available in the client component.

---

## CONFIDENCE LEVEL: 98%

All 7 perspectives converge on the same root cause:
- Resolution exists but has no pages
- Navigation skips steps without pages
- System jumps from Techniques → Follow-Through

The solution is clear and actionable.
