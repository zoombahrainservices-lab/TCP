# Chapter Reports - Dynamic System

## What Changed

**Before:**
- Reports page showed ALL chapters (regardless of progress)
- Only chapters 1-2 had assessment configs

**After:**
- Reports page shows **only previous chapters** (if on chapter N, show reports for chapters 1 through N-1)
- Assessment configs added for chapters 3-8
- Logic: "If user is on chapter 8, reports for chapters 1-7 are visible"

---

## How It Works

### Logic
```
Current Chapter = Highest chapter in user's chapter_progress table
Eligible Reports = All chapters < Current Chapter
```

### Examples
- User on **Chapter 1** → No reports yet (0 previous chapters)
- User on **Chapter 2** → Shows Chapter 1 report
- User on **Chapter 8** → Shows Chapters 1-7 reports
- User on **Chapter 10** → Shows Chapters 1-9 reports

---

## Files Changed

### 1. `lib/reports/assessmentConfig.ts`
Added assessment question configs for chapters 3-8 (with placeholder questions).

**To customize later**: Update the `questions` array for each chapter with actual self-check questions.

### 2. `app/actions/reports.ts`
Updated `getChaptersForReports()` to:
1. Query `chapter_progress` to find user's current chapter
2. Filter chapters to only include those < currentChapter
3. Only fetch assessment/resolution data for eligible chapters

---

## Testing

### Test Case 1: User on Chapter 1
- Go to `/reports`
- **Expected**: Empty or "no reports yet" message

### Test Case 2: User on Chapter 8
- Go to `/reports`
- **Expected**: Reports for Chapters 1-7 visible

### Test Case 3: Chapter Progression
1. Complete Chapter 1 (with assessment/resolution)
2. Start Chapter 2
3. Go to `/reports`
4. **Expected**: Chapter 1 report now visible

---

## Customization

### Adding Real Questions for Chapters 3-8
Edit `lib/reports/assessmentConfig.ts`:

```typescript
3: {
  chapterTitle: 'Chapter 3: Your Actual Title',
  maxScore: 35, // 7 questions × 5 points each = 35
  questions: [
    { id: 1, question: 'Your real question 1', low: 'Not at all', high: 'Completely' },
    { id: 2, question: 'Your real question 2', low: 'Never', high: 'Always' },
    // ... add 5 more
  ],
},
```

---

## Database Schema

Uses existing tables:
- `chapter_progress` - Tracks which chapter user is currently on
- `assessments` - Stores self-check assessment responses
- `artifacts` - Stores resolution data

No database migration needed!

---

## Benefits

✅ **Automatic** - Reports appear as user progresses
✅ **Clean UI** - Only shows relevant previous chapters
✅ **Scalable** - Works for any number of chapters
✅ **No manual config** - Purely based on user's progress

---

Your reports page now dynamically shows reports for all completed chapters! 🎉
