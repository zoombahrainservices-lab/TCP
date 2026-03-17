# Self-Check Customization System

Complete implementation of customizable self-check intro and result pages with global defaults and per-chapter overrides.

## Features

### 1. Global Defaults
- **Location**: `/admin/self-check-defaults`
- Centralized configuration for all chapters
- Full text customization (titles, subtitles, body paragraphs, highlights)
- Complete styling control (colors for backgrounds, text, buttons, etc.)
- Changes apply to all chapters that don't have overrides

### 2. Per-Chapter Overrides
- Edit any chapter's self-check intro/result page
- Add `self_check_intro` and `self_check_result` blocks
- Override any text or styling from global defaults
- Granular control: override only specific fields needed

### 3. Dynamic Styling
All style properties are customizable:

**Intro Page:**
- Title color & size
- Subtitle color
- Body background & text colors
- Highlight box (background, border, text)
- Button (background, hover, text)

**Result Page:**
- Title & subtitle colors
- Score card background & text
- Explanation box background & text
- Button (background, hover, text)

## Database Schema

### site_settings table
```sql
CREATE TABLE site_settings (
  id uuid PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  created_at timestamptz,
  updated_at timestamptz
);
```

**Key: `self_check_defaults`**
Stores global intro/result configuration including text and styles.

## Architecture

### API Flow
1. User visits `/read/chapter-N/assessment`
2. Component fetches `/api/chapter/N/self-check-copy`
3. API loads:
   - Global defaults from `site_settings`
   - Chapter-specific overrides from `step_pages.content`
4. API merges overrides onto defaults
5. Returns final merged configuration
6. Component renders with custom styles

### Data Hierarchy
```
Global Defaults (site_settings)
  ↓
Chapter Overrides (step_pages.content blocks)
  ↓
Final Rendered Experience
```

## Admin Usage

### Setting Global Defaults
1. Navigate to `/admin/self-check-defaults`
2. Edit text fields for intro/result pages
3. Customize colors using color pickers or hex values
4. Click "Save Changes"
5. Changes apply to all chapters immediately

### Creating Chapter-Specific Overrides
1. Go to Chapter Admin → Steps tab
2. Find the "Self Check" step
3. Edit the "Self-Check Intro" page
4. Add/edit `self_check_intro` and `self_check_result` blocks
5. Override text fields as needed
6. Expand "Custom Styling" section to override colors
7. Save page

**Pro Tip**: Leave override fields empty to inherit from global defaults. Only set values you want to customize for that specific chapter.

## Block Types

### SelfCheckIntroBlock
```typescript
{
  type: 'self_check_intro',
  title?: string,
  subtitle?: string,
  body1?: string,
  body2?: string,
  highlightTitle?: string,
  highlightBody?: string,
  styles?: {
    titleColor?: string,
    titleSize?: string,
    subtitleColor?: string,
    bodyBgColor?: string,
    bodyTextColor?: string,
    highlightBgColor?: string,
    highlightBorderColor?: string,
    highlightTextColor?: string,
    buttonBgColor?: string,
    buttonHoverColor?: string,
    buttonTextColor?: string,
  }
}
```

### SelfCheckResultBlock
```typescript
{
  type: 'self_check_result',
  title?: string,
  subtitle?: string,
  styles?: {
    titleColor?: string,
    subtitleColor?: string,
    scoreBgColor?: string,
    scoreTextColor?: string,
    explanationBgColor?: string,
    explanationTextColor?: string,
    buttonBgColor?: string,
    buttonHoverColor?: string,
    buttonTextColor?: string,
  }
}
```

## Migration

Run the migration in Supabase SQL Editor:

```bash
# Execute RUN_THIS_MIGRATION.sql in Supabase dashboard
# Or via CLI:
psql -h <your-db-host> -U postgres -d postgres -f RUN_THIS_MIGRATION.sql
```

## Files Changed/Created

### New Files
- `migrations/001_add_site_settings.sql` - Database schema
- `RUN_THIS_MIGRATION.sql` - Migration runner
- `components/admin/SelfCheckDefaultsEditor.tsx` - Global defaults UI
- `app/admin/self-check-defaults/page.tsx` - Admin page
- `app/api/admin/site-settings/[key]/route.ts` - Settings API
- `SELF_CHECK_CUSTOMIZATION.md` - This file

### Modified Files
- `lib/blocks/types.ts` - Added styles to SelfCheckIntroBlock and SelfCheckResultBlock
- `app/api/chapter/[chapterId]/self-check-copy/route.ts` - Loads and merges defaults with overrides
- `components/assessment/SelfCheckAssessment.tsx` - Applies dynamic styles
- `components/admin/ContentEditor.tsx` - Style override UI for blocks

## Testing

1. **Global Defaults**
   - Visit `/admin/self-check-defaults`
   - Change title color to red (#ff0000)
   - Save
   - Visit any chapter's self-check page
   - Verify title is red

2. **Chapter Override**
   - Edit Chapter 7's self-check intro block
   - Set title color to blue (#0000ff)
   - Save
   - Visit Chapter 7's self-check
   - Verify title is blue (override)
   - Visit Chapter 6's self-check
   - Verify title is red (global default)

3. **Partial Override**
   - Edit Chapter 5's self-check intro
   - Override only button color
   - Leave title color empty
   - Save
   - Verify button uses chapter color
   - Verify title uses global default color

## Future Enhancements

- Preview mode in admin
- Copy configuration from one chapter to another
- Export/import self-check templates
- Version history for global defaults
- A/B testing support for different styles
