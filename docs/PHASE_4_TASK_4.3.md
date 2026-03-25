# Phase 4 Task 4.3: Bound Map Page Queries

## The Problem

Current map page loads unbounded data:
```ts
// Fetches ALL steps (no chapter filter)
.from('chapter_steps').select('...').order('order_index')

// Fetches ALL pages (no step filter)  
.from('step_pages').select('...').order('order_index')
```

**Impact**: If there are 100 chapters with 1000 steps and 5000 pages, the map loads ALL of them even if only 5 chapters are published.

## The Solution

Bound queries to only published chapter IDs:
1. Get published chapters (already cached)
2. Extract chapter IDs
3. Fetch steps with `IN (chapter_ids)`
4. Fetch pages with `IN (step_ids)` 
5. Same client-side grouping logic

**Result**: Only load data that will actually be displayed.

## Files Changing
- `app/map/page.tsx`

## Exact Risk
**Medium** - Map page is not critical path but users rely on it to track progress. If bounded queries have bugs:
- Missing chapters/steps/pages in map view
- Incorrect progress display
- Performance regression if filter is wrong

## Safety Strategy
1. Keep same final data shape for `ChapterMapClient`
2. Add filters based on already-fetched published chapter IDs
3. Test that all published content appears
4. Verify admin vs non-admin views unchanged

## Before/After Behavior
- **Before**: Loads all chapters/steps/pages from database
- **After**: Loads only published chapters/steps/pages
- **Result**: Identical map display, much less data transferred

## Expected Impact
- **5 published chapters**: Load ~50 steps and ~200 pages instead of all
- **Query time**: 50-80% reduction
- **Payload size**: 50-80% reduction  
- **TTFB**: ~100-200ms improvement

## Manual Regression Checks
- [ ] Map page loads correctly
- [ ] All published chapters appear
- [ ] All steps for published chapters appear
- [ ] All pages for steps appear
- [ ] Progress completion dots are correct
- [ ] Admin view shows same content
- [ ] Non-admin view shows same content
- [ ] Current chapter highlight works

## Rollback Path
Revert `app/map/page.tsx` to remove `.in()` filters.
