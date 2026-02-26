# Image Management System

Complete guide for managing images in the TCP platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Storage Structure](#storage-structure)
- [Admin Panel Image Editing](#admin-panel-image-editing)
- [Migrating Existing Images](#migrating-existing-images)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

## Overview

The platform uses **Supabase Storage** for all chapter images with an organized hierarchical structure. Images are stored in the `chapter-assets` bucket and referenced in the database.

### Key Features

✅ **Upload & Replace** - Upload new images or replace existing ones  
✅ **Image Gallery** - Browse and select from previously uploaded images  
✅ **Drag & Drop** - Drag files directly into the upload area  
✅ **Alt Text** - Add accessibility descriptions  
✅ **Captions** - Add optional image captions  
✅ **Organized Storage** - Automatic folder organization by chapter/step/page  

## Storage Structure

Images are stored in a hierarchical structure:

```
chapter-assets/
└── chapters/
    └── {chapter-slug}/
        └── {step-slug}/
            └── page-{order}/
                └── {timestamp}-{random}.jpg
```

### Example

```
chapter-assets/
└── chapters/
    ├── stage-star-silent-struggles/
    │   ├── read/
    │   │   ├── page-0/
    │   │   │   ├── 1740398921-a3b2c1.jpg
    │   │   │   └── 1740398933-d4e5f6.png
    │   │   └── page-1/
    │   │       └── 1740398945-g7h8i9.jpg
    │   └── framework/
    │       └── page-0/
    │           └── 1740399001-j0k1l2.png
    └── genius-who-couldnt-speak/
        └── read/
            └── page-0/
                └── 1740399123-m3n4o5.jpg
```

## Admin Panel Image Editing

### How to Edit Images

1. **Navigate to Admin Panel**
   - Click **Admin** button in dashboard (admin users only)
   - Go to **Chapters** → Select a chapter
   - Click **Content** tab

2. **Select a Page**
   - Expand a step (e.g., "Reading", "Framework")
   - Click on a page to edit

3. **Edit Image Block**
   - Click on any image block to enter edit mode
   - You'll see three options:

#### Option A: Upload New Image

```
📤 Drag and drop an image here, or
   [Choose File] [Browse Gallery]
```

- **Drag & Drop**: Drag image files directly into the upload area
- **Choose File**: Click to select file from your computer
- **File Requirements**:
  - Max size: 10MB
  - Formats: JPG, PNG, GIF, WebP, SVG

#### Option B: Browse Gallery

- Click **Browse Gallery** button
- Select from previously uploaded images
- Images are organized by upload date

#### Option C: Replace Image

- If an image already exists, you'll see a preview
- Click **Choose File** or **Browse Gallery** to replace it
- The old URL is updated automatically

### Additional Image Settings

After uploading/selecting an image:

- **Alt Text**: Description for screen readers (accessibility)
- **Caption**: Optional text displayed below the image

### Saving Changes

- Click **Save Changes** to update the page
- The image is immediately visible to users

## Migrating Existing Images

If you have existing images hosted elsewhere (e.g., `/public/chapter/`), migrate them to storage:

### Prerequisites

1. ✅ `chapter-assets` bucket created in Supabase Dashboard
2. ✅ Storage policies applied (see `STORAGE_BUCKET_POLICIES.sql`)
3. ✅ Environment variables set in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Run Migration (Windows)

```powershell
# PowerShell
cd tcp-platform
.\scripts\migrate-images.ps1
```

### Run Migration (Linux/Mac)

```bash
# Bash
cd tcp-platform
chmod +x scripts/migrate-images.sh
./scripts/migrate-images.sh
```

### What the Migration Does

1. **Scans** all pages in the database for image blocks
2. **Downloads** each image from its current URL
3. **Uploads** to `chapter-assets` bucket with organized structure
4. **Updates** database with new storage URLs
5. **Tracks** all uploads in `image_references` table

### Migration Output

```
🚀 Starting image migration to storage...

📄 Found 45 pages to scan

📸 Image 1:
  📍 Page: stage-star-silent-struggles/read/page-1
  🔗 Original: /chapter/chapter 1/Nightmare.png
  ✅ Uploaded to: chapters/stage-star-silent-struggles/read/page-1/1740399123-a3b2c1.png
  💾 Page updated with new URLs

...

============================================================
📊 Migration Summary:
============================================================
Total images found:     23
✅ Successfully migrated: 20
⏭️  Already in storage:   2
❌ Failed:                1
============================================================
```

## API Endpoints

### Upload Image

**POST** `/api/admin/upload`

```typescript
// Request
const formData = new FormData()
formData.append('file', file)
formData.append('chapterSlug', 'stage-star-silent-struggles')
formData.append('stepSlug', 'read')
formData.append('pageOrder', '0')

// Response
{
  "url": "https://your-project.supabase.co/storage/v1/object/public/chapter-assets/chapters/stage-star-silent-struggles/read/page-0/1740399123-a3b2c1.jpg",
  "path": "chapters/stage-star-silent-struggles/read/page-0/1740399123-a3b2c1.jpg"
}
```

### List Gallery Images

**GET** `/api/admin/gallery`

```typescript
// Response
{
  "images": [
    "https://your-project.supabase.co/storage/v1/object/public/chapter-assets/chapters/...",
    "https://your-project.supabase.co/storage/v1/object/public/chapter-assets/chapters/...",
    ...
  ]
}
```

## Troubleshooting

### Image Not Uploading

**Error**: "Upload failed"

✅ **Solutions**:
1. Check file size (max 10MB)
2. Verify file format (images only)
3. Ensure you're logged in as admin
4. Check browser console for specific error

### Gallery Not Loading

**Error**: Empty gallery or loading forever

✅ **Solutions**:
1. Verify `chapter-assets` bucket exists
2. Check storage policies are applied
3. Ensure admin authentication is working
4. Check Network tab for API errors

### Migration Fails

**Error**: "Failed to download" or "Upload failed"

✅ **Solutions**:
1. Check internet connection (downloads existing images)
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Ensure bucket exists and policies are applied
4. Check original image URLs are accessible
5. Review migration script output for specific failures

### Images Show Broken/Missing

**Error**: Image placeholder or broken image icon

✅ **Solutions**:
1. Check if URL is correct in database
2. Verify storage bucket is public (RLS policy)
3. Check if image was deleted from storage
4. Use gallery to re-select/upload the image

### Permission Denied

**Error**: "You do not have permission"

✅ **Solutions**:
1. Verify you're logged in as admin
2. Check `profiles.role = 'admin'` in database
3. Ensure RLS policies allow admin access
4. Try logging out and back in

## Database Schema

### step_pages.content (JSONB)

```typescript
interface ImageBlock {
  type: 'image'
  src: string        // Full public URL from storage
  alt?: string       // Accessibility description
  caption?: string   // Optional caption
}
```

### image_references

Tracks all uploaded images for management:

```sql
CREATE TABLE image_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,           -- Path in bucket
  storage_bucket TEXT NOT NULL,         -- Always 'chapter-assets'
  file_size INTEGER,                    -- Bytes
  content_type TEXT,                    -- MIME type
  chapter_slug TEXT,                    -- For organization
  created_at TIMESTAMP DEFAULT NOW()
)
```

## Best Practices

### 1. Use WebP Format
- Smaller file sizes
- Better compression
- Widely supported

### 2. Optimize Before Upload
- Resize large images before uploading
- Recommended max width: 2000px
- Use tools like TinyPNG or ImageOptim

### 3. Always Add Alt Text
- Required for accessibility
- Helps SEO
- Describes image content

### 4. Use Descriptive Filenames
- Files are auto-renamed on upload
- Original names not preserved
- Use alt text for descriptions

### 5. Regular Cleanup
- Periodically check for unused images
- Query `image_references` table
- Delete unreferenced images from storage

## Support

For issues not covered here:

1. Check browser console for errors
2. Review Supabase logs in Dashboard
3. Verify all prerequisites are met
4. Check that admin role is assigned correctly
