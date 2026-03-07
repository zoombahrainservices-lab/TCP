# Image Migration to Bucket - Complete

## What This Does

Automatically migrates external image URLs in page content to your Supabase bucket with one click.

## Features

### 1. **Smart Detection**
- Scans all image blocks in page content
- Detects external images (not already in bucket)
- Shows "Migrate Images" button only when external images exist

### 2. **One-Click Migration**
- Downloads all external images
- Uploads to organized bucket paths: `chapters/{chapter}/{section}/page-{N}/migrated-{timestamp}.ext`
- Updates all image URLs in content
- **Auto-sets first image as hero image** if no hero image is set

### 3. **Safe & Smart**
- Skips images already in your bucket
- Skips local images (starting with `/` or `./`)
- Shows progress and errors
- Cannot be accidentally triggered (requires confirmation)

## How to Use

### Step 1: Open Page Editor

Navigate to any page in admin:
```
Admin → Chapters → [Chapter] → Pages → [Page] → Edit
```

### Step 2: Look for "Migrate Images" Button

If the page has external images, you'll see a blue "Migrate Images" button in the top-right toolbar:

```
[Migrate Images] [Preview] [Save Changes]
```

### Step 3: Click & Confirm

1. Click "Migrate Images"
2. Confirm the migration prompt:
   ```
   Migrate all external images in this page to Supabase bucket?
   
   This will:
   1. Download all external images
   2. Upload them to your bucket
   3. Update image URLs
   4. Set first image as hero image (if none set)
   
   This cannot be undone.
   ```
3. Wait for migration to complete (usually 1-5 seconds per image)

### Step 4: Verify Results

After migration:
- ✅ All image URLs updated to Supabase bucket URLs
- ✅ Hero image preview shows (if it was empty before)
- ✅ Success toast shows count: "✓ Migrated 3 image(s)"
- ✅ Page automatically reloads with new images

## What Gets Migrated

### External Images (WILL migrate)
- `https://example.com/image.jpg`
- `http://cdn.mysite.com/photo.png`
- Any full URL not in your bucket

### Already in Bucket (skipped)
- `https://abc123.supabase.co/storage/v1/object/public/chapter-assets/...`

### Local Images (skipped)
- `/public/images/hero.png`
- `./assets/logo.svg`

## Storage Organization

Images are stored with this structure:

```
chapter-assets/
  chapters/
    chapter-1/           ← chapter slug
      reading/           ← section slug
        page-0/          ← page order
          migrated-1709500123-a7f3c9.jpg
          migrated-1709500124-b8g4d0.png
        page-1/
          migrated-1709500125-c9h5e1.webp
```

### Filename Format
```
migrated-{timestamp}-{random}.{ext}
```
- **timestamp**: Unix timestamp (ms) for uniqueness
- **random**: 6-character random string
- **ext**: Auto-detected from image (jpg, png, webp, gif, svg)

## Hero Image Logic

If no hero image is set **before migration**:
1. Migration finds first image block
2. Uploads it to bucket
3. **Automatically sets it as hero image**
4. Saves to database
5. Shows preview immediately

If hero image already exists:
- Migration only updates content images
- Hero image remains unchanged

## Error Handling

### Partial Success
If some images fail:
- ✅ Successful images are migrated
- ❌ Failed images keep original URLs
- Toast shows: "✓ Migrated 2 image(s) (1 failed)"
- Check browser console for error details

### Common Errors
- **Download failed**: Image URL is broken or requires authentication
- **Upload failed**: Bucket permissions issue
- **Invalid format**: Unsupported image format

## Technical Details

### API Endpoint
```
POST /api/admin/pages/[pageId]/migrate-images
```

### Request Body
```json
{
  "pageId": "uuid",
  "content": [...],
  "chapterSlug": "chapter-1",
  "stepSlug": "reading",
  "pageOrder": 0
}
```

### Response
```json
{
  "success": true,
  "migratedImages": [
    {
      "oldUrl": "https://example.com/image.jpg",
      "newUrl": "https://...supabase.co/.../migrated-123.jpg",
      "blockIndex": 2
    }
  ],
  "errors": [],
  "updatedContent": [...],
  "summary": {
    "total": 3,
    "failed": 0
  }
}
```

## Database Tracking

Each migrated image is tracked in `image_references` table:
```sql
INSERT INTO image_references (
  storage_path,
  storage_bucket,
  file_size,
  content_type,
  chapter_slug
)
```

This enables:
- Cleanup scripts
- Storage audits
- Chapter-specific image lists

## Example Workflow

### Before Migration

Page content:
```json
[
  {
    "type": "image",
    "src": "https://cdn.example.com/story-image.jpg",
    "alt": "The story illustration"
  },
  {
    "type": "paragraph",
    "text": "Once upon a time..."
  }
]
```

Hero image: **(empty)**

### After Migration

Page content:
```json
[
  {
    "type": "image",
    "src": "https://abc123.supabase.co/storage/v1/object/public/chapter-assets/chapters/chapter-1/reading/page-0/migrated-1709500123-a7f3c9.jpg",
    "alt": "The story illustration"
  },
  {
    "type": "paragraph",
    "text": "Once upon a time..."
  }
]
```

Hero image: `https://...supabase.co/.../migrated-1709500123-a7f3c9.jpg` ✅

## Benefits

1. **No More Broken Images**: External URLs can go offline; bucket images are permanent
2. **Faster Loading**: Served from your Supabase CDN
3. **Organized Storage**: All images in one place with clear structure
4. **Automatic Backup**: Part of your Supabase project backup
5. **Easy Management**: Can browse/manage in Supabase dashboard

## Limitations

- Cannot migrate images requiring authentication
- Max file size: 10MB (Supabase default)
- Cannot undo migration (URLs are replaced)

## Best Practices

1. **Test on one page first** before migrating all pages
2. **Check console** if migration fails for details
3. **Verify hero image** preview after migration
4. **Save changes** after migration completes

## Files Modified

1. `app/api/admin/pages/[pageId]/migrate-images/route.ts` (new)
   - API endpoint for image migration
   - Downloads, uploads, updates content

2. `app/admin/chapters/[id]/pages/[pageId]/edit/page.tsx`
   - Added "Migrate Images" button
   - Added `handleMigrateImages()` function
   - Added `hasExternalImages` detection

## Build Status

✅ Build successful  
✅ New route registered: `/api/admin/pages/[pageId]/migrate-images`  
✅ TypeScript types valid  
✅ UI components working

Ready to use!
