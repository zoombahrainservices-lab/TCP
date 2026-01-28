# Chunk Images Testing Guide

This guide covers testing the chunk image upload, display, and removal functionality.

## Prerequisites

1. **Supabase Storage Bucket**: The `chunk-images` bucket must exist and be public
   - Go to Supabase Dashboard → Storage → Buckets
   - Create bucket named `chunk-images` if it doesn't exist
   - Set it to **Public** (images need to be publicly accessible)

2. **Environment Variables**: Ensure `.env.local` has:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Test Chapter**: At least one chapter with chunks must exist
   - Go to `/admin/chapters`
   - Create or edit a chapter
   - Ensure the chapter has chunks (chunks are created automatically when converting PDFs)

## Automated Testing

Run the automated test script:

```bash
npm run test:chunk-images
```

This script tests:
- ✅ Bucket exists and is public
- ✅ Test image creation
- ✅ Image upload to Supabase Storage
- ✅ Image URL accessibility
- ✅ Image URL storage in chapter chunks
- ✅ Image removal from storage
- ✅ Cleanup of test data

### Expected Output

```
🧪 Starting chunk image functionality tests...

✅ Bucket exists check
✅ Create test image
✅ Get test chapter
✅ Image upload
✅ Image accessibility
✅ Update chunk with image
✅ Remove image
✅ Cleanup chunk image URL

==================================================
Test Summary: 8/8 tests passed
==================================================
✅ All tests passed!
```

## Manual Testing

### Test 1: Image Upload via Admin UI

1. **Navigate to Admin Chapter Editor**
   - Go to `/admin/chapters`
   - Click on a chapter that has chunks
   - Or create a new chapter with chunks

2. **Upload an Image**
   - Scroll to the "Chunk Images (Optional)" section
   - For any chunk, click "Choose File" or the file input
   - Select an image file (JPG, PNG, GIF, or WebP)
   - Wait for "Uploading..." to complete
   - Verify:
     - ✅ Image preview appears (48x48 thumbnail)
     - ✅ No error messages
     - ✅ Upload completes successfully

3. **Save the Chapter**
   - Scroll to bottom and click "Update Chapter"
   - Verify:
     - ✅ Page redirects to chapters list
     - ✅ No error messages

### Test 2: Image Display in Reader

1. **View as Student**
   - Log in as a student (or use test student account)
   - Navigate to the day that has the chapter with images
   - Click "Start Reading" or navigate to the reading step

2. **Verify Image Display**
   - Check the chunked reading view
   - Verify:
     - ✅ Image appears on the left side (desktop) or top (mobile)
     - ✅ Image is properly sized and not distorted
     - ✅ Image loads without errors
     - ✅ Text content appears on the right side (desktop) or below (mobile)
     - ✅ Navigation works correctly (Previous/Next buttons)

3. **Test Responsive Layout**
   - Resize browser window or use mobile view
   - Verify:
     - ✅ On mobile: Image and text stack vertically
     - ✅ On desktop: Image and text are side-by-side (2-column layout)
     - ✅ Layout adapts smoothly

### Test 3: Image Removal

1. **Remove Image via Admin UI**
   - Go back to `/admin/chapters/[chapterId]`
   - Find the chunk with the uploaded image
   - Click "🗑️ Remove image" button
   - Confirm the removal dialog
   - Verify:
     - ✅ Image preview disappears
     - ✅ "Removing..." message appears briefly
     - ✅ No error messages

2. **Save and Verify**
   - Click "Update Chapter"
   - Navigate back to the chapter editor
   - Verify:
     - ✅ Image is no longer shown
     - ✅ File input is available for re-upload

3. **Verify in Reader**
   - View the chapter as a student
   - Navigate to the chunk that had the image removed
   - Verify:
     - ✅ Placeholder "No image" icon appears
     - ✅ Text content still displays correctly
     - ✅ No broken image icons or errors

## Edge Cases to Test

### File Size Validation
- Try uploading an image larger than 5MB
- Expected: Error message "Image must be smaller than 5MB"

### File Type Validation
- Try uploading a non-image file (e.g., PDF, text file)
- Expected: Error message "File must be an image"

### Multiple Images
- Upload images to multiple chunks in the same chapter
- Verify: All images display correctly in the reader

### Image Replacement
- Upload an image to a chunk
- Upload a different image to the same chunk
- Verify: New image replaces the old one

### Network Errors
- Disconnect internet during upload
- Expected: Error message appears, upload fails gracefully

## Browser Console Checks

Open browser DevTools (F12) and check:

1. **No Console Errors**
   - No red error messages
   - No failed network requests

2. **Network Tab**
   - Image uploads show successful POST requests
   - Image URLs return 200 status codes
   - No 404s or 403s for image URLs

3. **Storage Tab**
   - Check localStorage for any errors
   - Verify no unexpected data

## Troubleshooting

### Issue: "Bucket not found"
**Solution**: Create the `chunk-images` bucket in Supabase Dashboard → Storage

### Issue: "Upload failed: Invalid API key"
**Solution**: Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Issue: "Image not displaying"
**Solution**: 
- Verify bucket is set to **Public**
- Check image URL is accessible in browser
- Verify CORS settings in Supabase

### Issue: "Image removal fails"
**Solution**:
- Check browser console for errors
- Verify image URL format is correct
- Ensure user has proper permissions

## Test Checklist

- [ ] Automated test script passes
- [ ] Image upload works in admin UI
- [ ] Image displays correctly in reader (desktop)
- [ ] Image displays correctly in reader (mobile)
- [ ] Image removal works
- [ ] File size validation works (5MB limit)
- [ ] File type validation works (images only)
- [ ] Multiple images work in same chapter
- [ ] Image replacement works
- [ ] No console errors
- [ ] Responsive layout works correctly

## Success Criteria

All tests pass when:
1. ✅ Images can be uploaded via admin UI
2. ✅ Images display correctly in the 2-column reader layout
3. ✅ Images can be removed successfully
4. ✅ No errors in browser console
5. ✅ Responsive design works on mobile and desktop
6. ✅ File validation prevents invalid uploads
