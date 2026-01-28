# Adding Image to First Slide

This guide explains how to add an image to the first slide/chunk of Day 1.

## Option 1: Add Image to First Chunk (Recommended)

This adds the image to the first chunk in Learning Mode, which displays alongside the text in a 2-column layout.

### Using the Script

1. **Save your image file** to a location you can access (e.g., `./my-image.png`)

2. **Run the script**:
   ```bash
   npm run add-image ./path/to/your-image.png
   ```
   
   Or directly:
   ```bash
   tsx scripts/add-image-to-first-slide.ts ./path/to/your-image.png
   ```

3. **The script will**:
   - Upload the image to Supabase Storage (`chunk-images` bucket)
   - Add the image URL to the first chunk of Day 1
   - Display the image in the ChapterReader component

### Using Admin UI

1. Go to `/admin/chapters/1` (or the chapter ID for Day 1)
2. Scroll to the "Chunk Images (Optional)" section
3. For the first chunk, click "Choose File"
4. Select your image file
5. Wait for upload to complete
6. Click "Update Chapter"

## Option 2: Replace First Slide (PDF Presentation Mode)

If you want to replace the first slide in Presentation Mode (`page01.png`):

1. **Save your image** as `page01.png`
2. **Replace the file**:
   ```bash
   # Copy your image to replace the first slide
   cp /path/to/your-image.png tcp-platform/public/chapters/chapter01/page01.png
   ```

3. The image will appear when students view Day 1 in Presentation Mode

## Image Requirements

- **Formats**: PNG, JPG, JPEG, GIF, WebP
- **Max Size**: 5MB
- **Recommended**: 
  - For chunk images: Any aspect ratio (will be displayed responsively)
  - For slides: 16:9 or 4:3 aspect ratio works best

## Verification

After adding the image:

1. **For Chunk Images**:
   - Log in as a student
   - Go to `/student/day/1`
   - Click "Begin Day 1"
   - Select "Learning Mode" (if available)
   - Verify the image appears on the left side of the first chunk

2. **For Slide Replacement**:
   - Log in as a student
   - Go to `/student/day/1`
   - Click "Begin Day 1"
   - Select "Presentation Mode"
   - Verify the first slide shows your image

## Troubleshooting

### "Bucket not found" error
- Create the `chunk-images` bucket in Supabase Dashboard → Storage
- Set it to **Public**

### "Chapter has no chunks" error
- Day 1 chapter needs to have chunks created first
- Chunks are typically created when converting PDF to images
- You can also create chunks manually via the admin UI

### Image not displaying
- Check that the bucket is public
- Verify the image URL is accessible
- Check browser console for errors
- Ensure the image file is valid (not corrupted)

## Notes

- Chunk images are stored in Supabase Storage and referenced by URL
- Slide images are stored in `/public/chapters/chapter01/` directory
- Chunk images work in Learning Mode
- Slide images work in Presentation Mode
- Both can coexist - students can switch between modes (Day 1 only)
