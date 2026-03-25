/**
 * Performance Baseline Measurement Script
 * 
 * Usage: npm run measure-baseline
 * 
 * This script provides guidance for capturing performance baselines.
 * Actual measurements should be taken from Next.js dev/build output and browser tools.
 */

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TCP Platform Performance Baseline Measurement Guide
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: Start dev server and capture route timings
------------------------------------------------
1. Ensure dev server is running: npm run dev
2. Clear browser cache and restart if needed
3. Visit each route below and note the timing from Next.js terminal output:
   - GET / (landing page)
   - GET /dashboard (after login)
   - GET /map (after login)
   - GET /read/[chapterSlug]/[stepSlug] (pick Chapter 1, step 1)

4. Record the "render" time from terminal output like:
   GET /dashboard 200 in XXXms (compile: Xms, render: XXXms)

STEP 2: Count database queries
------------------------------
1. Add temporary console.log to count queries if needed, or
2. Use Supabase dashboard to monitor query count during load

Target routes to measure:
- Dashboard: Check how many times getChapterReportsData is called
- Reading page: Count total queries in page.tsx loader
- Map page: Count chapter/step/page/progress queries

STEP 3: Measure bundle sizes
----------------------------
1. Run: npm run build
2. Check .next/static output for client bundle sizes
3. Note the size of the main reading route bundle

STEP 4: Record results in PERF_BASELINE.md
------------------------------------------
Update the baseline document with actual measurements.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)

process.exit(0)
