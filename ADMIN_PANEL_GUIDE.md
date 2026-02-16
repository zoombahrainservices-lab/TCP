# Admin Panel Implementation Guide

## Overview

A comprehensive admin panel has been implemented for The Communication Protocol (TCP) platform, providing full control over users, chapters, XP system, and analytics.

## Access

**URL:** `/admin`

**Requirements:**
- User must be logged in
- User role must be set to `'admin'` in the database

### Setting Up an Admin User

```sql
-- Run this in your Supabase SQL editor
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

## Features Implemented

### 1. Admin Dashboard (`/admin`)

**Overview page showing:**
- Total users, active today, new this week
- Total chapters (published vs drafts)
- Total XP awarded and average level
- User breakdown by role
- Recent activity (signups, completions, XP awards)
- Quick action buttons

### 2. User Management (`/admin/users`)

**User List Page:**
- Search by name or email
- Filter by role (student, mentor, parent, admin)
- Sort by XP, level, join date, or last active
- Pagination (50 users per page)
- View user details, delete users
- Export to CSV

**User Detail Page (`/admin/users/[id]`):**

**Tabs:**
- **Overview:** Profile info, role editor, gamification stats, quick actions
- **Progress:** Chapter-by-chapter progress timeline with completion status
- **XP History:** Complete log of all XP awards with filtering
- **Badges:** All badges earned by the user

**Actions Available:**
- Change user role
- Adjust XP (add or subtract with reason)
- Adjust streak values
- Reset chapter progress (individual or all)
- Delete user account
- Award or revoke badges

### 3. Chapter Management (`/admin/chapters`)

**Chapter Dashboard:**
- View all parts with expandable chapter lists
- Create, edit, delete parts
- View chapter stats (published, drafts, total)
- Quick actions for each chapter:
  - Edit chapter settings
  - Publish/unpublish
  - Duplicate chapter
  - Delete chapter

**Chapter Editor (`/admin/chapters/[id]`):**

**Settings Tab:**
- Title, subtitle, slug
- Chapter number
- Part assignment
- Thumbnail URL
- Minimum level requirement
- Order index
- Published status

**Steps Tab:**
- View all steps in the chapter
- Create new steps (read, self_check, framework, techniques, resolution, follow_through)
- Edit step properties
- Delete steps
- Reorder steps

**Features:**
- Import/Export chapters as JSON
- Drag-and-drop reordering (planned)
- Full CRUD operations on parts, chapters, steps, and pages

### 4. XP System Management (`/admin/xp`)

**Overview Tab:**
- Total XP distributed
- Average user level
- Active streaks count
- Badges awarded
- XP distribution histogram
- Top 10 users by XP

**XP Logs Tab:**
- Complete history of all XP awards
- Filter by user, reason, date range
- Export to CSV
- Shows: User, Date, Reason, Amount, Chapter

**Badge Management Tab:**
- View all badges
- Create new badges
- Edit existing badges
- Delete badges
- Badge properties:
  - Name, description, icon (emoji)
  - Requirement type (chapters, streak, XP, level, custom)
  - Requirement value
  - Times awarded counter

**Streaks Tab:**
- View users with active streaks
- Streak milestone statistics
- Manual streak adjustments (via user detail page)

### 5. Analytics Dashboard (`/admin/analytics`)

**User Engagement:**
- DAU (Daily Active Users)
- WAU (Weekly Active Users)
- MAU (Monthly Active Users)
- Total registered users

**Progress Metrics:**
- Users with progress
- Average chapters completed per user
- Engagement rate

**Chapter Analytics:**
- Top performing chapters (highest completion rate)
- Chapters needing attention (lowest completion rate)
- Completion rates with visual progress bars
- User attempt vs completion stats

**Export:**
- Export full analytics report as JSON

## API Routes

### User Export
```
GET /api/admin/users/export
```
Exports all users to CSV with gamification data.

### Analytics Export
```
GET /api/admin/analytics/export
```
Exports complete analytics report as JSON.

### Chapter Export
```
GET /api/admin/chapters/export
```
Exports all content (parts, chapters, steps, pages) as JSON.

### Chapter Import
```
POST /api/admin/chapters/import
```
Imports content from JSON file (upserts existing records).

## Server Actions

All admin operations use server actions in `app/actions/admin.ts`:

**Dashboard:**
- `getAdminDashboardStats()`
- `getRecentActivity(limit)`

**User Management:**
- `getAllUsers(filters, pagination)`
- `getUserDetailById(userId)`
- `getUserProgressTimeline(userId)`
- `getUserXPHistory(userId, filters)`
- `updateUserRole(userId, newRole)`
- `adjustUserXP(userId, amount, reason)`
- `adjustUserStreak(userId, currentStreak, longestStreak)`
- `resetUserChapterProgress(userId, chapterId?)`
- `deleteUser(userId)`
- `awardBadge(userId, badgeId)`
- `revokeBadge(userId, badgeId)`

**Chapter Management:**
- `createPart(data)`, `updatePart(partId, data)`, `deletePart(partId)`
- `createChapter(data)`, `updateChapter(chapterId, data)`, `deleteChapter(chapterId)`
- `duplicateChapter(chapterId)`, `publishChapter(chapterId, isPublished)`
- `createStep(chapterId, data)`, `updateStep(stepId, data)`, `deleteStep(stepId)`
- `createPage(stepId, data)`, `updatePage(pageId, data)`, `deletePage(pageId)`
- `updatePageContent(pageId, content)`

**XP System:**
- `getXPSystemStats()`
- `getAllXPLogs(filters, pagination)`
- `getAllBadges()`
- `createBadge(data)`, `updateBadge(badgeId, data)`, `deleteBadge(badgeId)`

**Analytics:**
- `getUserEngagementStats(dateRange?)`
- `getChapterAnalytics()`
- `getProgressMetrics()`

## Components Created

### Admin-Specific Components (`components/admin/`)

1. **AdminSidebar.tsx** - Navigation sidebar with mobile support
2. **StatCard.tsx** - Dashboard stat cards with icons
3. **UserTable.tsx** - Sortable, filterable user table
4. **UserProgressTimeline.tsx** - Visual chapter progress timeline
5. **PartEditor.tsx** - Part create/edit modal
6. **BadgeEditor.tsx** - Badge create/edit modal
7. **XPAdjustmentModal.tsx** - Manual XP adjustment form
8. **ConfirmDialog.tsx** - Reusable confirmation dialog

## Security

- All admin routes protected with `requireAuth('admin')` guard
- Uses Supabase admin client to bypass RLS for administrative operations
- Role-based access control at both route and database level
- Confirmation dialogs for destructive actions

## Database Schema

No new tables were needed! The admin panel uses existing tables:
- `profiles` (with `role` column)
- `chapters`, `chapter_steps`, `step_pages`, `parts`
- `user_gamification`, `xp_logs`, `chapter_skill_scores`
- `badges`, `user_badges`
- `chapter_progress`, `step_completions`, `chapter_sessions`

## Styling

- Consistent with existing TCP design system
- Dark mode support throughout
- Responsive design (mobile-friendly)
- Uses existing UI components (Button, Card, Input, etc.)
- Tailwind CSS for styling

## Usage Examples

### Promoting a User to Admin
1. Go to `/admin/users`
2. Click on the user
3. Change role dropdown to "Admin"
4. Changes save automatically

### Creating a New Badge
1. Go to `/admin/xp`
2. Click "Badges" tab
3. Click "Create Badge"
4. Fill in:
   - Badge key (unique ID)
   - Name and description
   - Icon (emoji)
   - Requirement type and value
5. Click "Create Badge"

### Adjusting User XP
1. Go to `/admin/users/[userId]`
2. Click "Adjust XP" button
3. Enter amount (positive or negative)
4. Enter reason
5. Click "Apply Adjustment"

### Exporting Users
1. Go to `/admin/users`
2. Click "Export CSV" button
3. CSV file downloads automatically

### Managing Chapters
1. Go to `/admin/chapters`
2. Expand a part to see chapters
3. Click "Edit" on a chapter
4. Modify settings or steps
5. Click "Save Changes"

## Future Enhancements

Potential additions:
- Real-time updates using Supabase Realtime
- Advanced analytics charts (line graphs, pie charts)
- Bulk user operations
- Email notification system
- Audit log for admin actions
- Content preview before publishing
- Rich text editor for page content
- Image upload for thumbnails
- Advanced filtering and search

## Troubleshooting

**Can't access admin panel:**
- Verify your user role is set to 'admin' in the database
- Check you're logged in
- Clear browser cache and cookies

**Changes not saving:**
- Check browser console for errors
- Verify Supabase connection
- Check RLS policies allow admin operations

**Missing data:**
- Ensure Supabase admin client is configured with service role key
- Check environment variables are set correctly

## Support

For issues or questions:
1. Check browser console for errors
2. Review Supabase logs
3. Verify database schema matches expected structure
4. Check that all environment variables are set

---

**Admin Panel Version:** 1.0  
**Last Updated:** February 2026  
**Platform:** The Communication Protocol (TCP)
