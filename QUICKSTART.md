# Quick Start Guide - Dynamic Content System

Get the new content system running in 10 minutes.

## Prerequisites

- ✅ Supabase project with database access
- ✅ Node.js 18+ installed
- ✅ `.env.local` file configured

## Step 1: Run Database Migrations (5 min)

### Option A: Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Open `supabase/migrations/20260210_content_system.sql`
3. Copy entire contents
4. Paste in SQL editor
5. Click "Run"
6. Repeat for `20260210_seed_chapters.sql`

### Option B: Supabase CLI
```bash
# If you have Supabase CLI installed
supabase migration up
```

### Verify Migrations Worked
```sql
-- Run this query in Supabase SQL editor
SELECT 
  p.title as part,
  c.chapter_number,
  c.title as chapter,
  COUNT(cs.id) as steps
FROM parts p
JOIN chapters c ON c.part_id = p.id
JOIN chapter_steps cs ON cs.chapter_id = c.id
GROUP BY p.title, c.chapter_number, c.title
ORDER BY c.chapter_number;

-- Expected output:
-- PART I: FOUNDATION | 1 | The Stage Star... | 6
-- PART I: FOUNDATION | 2 | The Genius Who... | 6
```

## Step 2: Migrate Chapter 1 Content (2 min)

```bash
cd tcp-platform
npm run migrate-content
```

**Expected Output:**
```
✅ Connected to Supabase
🔄 Migrating Chapter 1 Reading content...
✅ Chapter 1 Reading migrated successfully
   Page ID: [some-uuid]
   Blocks: 26
```

### Verify Content Migration
```sql
-- Check that content was inserted
SELECT 
  sp.title,
  jsonb_array_length(sp.content) as block_count
FROM step_pages sp
JOIN chapter_steps cs ON cs.id = sp.step_id
JOIN chapters c ON c.id = cs.chapter_id
WHERE c.chapter_number = 1;

-- Expected: 1 row with 26 blocks
```

## Step 3: Test Dynamic Routes (3 min)

```bash
# Start dev server
npm run dev
```

### Test URLs

**Chapter 1 Reading (Dynamic Route):**
```
http://localhost:3000/read/stage-star-silent-struggles
```

**What to Check:**
- ✅ Page loads without errors
- ✅ You see heading "FROM STAGE STAR TO SILENT STRUGGLES"
- ✅ Story blocks render with styled borders
- ✅ Callout boxes show with colored backgrounds
- ✅ Navigation buttons work (prev/next)
- ✅ Progress bar updates

**Admin Dashboard:**
```
http://localhost:3000/admin/content
```

**What to Check:**
- ✅ Shows 3 parts
- ✅ Shows 2 chapters
- ✅ Chapter 1 and 2 listed under Foundation
- ✅ Published badges visible

## Common Issues & Fixes

### Issue: "Chapter not found"
**Cause:** Migrations didn't run or wrong slug

**Fix:**
```sql
-- Check chapters exist and are published
SELECT slug, is_published FROM chapters;

-- Should show:
-- stage-star-silent-struggles | true
-- genius-who-couldnt-speak | true
```

### Issue: "No content available"
**Cause:** Migration script didn't run

**Fix:**
```bash
# Re-run migration script
npm run migrate-content
```

### Issue: Blocks not rendering
**Cause:** Invalid JSON in content column

**Fix:**
```sql
-- Check content structure
SELECT content FROM step_pages LIMIT 1;

-- Should return valid JSON array like:
-- [{"type": "heading", "level": 1, "text": "..."}]
```

### Issue: "Cannot find module" errors
**Cause:** Missing dependencies

**Fix:**
```bash
npm install
```

## Next Steps

### Add More Content (Optional)
To migrate Chapter 1 Framework, Techniques, etc:
1. Edit `scripts/migrate-content.ts`
2. Add new migration functions
3. Run `npm run migrate-content`

See `MIGRATION_GUIDE.md` for detailed instructions.

### Convert to Server Components (Recommended)
Current dynamic routes use `'use client'`. For better performance:

1. Remove `'use client'` from route files
2. Move data fetching to server
3. Pass data as props to client components

Example:
```typescript
// app/read/[chapterSlug]/page.tsx
import { getChapterBySlug } from '@/lib/content/queries';

export default async function ChapterPage({ params }) {
  const chapter = await getChapterBySlug(params.chapterSlug);
  return <ClientChapterView chapter={chapter} />;
}
```

### Fix Authentication
Add user auth to save progress:
```typescript
import { requireAuth } from '@/lib/auth/guards';

export default async function ChapterPage() {
  const user = await requireAuth();
  // Now you can save progress with user.id
}
```

## Deployment to Production

### Before Deploying
- [ ] Test all dynamic routes locally
- [ ] Verify content renders correctly
- [ ] Check mobile responsiveness
- [ ] Backup database
- [ ] Run `npm run build` successfully

### Deploy Steps
```bash
# Build
npm run build

# Test production build locally
npm start

# If all good, deploy
vercel --prod
# or
git push # (if auto-deploy configured)
```

### After Deploying
1. Run migrations on production database
2. Run migration script against production
3. Test production URLs
4. Monitor for errors

## Support

**Documentation:**
- `MIGRATION_GUIDE.md` - Detailed migration steps
- `IMPLEMENTATION_SUMMARY.md` - Full technical details
- `.cursor/plans/dynamic_content_system_*.plan.md` - Original plan

**Troubleshooting:**
1. Check browser console for errors
2. Check Supabase logs
3. Verify database tables exist
4. Review RLS policies

**Questions?**
- Database issues: Check Supabase dashboard
- Route issues: Check Next.js dev console
- Build issues: Check `npm run build` output

---

**Time to Complete:** ~10 minutes  
**Prerequisites:** Supabase project, Node.js  
**Result:** Fully functional dynamic content system  
**Next:** See MIGRATION_GUIDE.md for advanced features
