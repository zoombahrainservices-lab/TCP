# Questions Page Customization - Database Update

## What This Does

This migration adds support for customizing the **questions page title and subtitle** from the admin panel. Now all three self-check pages (intro, questions, results) are fully customizable.

## Steps to Apply

### Option 1: Automatic Update (Recommended)

If your database already has the `self_check_defaults` record, run this SQL in your Supabase SQL Editor:

```sql
UPDATE public.site_settings
SET 
  value = jsonb_set(
    jsonb_set(
      value,
      '{intro,questionsTitle}',
      '"Chapter X Self-Check"'
    ),
    '{intro,questionsSubtitle}',
    '"Rate each statement from 1 to 7. Be honest—only you see this."'
  ),
  updated_at = now()
WHERE key = 'self_check_defaults';
```

### Option 2: Set via Admin UI

1. Start your dev server: `npm run dev`
2. Navigate to `/admin/self-check-defaults`
3. Scroll to the new "Questions Page" section
4. Fill in:
   - **Questions Page Title**: `Chapter X Self-Check` (use "X" as placeholder)
   - **Questions Page Subtitle**: `Rate each statement from 1 to 7. Be honest—only you see this.`
5. Click "Save Changes"

## What Changed

### Before
- Questions page title/subtitle were hardcoded in the parent component
- Each chapter showed generic: "Chapter N Self-Check"

### After
- Questions page title/subtitle are now:
  - Stored in global defaults (like intro/result pages)
  - Customizable per chapter via admin panel
  - Loaded dynamically from the API

## Files Modified

1. `lib/blocks/types.ts` - Added `questionsTitle` and `questionsSubtitle` to `SelfCheckIntroBlock`
2. `app/api/chapter/[chapterId]/self-check-copy/route.ts` - Returns questions page copy
3. `components/assessment/SelfCheckAssessment.tsx` - Uses dynamic values from API
4. `components/assessment/SelfCheckMCQAssessment.tsx` - Uses dynamic values from API
5. `components/admin/ContentEditor.tsx` - Shows questions page fields in admin
6. `components/admin/SelfCheckDefaultsEditor.tsx` - Global defaults editor UI

## Testing

1. Visit `/admin/self-check-defaults`
2. Set custom questions page title: "Test Assessment"
3. Set custom subtitle: "This is a test subtitle"
4. Save changes
5. Visit any chapter's self-check assessment page
6. Verify the title and subtitle appear correctly

## Per-Chapter Overrides

To customize questions page for a specific chapter:

1. Go to `/admin/chapters`
2. Select a chapter → Steps tab
3. Edit "Self-Check Intro" page
4. Find the "Questions Page (During Assessment)" section
5. Enter custom values (leave empty to use global defaults)
6. Save

## No Breaking Changes

- Existing chapters will use the new default values automatically
- Empty/missing fields fall back to global defaults
- Props are still accepted as fallback for backward compatibility
