# Gamification System Testing Guide

This document outlines how to test all aspects of the gamification system implementation.

## Prerequisites

Before testing, ensure:
1. Database migration has been run: `supabase/migrations/20260204_gamification_system.sql`
2. The application is running locally
3. You have at least one test user account

## 1. Database Setup Testing

### Run Migration
```bash
# Connect to your Supabase project and run the migration
# You can run this via Supabase CLI or dashboard SQL editor
```

### Verify Tables Created
```sql
-- Check all gamification tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_gamification',
  'xp_logs',
  'chapter_skill_scores',
  'streak_history',
  'badges',
  'user_badges'
);

-- Should return 6 rows

-- Check badges are seeded
SELECT COUNT(*) FROM badges;
-- Should return 9 badges
```

### Verify Functions Created
```sql
-- Test level calculation
SELECT calculate_level(0);    -- Should return 1
SELECT calculate_level(100);  -- Should return 2
SELECT calculate_level(250);  -- Should return 3
SELECT calculate_level(500);  -- Should return 4

-- Test streak multiplier
SELECT get_streak_multiplier(0);   -- Should return 1.0
SELECT get_streak_multiplier(5);   -- Should return 1.2
SELECT get_streak_multiplier(10);  -- Should return 1.5
SELECT get_streak_multiplier(20);  -- Should return 2.0

-- Test level threshold
SELECT get_level_threshold(1);  -- Should return 0
SELECT get_level_threshold(2);  -- Should return 100
SELECT get_level_threshold(5);  -- Should return ~890
```

## 2. Server Actions Testing

### Initialization
Test gamification initialization for new users:

```typescript
// In browser console or testing script
const userId = 'your-user-id';
const result = await initializeGamification(userId);
console.log('Initialization:', result);
// Should create user_gamification record with defaults
```

### XP Awarding
Test different XP award scenarios:

```typescript
// Test daily activity XP
await awardXP(userId, 'daily_activity', 10, { test: 'daily' });
// Check: user should receive 10 XP (base amount, no multiplier on day 1)

// Test section completion XP
await awardXP(userId, 'section_completion', 20, { chapter_id: 1 });
// Check: user should receive 20 XP

// Test with streak multiplier
// First, set streak to 5
await updateStreak(userId);
// Then award XP
await awardXP(userId, 'daily_activity', 10);
// Check: should receive 12 XP (10 * 1.2 multiplier)
```

### Streak Testing

#### Test 1: First Day Streak
```typescript
const result = await updateStreak(userId);
console.log(result);
// Expected: { streakContinued: false, currentStreak: 1 }
```

#### Test 2: Continue Streak (Next Day)
```typescript
// Manually update last_active_date to yesterday in database
// Then call updateStreak
const result = await updateStreak(userId);
// Expected: { streakContinued: true, currentStreak: 2 }
```

#### Test 3: Broken Streak
```typescript
// Manually update last_active_date to 3 days ago
// Then call updateStreak
const result = await updateStreak(userId);
// Expected: { streakContinued: false, currentStreak: 1, streakBroken: true }
```

#### Test 4: Milestone Bonuses
```typescript
// Set streak to 2, then trigger day 3
const result = await updateStreak(userId);
// Expected: { 
//   streakContinued: true, 
//   currentStreak: 3,
//   milestoneReached: 3,
//   bonusXP: 20
// }
```

### Skill Score & Improvement Testing

#### Test 1: Baseline Assessment
```typescript
await recordAssessmentScore(userId, 1, 'baseline', 40);
// Check: chapter_skill_scores should have score_before = 40
```

#### Test 2: After Assessment with Improvement
```typescript
await recordAssessmentScore(userId, 1, 'after', 30);
// Expected improvement: 10 points (40 - 30)
// Expected XP: 20 (10 * 2)
// Check: 
// - chapter_skill_scores.improvement = 10
// - xp_logs should have new entry with reason='improvement', amount=20
```

#### Test 3: After Assessment without Improvement
```typescript
await recordAssessmentScore(userId, 1, 'after', 45);
// Expected improvement: -5 points (worse)
// Expected XP: 0 (no reward for negative improvement)
```

## 3. Chapter Integration Testing

### Step Completion
```typescript
// Complete first step of the day
await completeStep(userId, 'CH1-1.1', 1);
// Check:
// 1. step_completions table has new entry
// 2. Streak is updated
// 3. Daily activity XP is awarded (10 XP)

// Complete second step same day
await completeStep(userId, 'CH1-1.2', 1);
// Check:
// 1. step_completions table has new entry
// 2. Streak is NOT updated (already active today)
// 3. No daily activity XP (already awarded today)
```

### Section Completion
```typescript
await completeSectionBlock(userId, 1, 'reading');
// Check:
// 1. chapter_progress.reading_complete = true
// 2. xp_logs has entry with reason='section_completion', amount=20
// 3. XP multiplied by streak if active
```

### Chapter Completion
```typescript
await completeChapter(userId, 1);
// Check:
// 1. chapter_progress.chapter_complete = true
// 2. chapter_sessions.completed_at is set
// 3. xp_logs has entry with reason='chapter_completion'
// 4. XP amount = 50 for Chapter 1 (1.0x multiplier)
```

## 4. Anti-Gaming Safeguards Testing

### Daily XP Cap
```typescript
// Award section completion XP 10 times in one day
for (let i = 0; i < 10; i++) {
  await awardXP(userId, 'section_completion', 20);
}

// Try 7th time (should hit cap of 120 XP for section_completion)
await awardXP(userId, 'section_completion', 20);
// Check: Should receive 0 XP (or remaining cap if < 20)
```

### Duplicate Award Prevention
```typescript
// Award with same reference_id twice
await awardXP(userId, 'section_completion', 20, { 
  reference_id: 'reading-block-1' 
});

await awardXP(userId, 'section_completion', 20, { 
  reference_id: 'reading-block-1' 
});
// Check: Second award should be prevented
```

### Repeat Chapter Penalty
```typescript
// Complete Chapter 1 first time
await completeChapter(userId, 1);
// XP: 50 (100%)

// Complete Chapter 1 second time
await completeChapter(userId, 1);
// XP: 25 (50%)

// Complete Chapter 1 third time
await completeChapter(userId, 1);
// XP: 12-13 (25%)
```

### Suspicious Activity Detection
```typescript
// Complete 15 steps in 5 minutes
const suspicious = await checkSuspiciousStepRate(userId, 5, 10);
// Expected: true

// Check XP velocity
const velocity = await checkSuspiciousXPVelocity(userId);
// Expected: true if > 300 XP in last hour
```

## 5. UI Components Testing

### XPDisplay Component
- Verify level badge shows correct number
- Check XP amount displays with commas (e.g., "1,234 XP")
- Verify progress bar fills correctly
- Test dark mode styling
- Test responsive design (mobile/tablet/desktop)

### StreakDisplay Component
- Verify flame icon shows correctly
- Check "active" state (colored) vs "inactive" (gray)
- Verify "days to next milestone" calculation
- Check "Best: X" display when current < longest
- Test dark mode styling

### XPNotification
```typescript
// Test notification appears
showXPNotification(20, 'Section completion', {
  multiplier: 1.2
});

// Test level up notification
showXPNotification(50, 'Chapter completion', {
  levelUp: true,
  newLevel: 5
});
```

### LevelUpModal
- Verify confetti triggers on mount
- Check level number displays in badge
- Test close button functionality
- Verify overlay blocks interaction

### ChapterReport
- Test score comparison (before vs after)
- Verify improvement arrow direction (↓ for better, ↑ for worse)
- Check XP breakdown displays all categories
- Test conditional rendering (only shows improvement/streak if > 0)

### ProfileStats
- Verify XP and streak displays load correctly
- Check chapter progress cards render
- Test "no activity yet" states
- Verify recent activity log displays correctly

## 6. Integration Testing Scenarios

### New User Journey
1. User signs up
2. Check: `user_gamification` record auto-created
3. User starts Chapter 1
4. Check: Streak = 1, XP = 10 (daily activity)
5. User completes reading block
6. Check: XP += 20 (section completion)
7. User takes baseline assessment (score: 35)
8. Check: `chapter_skill_scores` record created
9. User completes SPARK framework
10. Check: XP += 20 (section completion)
11. User takes after assessment (score: 28)
12. Check: XP += 14 (improvement: 7 * 2)
13. User completes chapter
14. Check: XP += 50 (chapter completion), chapter_complete = true

### Multi-Day Journey
**Day 1:**
- Complete 3 steps → Streak = 1, Daily XP awarded

**Day 2:**
- Complete 1 step → Streak = 2, Daily XP awarded

**Day 3:**
- Complete 2 steps → Streak = 3, Daily XP + Milestone bonus (20 XP)

**Day 4:**
- Skip day (no activity)

**Day 5:**
- Complete 1 step → Streak = 1 (broken and restarted)

### Level Progression
- Start: 0 XP, Level 1
- Award 100 XP → Level 2
- Award 150 XP (total 250) → Level 3
- Award 250 XP (total 500) → Level 4
- Verify level display updates in UI

## 7. Badge System Testing

### Badge Awarding
```typescript
// Test automatic badge check
const newBadges = await checkAndAwardBadges(userId);
console.log('Newly earned badges:', newBadges);

// Test specific badge requirements
// Streak badges
// - Set current_streak = 7, run checkAndAwardBadges
// - Should award 'week_warrior' badge

// Level badges
// - Set level = 5, run checkAndAwardBadges
// - Should award 'level_5' badge
```

### Badge Progress
```typescript
// Check progress toward a badge
const progress = await getBadgeProgress(userId, 'week_warrior');
console.log(progress);
// Expected: { current: 3, required: 7, progress: 42.86, earned: false }
```

## 8. Performance Testing

### Database Query Performance
```sql
-- Test XP logs query performance
EXPLAIN ANALYZE
SELECT * FROM xp_logs 
WHERE user_id = 'test-user-id' 
ORDER BY created_at DESC 
LIMIT 10;

-- Should use index and be < 10ms
```

### Concurrent XP Awards
Test what happens when multiple XP awards trigger simultaneously:
```typescript
// Award XP in parallel
await Promise.all([
  awardXP(userId, 'section_completion', 20),
  awardXP(userId, 'daily_activity', 10),
  awardXP(userId, 'improvement', 16)
]);

// Verify all awards are logged correctly
// Check total_xp is accurate
```

## 9. Edge Cases & Error Handling

### Test Cases
1. **Missing gamification data**: User exists but no gamification record
2. **Negative XP**: Try to award negative XP
3. **Invalid chapter ID**: Complete chapter with invalid ID
4. **Missing baseline**: Try to record 'after' assessment without baseline
5. **Concurrent streak updates**: Update streak multiple times same second
6. **Very high XP**: Award 10,000 XP, verify level calculation
7. **Zero improvement**: Record baseline and after with same score

## 10. Validation Checklist

Before marking complete, verify:

- [ ] Database migration runs without errors
- [ ] All tables created with correct schema
- [ ] RLS policies are active and working
- [ ] Functions (calculate_level, get_streak_multiplier) work correctly
- [ ] Badges are seeded (9 badges)
- [ ] XP awarding works for all reasons
- [ ] Streak system tracks correctly across multiple days
- [ ] Improvement XP calculated correctly (lower is better)
- [ ] Daily XP caps enforced
- [ ] Duplicate awards prevented
- [ ] Repeat chapter penalty applied
- [ ] UI components render correctly
- [ ] Dark mode styles work
- [ ] Responsive design works on mobile
- [ ] Dashboard displays XP and streak
- [ ] Profile page shows detailed stats
- [ ] No console errors in browser
- [ ] No TypeScript errors
- [ ] Server actions handle errors gracefully

## Manual Testing Steps

1. **Fresh User Test**
   - Create new account
   - Navigate to dashboard
   - Verify XP display shows "Level 1, 0 XP"
   - Verify streak shows "0 Day Streak"

2. **Complete Chapter Flow**
   - Start Chapter 1
   - Complete each section
   - Watch XP notifications appear
   - Verify dashboard updates
   - Check profile page for activity log

3. **Multi-Day Test**
   - Use app on Day 1 (note streak)
   - Come back Day 2 (verify streak incremented)
   - Skip Day 3
   - Come back Day 4 (verify streak reset)

4. **Level Up Test**
   - Manually add XP via SQL to trigger level up
   - Verify level up modal appears with confetti
   - Check dashboard shows new level

5. **Assessment Test**
   - Take baseline assessment with score 40
   - Complete chapter activities
   - Take after assessment with score 30
   - Verify improvement XP awarded (20 XP for 10 point improvement)

## Automated Testing (Future)

Consider adding:
- Unit tests for helper functions (calculateLevel, getStreakMultiplier)
- Integration tests for server actions
- E2E tests for critical user flows
- Performance benchmarks for database queries

## Known Limitations

1. Streak calculation depends on accurate timezone handling
2. XP caps are daily but reset at midnight UTC (may need timezone adjustment)
3. Badge checking runs on-demand, not automatically in background
4. No undo mechanism for XP awards
5. Chapter completion can be repeated (with diminishing returns)

## Troubleshooting

### Issue: Gamification data not loading
- Check user is authenticated
- Verify `user_gamification` record exists for user
- Check browser console for errors
- Verify RLS policies allow user to read own data

### Issue: Streak not updating
- Check `last_active_date` in database
- Verify timezone in server matches expected behavior
- Check `updateStreak` is being called

### Issue: XP not being awarded
- Check `xp_logs` table for entries
- Verify daily cap not reached
- Check for duplicate award prevention
- Look for errors in server logs

### Issue: Level not updating
- Verify `total_xp` is increasing
- Check `calculate_level` function works
- Verify level is being updated in `user_gamification` table

---

**Last Updated:** 2026-02-04
**Version:** 1.0
