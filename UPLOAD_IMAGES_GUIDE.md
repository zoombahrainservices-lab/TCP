# Upload Local Images to Storage - Quick Guide

## ✅ What's Been Done

### 1. Enhanced Image Editor
The admin content editor now shows **image preview** when editing image blocks:

```
When you click "Edit" on an image block, you'll see:

┌─────────────────────────────────────────┐
│  Current Image                          │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      [Image Preview]            │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│  /chapter/chapter 2/Nightmare.png      │
│                                         │
│  Replace Image:                         │
│    [Upload File] [Browse Gallery]       │
│                                         │
│  Alt Text: _____________________        │
│  Caption: ______________________        │
│                                         │
│  [Save Changes] [Cancel]                │
└─────────────────────────────────────────┘
```

### 2. Found All Local Images
Found **93 images** in your `/public` folder:

- **Chapter 2 images** (34 files): `/chapter/chapter 2/`
  - Nightmare.png, v.png, o.png, i.png, c.png, e.png
  - voice.png, How it started.png, real talks.png, etc.
  - Both PNG (3MB each) and WebP (400KB each) versions

- **Chapter 1 images** (33 files): `/slider-work-on-quizz/chapter1/`
  - Framework: spark.png, s.png, p.png, a.png, r.png, k.png
  - Techniques: Change Your Environment.png, Substitution Game.png, etc.
  - Follow Through: 90days.png, cb.png, m1.png, realconversation.png, etc.

- **Map assets** (3 files): `/map books/`
  - closed book.png, completed.png, current chapter.png

- **Onboarding** (17 files): `/slider-work-on-quizz/`
  - Quiz images: 1.png, 2.png, 3.png
  - Category icons: Myself.png, Friends-and-family.png, etc.

- **Global assets** (6 files): Root `/public`
  - BG.png, dbg.png, hero.png, TCP-logo.png, etc.

### 3. Created Upload Script
Created `scripts/upload-local-images.ts` that will:
- ✅ Upload all 93 images to `chapter-assets` bucket
- ✅ Organize them by chapter and section
- ✅ Update database references automatically
- ✅ Skip already-uploaded images
- ✅ Provide detailed progress report

## 🚀 How to Upload All Images

### Step 1: Create Storage Bucket (if not done yet)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Storage** in sidebar
4. Click **New bucket**
5. Settings:
   - Name: `chapter-assets`
   - Public: ✅ Enabled
   - File size limit: `10 MB`
6. Click **Create bucket**

### Step 2: Apply Storage Policies (if not done yet)

1. Click **SQL Editor** in sidebar
2. Open `STORAGE_BUCKET_POLICIES.sql`
3. Copy all the SQL code
4. Paste into SQL editor
5. Click **Run**
6. Verify "Success" ✅

### Step 3: Run Upload Script

**Option A: PowerShell (Recommended for Windows)**

```powershell
cd tcp-platform
.\scripts\upload-local-images.ps1
```

**Option B: Direct TypeScript**

```powershell
cd tcp-platform
npx ts-node scripts/upload-local-images.ts
```

### Step 4: Watch the Progress

The script will show detailed progress:

```
🚀 Starting local images upload...

📂 Scanning public folder for images...

📸 Found 93 images

[1/93] public/chapter/chapter 2/Nightmare.png
  ✅ Uploaded: chapters/genius-who-couldnt-speak/reading/nightmare.png

[2/93] public/chapter/chapter 2/v.png
  ✅ Uploaded: chapters/genius-who-couldnt-speak/reading/v.png

[3/93] public/slider-work-on-quizz/chapter1/frameworks/spark.png
  ✅ Uploaded: chapters/stage-star-silent-struggles/framework/spark.png

...

============================================================
📝 Updating database references...

  🔄 /chapter/chapter 2/Nightmare.png → https://...supabase.co/.../nightmare.png
  ✅ Updated page abc123-def456...

============================================================
📊 Upload Summary:
============================================================
Total images found:      93
✅ Successfully uploaded:  93
⏭️  Already existed:       0
❌ Failed:                 0
📝 Database pages updated: 15
============================================================

✨ Upload complete! All images are now in chapter-assets bucket.
```

## 📂 Storage Organization

Images will be organized like this:

```
chapter-assets/
└── chapters/
    ├── stage-star-silent-struggles/        # Chapter 1
    │   ├── reading/
    │   │   └── chaper1-1.jpeg
    │   ├── framework/
    │   │   ├── spark.png
    │   │   ├── s.png, p.png, a.png, r.png, k.png
    │   │   └── day23.png
    │   ├── techniques/
    │   │   ├── change-your-environment.png
    │   │   ├── substitution-game.png
    │   │   └── visual-progress.png
    │   └── follow-through/
    │       ├── 90days.png
    │       ├── cb.png
    │       └── realconversation.png
    │
    ├── genius-who-couldnt-speak/           # Chapter 2
    │   └── reading/
    │       ├── nightmare.png
    │       ├── voice.png
    │       ├── v.png, o.png, i.png, c.png, e.png
    │       ├── how-it-started.png
    │       ├── real-talks.png
    │       └── the-comeback.png
    │
    └── global/
        ├── map-assets/
        │   ├── closed-book.png
        │   ├── completed.png
        │   └── current-chapter.png
        ├── onboarding/
        │   ├── 1.png, 2.png, 3.png
        │   ├── myself.png
        │   └── friends-and-family.png
        └── assets/
            ├── bg.png
            ├── tcp-logo.png
            └── hero.png
```

## 🔄 What Gets Updated in Database

The script automatically updates all image references in your `step_pages.content` blocks:

**Before:**
```json
{
  "type": "image",
  "src": "/chapter/chapter 2/Nightmare.png",
  "alt": "Nightmare scene"
}
```

**After:**
```json
{
  "type": "image",
  "src": "https://your-project.supabase.co/storage/v1/object/public/chapter-assets/chapters/genius-who-couldnt-speak/reading/nightmare.png",
  "alt": "Nightmare scene"
}
```

## ✅ Verification Steps

After upload completes:

### 1. Check Storage Dashboard
1. Go to Supabase → Storage → chapter-assets
2. Browse folders: `chapters/stage-star-silent-struggles/`, etc.
3. Verify images are organized correctly

### 2. Test Admin Panel
1. Go to Admin → Chapters → Chapter 2 → Content
2. Edit any page with images
3. Click on image block
4. Verify:
   - ✅ Image preview shows
   - ✅ URL is from `storage/v1/object/public/chapter-assets/`
   - ✅ Can replace/edit image

### 3. Test User-Facing Pages
1. Go to dashboard as normal user
2. Navigate to Chapter 2 → Reading
3. Verify all images load correctly
4. Check browser console for no image errors

## 🎯 Benefits

### Before (Local Files)
- ❌ Images only work in development
- ❌ Can't deploy without committing large binaries
- ❌ No CDN, slow loading
- ❌ Hard to manage/update
- ❌ Path references break easily

### After (Supabase Storage)
- ✅ Images work in production
- ✅ No large files in git repo
- ✅ CDN-powered, fast loading
- ✅ Easy to manage via admin panel
- ✅ Permanent, stable URLs
- ✅ Can update/replace images easily
- ✅ Organized folder structure

## 📊 Storage Space Usage

Current images total approximately:

- **PNG files**: 200 MB (93 files × ~2-3 MB each)
- **WebP files**: 32 MB (32 files × ~400 KB each)
- **Total**: ~232 MB

Supabase free tier includes:
- ✅ 1 GB storage (you're using 23%)
- ✅ 2 GB bandwidth/month

## 🐛 Troubleshooting

### Error: "Bucket not found"
**Solution**: Create the `chapter-assets` bucket first (Step 1 above)

### Error: "Permission denied"
**Solution**: Apply storage policies (Step 2 above)

### Error: "NEXT_PUBLIC_SUPABASE_URL not set"
**Solution**: Check `.env.local` file exists and has correct variables

### Error: "Failed to update page"
**Solution**: Check you're using service role key (not anon key)

### Some images not updating
**Solution**: 
- Check database manually: `SELECT id, content FROM step_pages WHERE content::text LIKE '%/chapter/%'`
- Run script again (it's safe to re-run, skips existing uploads)

## 📚 Additional Resources

- **STORAGE_BUCKET_POLICIES.sql** - RLS policies to apply
- **IMAGE_MANAGEMENT.md** - Full image system documentation
- **ADMIN_CONTENT_EDITOR_SUMMARY.md** - Complete admin guide

## 🎉 Next Steps

After uploading all images:

1. ✅ Test a few pages to verify images load
2. ✅ Replace any images via admin panel to test upload
3. ✅ Check storage dashboard for organization
4. 📝 Update any hardcoded image paths in code (if any remain)
5. 🚀 Deploy to production!

---

**Questions?** Check the other documentation files or review the script output for specific errors.
