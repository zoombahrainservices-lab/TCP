# Admin Panel Debugging Guide

## 🔍 Issue: Chapters Not Showing

### Possible Causes

1. **No data in database**
2. **Chapters don't have `part_id` set**
3. **Database query failing silently**
4. **RLS (Row Level Security) blocking access**

### How to Debug

#### Step 1: Check the Browser Console

Open DevTools (F12) and look for:
- Error messages in Console tab
- Network tab for failed requests
- Look for logs like "Loaded parts: X" and "Loaded chapters: X"

#### Step 2: Visit the Debug Endpoint

Go to: `http://localhost:3000/api/admin/debug`

This will show you:
```json
{
  "status": "ok",
  "diagnostics": {
    "database": {
      "connection": "OK"
    },
    "queries": {
      "chapters": {
        "count": 2,
        "status": "OK"
      },
      "parts": {
        "count": 1,
        "status": "OK"
      }
    }
  }
}
```

**If chapters count is 0** → You need to create chapters
**If chapters count > 0 but not showing** → Continue to Step 3

#### Step 3: Check Database Directly

Run these queries in Supabase SQL Editor:

```sql
-- Check if chapters exist
SELECT id, title, chapter_number, part_id, is_published 
FROM chapters 
ORDER BY chapter_number;

-- Check if parts exist
SELECT id, title, order_index 
FROM parts 
ORDER BY order_index;

-- Check if chapters have part_id
SELECT 
  c.id,
  c.title,
  c.part_id,
  p.title as part_title
FROM chapters c
LEFT JOIN parts p ON c.part_id = p.id
ORDER BY c.chapter_number;
```

#### Step 4: Check RLS Policies

Make sure your admin user has the correct role:

```sql
-- Check your role
SELECT id, email, role 
FROM profiles 
WHERE email = 'your@email.com';

-- Should show role = 'admin'
-- If not, update it:
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

#### Step 5: Check Service Role Key

In your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # This one is critical!
```

The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and is required for admin operations.

### Common Fixes

#### Fix 1: Chapters Exist But Have No part_id

If your chapters don't have a `part_id`, they won't show under any part. The updated code now shows them in a "Chapters Without Parts" section.

To assign them to a part:

```sql
-- Create a part first
INSERT INTO parts (title, slug, order_index)
VALUES ('Part 1', 'part-1', 1);

-- Get the part ID
SELECT id FROM parts WHERE slug = 'part-1';

-- Update chapters to use this part
UPDATE chapters 
SET part_id = 'the-part-id-from-above'
WHERE part_id IS NULL;
```

#### Fix 2: Create Sample Data

If you have no chapters at all:

```sql
-- Create a part
INSERT INTO parts (title, slug, order_index)
VALUES ('Getting Started', 'getting-started', 1)
RETURNING id;

-- Create a chapter (use the part id from above)
INSERT INTO chapters (
  chapter_number,
  title,
  subtitle,
  slug,
  part_id,
  is_published,
  order_index
) VALUES (
  1,
  'Introduction',
  'Welcome to the course',
  'introduction',
  'your-part-id-here',
  true,
  1
);
```

#### Fix 3: Service Role Key Missing

If you see "permission denied" errors:

1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (not the `anon` key!)
3. Add to `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```
4. Restart your dev server

## 🔍 Issue: User Detail Page Shows "User not found"

### Possible Causes

1. **User ID in URL is incorrect**
2. **Database relationship query failing**
3. **User doesn't exist**

### How to Debug

#### Check the URL

The URL should be: `/admin/users/{user-id}`

The `{user-id}` should be a valid UUID like: `123e4567-e89b-12d3-a456-426614174000`

#### Check Browser Console

Look for errors like:
```
Error fetching user progress timeline: {...}
```

#### Verify User Exists

In Supabase SQL Editor:

```sql
-- Check if user exists
SELECT id, email, full_name, role 
FROM profiles 
WHERE id = 'the-user-id-from-url';
```

### Fix Applied

The `getUserProgressTimeline` function has been updated to:
1. Fetch progress separately
2. Fetch chapters separately
3. Merge them manually

This avoids the PostgREST relationship error.

## 🔍 Issue: XP Logs Not Showing

### Check

1. Visit `/admin/xp`
2. Look at the XP Logs tab
3. Check browser console for errors

### Fix Applied

The `getAllXPLogs` function now:
1. Fetches XP logs separately
2. Fetches user profiles separately
3. Merges them manually

## 📊 General Debugging Steps

### 1. Check Environment Variables

```bash
# In your terminal
cd tcp-platform
cat .env.local  # On Windows: type .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` ← Most important for admin!

### 2. Check Server Logs

When running `npm run dev`, watch the terminal for errors:

```
Error fetching chapters: {...}
Error fetching users: {...}
```

### 3. Check Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for failed requests (red)
5. Click on them to see the error response

### 4. Use the Debug Endpoint

Always start with: `http://localhost:3000/api/admin/debug`

This gives you a health check of:
- Environment variables
- Database connection
- Record counts
- Specific errors

### 5. Check Supabase Logs

1. Go to Supabase Dashboard
2. Click "Logs" in sidebar
3. Look for errors related to your queries

## 🛠️ Quick Fixes

### Restart Everything

```bash
# Stop the dev server (Ctrl+C)
# Clear Next.js cache
rm -rf .next  # On Windows: rmdir /s .next

# Rebuild
npm run build

# Start fresh
npm run dev
```

### Reset Admin Role

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

### Check Table Permissions

```sql
-- Check if tables exist and you can query them
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM chapters;
SELECT COUNT(*) FROM parts;
SELECT COUNT(*) FROM user_gamification;
SELECT COUNT(*) FROM xp_logs;
```

If any of these fail, you have a permissions issue.

## 📝 Error Reference

### "Could not find a relationship between..."

**Cause:** Supabase PostgREST can't find foreign key for nested joins

**Fix:** We now use separate queries + manual merging (already applied)

### "User not found"

**Cause:** Invalid user ID or user doesn't exist

**Fix:** Check the URL, verify user exists in database

### "Permission denied"

**Cause:** Missing or incorrect `SUPABASE_SERVICE_ROLE_KEY`

**Fix:** Add correct service role key to `.env.local`

### "Failed to load chapters"

**Cause:** No chapters in database OR query error

**Fix:** Check debug endpoint, create sample data if needed

### Empty screens (no data showing)

**Cause:** Data exists but not displaying

**Fix:** 
1. Check browser console for errors
2. Visit debug endpoint
3. Verify data exists in Supabase
4. Check if chapters have `part_id` set

## ✅ Verification Checklist

After applying fixes, verify:

- [ ] `/api/admin/debug` shows all tables with counts
- [ ] `/admin` dashboard shows statistics
- [ ] `/admin/users` shows user list
- [ ] Clicking a user shows their detail page
- [ ] `/admin/chapters` shows parts and chapters
- [ ] Clicking "Edit" on a chapter works
- [ ] `/admin/xp` shows XP logs and badges
- [ ] No errors in browser console
- [ ] No errors in server terminal

## 🎯 Still Having Issues?

1. **Check this file first:** `FIXES_APPLIED.md`
2. **Read the complete guide:** `ADMIN_COMPLETE.md`
3. **Review the implementation:** `ADMIN_PANEL_GUIDE.md`

### Collect Debug Info

If you need help, collect:
1. Output from `/api/admin/debug`
2. Browser console errors (screenshot)
3. Server terminal errors (copy/paste)
4. SQL query results from "Check Database Directly" section
5. Your `.env.local` file (redact sensitive keys!)

---

**Most issues are caused by:**
1. Missing `SUPABASE_SERVICE_ROLE_KEY` (60%)
2. No data in database (25%)
3. Incorrect admin role (10%)
4. Other (5%)

**Start with the debug endpoint!** → `http://localhost:3000/api/admin/debug`
