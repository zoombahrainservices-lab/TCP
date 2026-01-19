# XP System (Current + v2 Plan Baseline)

This doc captures the **current (v1)** XP system as implemented in the codebase *before* the new event-based v2 ledger work.

## Current XP source of truth

- **Primary source of truth**: `profiles.xp` (integer) in Supabase Postgres.
- **Related fields**:
  - `profiles.level` (derived from `xp` via DB trigger `trigger_update_level_from_xp`)
  - `profiles.total_xp_earned` (lifetime earned XP; incremented alongside `xp`)

Schema comes from migration `supabase/migrations/108_add_xp_level_to_profiles.sql`.

## Current award triggers (when XP increases)

XP is awarded when a student completes a phase:

- **Trigger point**: `completePhase(progressId)` in `app/actions/phases.ts`
  - Marks the progress row complete by setting `student_progress.completed_at`
  - Computes whether bonuses apply (mission/chapter completion, zone completion, perfect score)
  - Calls `awardXPForPhase(studentId, phaseId, baseXP, bonuses)` in `app/actions/xp.ts`
- **Award implementation**: `awardXPForPhase(...)` directly updates the `profiles` row:
  - `profiles.xp = oldXP + awarded`
  - `profiles.total_xp_earned = oldTotal + awarded`
  - `profiles.level` is updated in the DB trigger on `xp`

Notes:
- `completePhase()` has an early-return guard if `student_progress.completed_at` is already set, which helps avoid some duplicates, but there is **no XP ledger** table; awards are not recorded as immutable events.
- Awarding is **increment-based** on `profiles.xp`, not derived from a ledger.

## Current XP amounts

Hardcoded constants exist in `lib/xp.ts`:

- **Base per phase**: 20 XP
- **Mission/Chapter completion bonus**: 50 XP (awarded when all 5 phases in a chapter are complete)
- **Zone completion bonus**: 200 XP (awarded when all chapters in the zone are complete)
- **Perfect score bonus**: 25 XP (awarded if all before *or* all after answers are 5 or 7)

In `app/actions/phases.ts`, the award path currently uses:
- baseXP = 20
- chapterBonus = 50 (if computed as complete)
- zoneBonus = 200 (if computed as complete)
- perfectBonus = 25 (if computed as perfect)

## Current DB tables involved

- **`profiles`**
  - Stores `xp`, `level`, `total_xp_earned`
  - Level auto-updates via trigger `trigger_update_level_from_xp` (see migration `108_add_xp_level_to_profiles.sql`)

- **`student_progress`**
  - Tracks per-student per-phase progress
  - Completion recorded by setting `completed_at` (timestamp)
  - Unique constraint `(student_id, phase_id)` prevents duplicate progress rows per phase

- **`phases`**
  - Defines phases within a chapter (5 per chapter)

- **`chapters`**
  - “Mission” in UI terms
  - Has `zone_id` linking to zone

- **`zones`**
  - 5-zone hierarchy container for chapters

## Current code entry points

- XP calculation helpers: `lib/xp.ts`
- XP awarding / fetching XP: `app/actions/xp.ts`
- Phase completion + bonus checks: `app/actions/phases.ts` (`completePhase`)

