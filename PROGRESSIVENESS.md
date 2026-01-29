# TCP Chapter 1 - Progressive Implementation Plan

## Overview
This document outlines the complete Chapter 1 system architecture and progressive implementation approach based on the block-based learning system.

---

## 🎯 System Architecture

### Color-Coded Block System
- 🔵 **READING** - Narrative/science content with mobile pacing
- 🟡 **SELF-ASSESSMENT** - Baseline & After (with delta calculation)
- 🟠 **FRAMEWORK** - SPARK missions creating artifacts
- 🔴 **TECHNIQUES** - Toolbox buildout with operational cards
- 🟣 **RESOLUTION/PROOF** - Story proof screens
- ⚪ **FOLLOW-THROUGH** - Plan/Recovery/Scripts/Weekly focus

### Global UI Rules (All Screens)
**Header (Persistent):**
- Chapter 1 + progress: Step X / Y
- Block chips: Reading / Check / Framework / Toolbox / Proof / Follow-through
- "Resume later" button (saves current step)

**Mobile Layout Pacing:**
- Top: Illustration/scene image (no text inside image)
- Middle: Text (exact book text on reading screens)
- Bottom: CTA (Next / Continue / Save)

**Database Rule:**
- Every screen completion → writes to `step_completions`
- Any "Your Turn" → writes real object (assessment/artifact/commitment)

---

## 📊 Database Schema Requirements

### Core Tables Needed:

```sql
-- Chapter Sessions (tracks user's chapter journey)
chapter_sessions {
  id, user_id, chapter_id, started_at, completed_at
}

-- Step Completions (every screen tracked)
step_completions {
  id, user_id, step_id, status, data (jsonb), completed_at
}

-- Chapter Progress (milestone tracking)
chapter_progress {
  id, user_id, chapter_id,
  reading_complete, reading_completed_at,
  framework_complete, techniques_complete,
  proof_complete, chapter_complete
}

-- Assessments (baseline & after)
assessments {
  id, user_id, chapter_id, kind (baseline/after),
  responses (jsonb), score, band, note, created_at
}

-- Artifacts (SPARK outputs & toolbox items)
artifacts {
  id, user_id, chapter_id, type, data (jsonb), created_at
  -- Types: screen_time_baseline, avoidance_pattern, identity_card,
  --        accountability, substitutions, later_phrase, visual_tracker
}

-- Commitments (active habits)
commitments {
  id, user_id, chapter_id, title, minutes, frequency,
  reminder_on, reminder_time, status, created_at
}

-- Routines (daily/nightly toggles)
routines {
  id, user_id, type, enabled, reminder_time, start_date
}

-- Plans (90-day structured plan)
plans {
  id, user_id, chapter_id, start_date, mode, created_at
}

-- Plan Tasks (generated weekly tasks)
plan_tasks {
  id, plan_id, week_number, title, description, completed
}

-- Recovery Tools (enable/disable)
recovery_tools {
  id, user_id, chapter_id, enabled
}

-- Scripts (conversation templates)
scripts {
  id, user_id, chapter_id, target (parent/friend/self),
  custom_text, used_count
}

-- Weekly Focus (one thing to focus on)
weekly_focus {
  id, user_id, chapter_id, type, set_at
}
```

---

## 🗺️ Chapter 1 Complete Step Register

### Milestone 0 — ENTRY
**CH1-0.1 — Chapter Gate**
- Block: Entry
- Screen: Title + Start CTA
- Micro-line: Overview of what's coming
- DB: Creates `chapter_sessions`, `step_completions`
- Dashboard: Creates "Chapter 1 progress" container
- **Unlocks:** CH1-1.1

---

### 🔵 Block A — READING (4 screens)

**CH1-1.1 — Read Screen 1/4**
- Title: "THE MOMENT EVERYTHING CHANGED"
- Content: Tom's auditorium doorway moment (verbatim)
- CTA: Next
- DB: `step_completions` only
- **Unlocks:** CH1-1.2

**CH1-1.2 — Read Screen 2/4**
- Content: Tom's disappointment + THE RISE section (verbatim)
- CTA: Next
- DB: `step_completions`
- **Unlocks:** CH1-1.3

**CH1-1.3 — Read Screen 3/4**
- Title: "WHAT ACTUALLY HAPPENED"
- Content: Dr. Lembke, dopamine explanation (verbatim)
- CTA: Next
- DB: `step_completions`
- **Unlocks:** CH1-1.4

**CH1-1.4 — Read Screen 4/4**
- Content: Stanford research, brain science, "you can win" (verbatim)
- CTA: Finish Reading
- DB: `step_completions`
- **Unlocks:** CH1-1.5

**CH1-1.5 — Reading Completed Reward**
- Block: 🔵 Reading
- Message: "Reading complete. Next: baseline snapshot."
- CTA: Continue
- DB: Updates `chapter_progress.reading_complete = true`
- Dashboard: Adds "Reading ✅" chip
- **Unlocks:** CH1-2.1

---

### 🟡 Block B — SELF-ASSESSMENT (Baseline)

**CH1-2.1 — Why This Check Exists**
- Explanation screen
- CTA: Start Check
- DB: `step_completions`
- **Unlocks:** CH1-2.2

**CH1-2.2 — Baseline Check (7 sliders)**
- Input: 7 rating scales (1-7)
  1. How often I grab phone when working
  2. Remember yesterday's scrolling
  3. Feel after phone session
  4. Time on passion this year
  5. Time before phone urge
  6. Use phone to avoid feelings
  7. Phone vanished 24hrs reaction
- CTA: Submit
- DB: Creates `assessment` (kind: baseline), `step_completions`
- Dashboard: "Baseline Score" card created
- **Unlocks:** CH1-2.3

**CH1-2.3 — Baseline Result + Interpretation**
- Shows score bands:
  - 7-14: You're good
  - 15-28: Danger zone
  - 29-42: Tom's starting point
  - 43-49: Talk to counselor
- CTA: Continue
- DB: `step_completions`
- **Unlocks:** CH1-3.0

---

### 🟠 Block C — FRAMEWORK (SPARK - 5 letters, 11 steps)

**CH1-3.0 — SPARK Intro**
- Introduces SPARK framework
- CTA: Start SPARK
- DB: `step_completions`
- **Unlocks:** CH1-3.1

#### S — SURFACE
**CH1-3.1 — S Example (read)**
- Shows Tom's tracking: 6.5 hours daily
- CTA: Your Turn
- DB: `step_completions`
- **Unlocks:** CH1-3.2

**CH1-3.2 — S Input (Screen-time range)**
- Input: Range select (<1h / 1-3 / 3-5 / 5-7 / 7+ / Don't know)
- Optional: Image upload for proof
- CTA: Save
- DB: Creates `artifact` (type: screen_time_baseline)
- Dashboard: "Screen-time baseline" card
- **Unlocks:** CH1-3.3

#### P — PINPOINT
**CH1-3.3 — P Example (read)**
- Tom's "Why" - performance anxiety
- CTA: Your Turn
- DB: `step_completions`
- **Unlocks:** CH1-3.4

**CH1-3.4 — P Input (Avoided feelings)**
- Input: Multi-select tags + optional note
  - anxiety, fear of failing, boredom, loneliness, stress, overwhelm, rejection, other
- CTA: Save
- DB: Creates `artifact` (type: avoidance_pattern)
- Dashboard: "Avoidance pattern" card
- **Unlocks:** CH1-3.5

#### A — ANCHOR
**CH1-3.5 — A Example (read)**
- Identity-based motivation research
- Tom's: "I am a storyteller who makes people feel less alone"
- CTA: Write Yours
- DB: `step_completions`
- **Unlocks:** CH1-3.6

**CH1-3.6 — A Input (Identity statement)**
- Input: Template fields
  - "I am a ____" (identity)
  - "who ____" (impact)
- Button: Generate Card (preview)
- CTA: Save
- DB: Creates `artifact` (type: identity_card)
- Dashboard: "Identity Card" with download/print option
- **Unlocks:** CH1-3.7

#### R — REBUILD
**CH1-3.7 — R Example (read)**
- Micro-commitments: 5 minutes, 3x/week
- Stanford "tiny habits" research
- CTA: Pick Your Micro-Commitment
- DB: `step_completions`
- **Unlocks:** CH1-3.8

**CH1-3.8 — R Setup (Activate micro-commitment)**
- Input:
  - Select commitment (list + custom)
  - Minutes (5-10)
  - Frequency (3x this week default)
  - Reminder toggle + time
- CTA: Activate
- DB: Creates `commitment` (status: active)
- Dashboard: Active "Habit card" with check-ins
- **Unlocks:** CH1-3.9

#### K — KINDLE
**CH1-3.9 — K Example (read)**
- Tom reconnects with community
- Accountability partner
- CTA: Your Turn
- DB: `step_completions`
- **Unlocks:** CH1-3.10

**CH1-3.10 — K Setup (Accountability + script)**
- Input: Name field (required)
- Script card (pre-filled)
- Buttons: Copy / Mark Sent / Do Later
- DB: Creates `artifact` (type: accountability)
- Dashboard: Accountability card + weekly check-in prompt
- **Unlocks:** CH1-3.11

**CH1-3.11 — SPARK Complete**
- Completion message
- CTA: Continue
- DB: Updates `chapter_progress.framework_complete = true`
- Dashboard: "SPARK ✅" + 5 cards visible
- **Unlocks:** CH1-4.0

---

### 🔴 Block D — TECHNIQUES (Toolbox - 5 steps)

**CH1-4.0 — Toolbox Intro**
- Explanation: "These tools make SPARK stick"
- CTA: Build My Toolbox
- DB: `step_completions`
- **Unlocks:** CH1-4.1

**CH1-4.1 — Technique 1: Substitution Game**
- Shows Tom's 3 moves
- Input: Pick 3 alternatives (from list + custom)
- CTA: Save
- DB: Creates `artifact` (type: substitutions)
- Dashboard: "Urge → Substitutions" quick card
- **Unlocks:** CH1-4.2

**CH1-4.2 — Technique 2: The "Later" Technique**
- Explains "not now, later" strategy
- Input: Editable phrase (default provided)
- CTA: Save
- DB: Creates `artifact` (type: later_phrase)
- Dashboard: "Later phrase" mantra card
- **Unlocks:** CH1-4.3

**CH1-4.3 — Technique 3: Change Your Environment**
- Phone charges outside bedroom
- Input: Toggle + reminder time + start date
- CTA: Save
- DB: Creates `routine` (type: night_charge_outside)
- Dashboard: Night routine toggle/check-in
- **Unlocks:** CH1-4.4

**CH1-4.4 — Technique 4: Visual Progress**
- Paper chain / Calendar X's / Marble jar
- Input: Select method + optional printable download
- CTA: Save
- DB: Creates `artifact` (type: visual_tracker)
- Dashboard: Visual tracker card + printable link
- **Unlocks:** CH1-4.5

**CH1-4.5 — Toolbox Complete**
- Completion message
- CTA: Continue
- DB: Updates `chapter_progress.techniques_complete = true`
- Dashboard: 4 technique cards added
- **Unlocks:** CH1-5.1

---

### 🟣 Block E — RESOLUTION/PROOF (Story - 2 screens)

**CH1-5.1 — Read: THE COMEBACK (Screen 1/2)**
- Tom's 6-month comeback story (verbatim)
- Second place result
- CTA: Next
- DB: `step_completions`
- **Unlocks:** CH1-5.2

**CH1-5.2 — Read: THE COMEBACK (Screen 2/2)**
- Tom today: mentor, 247 links, third at states
- Layla's story begins
- CTA: Continue to Check
- DB: Updates `chapter_progress.proof_complete = true`, `step_completions`
- **Unlocks:** CH1-6.1

---

### 🟡 Block B (Reprise) — SELF-ASSESSMENT (After + Delta)

**CH1-6.1 — After Check (same 7 sliders)**
- Same exact 7 questions as baseline
- CTA: Submit
- DB: Creates `assessment` (kind: after)
- Dashboard: "After Score" card + delta vs baseline
- **Unlocks:** CH1-6.2

**CH1-6.2 — Compare (Baseline vs After)**
- Shows both scores + delta indicator
- Optional input: "What changed?" (1 sentence)
- CTA: Continue
- DB: Updates assessment with optional note
- **Unlocks:** CH1-7.1

---

### ⚪ Block F — FOLLOW-THROUGH (4 sub-sections)

#### 1. 90-Day Plan
**CH1-7.1 — 90-DAY PLAN (read screen)**
- Shows full 90-day structure (verbatim):
  - Weeks 1-3: Awareness
  - Weeks 4-9: Build
  - Weeks 10-13: Level Up
- CTA: Activate Plan
- DB: `step_completions`
- **Unlocks:** CH1-7.2

**CH1-7.2 — Plan Activation**
- Input: Start date + Mode (Light/Standard)
- CTA: Activate
- DB: Creates `plan` + generates `plan_tasks`
- Dashboard: Plan timeline widget (weeks)
- **Unlocks:** CH1-8.1

#### 2. Recovery Mode
**CH1-8.1 — WHEN YOU MESS UP (read screen)**
- 24-Hour Rule explained (verbatim)
- CTA: Add Recovery Mode to Dashboard
- DB: `step_completions`
- **Unlocks:** CH1-8.2

**CH1-8.2 — Recovery Mode Setup**
- Input: Enable toggle
- CTA: Save
- DB: Creates/updates `recovery_tools` (enabled: true)
- Dashboard: "Recovery Mode" button appears
- **Unlocks:** CH1-9.1

#### 3. Scripts Tool
**CH1-9.1 — REAL CONVERSATIONS (read screen)**
- Shows 3 scripts: To Parents / To Friends / To Yourself (verbatim)
- CTA: Open Scripts Tool
- DB: `step_completions`
- **Unlocks:** CH1-9.2

**CH1-9.2 — Scripts Tool**
- Input: Tabs (Parent/Friend/Self)
- Actions: Copy / Edit / Mark used
- DB: Upserts `scripts` with used count
- Dashboard: Scripts library section
- **Unlocks:** CH1-10.1

#### 4. Weekly Focus
**CH1-10.1 — YOUR MOMENT (read screen 1/2)**
- Motivational text: "Tom's story isn't about superhuman willpower..."
- CTA: Next
- DB: `step_completions`
- **Unlocks:** CH1-10.2

**CH1-10.2 — YOUR MOMENT (read screen 2/2)**
- "Pick ONE thing" list (verbatim)
- CTA: Choose My One Focus
- DB: `step_completions`
- **Unlocks:** CH1-10.3

**CH1-10.3 — Weekly Focus Picker**
- Input: Single select (required)
  - Identity statement (review daily)
  - Weekly check-ins (accountability)
  - Delete one app
- CTA: Confirm
- DB: Creates `weekly_focus`, `step_completions`
- Dashboard: Pinned card "This week's focus"
- **Unlocks:** CH1-11.0

---

### Chapter Close
**CH1-11.0 — Chapter Complete**
- Completion badge shown
- CTA: "Go to Dashboard" / "Start next chapter"
- DB: Updates `chapter_sessions.completed_at`, `chapter_progress.chapter_complete = true`
- Dashboard: Chapter 1 marked complete + unlock next
- **End of Chapter 1**

---

## 📦 Complete Objects Created by End of Chapter 1

### Assessments (2)
- 1× baseline assessment (7 sliders, score, band)
- 1× after assessment (7 sliders, score, band, optional note)

### Artifacts (7)
- `screen_time_baseline` (range + optional proof image)
- `avoidance_pattern` (multi-select tags + note)
- `identity_card` (identity + impact statement)
- `accountability` (name + status + reminder)
- `substitutions` (3 alternative actions)
- `later_phrase` (custom mantra)
- `visual_tracker` (method selection)

### Commitments (1)
- 1× micro-commitment (active habit: title, minutes, frequency, reminders)

### Routines (1)
- 1× night_charge_outside (toggle + reminder)

### Follow-Through (4)
- 1× plan (90-day with generated tasks)
- 1× recovery_tools (enabled flag)
- 1× scripts (used counts for 3 types)
- 1× weekly_focus (selected type)

### Meta
- 1× chapter_session (started_at, completed_at)
- ~35× step_completions (one per screen)
- 1× chapter_progress (all flags set to true)

---

## 🏗️ Progressive Implementation Phases

### Phase 1: Foundation (Current - DONE ✅)
- ✅ Chapter 1 title slide + 5 reading screens
- ✅ Basic navigation structure
- ✅ Dashboard with Chapter 1 CTA
- ✅ "Read" navigation link

### Phase 2: Database Schema
**Priority: IMMEDIATE**
- [ ] Create Supabase migrations for all tables
- [ ] Set up RLS policies for user data
- [ ] Create DB helper functions/queries
- [ ] Test data insertion/retrieval

**Files to Create:**
- `supabase/migrations/YYYYMMDD_chapter_system.sql`
- `lib/db/chapter-queries.ts`
- `lib/db/assessment-queries.ts`
- `lib/db/artifact-queries.ts`

### Phase 3: Step System Architecture
**Priority: HIGH**
- [ ] Build step navigation system
- [ ] Implement step completion tracking
- [ ] Create persistent header with progress
- [ ] Build "Resume later" functionality
- [ ] Create step unlock logic

**Files to Create:**
- `components/chapter/StepContainer.tsx`
- `components/chapter/ChapterHeader.tsx`
- `components/chapter/StepProgress.tsx`
- `hooks/useChapterProgress.ts`

### Phase 4: Block A - Reading (Expand)
**Priority: HIGH**
- [ ] Expand current 5 slides to proper 4-screen reading block
- [ ] Add exact verbatim text from spec
- [ ] Implement reading completion reward (CH1-1.5)
- [ ] Update chapter progress on completion

**Files to Modify:**
- `app/read/chapter-1/page.tsx` (split into proper 4 screens + reward)

### Phase 5: Block B - Self-Assessment
**Priority: MEDIUM**
- [ ] Build 7-slider assessment component
- [ ] Create baseline assessment screen (CH1-2.1, CH1-2.2)
- [ ] Build result interpretation screen (CH1-2.3)
- [ ] Implement score calculation & banding
- [ ] Store assessment in DB

**Files to Create:**
- `components/assessment/SliderScale.tsx`
- `components/assessment/BaselineCheck.tsx`
- `components/assessment/ResultScreen.tsx`
- `lib/assessment/scoring.ts`

### Phase 6: Block C - SPARK Framework
**Priority: MEDIUM-HIGH**
- [ ] Build SPARK intro screen (CH1-3.0)
- [ ] Implement S - Surface (CH1-3.1, CH1-3.2)
- [ ] Implement P - Pinpoint (CH1-3.3, CH1-3.4)
- [ ] Implement A - Anchor (CH1-3.5, CH1-3.6)
- [ ] Implement R - Rebuild (CH1-3.7, CH1-3.8)
- [ ] Implement K - Kindle (CH1-3.9, CH1-3.10)
- [ ] Build SPARK complete screen (CH1-3.11)
- [ ] Create artifact storage system

**Files to Create:**
- `components/spark/SparkIntro.tsx`
- `components/spark/SurfaceInput.tsx`
- `components/spark/PinpointInput.tsx`
- `components/spark/AnchorInput.tsx`
- `components/spark/RebuildInput.tsx`
- `components/spark/KindleInput.tsx`
- `lib/artifacts/artifact-storage.ts`

### Phase 7: Block D - Techniques
**Priority: MEDIUM**
- [ ] Build Toolbox intro (CH1-4.0)
- [ ] Implement Substitution Game (CH1-4.1)
- [ ] Implement Later Technique (CH1-4.2)
- [ ] Implement Environment Change (CH1-4.3)
- [ ] Implement Visual Progress (CH1-4.4)
- [ ] Build Toolbox complete screen (CH1-4.5)

**Files to Create:**
- `components/techniques/ToolboxIntro.tsx`
- `components/techniques/SubstitutionInput.tsx`
- `components/techniques/LaterPhraseInput.tsx`
- `components/techniques/EnvironmentSetup.tsx`
- `components/techniques/VisualTrackerSetup.tsx`

### Phase 8: Block E - Resolution/Proof
**Priority: MEDIUM-LOW**
- [ ] Implement 2-screen comeback story (CH1-5.1, CH1-5.2)
- [ ] Simple reading screens, no input

**Files to Create:**
- `components/proof/ComebackStory.tsx`

### Phase 9: Block B (Reprise) - After Assessment
**Priority: MEDIUM**
- [ ] Reuse assessment component from Phase 5
- [ ] Build comparison/delta screen (CH1-6.2)
- [ ] Show improvement visualization

**Files to Create:**
- `components/assessment/AfterCheck.tsx`
- `components/assessment/DeltaComparison.tsx`

### Phase 10: Block F - Follow-Through
**Priority: MEDIUM-LOW**
- [ ] 90-Day Plan (CH1-7.1, CH1-7.2)
- [ ] Recovery Mode setup (CH1-8.1, CH1-8.2)
- [ ] Scripts Tool (CH1-9.1, CH1-9.2)
- [ ] Weekly Focus (CH1-10.1, CH1-10.2, CH1-10.3)

**Files to Create:**
- `components/follow-through/NinetyDayPlan.tsx`
- `components/follow-through/RecoveryModeSetup.tsx`
- `components/follow-through/ScriptsTool.tsx`
- `components/follow-through/WeeklyFocusPicker.tsx`

### Phase 11: Chapter Complete
**Priority: MEDIUM-LOW**
- [ ] Build completion screen (CH1-11.0)
- [ ] Unlock next chapter logic
- [ ] Completion badge/celebration

**Files to Create:**
- `components/chapter/ChapterComplete.tsx`

### Phase 12: Dashboard Integration
**Priority: HIGH (After Phases 2-6)**
- [ ] Build Chapter 1 progress widget
- [ ] Display all artifacts as cards
- [ ] Show active commitments/habits
- [ ] Display assessments with delta
- [ ] Weekly focus pinned card
- [ ] Recovery Mode button
- [ ] Scripts library access

**Files to Create:**
- `components/dashboard/ChapterProgressWidget.tsx`
- `components/dashboard/ArtifactCard.tsx`
- `components/dashboard/CommitmentCard.tsx`
- `components/dashboard/AssessmentSummary.tsx`
- `components/dashboard/WeeklyFocusCard.tsx`
- `components/dashboard/RecoveryModeButton.tsx`

### Phase 13: Testing & Polish
**Priority: ONGOING**
- [ ] Test complete user flow start to finish
- [ ] Verify all DB writes
- [ ] Test resume functionality
- [ ] Mobile responsiveness check
- [ ] Accessibility audit
- [ ] Performance optimization

---

## 🎨 UI/UX Consistency Rules

### All Input Screens Must Have:
1. Clear heading (what they're doing)
2. Optional info tooltip (why it matters)
3. Proper validation
4. Disabled CTA until valid input
5. Loading state on submit
6. Success confirmation

### All Reading Screens Must Have:
1. Illustration at top (if applicable)
2. Verbatim text (no changes)
3. Simple "Next" or "Continue" CTA
4. No input fields

### Navigation Consistency:
- Header always shows: Chapter + Step X/Y
- Progress bar reflects completion %
- Block chips show which section user is in
- Back button available (except first screen)
- "Resume later" always accessible

---

## 🔄 State Management Strategy

### Global Chapter State:
```typescript
interface ChapterState {
  sessionId: string | null
  currentStepId: string
  completedSteps: string[]
  artifacts: Artifact[]
  assessments: Assessment[]
  commitments: Commitment[]
  progress: ChapterProgress
}
```

### Context Provider:
- `ChapterProvider` wraps entire chapter experience
- Provides: current step, navigation, data saving
- Handles: auto-save, resume, step unlocking

---

## 📱 Mobile-First Considerations

### Screen Sizes:
- Design for 375px width minimum
- Test on 768px (tablet)
- Ensure all CTAs thumb-reachable
- No horizontal scroll

### Touch Targets:
- Minimum 44px height for buttons
- Sliders have large touch areas
- Proper spacing between interactive elements

### Performance:
- Lazy load images
- Debounce input saves
- Optimize re-renders
- Cache completed steps

---

## 🚀 Launch Checklist

Before releasing Chapter 1 to users:

### Data:
- [ ] All migrations applied
- [ ] RLS policies tested
- [ ] Backup strategy in place
- [ ] Data retention policy clear

### Features:
- [ ] All 35+ steps functional
- [ ] Resume works correctly
- [ ] Dashboard updates properly
- [ ] All artifacts save correctly

### Quality:
- [ ] Mobile tested on real devices
- [ ] Accessibility (WCAG AA)
- [ ] Error handling for all inputs
- [ ] Loading states everywhere

### Content:
- [ ] All text is verbatim from spec
- [ ] All tooltips are clear
- [ ] No typos
- [ ] Images optimized

---

## 📈 Success Metrics to Track

### Completion Metrics:
- % users who start Chapter 1
- % who complete reading block
- % who complete baseline assessment
- % who complete SPARK framework
- % who finish entire chapter
- Average time to complete

### Engagement Metrics:
- Resume rate (users who stop and come back)
- Artifact creation rate
- Commitment activation rate
- Weekly focus adherence

### Quality Metrics:
- Drop-off points (which steps lose users)
- Error rates per step
- Support tickets per 1000 users
- User satisfaction (post-chapter survey)

---

## 🎯 Next Immediate Actions

1. **Review this plan** - Ensure nothing is missing
2. **Database first** - Create all tables (Phase 2)
3. **Build step system** - Navigation & tracking (Phase 3)
4. **One block at a time** - Start with Reading (Phase 4)
5. **Test continuously** - Don't wait until end

---

*This document is a living plan. Update as implementation progresses.*
*Current Status: Planning Complete, Ready for Phase 2 (Database)*
