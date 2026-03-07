# Dynamic Chapter Navigation & Images - Complete

## Problem Fixed

**Issue**: When on Chapter 3 and clicking "Framework" (or any section) from dashboard/sidebar, it was going to Chapter 1 Framework instead of Chapter 3 Framework.

**Root Cause**: Dashboard navigation (`DashboardNav.tsx`) only had hardcoded slugs for Chapters 1-2 and was falling back to Chapter 1 for any other chapter.

## Solution Implemented

### 1. **Dynamic Chapter Slug Generation**

Created a helper function that works for **any chapter number**:

```typescript
const getChapterSlug = (chapterNum: number) => {
  return chapterSlugByNumber[chapterNum] || `chapter-${chapterNum}`
}
```

- **Chapter 1** → `stage-star-silent-struggles`
- **Chapter 2** → `genius-who-couldnt-speak`
- **Chapter 3+** → `chapter-3`, `chapter-4`, etc.

### 2. **All 6 Section Links Now Dynamic**

Updated **ALL** navigation links to use the current chapter:

```typescript
const currentChapterSlug = getChapterSlug(activeChapter)

const readingHref = `/read/${currentChapterSlug}/reading`
const selfCheckHref = `/read/${currentChapterSlug}/assessment`
const frameworkHref = `/read/${currentChapterSlug}/framework`
const techniquesHref = `/read/${currentChapterSlug}/techniques`
const followThroughHref = `/read/${currentChapterSlug}/follow-through`
const resolutionHref = `/chapter/${activeChapter}/proof`
```

**Before**: Reading & Self-Check used `/chapter/N/` format (wrong)  
**After**: All sections use `/read/chapter-slug/section` format (correct & consistent)

### 3. **Section Images Made Dynamic**

Created `lib/chapterImages.ts` for dynamic image paths:

**Chapter 1** (existing structure):
- Base: `/slider-work-on-quizz/chapter1/`
- Reading: `chaper1-1.jpeg`
- Framework: `frameworks/spark.webp`
- Techniques: `technique/Visual Progress.webp`
- Follow-Through: `follow through/90days.webp`

**Chapter 2, 3, ... N**:
- Base: `/chapter/chapter 2/`, `/chapter/chapter 3/`, etc.
- Images named by section:
  - `reading.webp` (or `.png`)
  - `self-check.webp`
  - `framework.webp`
  - `technique.webp`
  - `resolution.webp`
  - `follow-through.webp`

**Map Client Updated**: Now shows section thumbnails for ALL chapters dynamically (not just Chapter 1).

## How It Works Now

### Current Chapter Detection

The system intelligently detects the current chapter from:

1. **URL when on chapter page**: `/read/chapter-3/framework` → Chapter 3
2. **localStorage when on dashboard**: Last chapter user was viewing
3. **Server-provided current chapter**: From user progress

### Navigation Logic

**Scenario 1: On Chapter 3 Framework**
- Reading → `/read/chapter-3/reading`
- Self-Check → `/read/chapter-3/assessment`
- Framework → `/read/chapter-3/framework` ✅ (stays on Chapter 3)
- Techniques → `/read/chapter-3/techniques`
- Resolution → `/chapter/3/proof`
- Follow-Through → `/read/chapter-3/follow-through`

**Scenario 2: On Dashboard (last viewed Chapter 2)**
- All 6 section links point to **Chapter 2** content
- Clicking Framework → `/read/genius-who-couldnt-speak/framework`

**Scenario 3: On Chapter 10 (future)**
- All 6 section links point to **Chapter 10** content
- Clicking Framework → `/read/chapter-10/framework`
- Uses slug `chapter-10` (automatic fallback)

## Files Modified

1. **`components/ui/DashboardNav.tsx`**
   - Added `getChapterSlug()` helper
   - Created all 6 dynamic href variables
   - Fixed Reading & Self-Check to use `/read/` format

2. **`lib/chapterImages.ts`** (new)
   - `getSectionImageCandidates(chapterNum, stepType)` → `[webp, png]`
   - `getChapterImageBase(chapterNum)` → base path
   - `getChapterCoverUrl(chapterNum)` → cover image
   - Works for chapters 1-∞

3. **`app/dashboard/map/MapClient.tsx`**
   - Imports `getSectionImageCandidates`
   - Shows section thumbnails for ALL chapters
   - Fallback to icons when no image exists

## Testing

✅ Build successful  
✅ All TypeScript types valid  
✅ Dynamic navigation for Chapter 1, 2, 3+  
✅ Section images show for all chapters  
✅ Map panel shows correct thumbnails

## Usage for New Chapters

To add **Chapter 4** (or any new chapter):

1. **Create image folder**: `public/chapter/chapter 4/`
2. **Add 6 section images**:
   - `reading.webp`
   - `self-check.webp`
   - `framework.webp`
   - `technique.webp`
   - `resolution.webp`
   - `follow-through.webp`
3. **No code changes needed** - everything is automatic!

Optional: Add custom slug in `DashboardNav.tsx`:
```typescript
const chapterSlugByNumber: Record<number, string> = {
  1: 'stage-star-silent-struggles',
  2: 'genius-who-couldnt-speak',
  4: 'my-custom-chapter-4-slug', // Optional
}
```

## The Logic Behind It

> "If the current chapter is N, then all 6 sections (Reading, Self-Check, Framework, Techniques, Resolution, Follow-Through) should show content of N."

This is now **100% implemented**. The navigation is **contextual** - it always points to the chapter you're currently viewing or last viewed.

## Commit

```
Make dashboard navigation contextual to current chapter for all 6 sections
```
