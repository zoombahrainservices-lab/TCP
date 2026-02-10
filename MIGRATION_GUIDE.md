# Dynamic Content System Migration Guide

This guide walks through migrating the TCP platform from hardcoded chapters to a database-driven, scalable content system.

## Overview

The new system allows:
- **30+ chapters** managed without code changes
- **Block-based content** stored as JSON in the database
- **Admin interface** for non-technical content editing
- **Zero code duplication** with dynamic routes
- **Single source of truth** for all chapter content

## Architecture

```
Database (Supabase)
├── parts (Foundation, Connection, Mastery)
├── chapters (30 chapters with metadata)
├── chapter_steps (read, self_check, framework, techniques, resolution, follow_through)
└── step_pages (pages with JSONB content blocks)

Content Blocks (17 types)
├── Text: heading, paragraph, story, quote
├── Visual: image, callout, divider, list
├── Interactive: prompt, scale_questions, yes_no_check, checklist
├── Planning: task_plan, scripts
├── CTA: cta, button
└── Dynamic: conditional, variable

Dynamic Routes
├── /read/[chapterSlug] → Reading experience
├── /read/[chapterSlug]/[stepSlug] → Framework, techniques, etc.
└── /assessment/[chapterSlug] → Self-check assessment
```

## Migration Steps

### 1. Apply Database Migrations

**IMPORTANT: Run these in order!**

```bash
# Navigate to Supabase project or use Supabase CLI
cd tcp-platform

# Apply content system schema
supabase migration up 20260210_content_system.sql

# Seed Chapter 1 and 2 metadata
supabase migration up 20260210_seed_chapters.sql
```

These migrations create:
- `parts`, `chapters`, `chapter_steps`, `step_pages` tables
- Helper functions for queries
- RLS policies for security
- Indexes for performance

### 2. Run Content Migration Script

**After database migrations are applied:**

```bash
cd tcp-platform
npm run migrate-content
```

This script:
- Converts Chapter 1 reading slides to JSON blocks
- Inserts blocks into `step_pages` table
- Verifies the migration was successful

**Expected output:**
```
✅ Connected to Supabase
🔄 Migrating Chapter 1 Reading content...
✅ Chapter 1 Reading migrated successfully
   Page ID: [uuid]
   Blocks: 26
   
🔍 Verifying migration...
📊 Found 2 chapters:
   1. The Stage Star with Silent Struggles (stage-star-silent-struggles)
   2. The Genius Who Couldn't Speak (genius-who-couldnt-speak)
   
✅ Verification complete
```

### 3. Test Dynamic Routes

Visit these URLs to test the new system:

```
http://localhost:3000/read/stage-star-silent-struggles
http://localhost:3000/read/stage-star-silent-struggles/framework
http://localhost:3000/read/stage-star-silent-struggles/techniques
```

**What to verify:**
- ✅ Pages load without errors
- ✅ Content renders correctly (headings, paragraphs, callouts, etc.)
- ✅ Navigation works (prev/next buttons)
- ✅ Progress bar updates
- ✅ Images display properly
- ✅ Responsive design on mobile

### 4. Migrate Remaining Content

After verifying Chapter 1 reading works, migrate:

1. **Chapter 1 Framework (SPARK)**
   - Create 5 pages (S, P, A, R, K)
   - Convert framework-screens.tsx to blocks
   
2. **Chapter 1 Techniques**
   - Convert technique-screens.tsx to blocks
   
3. **Chapter 1 Follow-Through**
   - Convert follow-through-screens.tsx to blocks
   - Include 90-day plan as `task_plan` block

4. **Chapter 2 Reading**
   - Convert 20+ slides to blocks
   
5. **Chapter 2 Framework (VOICE)**
   - Create pages for V, O, I, C, E

**Script template:**
```typescript
// Add to migrate-content.ts
async function migrateChapter1Framework() {
  const frameworkPages = [
    {
      slug: 'spark-s',
      title: 'S - Surface',
      content: [
        { type: 'heading', level: 2, text: 'S - Surface' },
        { type: 'paragraph', text: '...' },
        // ... more blocks
      ]
    },
    // ... more pages
  ];
  
  for (const page of frameworkPages) {
    await supabase.from('step_pages').insert({
      step_id: frameworkStepId,
      ...page,
      order_index: index,
      xp_award: 20
    });
  }
}
```

### 5. Update Internal Links

Search for and update hardcoded chapter links:

```bash
# Find all hardcoded chapter-1 links
grep -r "chapter-1" app/
grep -r "/read/chapter-1" components/

# Replace with dynamic slugs
/read/chapter-1 → /read/stage-star-silent-struggles
/chapter/1/reading → /chapter/stage-star-silent-struggles/reading
```

Update files:
- `app/dashboard/page.tsx`
- `components/dashboard/cards/*.tsx`
- `app/chapter/*/page.tsx`

### 6. Add Redirects (Optional)

Create redirects for old URLs:

**`next.config.js`:**
```javascript
module.exports = {
  async redirects() {
    return [
      {
        source: '/read/chapter-1',
        destination: '/read/stage-star-silent-struggles',
        permanent: true,
      },
      {
        source: '/read/chapter-2',
        destination: '/read/genius-who-couldnt-speak',
        permanent: true,
      },
      // Add more as needed
    ]
  },
}
```

### 7. Delete Old Hardcoded Routes (After Testing)

**DO NOT DELETE until you've verified everything works!**

```bash
# Backup first
cp -r app/read/chapter-1 backup/
cp -r app/read/chapter-2 backup/

# Then delete
rm -rf app/read/chapter-1
rm -rf app/read/chapter-2
```

Keep these files temporarily:
- `app/read/chapter-1/your-turn/[section]/[promptKey]/page.tsx` (still used)
- `app/chapter/1/assessment/page.tsx` (needs migration)

## Admin Interface Setup

### Restore Archived Admin Routes

```bash
# Copy admin files from archive
cp -r archive/app/admin app/
cp -r archive/components/admin components/
```

### Update Auth Guards

**`lib/auth/guards.ts`:**
```typescript
export async function requireAuth(role?: 'admin' | 'mentor' | 'parent' | 'student') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  if (role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== role) {
      redirect('/dashboard');
    }
  }
  
  return user;
}
```

### Access Admin Interface

```
http://localhost:3000/admin
http://localhost:3000/admin/content
http://localhost:3000/admin/content/chapters/[chapterId]/edit
```

## Block Editor (Phase 2)

The block editor allows visual content editing:

**Features:**
- ✅ Drag-and-drop block reordering
- ✅ Block palette (add new blocks)
- ✅ Live preview (see how users see it)
- ✅ JSON editor (advanced mode)
- ✅ Block templates (pre-built patterns)

**Implementation:**
1. Build `components/admin/BlockEditor.tsx`
2. Add drag-and-drop with `@dnd-kit/core`
3. Implement live preview using `BlockRenderer`
4. Add validation (required fields, image paths, etc.)

## Rollback Plan

If something goes wrong:

### Rollback Database

```bash
# Revert migrations
supabase migration down 20260210_seed_chapters.sql
supabase migration down 20260210_content_system.sql
```

### Rollback Code

```bash
# Restore from backup
git checkout HEAD -- app/read/
git checkout HEAD -- components/content/
```

### Keep Old Routes Active

Don't delete old routes until you're 100% confident. Run both systems in parallel:

- Old: `/read/chapter-1` (hardcoded)
- New: `/read/stage-star-silent-struggles` (dynamic)

Use feature flags to toggle between them.

## Performance Considerations

### JSONB Query Optimization

```sql
-- Index for searching block types
CREATE INDEX idx_step_pages_content_type 
ON step_pages USING gin((content -> 'type'));

-- Index for searching prompt IDs
CREATE INDEX idx_step_pages_content_id 
ON step_pages USING gin((content -> 'id'));
```

### Caching Strategy

```typescript
// app/read/[chapterSlug]/page.tsx
export const revalidate = 3600; // Cache for 1 hour

// Or use on-demand revalidation
revalidatePath(`/read/${chapterSlug}`);
```

### Image Optimization

- Use Next.js `<Image>` with `priority={false}` for lazy loading
- Compress images before upload
- Use CDN for static assets

## Troubleshooting

### "Chapter not found"
- Verify migrations ran: `SELECT * FROM chapters;`
- Check `is_published = true`
- Verify slug matches URL

### Blocks not rendering
- Check JSONB structure: `SELECT content FROM step_pages WHERE id = '...';`
- Verify block type exists in `BlockRenderer.tsx`
- Check browser console for errors

### RLS policy errors
- Verify user is authenticated
- Check profile role: `SELECT role FROM profiles WHERE id = auth.uid();`
- Review RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'chapters';`

### Migration script fails
- Check Supabase credentials in `.env.local`
- Verify database connection: `SELECT now();`
- Check for existing data: `SELECT COUNT(*) FROM step_pages;`

## Next Steps

After migration is complete:

1. **Add remaining chapters (3-30)**
   - Create metadata in `chapters` table
   - Create steps for each chapter
   - Migrate/create content blocks

2. **Build admin block editor**
   - Visual drag-and-drop interface
   - Block templates library
   - Live preview mode

3. **Implement personalization**
   - Conditional blocks based on user responses
   - Variable substitution in text
   - Dynamic content recommendations

4. **Add analytics**
   - Track block engagement (time spent, interactions)
   - Identify drop-off points
   - A/B test different content variations

5. **Localization**
   - Add `language` column to `step_pages`
   - Store translations as separate pages
   - Language selector in UI

## Support

Questions? Issues?

1. Check this guide first
2. Review migration logs: `tail -f logs/migration.log`
3. Consult the plan: `.cursor/plans/dynamic_content_system_*.plan.md`
4. Ask the team on Slack

---

**Migration Status:** Ready to execute
**Estimated Time:** 2-3 hours for full migration
**Risk Level:** Medium (test thoroughly before production)
