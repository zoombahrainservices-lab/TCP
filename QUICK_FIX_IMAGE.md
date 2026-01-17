# Quick Fix: Add Image to First Chunk

The image needs to be uploaded to Supabase Storage. You have two options:

## Option 1: Create Bucket and Run Script (Recommended)

1. **Create the bucket in Supabase:**
   - Go to your Supabase Dashboard
   - Navigate to **Storage** → **Buckets**
   - Click **New bucket**
   - Name: `chunk-images`
   - Set to **Public** ✅
   - Click **Create bucket**

2. **Run the script:**
   ```bash
   cd tcp-platform
   npx tsx scripts/add-image-to-first-chunk.ts "public\WhatsApp Image 2026-01-17 at 12.38.44 PM.jpeg"
   ```

## Option 2: Use Admin UI (Easier)

1. **Start your dev server:**
   ```bash
   cd tcp-platform
   npm run dev
   ```

2. **Log in as admin** and go to:
   ```
   http://localhost:3000/admin/chapters/1
   ```
   (Replace `1` with the actual Day 1 chapter ID if different)

3. **Scroll down to "Chunk Images (Optional)" section**

4. **For the first chunk**, click **Choose File** and select:
   ```
   tcp-platform/public/WhatsApp Image 2026-01-17 at 12.38.44 PM.jpeg
   ```

5. **Wait for upload** to complete (you'll see a preview)

6. **Click "Update Chapter"** at the bottom

7. **Refresh the student page** - the image should now appear on the left side!

## Verify

After adding the image:
- Go to `/student/day/1` as a student
- Click "Begin Day 1"
- Make sure "Learning Mode" is selected
- The image should appear on the left side of the first chunk
