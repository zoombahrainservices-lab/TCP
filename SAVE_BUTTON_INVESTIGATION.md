# 🔍 Save Button Investigation Report

## Analysis from 8 Different Angles

### ✅ Angle 1: Database Schema
**Finding:** `step_pages` table structure:
- ✅ HAS: `content` (JSONB) - your self-check blocks save here
- ❌ NO: `hero_image_url` column
- ❌ NO: `title_style` column

**Conclusion:** Content CAN save, but hero_image_url cannot.

### ✅ Angle 2: Server Action Code (`updatePage`)
**Finding:** Lines 1618-1620 in `app/actions/admin.ts`:
```typescript
const payload: Record<string, unknown> = {}
if (data.title !== undefined) payload.title = data.title
if (data.content !== undefined) payload.content = data.content
// hero_image_url is NOT included!
```

**Conclusion:** Only `title` and `content` are saved. Hero image is intentionally ignored.

### ✅ Angle 3: Frontend Save Handler
**Finding:** Lines 233-237 in page editor:
```typescript
const payload = {
  title: pageTitle,
  content: prepared,  // ← Your self-check blocks are here
  hero_image_url: heroImageUrl || null,  // ← This gets ignored by server!
}
```

**Conclusion:** Frontend TRIES to save hero_image, but server drops it.

### ✅ Angle 4: Content Preparation
**Finding:** Lines 210-248 (`savePage` function):
- ✅ Calls `prepareContentForSave(contentWithMeta)` 
- ✅ Validates blocks with `validateBlocks(prepared)`
- ✅ Sends to server with `await updatePage(pageId, payload)`

**Conclusion:** Content preparation looks correct.

### ✅ Angle 5: Block Validation
**Finding:** Line 226-231:
```typescript
const validation = validateBlocks(prepared)
if (!validation.valid) {
  toast.error(`Validation failed: ${validation.errors.join('; ')}`)
  setSaving(false)
  return  // ← Save stops here if validation fails!
}
```

**Conclusion:** If your blocks don't validate, save fails silently (well, with toast).

### ✅ Angle 6: Error Handling
**Finding:** Lines 241-245:
```typescript
} catch (error: any) {
  console.error('Error saving:', error)
  const message = error?.message ?? ...
  toast.error(message)
}
```

**Conclusion:** Errors ARE caught and shown. If you don't see an error toast, the save technically "succeeded."

### ✅ Angle 7: Success Feedback
**Finding:** Line 240:
```typescript
toast.success('Content saved successfully')
```

**Conclusion:** If you see green "Content saved successfully" toast, the data DID save to database.

### ✅ Angle 8: State vs Database Mismatch
**Finding:** 
- Frontend state updates immediately (line 567: `onChange={setContent}`)
- Database saves happen async (line 239: `await updatePage`)
- No refresh after save (no `router.refresh()` or query invalidation)

**Conclusion:** **THIS IS THE LIKELY ISSUE!** Changes save to DB but UI doesn't reload fresh data from DB.

---

## 🎯 ROOT CAUSE (All Angles Point Here):

### Primary Issue: **Stale Data After Save**

1. ✅ You edit the self-check block in the UI
2. ✅ State updates immediately (`setContent`)
3. ✅ You click "Save Changes"
4. ✅ Content DOES save to database
5. ❌ But page doesn't refresh from database
6. ❌ When you reload page manually, React Query cache might be stale
7. ❌ So you see old data even though new data is in DB

### Evidence:
- Line 26-34: Uses React Query with `staleTime: 30000` (30 seconds)
- No cache invalidation after save
- No `router.refresh()` after save
- Query key is `['admin-page-full', pageId]`

---

## 🔧 The Fix

The issue is **NOT** that save isn't working. The issue is that after save, the UI needs to:
1. Invalidate the React Query cache
2. Refetch fresh data from the database

**Solution: Add cache invalidation after successful save**
