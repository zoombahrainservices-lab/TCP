# Predictive Preload Implementation Summary

## Overview
Implemented a production-safe predictive preloading system for guided chapter navigation in Next.js 16. The system includes:
- n+1..n+3 page image lookahead (network-aware)
- Next-section route/data/image prefetch
- Deduplication via central registry
- Network-aware throttling (respects saveData and slow connections)

## New Files Created

### 1. Network Policy Hook
**File**: `lib/hooks/useNetworkPrefetchPolicy.ts`
**Purpose**: Provides network-aware prefetch policy based on `navigator.connection`

**Features**:
- Detects `saveData` preference (explicit user opt-in to reduce data)
- Adapts to `effectiveType` (slow-2g, 2g, 3g, 4g)
- Returns policy object controlling:
  - Page image lookahead count (1, 2, or 3)
  - Whether to prefetch next routes
  - Whether to load secondary section images
  - Whether to defer non-critical preloads

**Network Policies**:
- `saveData=true`: lookahead=1, no secondary images
- `slow-2g/2g`: lookahead=1, no secondary images
- `3g`: lookahead=2, no secondary images
- `4g/default`: lookahead=3, allow secondary images

### 2. Predictive Preload Hooks
**File**: `lib/hooks/usePredictivePreload.ts`
**Purpose**: Core preload logic for page images and next sections

**Exports**:
- `usePageImagePreload(currentPage, pages, options?)`: Preloads hero images for n+1, n+2, n+3 pages
- `useNextSectionPrefetch(config)`: Prefetches next section route, metadata, and hero images

**Features**:
- Only preloads future pages (currentPage + 1 onwards)
- Respects network policy for lookahead count
- Deduplicates via global registry
- Safe on fast page flips (won't duplicate work)
- Prefetches next section route using `router.prefetch()`
- Warms next-section metadata via API
- Preloads first hero image with high priority
- Optionally preloads second image on fast networks

## Modified Files

### 1. Prefetch Cache Enhancement
**File**: `lib/prefetch/clientPrefetchCache.ts`
**Changes**:
- Added error recovery (allows retry on failure)
- Added soft size limit (MAX_CACHE_SIZE = 500)
- Enhanced error handling in `tryPrefetch()`

### 2. Reading Client
**File**: `app/read/[chapterSlug]/DynamicChapterReadingClient.tsx`
**Changes**:
- Added `usePageImagePreload(currentPage, pages)` for n+1..n+3 image preloading
- Added `useNextSectionPrefetch()` for next section (Self-Check) route and image prefetch
- No changes to navigation or progress logic

### 3. Step Client (Self-Check, Framework, Techniques)
**File**: `app/read/[chapterSlug]/[stepSlug]/DynamicStepClient.tsx`
**Changes**:
- Added `usePageImagePreload(currentPage, pages)` for n+1..n+3 image preloading
- Added `useNextSectionPrefetch()` for next section route and images prefetch
- Includes optional second image candidate from next page
- No changes to navigation or progress logic

### 4. Resolution Page
**File**: `app/chapter/[chapterId]/proof/page.tsx`
**Changes**:
- Replaced one-off `usePrefetchGuidedStep()` with new `useNextSectionPrefetch()`
- Prefetches Follow-Through route and hero image
- Consistent with other section transitions

## Why These Changes Help

1. **Faster page transitions**: Images for n+1, n+2, n+3 are already loaded when user clicks "Continue"
2. **Faster section transitions**: Next section route and hero image are prefetched before user completes current section
3. **Network-aware**: Automatically reduces preloading on slow connections or when user has enabled data saver
4. **Production-safe**: Uses deduplication to prevent repeated fetches and respects network constraints
5. **No breaking changes**: All navigation, progress saving, unlock logic, and UI remain unchanged

## Testing Checklist

### Functional Tests (Local Dev)
- [x] Build completed successfully with no TypeScript errors
- [x] Lint completed with no new errors in modified/new files
- [ ] Reading: Page n → n+1 → n+2 transitions feel faster
- [ ] Reading → Self-Check navigation works correctly
- [ ] Self-Check → Framework navigation works correctly
- [ ] Framework → Techniques navigation works correctly
- [ ] Techniques → Resolution navigation works correctly
- [ ] Resolution → Follow-Through navigation works correctly
- [ ] Resume page index behavior still works (especially Chapter 14 framework long flows)
- [ ] Progress saving works correctly
- [ ] Chapter unlock logic works correctly

### Network Policy Tests (Chrome DevTools)
- [ ] `saveData=true`: Only immediate next route/image preloads (check Network tab)
- [ ] `2g/slow-2g`: No n+3 lookahead (check Network tab)
- [ ] `4g/wifi`: Full n+1..n+3 image lookahead active (check Network tab)
- [ ] No duplicate preload requests for same URLs (check Console for dedup logs)

### Production Preview Tests (Vercel)
- [ ] Route transitions feel faster than before
- [ ] No TypeScript or build errors
- [ ] No breakage in progress save/unlock logic
- [ ] Mobile performance acceptable

## Rollback Instructions

### Quick Rollback (Disable Predictive Preload)
If issues arise, disable the new preload system by removing the hook calls:

1. **Remove from Reading Client**
   - File: `app/read/[chapterSlug]/DynamicChapterReadingClient.tsx`
   - Remove lines:
     - `import { usePageImagePreload, useNextSectionPrefetch } from '@/lib/hooks/usePredictivePreload'`
     - `usePageImagePreload(currentPage, pages)` call
     - `useNextSectionPrefetch({ ... })` call
   - Keep existing `useGuidedFlowPreload()` call

2. **Remove from Step Client**
   - File: `app/read/[chapterSlug]/[stepSlug]/DynamicStepClient.tsx`
   - Remove lines:
     - `import { usePageImagePreload, useNextSectionPrefetch } from '@/lib/hooks/usePredictivePreload'`
     - `usePageImagePreload(currentPage, pages)` call
     - `useNextSectionPrefetch({ ... })` call
   - Keep existing `useGuidedFlowPreload()` call

3. **Remove from Resolution Page**
   - File: `app/chapter/[chapterId]/proof/page.tsx`
   - Remove lines:
     - `import { useNextSectionPrefetch } from '@/lib/hooks/usePredictivePreload'`
     - `import { getSectionImageUrlPrimary } from '@/lib/chapterImages'`
     - `const followThroughUrl = ...` and related lines
     - `useNextSectionPrefetch({ ... })` call
   - Restore:
     - `import { usePrefetchGuidedStep } from '@/lib/hooks/useGuidedFlowPreload'`
     - `usePrefetchGuidedStep(chapterId, 'follow_through', null)`

4. **Deploy and verify**
   - Run `npm run build` to ensure no errors
   - Deploy to Vercel
   - Verify core navigation works

### Full Rollback (Remove All Changes)
If the quick rollback isn't sufficient:

1. Perform quick rollback steps above
2. Delete new files:
   - `lib/hooks/useNetworkPrefetchPolicy.ts`
   - `lib/hooks/usePredictivePreload.ts`
   - `PREDICTIVE_PRELOAD_IMPLEMENTATION.md`
3. Revert `lib/prefetch/clientPrefetchCache.ts` changes:
   - Remove error handling and size limit from `tryPrefetch()`
   - Restore original simple implementation
4. Run smoke tests (see below)

## Smoke Test Checklist
After any rollback:
- [ ] Login → Dashboard works
- [ ] Dashboard → Reading works
- [ ] Reading → Self-Check works
- [ ] Framework page navigation works (especially Chapter 14)
- [ ] Techniques page navigation works
- [ ] Resolution submission works
- [ ] Follow-Through works
- [ ] Progress saving works
- [ ] No console errors

## Performance Debug
To verify preloading is working as expected:

1. Open browser DevTools Console
2. Look for logs prefixed with `[Prefetch]` (only in dev mode)
3. Check Network tab for:
   - Image preload requests (should see hero images loading ahead)
   - Route prefetch requests
   - No duplicate requests for same URLs
4. Test with throttled network (Chrome DevTools → Network → Slow 3G)
5. Test with Save-Data enabled (Chrome DevTools → Network conditions → Save-Data: on)

## Notes
- All changes are isolated to the preload layer
- No changes to navigation handlers
- No changes to progress save logic
- No changes to unlock logic
- No changes to section transition logic
- Backward compatible with existing `useGuidedFlowPreload()` hook
