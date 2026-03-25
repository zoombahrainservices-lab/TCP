# Performance Baseline

**Date:** 2026-03-24  
**Branch:** main  
**Commit:** (record after first measurement)

This document records the performance baseline before optimization work begins.

## Measurement Method

- Route timings captured from Next.js dev server terminal output
- Query counts estimated from code inspection and manual observation
- Bundle sizes from `npm run build` output
- All measurements taken on local development environment

## Route Performance

### Landing Page (/)
- **TTFB (Time to First Byte):** _[To be measured]_
- **Render time:** _[To be measured]_
- **Query count:** 0 (static page)
- **Notes:** Should be mostly static

### Dashboard (/dashboard)
- **TTFB:** _[To be measured]_
- **Render time:** _[To be measured]_
- **Query count:** ~6-8 queries
  - `requireAuth()` → auth.getUser() + profiles lookup
  - `getChapterReportsData()` in layout → chapter_progress + xp_logs
  - `getAllChapters()` in layout → chapters table
  - `getChapterReportsData()` in page → chapter_progress + xp_logs (DUPLICATE)
  - `getCachedAllChapters()` in page → chapters table (DUPLICATE)
  - `getGamificationData()` in GamificationAsync → user_gamification
  - `getChapterReportsData()` in ChapterProgressAsync → chapter_progress + xp_logs (DUPLICATE #3)
  - `getCachedAllChapters()` in ChapterProgressAsync → chapters table (DUPLICATE #2)
  - `getGamificationData()` in ReportsAsync → user_gamification (DUPLICATE)
  - `getWeeklyReportsData()` in ReportsAsync → xp_logs
- **Known inefficiencies:**
  - `getChapterReportsData()` called 3 times per request (layout + page + ChapterProgressAsync)
  - `getGamificationData()` called 2 times per request (GamificationAsync + ReportsAsync)
  - Chapter list fetched via two different helpers (getAllChapters vs getCachedAllChapters)

### Map Page (/map)
- **TTFB:** _[To be measured]_
- **Render time:** _[To be measured]_
- **Query count:** ~6 queries
  - `requireAuth()` → auth.getUser() + profiles lookup
  - `getCachedAllChapters()` → chapters table
  - `profiles` lookup for role (DUPLICATE - already in requireAuth)
  - `chapter_progress` → user progress data
  - `chapter_steps` → all steps (unbounded)
  - `step_pages` → all pages (unbounded)
  - `step_completions` → user completions
- **Known inefficiencies:**
  - Duplicate role lookup (profiles queried twice)
  - Unbounded data loading for all chapters/steps/pages

### Reading Page (/read/[chapterSlug]/[stepSlug])
- **TTFB:** _[To be measured]_
- **Render time:** _[To be measured]_
- **Query count:** ~6-7 queries
  - `getSession()` → auth.getUser() + profiles lookup
  - `getCachedChapterBundle()` or `getCachedChapterBundleAdmin()` → RPC or fallback queries
  - `getStepPages()` → step_pages table
  - `getNextStepWithContent()` → potential N+1 (loops calling getStepPages per step)
  - `getChapterPromptAnswers()` → createClient() + auth.getUser() + user_prompt_answers (SEQUENTIAL)
  - `getYourTurnResponses()` → createClient() + auth.getUser() + artifacts (SEQUENTIAL)
- **Known inefficiencies:**
  - `getChapterPromptAnswers` and `getYourTurnResponses` are awaited sequentially (can parallelize)
  - `getNextStepWithContent()` has N+1 query pattern (loops over steps calling getStepPages)

## Bundle Sizes

### Production Build
- **Total bundle size:** _[To be measured after npm run build]_
- **Main reading route bundle:** _[To be measured]_
- **Source maps in production:** Currently ENABLED (productionBrowserSourceMaps: true)

### Client-Side
- **WriteQueue logs:** Unconditional console.log in production builds
- **BlockRenderer:** All block types likely loaded eagerly

## Chromium Tracing

- **Current config:** Global include for all routes (`'/*'`)
- **Impact:** All traced routes include Chromium binaries (~50MB+ of assets)
- **Actual usage:** Only report/PDF routes need Chromium

## Next Steps

After recording actual measurements:

1. **Config wins:**
   - Disable production browser source maps → reduce build output
   - Scope Chromium tracing to `/api/reports/*` only → reduce serverless bundle size

2. **Runtime cleanup:**
   - Remove WriteQueue production logging
   - Remove duplicate map role query
   - Parallelize reading-page fetches

3. **Dashboard optimization:**
   - Deduplicate getChapterReportsData (3x → 1x per request)
   - Deduplicate getGamificationData (2x → 1x per request)
   - Standardize chapter list helper

4. **Later optimizations:**
   - Fix getNextStepWithContent N+1
   - Add proper caching for public content
   - Optimize map page data loading

---

## Actual Measurements

_Record actual measurements here after running the measurement process:_

```
Landing Page (/):
- TTFB: XXms
- Render: XXms

Dashboard (/dashboard):
- TTFB: XXms
- Render: XXms
- Observed query count: X

Map (/map):
- TTFB: XXms
- Render: XXms
- Observed query count: X

Reading Page (/read/...):
- TTFB: XXms
- Render: XXms
- Observed query count: X

Build Output:
- Route: / - Size: XXkB
- Route: /dashboard - Size: XXkB
- Route: /read/[...] - Size: XXkB
```
