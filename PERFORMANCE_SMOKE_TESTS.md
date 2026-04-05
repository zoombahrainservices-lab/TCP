# TCP Platform - Performance Smoke Test Checklist

## Instructions
Run this checklist after EVERY performance-related deploy to ensure core functionality remains intact.

## Test Environment
- [ ] Dev server running: `npm run dev`
- [ ] Browser: Chrome (latest)
- [ ] Network: Fast 3G throttling (for mobile simulation)
- [ ] Device: Test on actual mobile device if possible

---

## 1. Authentication & Dashboard
- [ ] Can log in with email/password
- [ ] Can log in with Google OAuth
- [ ] Dashboard loads without errors
- [ ] User profile displays correctly
- [ ] XP and streak data shows correctly
- [ ] Chapter cards render with correct images
- [ ] "Continue" button navigates to correct chapter

## 2. Chapter Navigation
- [ ] Can open Chapter 1 from dashboard
- [ ] Can open Chapter 2 from dashboard
- [ ] Can navigate back to dashboard from chapter
- [ ] Chapter slug URLs work correctly (`/read/stage-star-silent-struggles`)
- [ ] Chapter number URLs redirect properly (if applicable)

## 3. Reading Section
**Test on Chapter 1 and Chapter 2:**
- [ ] Cover page loads correctly
- [ ] Can advance from cover to first reading page
- [ ] Can navigate forward through pages (Continue button works)
- [ ] Can navigate backward through pages (Previous button works)
- [ ] Hero images load and display correctly
- [ ] Content blocks render properly (text, images, prompts)
- [ ] Progress bar updates as pages advance
- [ ] Completing last page triggers celebration
- [ ] Navigation to Self-Check works after completion

## 4. Self-Check Section
**Test on Chapter 1 and Chapter 2:**
- [ ] Self-Check page loads (no "Content Not Available" error)
- [ ] Assessment questions display correctly
- [ ] Can select answers
- [ ] Can submit assessment
- [ ] Score displays correctly
- [ ] Results screen shows proper feedback
- [ ] Can navigate to Framework after completion
- [ ] Progress saves correctly (verified by refresh)

## 5. Framework Section
**Test on Chapter 1 (SPARK) and Chapter 2 (VOICE):**
- [ ] Framework cover page loads (if present)
- [ ] Framework letter strip displays correctly
- [ ] Can navigate through framework pages
- [ ] Letter highlighting works correctly in progress strip
- [ ] "Your Turn" pages display properly
- [ ] Can save "Your Turn" responses
- [ ] Can complete framework section
- [ ] Navigation to Techniques works

**Special test for Chapter 14 or long frameworks:**
- [ ] Can navigate backward from page 9+
- [ ] Can navigate forward from page 9+
- [ ] Page index doesn't snap back to resume position
- [ ] Navigation is smooth without loops

## 6. Techniques Section
**Test on Chapter 1:**
- [ ] Techniques pages load
- [ ] Can navigate through technique pages
- [ ] Content and images display correctly
- [ ] Can complete techniques section
- [ ] Navigation to Resolution works

## 7. Resolution Section
**Test on Chapter 1 and Chapter 2:**
- [ ] Resolution page loads at `/chapter/[N]/proof`
- [ ] Copy and guidance text displays immediately (no loading flash)
- [ ] Can add text proof
- [ ] Can add image proof
- [ ] Can add audio recording (if browser supports)
- [ ] Can save and submit resolution
- [ ] Navigation to Follow-Through works after completion
- [ ] Already-completed state works (shows skip option)

## 8. Follow-Through Section
**Test on Chapter 1:**
- [ ] Follow-through page loads
- [ ] Checklist renders correctly
- [ ] Can check/uncheck items
- [ ] Can complete section
- [ ] Final celebration displays

## 9. Progress & State Persistence
- [ ] Resume a partially completed chapter
- [ ] Verify resume starts at correct page index
- [ ] Complete a section and refresh
- [ ] Verify completion persists after refresh
- [ ] Check dashboard shows updated progress
- [ ] Verify unlock logic (next chapter availability)

## 10. Admin Preview (if admin user)
- [ ] Can preview unpublished chapters
- [ ] Admin edit buttons appear on pages
- [ ] Can click edit button and return correctly
- [ ] Draft content loads without errors

## 11. Mobile-Specific Tests
- [ ] Sidebar hamburger toggle works
- [ ] Touch navigation works (swipe/tap)
- [ ] Images display correctly on small screens
- [ ] Progress bar visible and accurate
- [ ] Close button works
- [ ] Keyboard doesn't break layout on input fields

## 12. Image Loading
- [ ] Hero images load on Reading pages
- [ ] Hero images load on Framework pages
- [ ] Hero images load on Techniques pages
- [ ] Images don't pop in late (prefetch working)
- [ ] No broken image icons
- [ ] Dark mode images work correctly

## 13. Performance Verification
- [ ] Route transitions feel fast (< 500ms perceived)
- [ ] No visible loading spinners between sections
- [ ] Images appear quickly
- [ ] Continue button responds immediately
- [ ] No layout shifts during page load
- [ ] Smooth scrolling and interaction

---

## Test Results
Date: _______________
Tester: _______________
Git commit: _______________

### Pass/Fail Summary
- Authentication: ☐ PASS ☐ FAIL
- Navigation: ☐ PASS ☐ FAIL
- Reading: ☐ PASS ☐ FAIL
- Self-Check: ☐ PASS ☐ FAIL
- Framework: ☐ PASS ☐ FAIL
- Techniques: ☐ PASS ☐ FAIL
- Resolution: ☐ PASS ☐ FAIL
- Follow-Through: ☐ PASS ☐ FAIL
- Progress State: ☐ PASS ☐ FAIL
- Mobile: ☐ PASS ☐ FAIL
- Images: ☐ PASS ☐ FAIL
- Performance: ☐ PASS ☐ FAIL

### Issues Found
```
(List any issues here)
```

### Rollback Required?
☐ YES - Rollback immediately
☐ NO - Deploy is safe

---

## Quick Rollback Commands
```bash
# If issues found, rollback to previous commit
git log --oneline -n 5
git revert <commit-hash>
# Or reset hard (loses uncommitted work!)
git reset --hard HEAD~1

# Redeploy previous version
vercel --prod

# Or via Vercel dashboard
# Deployments → Previous deployment → Promote to Production
```
