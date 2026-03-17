# QUICK START: Self-Check Customization

## 1. Run the Database Migration

**IMPORTANT**: Run this SQL in your Supabase SQL Editor first!

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy the entire contents of `RUN_THIS_MIGRATION.sql`
4. Paste and execute
5. Verify: Check that `site_settings` table exists

## 2. Access the Global Defaults Editor

Navigate to: **`/admin/self-check-defaults`**

This is where you set the default text and colors for ALL chapters.

## 3. Override for Specific Chapters

1. Go to `/admin/chapters`
2. Select a chapter (e.g., Chapter 7)
3. Click "Steps" tab
4. Find the "Self Check" step
5. Edit the "Self-Check Intro" page
6. You'll see two special blocks:
   - **Self-Check Intro** - Customize intro text/colors
   - **Self-Check Result** - Customize result text/colors
7. Edit the text fields you want to override
8. Expand "Custom Styling" to override colors
9. **Leave fields empty to use global defaults**
10. Click "Save Changes"

## 4. Test It

1. Visit `/read/chapter-7/assessment` (or any chapter)
2. You should see the intro page with your custom text/colors
3. Complete the self-check
4. Result page should show your custom styling

## Color Customization Examples

### Make Chapter 7 Blue-Themed
In Chapter 7's self-check blocks, set:
- Title Color: `#1e40af` (blue)
- Button BG: `#3b82f6` (blue)
- Highlight BG: `#dbeafe` (light blue)

### Make Chapter 3 Green-Themed
In Chapter 3's self-check blocks, set:
- Title Color: `#166534` (green)
- Button BG: `#22c55e` (green)
- Highlight BG: `#d1fae5` (light green)

## Troubleshooting

**Issue**: Changes not showing
- **Solution**: Clear browser cache and hard refresh (Ctrl+Shift+R)

**Issue**: "Table doesn't exist" error in API
- **Solution**: Run the migration (`RUN_THIS_MIGRATION.sql`) in Supabase

**Issue**: Chapter uses wrong colors
- **Solution**: Check if chapter has override blocks. Empty fields = uses global defaults.

## What Gets Customized

### Intro Page
- Title (e.g., "Self-Check")
- Subtitle (e.g., "Take a quick snapshot...")
- Body paragraphs (2 paragraphs explaining the self-check)
- Highlight box (yellow callout with key info)
- Button (Start Self-Check →)
- All colors for each element

### Result Page
- Title (e.g., "Self-Check Results")
- Subtitle
- Score display card
- Explanation box ("Score Bands Explained")
- Button (Continue to Framework →)
- All colors for each element

## Admin Navigation

- **Global Defaults**: `/admin/self-check-defaults`
- **Chapter Overrides**: `/admin/chapters` → Select chapter → Steps tab → Edit "Self-Check Intro" page
- **Live Preview**: Visit `/read/chapter-N/assessment` after saving

---

**Need Help?** See `SELF_CHECK_CUSTOMIZATION.md` for detailed documentation.
