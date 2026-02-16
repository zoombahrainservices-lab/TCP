# Admin Panel - Quick Reference

## URLs

- **Dashboard:** `http://localhost:3000/admin`
- **Users:** `http://localhost:3000/admin/users`
- **Chapters:** `http://localhost:3000/admin/chapters`
- **XP System:** `http://localhost:3000/admin/xp`
- **Analytics:** `http://localhost:3000/admin/analytics`
- **Debug:** `http://localhost:3000/api/admin/debug`

## Chapter Management

### Create New Chapter
1. `/admin/chapters` → "New Chapter"
2. Enter title, subtitle, part, number
3. Select steps to include
4. Enable/disable starter templates
5. Create

### Edit Chapter Content
1. `/admin/chapters` → Click chapter → "Edit"
2. Go to "Content" tab
3. See all steps with pages
4. Expand step to manage pages
5. Click "Edit Content" to modify blocks

### Add "Your Turn" Page
1. Content tab → Expand step
2. "Add from Template"
3. Choose "Your Turn: [type]"
4. Customize prompts
5. Save

### Reorder Steps
- Use up/down arrows on step cards
- Changes save automatically

### Reorder Pages
- Use up/down arrows on page rows
- Changes save automatically

### Make Step Optional
1. Click edit icon on step card
2. Uncheck "Required Step"
3. Save

## Templates Available

### "Your Turn" Templates (5)
1. Reflection - 3 reflection prompts
2. Practice Exercise - Guided practice with checklist
3. Framework Application - Apply to real situation
4. Technique Practice - Deliberate practice guide
5. Action Plan - Concrete commitment planning

### Other Templates (8)
6. Simple Reflection
7. Scale Assessment
8. Action Plan
9. Yes/No Baseline
10. Story with Reflection
11. Framework Introduction
12. Quick Tips
13. Weekly Task Planner

## Content Blocks (18 Types)

**Text:** Heading, Paragraph, Story, Quote, Divider
**Visual:** Image, Callout, List
**Interactive:** Prompt, Scale Questions, Yes/No Check, Checklist
**Planning:** Task Plan, Scripts
**Action:** CTA, Button
**Advanced:** Conditional, Variable

## Common Tasks

### Add Page to Reading Step
```
Edit Chapter → Content → Expand "Reading" → Add Page
```

### Add Framework Content
```
Edit Chapter → Content → Expand "Framework" → Add from Template → "Framework Introduction"
```

### Add Practice Exercise
```
Edit Chapter → Content → Expand "Techniques" → Add from Template → "Your Turn: Practice Exercise"
```

### Check for Issues
```
Edit Chapter → See yellow warning box at top
```

### Reorder Content
```
Content tab → Use up/down arrows on steps and pages
```

## Keyboard Shortcuts

- **F12** - Open browser console (for debugging)
- **Ctrl+S** - Save (in editors)
- **Esc** - Close modals

## Troubleshooting

### Chapters Not Showing
1. Check browser console (F12)
2. Look for "Loaded chapters: X"
3. Scroll to debug section at bottom
4. Visit `/api/admin/debug`

### "supabaseKey is required" Error
- **Fixed!** All components now use server actions

### Pages Not Saving
- Check browser console for errors
- Verify you're logged in as admin
- Check network tab for failed requests

### Validation Warnings
- Yellow box shows issues
- Fix required steps without pages
- Add content to empty pages
- Set appropriate XP awards

## Tips

1. **Use templates** - Faster than building from scratch
2. **Start with wizard** - Creates proper structure
3. **Check validation** - Before publishing
4. **Use debug section** - Always shows all chapters
5. **Expand All button** - See everything at once
6. **Auto-save works** - In content editor (30s)

## Quick Fixes

### Fix: Part ID Mismatch
```sql
SELECT id FROM parts WHERE order_index = 1;
UPDATE chapters SET part_id = 'correct-id' WHERE part_id IS NULL;
```

### Fix: Make User Admin
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### Fix: Reset Chapter Order
```sql
UPDATE chapters SET order_index = chapter_number;
```

## Support Files

- `COMPLETE_CHAPTER_SYSTEM.md` - Full documentation
- `DEBUGGING_GUIDE.md` - Troubleshooting
- `ADMIN_COMPLETE.md` - Feature overview
- `FIXES_APPLIED.md` - Bug fixes history

---

**Everything is now working!** Start with `/admin/chapters` and explore the new features.
