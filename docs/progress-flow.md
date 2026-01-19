# Progress Flow - Zone → Chapter → Phase

## Hierarchy

The learning content is organized in a three-level hierarchy:

```
Zone (5 total)
  └── Chapter (30 total, ~6 per zone)
      └── Phase (5 per chapter, 150 total)
```

### Breakdown
- **5 Zones** - Major thematic areas
- **30 Chapters** - Learning missions (approximately 6 per zone)
- **150 Phases** - Individual learning units (5 per chapter)

## Unlock Rules

### Zone Unlock
- **Zone 1**: Always unlocked for all students
- **Zone N (N > 1)**: Unlocked when ALL phases in ALL chapters of Zone N-1 are completed

Example: Zone 2 unlocks only after completing all 5 phases of all chapters in Zone 1.

### Chapter Unlock
- **Chapter 1 in any zone**: Unlocked when the zone itself is unlocked
- **Chapter M in zone**: Unlocked when ALL phases in ALL chapters with `chapter_number < M` in the same zone are completed

Example: Chapter 3 in Zone 2 unlocks only after completing all phases of Chapter 1 AND Chapter 2 in Zone 2.

**Important**: This is NOT just the previous chapter - it's ALL earlier chapters in the zone.

### Phase Unlock
- **Phase 1 in any chapter**: Unlocked when the chapter itself is unlocked
- **Phase P in chapter**: Unlocked when Phase P-1 in the same chapter is completed

Example: Phase 3 unlocks only after Phase 2 is completed.

## Current Mission

The "current mission" is the first phase (ordered by `zone_number`, `chapter_number`, `phase_number`) that is:

1. **Unlocked** (according to rules above)
2. **Not completed** by the student

This ensures students always progress sequentially through the content.

## Implementation

### Pure Logic Layer
**File**: `lib/progress.ts`

Contains pure TypeScript functions that implement unlock rules without database calls:

- `computeUnlockStates(phases, completedPhaseIds)` - Determines which phases are unlocked
- `findCurrentMission(phases, unlockMap)` - Finds the first unlocked incomplete phase
- `getProgressStats(phases, unlockMap)` - Aggregates completion statistics

These functions are:
- **Pure** - Same input always produces same output
- **Testable** - Can be unit tested without database
- **Efficient** - Single pass through data

### Server Actions
**File**: `app/actions/progress.ts`

- `getStudentProgress(studentId)` - Main function that:
  1. Fetches all phases and student's completed phases from database
  2. Calls pure helper functions to compute unlock states
  3. Returns comprehensive progress data for dashboard

**Files**: `app/actions/zones.ts`, `app/actions/chapters.ts`, `app/actions/phases.ts`

- `isZoneUnlocked(studentId, zoneId)` - Checks zone unlock status
- `isChapterUnlocked(studentId, chapterId)` - Checks chapter unlock status (validates ALL earlier chapters)
- `isPhaseUnlocked(studentId, phaseId)` - Checks phase unlock status

### Validation
**File**: `app/actions/phases.ts`

- `completePhase(progressId)` - Validates phase is unlocked before:
  - Marking it complete
  - Awarding XP
  - Checking for bonuses

This prevents students from completing locked phases by directly calling the API.

## Data Flow

```
Student Dashboard
    ↓
getStudentProgress(studentId)
    ↓
Fetch: all phases + completed phases
    ↓
computeUnlockStates() → UnlockMap
    ↓
findCurrentMission() → Current Phase
    ↓
getProgressStats() → Aggregated Stats
    ↓
Return: zones, current mission, stats
    ↓
Render: JourneyMap + SystemStatusPanel
```

## Database Schema

### Tables Used

**zones**
- `id` (primary key)
- `zone_number` (1-5, for ordering)
- `name`, `color`, `icon` (for display)

**chapters**
- `id` (primary key)
- `zone_id` (foreign key to zones)
- `chapter_number` (1-N within zone, for ordering)
- `title`, `content` (learning material)

**phases**
- `id` (primary key)
- `chapter_id` (foreign key to chapters)
- `phase_number` (1-5 within chapter, for ordering)
- `phase_type` (power-scan, secret-intel, visual-guide, field-mission, level-up)

**student_progress**
- `student_id` (foreign key to profiles)
- `phase_id` (foreign key to phases)
- `completed_at` (timestamp, NULL if not completed)
- Unique constraint on (student_id, phase_id)

## XP & Rewards

When a phase is completed:

1. **Base XP**: 20 XP per phase
2. **Chapter Bonus**: +50 XP when completing the last phase of a chapter
3. **Zone Bonus**: +200 XP when completing the last phase of a zone
4. **Perfect Score Bonus**: +25 XP for perfect assessment scores

XP is stored in `profiles.xp` and automatically updates `profiles.level` via database trigger.

## Testing Checklist

To verify the implementation works correctly:

- [ ] Zone 1, Chapter 1, Phase 1 is unlocked for new student
- [ ] Phase 2 is locked until Phase 1 is completed
- [ ] Chapter 2 is locked until ALL phases of Chapter 1 are completed
- [ ] Chapter 3 is locked until ALL phases of Chapters 1 AND 2 are completed
- [ ] Zone 2 is locked until ALL chapters in Zone 1 are completed
- [ ] Current mission correctly identifies first incomplete unlocked phase
- [ ] `completePhase()` rejects attempts to complete locked phases
- [ ] Dashboard displays correct current zone/chapter/phase
- [ ] XP is only awarded once per phase completion

## Troubleshooting

### Student can't access a phase
1. Check if the phase is unlocked: `isPhaseUnlocked(studentId, phaseId)`
2. Verify previous phase is completed
3. Check if chapter is unlocked: `isChapterUnlocked(studentId, chapterId)`
4. Verify ALL earlier chapters in zone are complete
5. Check if zone is unlocked: `isZoneUnlocked(studentId, zoneId)`
6. Verify previous zone is complete

### Current mission not updating
1. Verify phase completion was successful (check `student_progress.completed_at`)
2. Check `getStudentProgress()` is being called after completion
3. Verify unlock logic in `computeUnlockStates()` is working correctly

### XP not awarded
1. Check if phase was already completed (duplicate completion)
2. Verify `completePhase()` returned success
3. Check `profiles.xp` was updated in database
4. Verify trigger `trigger_update_level_from_xp` is active

## Future Enhancements

Potential improvements to consider:

- **Caching**: Cache unlock states for performance
- **Batch Operations**: Support completing multiple phases at once
- **Skip Rules**: Allow admins to unlock specific content for students
- **Prerequisites**: Add custom prerequisite rules beyond sequential order
- **Analytics**: Track time spent per phase, completion rates
