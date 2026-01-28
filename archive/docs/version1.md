# The Communication Protocol — Platform Specification v1

## Overview

A Duolingo-style learning platform for communication skills. 30 chapters, each structured as a linear journey through blocks of activities. Users progress screen-by-screen, with reactive UI (popups, unlocks, auto-progression) and persistent dashboard artifacts.

---

## The 8 Activity Types (Universal Across All Chapters)

### 1) Rating Check (Scale)

**What it is:** 1–7 (or similar) sliders, summed into a score + interpretation.

**Store:** per-question score, total, timestamp, "before/after" pairing.

**UI:** 5–7 sliders + "See my result" + compare later.

**Book examples:** "YOUR INFLUENCE CHECK — Be honest (1-7)" style checks.

---

### 2) Quick Choice (MCQ / Single Select / Multi-select)

**What it is:** pick from predefined options (feelings, triggers, situations).

**Store:** selected option(s) + optional "other" text.

**UI:** chips/cards; fast, low friction.

**Use when the book says:** "Pick one / choose / identify…" (even if the original text is open-ended).

---

### 3) Short Write (1–3 sentences)

**What it is:** a small text input (reflection, sentence completion).

**Store:** user text + optional tags.

**UI:** prompt + character limit + "Save as artifact."

**Book examples:** "ask yourself: 'Would I stake my reputation on this?'" and similar self-prompts.

---

### 4) Structured Write (Template / Form)

**What it is:** the same as writing, but constrained into fields (so it becomes usable later).

**Store:** fielded data (e.g., Ladder Rungs 1–8; Identity = [role] + [impact]).

**UI:** stepper form, list builder, reorderable items.

**Book examples:** ladder-building and "write one piece" outcomes fit this perfectly.

---

### 5) Commitment Toggle (Habit/Rule you "enable")

**What it is:** user turns on a recurring commitment that appears on the dashboard until disabled.

**Store:** commitment definition, frequency, streak, reminders on/off.

**UI:** "Enable this commitment" + schedule + check-in button.

**Best for:** "This week, do X once" or "for one week, do Y" tasks (common in the book).

---

### 6) Real-World Action Log (Do it, then confirm)

**What it is:** task happens outside the app; inside the app they log completion + optional notes.

**Store:** done/not done, timestamp, optional proof, optional reflection.

**UI:** single "Mark done" + "What happened?" (optional).

**Book examples:** "practice saying 'I don't know enough…' once this week" or "turn down one opportunity…" are action logs.

---

### 7) Evidence Upload (Optional Proof)

**What it is:** screenshot/photo/file upload when helpful, but never mandatory.

**Store:** file URL + linked activity id.

**UI:** "Add proof (optional)" → camera/upload.

**Use for:** screen-time proof, printed artifacts, environment changes, etc.

---

### 8) Script Builder (Copy / Send / Practice)

**What it is:** prewritten message scripts that user can copy, edit, and mark "used."

**Store:** selected script, edits, "used" timestamp, recipient type.

**UI:** choose script → edit → copy → "I used it."

**Book examples:** "REAL TALK SCRIPTS" blocks are exactly this pattern.

---

## Color Legend (Blocks — Fixed Across All Chapters)

- 🔵 **READING** (narrative/science; mobile pacing)
- 🟡 **SELF-ASSESSMENT** (Baseline / After)
- 🟠 **FRAMEWORK** (SPARK missions → artifacts)
- 🔴 **TECHNIQUES** (Toolbox buildout → operational cards)
- 🟣 **RESOLUTION / PROOF** (story proof)
- ⚪ **FOLLOW-THROUGH** (Plan / Recovery / Scripts / Weekly focus)

---

## Global UI Rules (Applies to Every Screen)

### Header (Persistent)

- Chapter 1 + progress: Step X / Y
- Block chips: Reading / Check / Framework / Toolbox / Proof / Follow-through
- "Resume later" (saves current step)

### Mobile Layout Pacing

- **Top:** Illustration/scene image (no text inside image)
- **Middle:** Text (exact book text on reading screens)
- **Bottom:** CTA (Next / Continue / Save)

### DB Rule

- Every screen completion writes a row to `step_completions` (even if no input).
- Any "Your Turn" writes a real object (assessment/artifact/commitment/etc).

---

## Chapter 1 — Step Register (Linear Flow)

### Milestone 0 — Entry

#### CH1-0.1 — Chapter Gate

**Block:** (Entry)

**Screen shows:**
- Title: "Chapter 1: From Stage Star to Silent Struggles"
- One CTA: Start Chapter 1
- Micro-line: "You'll read, check your baseline, build your SPARK plan, then set up your phone-defense system."

**Input:** none

**DB writes:**
```
chapter_sessions.create({ user_id, chapter_id: 1, started_at })
step_completions.upsert({ step_id:"CH1-0.1", status:"done" })
```

**Dashboard effect:** Create container "Chapter 1 progress" (empty)

**Tooltip:** "This starts a Chapter Session so we can resume and track progress."

**Unlock →** CH1-1.1

---

### 🔵 Block A — READING (exact original text; screen pacing)

_Note: These are reading-mode screens. Text below is verbatim (only line breaks change). No rewrites, no summaries._

#### CH1-1.1 — Read (Screen 1/3)

**Screen title:** THE MOMENT EVERYTHING CHANGED

**Original text (verbatim):**
```
Tom stood in the auditorium doorway, phone glowing, thumb scrolling through TikTok.
Applause for another speaker leaked through the doors—a sound he used to live for, now just background noise.
"Tom Hammond? Is Tom here tonight?"
His mom grabbed his arm. "Tom! They're calling you!"
He shrugged her off. "Just one more video."
By the time his dad grabbed the phone, the organizers had moved on.
```

**CTA:** Next

**Input:** none (no typing)

**DB writes:**
```
step_completions.upsert({ step_id:"CH1-1.1", status:"done" })
```

**Tooltip:** "Reading screens save completion only."

**Unlock →** CH1-1.2

---

#### CH1-1.2 — Read (Screen 2/3)

**Original text (verbatim):**
```
Tom, fourteen, had just missed his slot at regionals—the same competition where he'd won first place eighteen months ago.
His mom's face: pure disappointment.

THE RISE
Rewind three years. Tom was different.
At eleven, this sixth-grader could hold 200 people captive with just his voice.
While friends ground Fortnite after school, Tom practiced speeches for two hours in front of his mirror.
By seventh grade, Tom was that kid—the one who MCed assemblies, the one everyone's parents wanted at gatherings.
```

**CTA:** Next

**DB:** `step_completions.upsert({ step_id:"CH1-1.2", status:"done" })`

**Unlock →** CH1-1.3

---

#### CH1-1.3 — Read (Screen 3/3)

**Original text (verbatim):**
```
After winning regionals at twelve, his debate coach said: "You're going to do something big someday."
Tom believed him.

WHAT ACTUALLY HAPPENED
Here's what nobody tells you: what happened to Tom is happening to everyone your age. And it's not your fault.
Dr. Anna Lembke (legit psychiatrist) wrote Dopamine Nation explaining how TikTok, Instagram, and YouTube hijack your brain.
Every scroll gives you dopamine—the same chemical released when you eat your favorite food or get a text from your crush.
Stanford tracked 2,500 teenagers for three years.
```

**CTA:** Next

**DB:** `step_completions.upsert({ step_id:"CH1-1.3", status:"done" })`

**Unlock →** CH1-1.4

---

#### CH1-1.4 — Read (Screen 4/4)

**Original text (verbatim):**
```
Those spending 3+ hours daily on entertainment apps showed a 60% drop in passion activities.
Brain scans revealed reduced activity in the prefrontal cortex—the part handling delayed gratification.
Tom's brain: Stage performances released dopamine naturally, but required work. TikTok? Instant dopamine every 15 seconds.
Reality check: Average teenager gets 237 notifications daily. Takes just 66 days to rewire neural pathways.
You're not weak. You're being gamed by billion-dollar algorithms. The game is rigged.
But you can still win.
```

**CTA:** Finish Reading

**DB:** `step_completions.upsert({ step_id:"CH1-1.4", status:"done" })`

**Unlock →** CH1-1.5

---

#### CH1-1.5 — Reading Completed Reward

**Block:** 🔵 Reading

**Screen shows:**
- "Reading complete. Next: baseline snapshot."
- CTA: Continue

**DB writes:**
```
chapter_progress.update({ chapter_id:1, user_id, reading_complete:true, reading_completed_at })
step_completions.upsert({ step_id:"CH1-1.5", status:"done" })
```

**Dashboard effect:** Add chip/card: "Reading ✅"

**Tooltip:** "This marks Reading as completed for the chapter progress bar."

**Unlock →** CH1-2.1

---

### 🟡 Block B — SELF-ASSESSMENT (Baseline)

#### CH1-2.1 — Why This Check Exists

**Screen shows:**
- Short UI copy: "This is your baseline. You'll repeat it after the training to see change."
- CTA: Start Check

**Input:** none

**DB writes:** `step_completions.upsert({ step_id:"CH1-2.1", status:"done" })`

**Tooltip:** "No typing—just a fast snapshot."

**Unlock →** CH1-2.2

---

#### CH1-2.2 — Baseline Check (7 sliders 1–7)

**Screen shows (labels are verbatim from the book section):**

Header: "YOUR SELF-CHECK — Rate 1-7:"

**Sliders:**
1. How often I grab phone when working (1=rarely, 7=constantly)
2. Remember yesterday's scrolling (1=yes, 7=barely)
3. Feel after phone session (1=energized, 7=empty)
4. Time on passion this year (1=more, 7=abandoned)
5. Time before phone urge (1=30+ min, 7=under 5)
6. Use phone to avoid feelings (1=rarely, 7=always)
7. Phone vanished 24hrs (1=relieved, 7=panicked)

**CTA:** Submit

**Input:** `rating_scale_1_7 × 7` (required)

**DB writes:**
```
assessments.insert({ user_id, chapter_id:1, kind:"baseline", responses:{q1..q7}, score, band, created_at })
step_completions.upsert({ step_id:"CH1-2.2", status:"done", data:{ assessment_id } })
```

**Dashboard effect:** Create card: "Baseline Score" (timestamp + band)

**Tooltip:** "We store score + band so we can show progress after the chapter."

**Unlock →** CH1-2.3

---

#### CH1-2.3 — Baseline Result + Interpretation

**Screen shows (verbatim scoring bands):**

**SCORE:**
- 7-14: You're good
- 15-28: Danger zone—start SPARK now
- 29-42: Tom's starting point—recovery possible
- 43-49: Talk to school counselor or trusted adult

**CTA:** Continue

**Input:** none

**DB writes:** `step_completions.upsert({ step_id:"CH1-2.3", status:"done" })`

**Tooltip:** "This is your baseline band. You'll see a delta later."

**Unlock →** CH1-3.0

---

### 🟠 Block C — FRAMEWORK (SPARK missions → each mission saves 1 artifact)

#### CH1-3.0 — SPARK Intro

**Screen shows (verbatim):**
```
THE SPARK FRAMEWORK
Tom used a system called SPARK—five steps that actually work:
```

**CTA:** Start SPARK

**DB:** `step_completions.upsert({ step_id:"CH1-3.0", status:"done" })`

**Tooltip:** "Each letter creates one saved artifact on your dashboard."

**Unlock →** CH1-3.1

---

### S — SURFACE

#### CH1-3.1 — S Example (read)

**Shows (verbatim):**
```
S - SURFACE the Pattern
Tom tracked phone usage for one week: 6.5 hours daily. That's 195 hours monthly on his phone vs. 2 hours practicing.
"Almost 200 hours scrolling. Two hours on what I care about. That's not who I want to be."
```

**CTA:** Your Turn

**DB:** `step_completions.upsert({ step_id:"CH1-3.1", status:"done" })`

**Unlock →** CH1-3.2

---

#### CH1-3.2 — S Input (Screen-time range)

**Shows (verbatim prompt):**
```
YOUR TURN: Settings → Screen Time (iPhone) or Digital Wellbeing (Android). Look at your daily average. Don't judge. Just look.
```

**Input UI:**
- Single select (required): `<1h / 1–3 / 3–5 / 5–7 / 7+ / I don't know`
- Optional: image upload "Add proof (optional)"

**CTA:** Save

**DB writes:**
```
artifacts.insert({ user_id, chapter_id:1, type:"screen_time_baseline", data:{ range, proof_media_id? }, created_at })
step_completions.upsert({ step_id:"CH1-3.2", status:"done", data:{ artifact_id } })
```

**Dashboard effect:** Card: "Screen-time baseline" (range + proof badge if uploaded)

**Tooltip:** "This is your 'starting point' artifact for the chapter."

**Unlock →** CH1-3.3

---

### P — PINPOINT

#### CH1-3.3 — P Example (read)

**Verbatim:**
```
P - PINPOINT the Why
Tom's dad asked: "Why'd you stop caring about speaking?"
After silence: "What if I'm not actually that good? What if I disappoint everyone? At least on my phone, I don't have to find out."
The phone was escape from performance anxiety.
```

**CTA:** Your Turn

**DB:** `step_completions.upsert({ step_id:"CH1-3.3", status:"done" })`

**Unlock →** CH1-3.4

---

#### CH1-3.4 — P Input (Avoided feelings)

**Verbatim prompt:**
```
YOUR TURN: "When I reach for my phone, I'm usually avoiding feeling..."
```

**Input UI:**
- Multi-select (required, min 1): `anxiety / fear of failing / boredom / loneliness / stress / overwhelm / rejection / other`
- Optional short note (1 sentence max)

**CTA:** Save

**DB writes:**
```
artifacts.insert({ type:"avoidance_pattern", data:{ tags:[...], note? } })
step_completions.upsert({ step_id:"CH1-3.4", status:"done", data:{ artifact_id } })
```

**Dashboard:** Card: "Avoidance pattern"

**Tooltip:** "This gets reused later for relapse triggers + recovery mode."

**Unlock →** CH1-3.5

---

### A — ANCHOR

#### CH1-3.5 — A Example (read)

**Verbatim:**
```
A - ANCHOR to Identity
Stanford research: Identity-based motivation is 3x more effective than goals.
Tom wrote: "I am a storyteller who makes people feel less alone."
Not "I want to be." "I AM."
Stuck it on his mirror. Read it every morning. Sounds corny. Worked.
```

**CTA:** Write Yours

**DB:** `step_completions.upsert({ step_id:"CH1-3.5", status:"done" })`

**Unlock →** CH1-3.6

---

#### CH1-3.6 — A Input (Identity statement)

**Verbatim prompt:**
```
YOUR TURN: "I am a [identity] who [impact]." Write it somewhere visible.
```

**Input UI:**
- Template fields (required):
  - `identity = "I am a ____"`
  - `impact = "who ____"`
- Button: "Generate Card" (preview)
- Save

**DB writes:**
```
artifacts.insert({ type:"identity_card", data:{ identity, impact, render_id } })
step_completions.upsert({ step_id:"CH1-3.6", status:"done", data:{ artifact_id } })
```

**Dashboard:** Card: "Identity Card" (+ Download/Print later)

**Tooltip:** "This card can be pinned as a lock-screen prompt later."

**Unlock →** CH1-3.7

---

### R — REBUILD

#### CH1-3.7 — R Example (read)

**Verbatim:**
```
R - REBUILD with Micro-Commitments
Tom started with five minutes, three times that week. That's it.
• Week 1: 5 minutes, 3 days
• Week 2: 10 minutes, 4 days
• Week 3: Watch open mic (don't perform)
• Week 4: One story at family dinner
Stanford found "tiny habits" are 400% more likely to stick than big goals.
```

**CTA:** Pick Your Micro-Commitment

**DB:** `step_completions.upsert({ step_id:"CH1-3.7", status:"done" })`

**Unlock →** CH1-3.8

---

#### CH1-3.8 — R Setup (Activate micro-commitment)

**Verbatim anchor line shown above form:**
```
YOUR TURN: Pick ONE thing. 5-10 minutes max. Three times this week.
```

**Input UI:**
- Select commitment (list + custom)
- Minutes (5–10 default)
- Frequency (default: 3× this week)
- Reminder toggle (on/off)
- Reminder time (if on)

**CTA:** Activate

**DB writes:**
```
commitments.insert({ user_id, chapter_id:1, title, minutes, frequency, reminder_on, reminder_time, status:"active" })
step_completions.upsert({ step_id:"CH1-3.8", status:"done", data:{ commitment_id } })
```

**Dashboard:** Active "Habit card" with check-ins

**Tooltip:** "This becomes a daily/weekly dashboard checkbox, not more chapter screens."

**Unlock →** CH1-3.9

---

### K — KINDLE

#### CH1-3.9 — K Example (read)

**Verbatim:**
```
K - KINDLE Community
Tom reconnected with debate team. Asked his cousin Alex to be his accountability partner. Started attending open mics.
Being around people who cared reminded his brain why this mattered.
```

**CTA:** Your Turn

**DB:** `step_completions.upsert({ step_id:"CH1-3.9", status:"done" })`

**Unlock →** CH1-3.10

---

#### CH1-3.10 — K Setup (Accountability + script)

**Verbatim prompt:**
```
YOUR TURN: Text ONE person right now. Tell them what you're working on. Ask for weekly check-ins.
```

**Input UI:**
- Name field (required) (no contact integration in MVP)
- Script card (pre-filled from prompt logic)
- Buttons:
  - Copy
  - Mark Sent
  - Do Later (sets reminder)

**DB writes:**
```
artifacts.insert({ type:"accountability", data:{ name, status:"sent|planned", reminder_at? } })
step_completions.upsert({ step_id:"CH1-3.10", status:"done", data:{ artifact_id } })
```

**Dashboard:** Accountability card + weekly check-in prompt

**Tooltip:** "We store only a name + status for MVP; no messaging integration needed."

**Unlock →** CH1-3.11

---

#### CH1-3.11 — SPARK Complete

**Screen shows:**
- "You've built your recovery system foundation."
- CTA: Continue

**DB writes:**
```
chapter_progress.update({ framework_complete:true })
step_completions.upsert({ step_id:"CH1-3.11", status:"done" })
```

**Dashboard:** "SPARK ✅" + 5 cards visible

**Unlock →** CH1-4.0

---

### 🔴 Block D — TECHNIQUES (Toolbox Buildout; configured once)

#### CH1-4.0 — Toolbox Intro

**Screen shows:**
- UI copy: "These are not extra. They are the tools that make SPARK stick."
- CTA: Build My Toolbox

**DB:** `step_completions.upsert({ step_id:"CH1-4.0", status:"done" })`

**Tooltip:** "Configure once here; execute later from dashboard."

**Unlock →** CH1-4.1

---

#### CH1-4.1 — Technique 1: Substitution Game (configure)

**Verbatim text shown:**
```
#1: Substitution Game
Tom's three moves when reaching for his phone:
• Read one page from a great speech (pocket copy)
• Do 20 push-ups (disrupts mental loops)
• Voice-memo a story idea
Key: Easier than unlocking his phone.
YOUR TURN: Pick three easy alternatives. Write them in notes app now.
```

**Input UI:**
- Pick 3 from list + custom (required exactly 3)

**CTA:** Save

**DB writes:**
```
artifacts.insert({ type:"substitutions", data:{ items:[...3] } })
step_completions.upsert({ step_id:"CH1-4.1", status:"done", data:{ artifact_id } })
```

**Dashboard:** "Urge → Substitutions" quick card

**Tooltip:** "This is your 'urge protocol' card."

**Unlock →** CH1-4.2

---

#### CH1-4.2 — Technique 2: The "Later" Technique

**Verbatim:**
```
#2: The "Later" Technique
Not "I won't watch TikTok." Instead: "I can watch after dinner, but right now I'm choosing to practice."
Brain doesn't feel deprived with "later."
```

**Input UI:**
- Editable phrase (default: "After dinner, not now." OR use the verbatim long sentence)
- Save

**DB writes:**
```
artifacts.insert({ type:"later_phrase", data:{ text } })
step_completions.upsert({ step_id:"CH1-4.2", status:"done" })
```

**Dashboard:** "Later phrase" mantra card

**Tooltip:** "Stored as a 1-tap copy phrase."

**Unlock →** CH1-4.3

---

#### CH1-4.3 — Technique 3: Change Your Environment

**Verbatim:**
```
#3: Change Your Environment
Tom's phone charged in the kitchen overnight. Speech notes where phone used to sit. Trophies on his desk.
Environmental changes reduce bad habits 80% without willpower.
YOUR TURN: Tonight—charge phone outside your bedroom.
```

**Input UI:**
- Toggle: "Charge phone outside bedroom tonight" (on/off)
- Reminder time (if on)
- Start date (default tonight)

**DB writes:**
```
routines.insert({ type:"night_charge_outside", enabled:true, reminder_time, start_date })
step_completions.upsert({ step_id:"CH1-4.3", status:"done" })
```

**Dashboard:** Night routine toggle/check-in

**Tooltip:** "This becomes a nightly one-tap completion."

**Unlock →** CH1-4.4

---

#### CH1-4.4 — Technique 4: Visual Progress

**Verbatim:**
```
#4: Visual Progress
Tom made a paper chain. Every 10-minute practice = one link.
By day 30, it wrapped his room. Physical proof: "I'm someone who shows up."
YOUR TURN: Paper chain, calendar X's, marble jar—make progress visible.
```

**Input UI:**
- Select one: `Paper chain / Calendar X's / Marble jar`
- Optional: Download printable

**DB writes:**
```
artifacts.insert({ type:"visual_tracker", data:{ method } })
step_completions.upsert({ step_id:"CH1-4.4", status:"done" })
```

**Dashboard:** Visual tracker card (+ printable link)

**Tooltip:** "We store the method so the dashboard matches your tracker."

**Unlock →** CH1-4.5

---

#### CH1-4.5 — Toolbox Complete

**Screen shows:**
- "Toolbox built."
- CTA: Continue

**DB writes:**
```
chapter_progress.update({ techniques_complete:true })
step_completions.upsert({ step_id:"CH1-4.5", status:"done" })
```

**Dashboard:** 4 technique cards added

**Unlock →** CH1-5.1

---

### 🟣 Block E — RESOLUTION / PROOF (story proof)

#### CH1-5.1 — Read: THE COMEBACK (Screen 1/2)

**Verbatim:**
```
THE COMEBACK
Six months later, same competition. Same venue.
Tom walked on stage, phone forgotten in his pocket.
"I want to tell you about the day I chose a screen over my dreams, and what happened when I chose my dreams back."
Seven minutes of truth. The shame. The hollow hours. The fear. The small daily choices.
Three seconds of silence. Then applause.
Second place. But more importantly—proof he could come back.
```

**CTA:** Next

**DB:** `step_completions.upsert({ step_id:"CH1-5.1", status:"done" })`

**Unlock →** CH1-5.2

---

#### CH1-5.2 — Read: THE COMEBACK (Screen 2/2)

**Verbatim:**
```
Tom today at sixteen: Volunteers as peer mentor. Chain hit 247 links. Placed third at states.
"My phone's a tool now, not my personality. I use it. It doesn't use me."
Three months later, fourteen-year-old Layla found him: "That chain thing—did it work?"
Tom showed her everything. That night he realized: his recovery gave him new purpose.
The student became the teacher.
```

**CTA:** Continue to Check

**DB:**
```
chapter_progress.update({ proof_complete:true })
step_completions.upsert({ step_id:"CH1-5.2", status:"done" })
```

**Tooltip:** "Proof screens are the emotional 'why'—no input saved."

**Unlock →** CH1-6.1

---

### 🟡 Block B again — SELF-ASSESSMENT (After + delta)

#### CH1-6.1 — After Check (same 7 sliders)

**Screen shows:**
- Same 7 slider labels (verbatim, identical to baseline)

**CTA:** Submit

**DB writes:**
```
assessments.insert({ kind:"after", responses, score, band })
step_completions.upsert({ step_id:"CH1-6.1", status:"done" })
```

**Dashboard:** "After Score" card + delta vs baseline

**Tooltip:** "This creates the progress delta screen."

**Unlock →** CH1-6.2

---

#### CH1-6.2 — Compare (Baseline vs After)

**Screen shows:**
- Baseline score/band vs After score/band
- Delta indicator (improved / same / worse)
- Optional micro-input: "What changed?" (1 sentence) — optional

**DB writes:**
```
assessments.update(after_assessment_id, { note? })
step_completions.upsert({ step_id:"CH1-6.2", status:"done" })
```

**Tooltip:** "Optional note helps later reflections—keep it 1 sentence."

**Unlock →** CH1-7.1

---

### ⚪ Block F — FOLLOW-THROUGH (Plan / Recovery / Scripts / Weekly Focus)

#### 90-Day Plan

##### CH1-7.1 — 90-DAY PLAN (read screen)

**Verbatim:**
```
90-DAY PLAN
WEEKS 1-3: Awareness
• Week 1: Track usage. Don't change yet
• Week 2: Write identity statement. Make it visible
• Week 3: Pick micro-commitment. Tell someone

WEEKS 4-9: Build
• Use substitution moves
• Start visual tracker
• Find accountability partner
• Increase commitment gradually (add 5 min every 2 weeks)

WEEKS 10-13: Level Up
• Reconnect with community
• Share your story
• Set public goal
• Teach someone else
```

**CTA:** Activate Plan

**DB:** `step_completions.upsert({ step_id:"CH1-7.1", status:"done" })`

**Unlock →** CH1-7.2

---

##### CH1-7.2 — Plan Activation (UI decision screen)

**Input UI:**
- Start date: `Today / Monday / Choose date`
- Mode: `Light / Standard` (optional)

**CTA:** Activate

**DB writes:**
```
plans.insert({ user_id, chapter_id:1, start_date, mode })
plan_tasks.generate({ plan_id })
step_completions.upsert({ step_id:"CH1-7.2", status:"done", data:{ plan_id } })
```

**Dashboard:** Plan timeline widget (weeks)

**Tooltip:** "Plan tasks are generated into weekly dashboard actions."

**Unlock →** CH1-8.1

---

#### When You Mess Up (Recovery Mode)

##### CH1-8.1 — WHEN YOU MESS UP (read screen)

**Verbatim:**
```
WHEN YOU MESS UP
24-Hour Rule:
• Stop spiral NOW
• Ask: What triggered this?
• Fix the leak in your system
• Get back in within 24 hours
• Tell your accountability person
Tom broke his streak twice. He still made it.
```

**CTA:** Add Recovery Mode to Dashboard

**DB:** `step_completions.upsert({ step_id:"CH1-8.1", status:"done" })`

**Unlock →** CH1-8.2

---

##### CH1-8.2 — Recovery Mode Setup (button install)

**Input:**
- One toggle: "Enable Recovery Mode button"

**DB writes:**
```
recovery_tools.enable({ user_id, chapter_id:1, enabled:true })
step_completions.upsert({ step_id:"CH1-8.2", status:"done" })
```

**Dashboard:** "Recovery Mode" button appears (guided 5-step flow)

**Tooltip:** "This is not a chapter screen later—this is a dashboard tool."

**Unlock →** CH1-9.1

---

#### Real Conversations (Scripts Tool)

##### CH1-9.1 — REAL CONVERSATIONS (read screen)

**Verbatim:**
```
REAL CONVERSATIONS
To Parents: "My phone's messing with [thing I care about]. I want to fix it but need help. Can we set rules together? Phone in kitchen at night, phone-free study time? I know I fought you before, but this time it's my idea."

To Friends: "Gonna be less online. Getting back into [your thing]. Still wanna hang—maybe [non-screen activity]? Call me out if I'm zombie-scrolling?"

To Yourself: "This feeling passes in 5 minutes. What would future-me do right now?"
```

**CTA:** Open Scripts Tool

**DB:** `step_completions.upsert({ step_id:"CH1-9.1", status:"done" })`

**Unlock →** CH1-9.2

---

##### CH1-9.2 — Scripts Tool (save/copy/use tracking)

**Input UI:**
- Tabs: `Parent / Friend / Self`
- Actions:
  - Copy
  - Edit (optional)
  - Mark used

**DB writes:**
```
scripts.upsert({ user_id, chapter_id:1, target, custom_text?, used_count_increment })
step_completions.upsert({ step_id:"CH1-9.2", status:"done" })
```

**Dashboard:** Scripts library section

**Tooltip:** "We track 'used' so the dashboard can celebrate real execution."

**Unlock →** CH1-10.1

---

#### Your Moment (Weekly Focus)

##### CH1-10.1 — YOUR MOMENT (read screen 1/2)

**Verbatim:**
```
YOUR MOMENT
Tom's story isn't about superhuman willpower. It's about one Tuesday when he decided who he'd been wasn't who he wanted to become.

Some of you will bookmark this and come back when ready. That's fine.

But if you're feeling that pull right now—that voice saying "maybe I could actually do this"—don't ignore it.

Pick ONE thing:
```

**CTA:** Next

**DB:** `step_completions.upsert({ step_id:"CH1-10.1", status:"done" })`

**Unlock →** CH1-10.2

---

##### CH1-10.2 — YOUR MOMENT (read screen 2/2)

**Verbatim:**
```
• Write your identity statement in phone notes
• Text one person for weekly check-ins
• Delete one app that takes more than it gives

Not all three. Just one.

The rest of this book will be here.

But if you're ready now? Move. Don't let this feeling fade.

In six months, you'll either wish you'd started today, or you'll be glad you did.

Your call.
```

**CTA:** Choose My One Focus

**DB:** `step_completions.upsert({ step_id:"CH1-10.2", status:"done" })`

**Unlock →** CH1-10.3

---

##### CH1-10.3 — Weekly Focus Picker (functional version of "Pick ONE thing")

**Input UI:**
- Single select (required):
  - Identity statement (review daily)
  - Weekly check-ins (accountability)
  - Delete one app

**CTA:** Confirm

**DB writes:**
```
weekly_focus.set({ user_id, chapter_id:1, type, set_at })
step_completions.upsert({ step_id:"CH1-10.3", status:"done" })
```

**Dashboard:** Pinned card: "This week's focus"

**Tooltip:** "This is the one thing the dashboard keeps in your face."

**Unlock →** CH1-11.0

---

### Chapter Close

#### CH1-11.0 — Chapter Complete

**Screen shows:**
- Completion badge
- CTA: "Go to Dashboard" / "Start next chapter"

**DB writes:**
```
chapter_sessions.update({ completed_at })
chapter_progress.update({ chapter_complete:true })
step_completions.upsert({ step_id:"CH1-11.0", status:"done" })
```

**Dashboard:** Chapter 1 marked complete + unlock next

**Tooltip:** "Completion locks progress + unlocks next content."

---

## What Chapter 1 Creates in DB (Objects List)

By the end of Chapter 1, a user can have:

### Assessments
- 1× baseline assessment (7 sliders)
- 1× after assessment (same 7 sliders) + optional delta note

### Artifacts (Framework + Toolbox)
- `screen_time_baseline`
- `avoidance_pattern`
- `identity_card`
- `accountability`
- `substitutions`
- `later_phrase`
- `visual_tracker`

### Commitments / Routines
- 1× micro-commitment (active habit)
- 1× routine: `night_charge_outside` (toggle)

### Follow-through
- 1× plan (90-day) + generated `plan_tasks`
- `recovery_tools` enabled
- `scripts` used counts
- `weekly_focus` selection

### Meta
- `chapter_session`
- `step_completions` for every screen
- `chapter_progress` flags

---

## Tooltip Library (Reusable; Implement Once)

Use a small "ⓘ" button top-right on screens that save something:

| Type | Text |
|------|------|
| **Completion-only** | "This step saves your progress and unlocks the next screen." |
| **Assessment** | "We save your score so we can show change later." |
| **Artifact** | "This creates a dashboard card you can revisit anytime." |
| **Commitment** | "This becomes a recurring dashboard check-in." |
| **Routine** | "This adds a nightly toggle. No extra chapter steps." |
| **Plan** | "This generates weekly tasks on your dashboard." |

---

## Technical Implementation Notes

### Core Tables Needed

```sql
-- Users & Auth
users (id, email, role)
profiles (id, full_name, created_at)

-- Chapter Progress
chapter_sessions (id, user_id, chapter_id, started_at, completed_at)
step_completions (id, user_id, step_id, status, data, completed_at)
chapter_progress (id, user_id, chapter_id, reading_complete, framework_complete, techniques_complete, proof_complete, chapter_complete, timestamps...)

-- Activity Data
assessments (id, user_id, chapter_id, kind, responses, score, band, note, created_at)
artifacts (id, user_id, chapter_id, type, data, created_at)
commitments (id, user_id, chapter_id, title, minutes, frequency, reminder_on, reminder_time, status, created_at)
routines (id, user_id, type, enabled, reminder_time, start_date, created_at)
plans (id, user_id, chapter_id, start_date, mode, created_at)
plan_tasks (id, plan_id, week, task, status, due_date)
recovery_tools (id, user_id, chapter_id, enabled, created_at)
scripts (id, user_id, chapter_id, target, custom_text, used_count, last_used_at)
weekly_focus (id, user_id, chapter_id, type, set_at)
```

### UI Components to Build

1. **Reading Screen** (text + image + Next button)
2. **Rating Check** (1-7 sliders × N)
3. **Quick Choice** (single/multi-select chips)
4. **Short Write** (textarea + char limit)
5. **Structured Write** (form builder)
6. **Commitment Toggle** (switch + frequency picker)
7. **Action Log** (checkbox + timestamp + notes)
8. **Evidence Upload** (camera/file picker)
9. **Script Builder** (tabs + copy/edit/mark used)

### Dashboard Widgets

- Chapter progress cards
- Active habits (check-in buttons)
- Artifact library
- Weekly focus banner
- Recovery mode button
- Scripts quick access
- Plan timeline

---

## Next Steps for Implementation

1. **Archive existing code** → move current `/app` structure to `/archive-v0`
2. **Database migration** → create new schema based on tables above
3. **Core UI components** → build the 8 activity types as reusable components
4. **Chapter 1 screens** → implement linear flow for CH1-0.1 through CH1-11.0
5. **Dashboard** → build artifact/progress display
6. **Auth simplification** → anyone can sign up (no parent/child logic for now)
7. **Admin panel** → basic CRUD for chapters/steps/content

---

## Design Principles

- **Mobile-first**: all screens optimized for phone (Duolingo-style)
- **Linear progression**: no skipping; unlock next step only after completion
- **Persistent header**: always show chapter + progress + resume button
- **Reactive UI**: popups, celebrations, unlocks feel immediate
- **Dashboard as home**: not just progress tracker, but the daily interface
- **No dead ends**: every input creates something useful later

---

*End of Version 1 Specification*
