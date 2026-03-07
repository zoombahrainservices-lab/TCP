# Admin Image Management System

## Overview
Your admin panel now has a comprehensive image upload and management system with drag & drop support and organized storage in Supabase bucket.

## Features

### 1. **Hero Image Management (Page-Level)**
Located at: `/admin/chapters/[id]/pages/[pageId]/edit`

**What it does:**
- Upload and manage the main left-side image for any page
- Drag & drop files or click to select
- Browse existing images from gallery
- Images stored in organized paths: `chapters/{chapter-slug}/{step-slug}/page-{order}/`

**How to use:**
1. Navigate to Admin → Chapters → [Select Chapter] → Pages → [Select Page] → Edit
2. Scroll to "Hero Image (Main Page Image - Left Side)" section
3. Three ways to add an image:
   - **Drag & Drop**: Drag an image file into the upload area
   - **Choose File**: Click button to browse your computer
   - **Browse Gallery**: Select from previously uploaded images
4. Preview appears immediately
5. Click "Clear" to remove image
6. Hit "Save Page" (top right) to persist changes

**Storage Path Example:**
```
chapter-assets/
  chapters/
    chapter-1/
      reading/
        page-0/
          1709500123-a7f3c9.jpg
```

---

### 2. **Inline Images in Content**
Located at: Content Editor → Add Block → Image Block

**What it does:**
- Add small images within your content (right side of page)
- Same drag & drop interface as hero images
- Can add multiple images throughout content
- Each image can have caption and alt text

**How to use:**
1. In Content Editor, click "Add Block" → "Image"
2. Click "Edit" on the new image block
3. Same 3 upload options (drag/drop, choose, browse gallery)
4. Add alt text and caption (optional)
5. Click "Save" on the block

---

## File Organization

### Storage Bucket: `chapter-assets`
```
chapters/
  ├── chapter-1/
  │   ├── reading/
  │   │   ├── page-0/
  │   │   │   └── {timestamp}-{random}.jpg
  │   │   └── page-1/
  │   ├── framework/
  │   └── techniques/
  ├── chapter-2/
  └── general/  (fallback for uncategorized)
```

### Path Structure:
- **Chapter Slug**: Based on chapter name (e.g., `chapter-1`)
- **Step Slug**: Based on section name (e.g., `reading`, `framework`)
- **Page Order**: Page number within step (e.g., `page-0`, `page-1`)
- **Filename**: `{timestamp}-{random}.{extension}`

---

## Image Gallery

The "Browse Gallery" button opens a modal showing all previously uploaded images:
- Organized by chapter and section
- Search and filter capabilities
- Click to select (single or multiple)
- Visual preview before selection

---

## Technical Details

### Upload API Endpoint
**Route**: `/api/admin/upload`

**Request Format**:
```typescript
FormData {
  file: File,
  chapterSlug: string,
  stepSlug: string,
  pageOrder: string
}
```

**Response**:
```json
{
  "url": "https://...supabase.co/.../chapters/...",
  "path": "chapters/chapter-1/reading/page-0/..."
}
```

### Validation
- **File Types**: Images only (jpg, png, gif, webp, svg)
- **File Size**: Max 10MB
- **Automatic Sanitization**: Slugs are cleaned and lowercased

### Database Tracking
Uploads are tracked in `image_references` table:
- `storage_path`: Full path in bucket
- `storage_bucket`: `chapter-assets`
- `file_size`: Bytes
- `content_type`: MIME type
- `chapter_slug`: For filtering/cleanup

---

## Priority Rules (Frontend Display)

When a page loads, the hero image is determined by this priority:

1. **Page-level `hero_image_url`** ← What you just uploaded
2. First `image` block in content (if no page hero set)
3. Step-level `hero_image_url`
4. Chapter `hero_image_url`
5. Chapter `thumbnail_url`
6. Fallback: `/placeholder.png`

This means your uploaded hero image takes precedence!

---

## Best Practices

### For Hero Images (Left Side)
- Use high-quality images (1200x800px or larger)
- Aspect ratio: 3:2 or 16:9 works best
- Consider mobile responsiveness

### For Inline Images (Right Side)
- Keep smaller (600-800px wide)
- Use for diagrams, screenshots, icons
- Add descriptive alt text for accessibility

### Organization Tips
- Use consistent naming in admin
- Delete unused images via gallery
- One hero image per page
- Multiple inline images OK

---

## Troubleshooting

**Upload fails:**
- Check file size (< 10MB)
- Verify file is an image format
- Ensure you're logged in as admin

**Image doesn't appear:**
- Hard refresh browser (Ctrl+F5)
- Check Supabase bucket permissions
- Verify `hero_image_url` saved in database

**Old image still shows:**
- Click "Clear" first, then save
- Upload new image
- Save page again

---

## Component Reference

### `<ImageUploadField>`
Location: `components/admin/ImageUploadField.tsx`

Props:
```typescript
{
  label: string
  value: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  chapterSlug?: string
  stepSlug?: string
  pageOrder?: number
  helperText?: string
  required?: boolean
}
```

Used in:
- Page hero image editor
- Content editor image blocks
- Any other admin upload needs

---

## What Changed

### Files Modified:
1. `app/admin/chapters/[id]/pages/[pageId]/edit/page.tsx`
   - Replaced text URL input with `ImageUploadField`
   - Added import for component

### Files Already Existing:
- `components/admin/ImageUploadField.tsx` (drag & drop UI)
- `components/admin/ImageGallery.tsx` (browse modal)
- `app/api/admin/upload/route.ts` (upload handler)

### Database Schema:
- `step_pages.hero_image_url` (already exists from previous update)
- `image_references` table (tracks all uploads)

---

## Next Steps

✅ Hero image upload with drag & drop: DONE
✅ Inline image blocks with drag & drop: ALREADY WORKING
✅ Organized storage in Supabase: DONE
✅ Gallery browser: ALREADY WORKING

You can now:
1. Go to any page editor
2. Upload hero images with drag & drop
3. Browse previously uploaded images
4. Add inline images in content blocks
5. Everything stored organized by chapter/section/page

**Test it now:**
```bash
npm run dev
# Visit: http://localhost:3000/admin/chapters/1/pages/[pageId]/edit
```
