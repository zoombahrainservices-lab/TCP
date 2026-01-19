# The Communication Protocol - Complete Wireframe

## Project Structure Overview

```
The Communication Protocol Platform
├── Authentication System
├── Student Portal (Main Learning Flow)
├── Parent/Mentor Portal (Monitoring)
└── Admin Portal (Content Management)
```

---

## 1. Authentication Flow

### 1.1 Landing Page (`/`)
- **Header**: Logo + "Login" button
- **Hero Section**: 
  - Title: "Master Communication in 30 Days"
  - Description text
  - CTA buttons: "Get Started as Parent" | "Login"
- **Features Grid**: 3 feature cards
- **Footer**: Basic info

### 1.2 Login Page (`/auth/login`)
- Email/Password form
- "Sign in with Google" button
- "Forgot password?" link
- "Don't have an account? Sign up" link

### 1.3 Registration Pages
- `/auth/register-parent` - Parent registration form
- Email verification flow

---

## 2. Student Portal

### 2.1 Student Dashboard (`/student`)
**Layout:**
```
┌─────────────────────────────────────────────────┐
│ [Teal Banner] THE COMMUNICATION CODE: LEVEL UP  │
├─────────────────────────────────────────────────┤
│ Welcome message + Hero text                      │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────┬──────────────────┐ │
│ │   JOURNEY MAP CARD      │  SYSTEM STATUS   │ │
│ │                         │                  │ │
│ │  [Zone 1]─[Zone 2]─    │  Agent Level: 5  │ │
│ │     │        │          │  XP: 4500/5000   │ │
│ │     │        │          │                  │ │
│ │  Overall Progress       │  [Progress Bars] │ │
│ │  ████████░░░░ 3/7       │                  │ │
│ │                         │  [START MISSION] │ │
│ └─────────────────────────┴──────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Journey Map:**
- Horizontal layout with 5 zones
- Each zone: Circle with zone number, name, days range
- Current zone: Red glow effect + "CURRENT MISSION" badge
- Locked zones: Grey with padlock icons
- Clickable zones → Navigate to zone missions page

**System Status Panel:**
- Agent Level display
- XP progress
- Overall mission completion
- "START TODAY'S MISSION" button

---

### 2.2 Zone Missions Page (`/student/zone/[zoneId]`)
**Layout:**
```
┌─────────────────────────────────────────────────┐
│ [Back Button]                                    │
├─────────────────────────────────────────────────┤
│        ZONE 1: THE INNER CIRCLE                 │
├─────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│ │MISS 1│ │MISS 2│ │MISS 3│ │MISS 4│          │
│ │[RED] │ │[RED] │ │[RED] │ │[GREY]│          │
│ │✓     │ │✓     │ │⚡    │ │🔒    │          │
│ │Complete│Complete│Current │Locked │          │
│ └──────┘ └──────┘ └──────┘ └──────┘          │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│ │MISS 5│ │MISS 6│ │MISS 7│ │      │          │
│ │[GREY]│ │[GREY]│ │[GREY]│ │      │          │
│ │🔒    │ │🔒    │ │🔒    │ │      │          │
│ │Locked│ │Locked│ │Locked│ │      │          │
│ └──────┘ └──────┘ └──────┘ └──────┘          │
├─────────────────────────────────────────────────┤
│ 3/7 MISSIONS COMPLETE                           │
│ ████████░░░░░░░ (Progress segments)            │
└─────────────────────────────────────────────────┘
```

**Mission Cards:**
- **Completed**: Red background, green checkmark, "Complete" status
- **Current**: Red background, glowing border, lightning bolt icon, "Current Mission" status
- **Locked**: Grey background, padlock icon, "Locked" status
- Clickable (unlocked) → Navigate to chapter page

---

### 2.3 Chapter/Mission Page (`/student/chapter/[chapterId]`)
**Layout:**
```
┌─────────────────────────────────────────────────┐
│ [Back Button]                                    │
├─────────────────────────────────────────────────┤
│    MISSION #3: THE ANXIETY LADDER                │
│         🏃 Brave Framework                      │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ ⚙️  PHASE 1: THE POWER SCAN [RED BORDER]   │ │
│ │    Rate your current power levels...        │ │
│ │    [Status: Current/Complete/Locked]        │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📡 PHASE 2: THE SECRET INTEL [ORANGE BORDER]│ │
│ │    The science behind the skill...          │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ ⚠️  PHASE 3: THE HERO'S VISUAL GUIDE         │ │
│ │    [YELLOW BORDER]                          │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🎯 PHASE 4: THE FIELD MISSION [GREEN BORDER]│ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ ⬆️  PHASE 5: LEVEL UP [BLUE BORDER]         │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ [CLAIM XP & FINISH DAY] (when all complete)     │
└─────────────────────────────────────────────────┘
```

**Phase Cards:**
- Each phase has colored border (red/orange/yellow/green/blue)
- Phase icon, number, and label
- Content preview
- Status indicators (Completed/Current/Locked)
- Clickable → Navigate to phase detail page

---

### 2.4 Phase Detail Page (`/student/chapter/[chapterId]/[phaseType]`)
**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Zone 1 • Mission 3    ⚡ Power Scan             │
│ ████░░░░░░░░░░░░░░░░ 25% Progress               │
├─────────────────────────────────────────────────┤
│                                                  │
│ STEP 1: OVERVIEW (if not started)              │
│ ┌─────────────────────────────────────────────┐ │
│ │         ⚡ (Large Icon)                     │ │
│ │         Power Scan                          │ │
│ │         Description text...                 │ │
│ │         [Begin Power Scan] Button           │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ OR STEP 2: CONTENT (after starting)            │
│ ┌─────────────────────────────────────────────┐ │
│ │ ⚡ Power Scan                                │ │
│ │ Rate yourself (1-7 scale)                   │ │
│ │                                              │ │
│ │ Question 1: [Slider] [Input: 3]             │ │
│ │ Question 2: [Slider] [Input: 5]             │ │
│ │ Question 3: [Slider] [Input: 2]             │ │
│ │                                              │ │
│ │ [← Back]              [Continue →]          │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ OR STEP 3: ACTION (for field-mission)          │
│ ┌─────────────────────────────────────────────┐ │
│ │ Upload Your Proof                            │ │
│ │ [Audio/Image/Text Upload Form]               │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ OR STEP 4: COMPLETE                            │
│ ┌─────────────────────────────────────────────┐ │
│ │         ✓ (Checkmark)                       │ │
│ │         Challenge Complete!                  │ │
│ │         +150 XP Earned!                      │ │
│ │         [Back to Mission] [Dashboard]        │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Phase Types:**
1. **Power Scan** (`power-scan`): Self-assessment questions (1-7 scale)
2. **Secret Intel** (`secret-intel`): Chapter reading content
3. **Visual Guide** (`visual-guide`): Images/videos/audio guides
4. **Field Mission** (`field-mission`): Task with proof upload
5. **Level Up** (`level-up`): Post-assessment + reflection

---

### 2.5 Other Student Pages
- `/student/progress` - 30-day progress visualization
- `/student/vault` - Achievements and reflections
- `/student/baseline` - Initial assessment (first-time users)

---

## 3. Parent/Mentor Portal

### 3.1 Parent Dashboard (`/parent`)
**Layout:**
```
┌─────────────────────────────────────────────────┐
│ My Children                    [+ Add Child]     │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ Student Name                                 │ │
│ │ Current Day: Day 15                          │ │
│ │ Progress: ████████░░ 45%                    │ │
│ │ Last Activity: 2 days ago                    │ │
│ │ [View Profile →]                             │ │
│ └─────────────────────────────────────────────┘ │
│ [More student cards...]                         │
└─────────────────────────────────────────────────┘
```

### 3.2 Child Profile (`/parent/child/[childId]`)
**Layout:**
```
┌─────────────────────────────────────────────────┐
│ [Back]  Student Name's Progress                 │
├─────────────────────────────────────────────────┤
│ ┌──────────────────┬──────────────────────────┐ │
│ │ 30-Day Progress  │  Day Submissions         │ │
│ │ [Circle Grid]    │                          │ │
│ │                  │  Day 1: ✓ Complete       │ │
│ │ 45% Complete     │  [View Submission]       │ │
│ │                  │                          │ │
│ │                  │  Day 2: ✓ Complete       │ │
│ │                  │  [View Submission]       │ │
│ │                  │                          │ │
│ │                  │  Day 3: ⏳ In Progress   │ │
│ └──────────────────┴──────────────────────────┘ │
│ [Generate Report] Button                         │
└─────────────────────────────────────────────────┘
```

### 3.3 Day Submission View
- Before/After self-check scores
- Reflection text
- Uploaded proof (audio player/image/text)
- Parent feedback section

---

## 4. Admin Portal

### 4.1 Admin Dashboard (`/admin`)
**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Admin Dashboard                                  │
├─────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ Students │ │ Parents  │ │ Mentors  │        │
│ │    150   │ │    75    │ │    25    │        │
│ └──────────┘ └──────────┘ └──────────┘        │
│                                                  │
│ Quick Actions:                                   │
│ [Manage Chapters] [View Users] [Settings]        │
└─────────────────────────────────────────────────┘
```

### 4.2 Chapter Management (`/admin/chapters`)
**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Chapters (30 total)          [+ Create Chapter]  │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ Day 1: From Stage Star...        [Edit] [X] │ │
│ │ Day 2: Active Listening          [Edit] [X] │ │
│ │ Day 3: Body Language Basics      [Edit] [X] │ │
│ │ ...                                         │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 4.3 Chapter Editor
- Title, subtitle, content (markdown editor)
- Task description
- Before/After questions (dynamic array)
- Preview mode
- Save/Cancel buttons

---

## 5. Navigation Structure

```
Root (/)
├── Landing Page
│
├── /auth
│   ├── /login
│   ├── /register-parent
│   └── /callback (OAuth)
│
├── /student (Student Portal)
│   ├── / (Dashboard - Journey Map)
│   ├── /zone/[zoneId] (Zone Missions)
│   ├── /chapter/[chapterId] (Mission Phases)
│   ├── /chapter/[chapterId]/[phaseType] (Phase Detail)
│   ├── /progress (30-Day Progress)
│   ├── /vault (Achievements)
│   └── /baseline (Initial Assessment)
│
├── /parent (Parent Portal)
│   ├── / (Dashboard - Children List)
│   └── /child/[childId]
│       ├── / (Child Profile)
│       └── /report (Progress Report)
│
├── /mentor (Mentor Portal - Same as Parent)
│
└── /admin (Admin Portal)
    ├── / (Dashboard)
    └── /chapters
        ├── / (Chapters List)
        └── /[chapterId] (Chapter Editor)
```

---

## 6. Data Flow

### 6.1 Student Progress Flow
```
1. Student logs in → Dashboard
2. Clicks Zone → Zone Missions Page
3. Clicks Mission → Chapter Page (5 phases)
4. Clicks Phase → Phase Detail Page
5. Completes Phase → Returns to Chapter Page
6. Completes All Phases → Can claim XP
```

### 6.2 Phase Completion Flow
```
Power Scan:
  Overview → Questions (1-7 scale) → Save → Complete

Secret Intel:
  Overview → Reading Content → Mark Complete

Visual Guide:
  Overview → Visual Content → Mark Complete

Field Mission:
  Overview → Task Instructions → Upload Proof → Complete

Level Up:
  Overview → Post-Assessment → Reflection → Complete
```

---

## 7. Component Hierarchy

```
StudentDashboard
├── JourneyMap (Zones visualization)
└── SystemStatusPanel

ZonePage
└── MissionCard[] (Grid of missions)

ChapterPage
└── PhaseCard[] (List of 5 phases)

PhaseDetailPage
├── ProgressIndicator
├── PhaseIcon
├── SelfCheckScale (for power-scan/level-up)
├── ChapterReader (for secret-intel)
├── UploadForm (for field-mission)
└── ReflectionInput (for level-up)
```

---

## 8. Key Features

### 8.1 Gamification
- XP System (experience points)
- Level Progression
- Achievement Badges
- Progress Tracking

### 8.2 Content Structure
- 5 Zones (7 missions each, except Zone 5: 2 missions)
- 30 Total Missions (Chapters)
- 5 Phases per Mission
- 150 Total Phases

### 8.3 Unlock System
- Zones unlock sequentially
- Missions unlock sequentially within zone
- Phases unlock sequentially within mission

---

## 9. Color Scheme

- **Zone 1**: Red (#FF2D2D)
- **Zone 2**: Orange (#FFAA23)
- **Zone 3**: Yellow (#F7DA0D)
- **Zone 4**: Green (#28D94D)
- **Zone 5**: Blue (#0DB7FF)

- **Phase Colors**:
  - Power Scan: Red border
  - Secret Intel: Orange border
  - Visual Guide: Yellow border
  - Field Mission: Green border
  - Level Up: Blue border

---

## 10. Responsive Design

- **Mobile**: Single column, stacked layout
- **Tablet**: 2-column grid for missions
- **Desktop**: 4-column grid for missions, side-by-side panels

---

This wireframe covers the complete structure of The Communication Protocol platform. Each page maintains consistent navigation patterns and follows the zone → mission → phase hierarchy.
