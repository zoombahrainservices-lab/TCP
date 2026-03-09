# Navigation State Preservation - Implementation Guide

## Overview

This guide documents how pagination and list state is preserved when navigating between list views and edit/detail views in the admin panel.

## Current Implementation

### ✅ Chapters → Chapter Editor → Page Editor (IMPLEMENTED)

The application **already implements** state preservation for the chapter editor workflow:

#### Flow:
1. **Chapter Editor** (`/admin/chapters/[id]`) displays steps and pages
2. User clicks **"Edit Content"** on a page
3. Navigates to **Page Editor** (`/admin/chapters/[id]/pages/[pageId]/edit`)
4. User clicks **"Back"** or **"Save and Return"**
5. Returns to **Chapter Editor** with:
   - ✅ Same tab active (`tab=steps`)
   - ✅ Same step expanded (`expand=stepId`)
   - ✅ Scrolls to the edited page (`page=pageId`)

#### Implementation (StepCard.tsx, line 310):

```tsx
<Link
  href={`/admin/chapters/${chapterId}/pages/${page.id}/edit?from=steps&returnUrl=${encodeURIComponent(`/admin/chapters/${chapterId}?tab=steps&expand=${step.id}&page=${page.id}`)}`}
>
  <FileEdit className="w-4 h-4" />
  Edit Content
</Link>
```

#### Return Logic (PageContentEditorPage, lines 69-93):

```tsx
const handleBack = () => {
  // Priority 1: Use explicit returnUrl if provided
  if (returnUrlParam) {
    router.push(returnUrlParam)
    return
  }

  // Priority 2: Return to steps tab with expansion
  if (from === 'steps') {
    const expand = step?.id ? `&expand=${step.id}` : ''
    const pageParam = page?.id ? `&page=${page.id}` : ''
    router.push(`/admin/chapters/${chapterId}?tab=steps${expand}${pageParam}`)
    return
  }

  // Priority 3: Return to reading view
  if (from === 'reading' && chapter?.slug) {
    const stepSlug = step?.slug ?? 'reading'
    router.push(`/read/${chapter.slug}/${stepSlug}`)
    return
  }

  // Fallback: chapter editor home
  router.push(`/admin/chapters/${chapterId}`)
}
```

### 🔄 Chapters List → Chapter Editor (NEEDS UPDATE WHEN PAGINATION ADDED)

Currently, the chapters list (`/admin/chapters`) displays **all chapters without pagination**. When pagination is added in the future, use this pattern:

#### Recommended Implementation:

**1. Add pagination state to chapters list:**

```tsx
// In /admin/chapters/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'

export default function ChaptersListPage() {
  const searchParams = useSearchParams()
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  
  // ... pagination logic ...
  
  return (
    <div>
      {chapters.map((chapter) => (
        <Link href={`/admin/chapters/${chapter.id}?returnPage=${currentPage}`}>
          <Button>Edit</Button>
        </Link>
      ))}
      
      {/* Pagination controls */}
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
```

**2. Update chapter editor back button:**

```tsx
// In /admin/chapters/[id]/page.tsx
const searchParams = useSearchParams()
const returnPage = searchParams.get('returnPage')

<Link
  href={returnPage ? `/admin/chapters?page=${returnPage}` : '/admin/chapters'}
  className="..."
>
  <ArrowLeft /> Back to Chapters
</Link>
```

## Utility Functions

A complete set of utilities has been created in `lib/utils/navigationState.ts`:

### Quick Examples:

#### 1. Simple State Preservation:

```tsx
import { buildEditUrl, extractReturnState, buildReturnUrl } from '@/lib/utils/navigationState'

// From list page:
const editUrl = buildEditUrl('/admin/items/123/edit', { 
  page: 4, 
  filter: 'active' 
})
router.push(editUrl) // → /admin/items/123/edit?page=4&filter=active

// From edit page:
const searchParams = useSearchParams()
const state = extractReturnState(searchParams, ['page', 'filter'])
const returnUrl = buildReturnUrl('/admin/items', state)
router.push(returnUrl) // → /admin/items?page=4&filter=active
```

#### 2. ReturnUrl Pattern (Recommended):

```tsx
import { buildEditUrlWithReturn } from '@/lib/utils/navigationState'

// From list page:
const currentUrl = `/admin/items?page=4&filter=active`
const editUrl = buildEditUrlWithReturn('/admin/items/123/edit', currentUrl)
router.push(editUrl)
// → /admin/items/123/edit?returnUrl=%2Fadmin%2Fitems%3Fpage%3D4%26filter%3Dactive

// From edit page:
const returnUrl = searchParams.get('returnUrl')
if (returnUrl) {
  router.push(returnUrl) // → /admin/items?page=4&filter=active
}
```

#### 3. Pagination-Specific:

```tsx
import { extractPaginationState, buildPaginationUrl } from '@/lib/utils/navigationState'

const searchParams = useSearchParams()
const pagination = extractPaginationState(searchParams)
// { page: 4, pageSize: 20, sortBy: 'created_at', sortOrder: 'desc' }

const url = buildPaginationUrl('/admin/items', { page: 5, sortBy: 'name' })
// → /admin/items?page=5&sortBy=name
```

## Best Practices

### ✅ DO:

1. **Use `returnUrl` for complex navigation flows**
   - Preserves all state automatically
   - Works across multiple navigation levels
   - Already implemented in page editor

2. **Pass state explicitly for simple cases**
   - `?page=4&tab=steps&expand=stepId`
   - Easy to debug
   - Good for single-level navigation

3. **Fallback gracefully**
   - Always provide a default return path
   - Check if state parameters exist before using them

4. **Encode URLs properly**
   - Use `encodeURIComponent()` for `returnUrl` values
   - Prevents URL parsing issues

### ❌ DON'T:

1. **Don't use browser history**
   - `router.back()` can break if user came from external link
   - Always use explicit navigation

2. **Don't hardcode URLs**
   - Make return paths configurable
   - Use utility functions for consistency

3. **Don't forget edge cases**
   - What if page number exceeds total pages?
   - What if item was deleted?
   - Provide fallback behavior

## Testing Checklist

When implementing state preservation:

- [ ] Navigate to page 4 of list
- [ ] Click edit on an item
- [ ] Click "Back" - should return to page 4
- [ ] Click "Save" - should return to page 4
- [ ] Edit item on page 1
- [ ] Click "Back" - should return to page 1 (not page 4)
- [ ] Open item directly via URL
- [ ] Click "Back" - should go to page 1 (no state preserved)
- [ ] Delete item on page 4
- [ ] Page 4 becomes page 3 - should handle gracefully

## Migration Guide

### To add pagination to an existing list:

**Step 1: Add pagination to list page**

```tsx
// pages/admin/items/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'

export default function ItemsListPage() {
  const searchParams = useSearchParams()
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = 20
  
  // Slice data for current page
  const startIndex = (currentPage - 1) * pageSize
  const paginatedItems = items.slice(startIndex, startIndex + pageSize)
  
  return (
    <>
      {paginatedItems.map(item => (
        <Link href={`/admin/items/${item.id}/edit?page=${currentPage}`}>
          Edit
        </Link>
      ))}
      <Pagination currentPage={currentPage} totalPages={Math.ceil(items.length / pageSize)} />
    </>
  )
}
```

**Step 2: Update edit page back button**

```tsx
// pages/admin/items/[id]/edit/page.tsx
const searchParams = useSearchParams()
const returnPage = searchParams.get('page') || '1'

const handleBack = () => {
  router.push(`/admin/items?page=${returnPage}`)
}
```

**Step 3: Update save handler**

```tsx
const handleSave = async () => {
  await saveItem()
  router.push(`/admin/items?page=${returnPage}`)
}
```

## Related Files

- ✅ **Implementation Example**: `app/admin/chapters/[id]/pages/[pageId]/edit/page.tsx`
- ✅ **Link Builder**: `components/admin/StepCard.tsx` (line 310)
- 📚 **Utilities**: `lib/utils/navigationState.ts`
- 📋 **To Update**: `app/admin/chapters/page.tsx` (when adding pagination)

## Summary

- ✅ **Current State**: Page editor already preserves tab, step expansion, and scroll position
- 🔄 **Future Work**: Add pagination to chapters list and preserve page number
- 📦 **Tools Ready**: Utility functions available in `lib/utils/navigationState.ts`
- 📖 **Pattern Established**: Use `returnUrl` parameter for complex flows, query params for simple cases
