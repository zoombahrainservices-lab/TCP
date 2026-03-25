# Phase 4 Task 4.1: Replace getNextStepWithContent N+1 with V2

## The Problem

Current `getNextStepWithContent` has an N+1 query pattern:
1. Fetches all steps after current order_index
2. **For each step**, calls `getStepPages(step.id)` sequentially
3. Returns first step that has pages (or resolution step)

**Impact**: If there are 5 steps after current, this makes 6 queries (1 for steps + 5 for pages).

## The Solution

Create `getNextStepWithContentV2` that:
1. Fetches all steps after current order_index (1 query)
2. Fetches pages for ALL those step IDs in a single query with `IN` clause
3. Groups pages by step_id in memory
4. Returns first step that has pages

**Result**: Always 2 queries regardless of step count.

## Safety Strategy

1. ✅ Create V2 beside existing function (don't replace yet)
2. ✅ Add comparison logging in development
3. ✅ Test V2 returns same results as V1
4. ✅ Switch reading page to use V2
5. ✅ Monitor for issues
6. Keep V1 for emergency rollback

## Implementation

### Files Changing
- `lib/content/queries.ts` - add `getNextStepWithContentV2`
- `app/read/[chapterSlug]/[stepSlug]/page.tsx` - switch to V2

### Exact Risk
**Medium to High** - This is critical navigation logic. If V2 has bugs:
- Users could get wrong next step
- Reading flow could break
- Progress completion could fail

### Before/After Behavior
- **Before**: Sequential page checks, 1 + N queries
- **After**: Parallel page fetch, always 2 queries
- **Result**: Identical next step returned, much faster

### Manual Regression Checks
- ✅ Navigate through reading pages → verify correct next steps
- ✅ Handle resolution steps correctly (they have no pages)
- ✅ Handle end-of-chapter (no more steps)
- ✅ Handle steps with no pages (skip to next with content)
- ✅ Verify all step types work: reading, framework, techniques, follow_through

### Rollback Path
Revert `page.tsx` to use `getNextStepWithContent` (V1), keep V2 for later retry.
