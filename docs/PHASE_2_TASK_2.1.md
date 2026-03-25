# Phase 2 Task 2.1: Replace select('*') in Metadata-Only Queries

## Files Changing
- `lib/content/queries.ts`

## Exact Risk
**Medium** - If we miss required fields, consuming code will break at runtime. TypeScript won't catch missing fields if types are too broad.

## Strategy
Replace `select('*')` with explicit columns **one function at a time**, starting with the safest metadata-only navigation helpers.

## Safe Candidates (Metadata Only)
These functions only need navigation/lookup fields, not full content:

1. ✅ **getNextStep** - only needs step metadata for navigation
2. ✅ **getPreviousStep** - only needs step metadata  
3. ✅ **getNextChapter** - only needs chapter metadata
4. ✅ **getPreviousChapter** - only needs chapter metadata
5. ✅ **getNextStepWithContent** - initial steps fetch (pages fetched separately)

## Unsafe Candidates (Skip for Now)
These return full objects that consumers might depend on having all fields:

- `getChapterBySlug`, `getChapterById`, `getChapterByNumber` - used in reading routes, need all chapter fields
- `getAllChapters` - used in dashboard/map, needs all fields for display
- `getChapterSteps` - used in various places, needs all step fields
- `getStepPages` - needs all page fields including content
- Full entity lookups (`getStepById`, `getPageById`, etc.)

## Implementation Plan

### Phase 1: Navigation Helpers (Safest)
Start with functions that only support navigation logic and don't render content.

**Fields Needed:**
- **Step nav**: `id`, `chapter_id`, `step_type`, `title`, `slug`, `order_index`
- **Chapter nav**: `id`, `slug`, `title`, `chapter_number`, `order_index`, `is_published`

### Before/After Expected Behavior
- **Before**: Navigation queries fetch all columns (including content, timestamps, etc.)
- **After**: Same navigation results, but smaller payloads and faster queries

### Manual Regression Checks
- Load reading page → verify continue/next step link works
- Navigate between steps → verify correct next/previous step
- Complete a chapter → verify correct next chapter navigation
- Test with chapters that have resolution steps (special case)

### Rollback Path
Revert changes to `lib/content/queries.ts` - restore `select('*')` for affected functions.

---

## Changes Being Made

### 1. getNextStep
```typescript
// Before: select('*')
// After: explicit columns for navigation
.select('id, chapter_id, step_type, title, slug, order_index')
```

### 2. getPreviousStep
```typescript
// Before: select('*')
// After: explicit columns for navigation  
.select('id, chapter_id, step_type, title, slug, order_index')
```

### 3. getNextStepWithContent (initial fetch only)
```typescript
// Before: select('*')
// After: explicit columns for navigation
// Note: pages are fetched separately via getStepPages
.select('id, chapter_id, step_type, title, slug, order_index')
```

### 4. getNextChapter
```typescript
// Before: select('*')
// After: explicit columns for navigation
.select('id, slug, title, chapter_number, order_index, is_published')
```

### 5. getPreviousChapter  
```typescript
// Before: select('*')
// After: explicit columns for navigation
.select('id, slug, title, chapter_number, order_index, is_published')
```

---

## Expected Impact
- **Query Payload Reduction**: ~50-70% smaller for navigation queries (no content/timestamps/metadata fields)
- **Query Speed**: Slightly faster due to less data transfer
- **Behavior**: Identical - these functions only support navigation logic

## Risk Mitigation
1. Start with pure navigation helpers only
2. Test each change before moving to next
3. Keep full entity lookups unchanged for now
4. Tests will catch any missing field errors
