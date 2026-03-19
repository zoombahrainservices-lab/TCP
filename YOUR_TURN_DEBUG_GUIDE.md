# Your Turn Data Not Showing - Comprehensive Debug Guide

## Problem
Report shows "Your Turn responses not found" even though user may have completed sections.

## Multi-Perspective Analysis System

The code now logs **7 different perspectives** to identify the exact issue:

### PERSPECTIVE 1: Steps Query
**What it checks:** Are Framework/Techniques/Follow-Through steps found for this chapter?

**Log output:**
```
[getResolutionReportData] PERSPECTIVE 1: Fetching steps...
Steps query result:
  - Found 3 steps
  - Error: none
  - Step: framework (Framework) [uuid-1]
  - Step: techniques (Techniques) [uuid-2]
  - Step: follow_through (Follow-Through) [uuid-3]
```

**If you see 0 steps:**
- Chapter doesn't have these step types in database
- Check `steps` table for this chapter_id

### PERSPECTIVE 2: Pages Query
**What it checks:** Are there pages for these steps?

**Log output:**
```
[getResolutionReportData] PERSPECTIVE 2: Fetching pages for 3 steps...
Pages query result:
  - Found 15 pages
  - Error: none
```

**If you see 0 pages:**
- Steps exist but have no pages
- Check `step_pages` table

### PERSPECTIVE 3: Prompt Extraction
**What it checks:** Can we extract prompt questions from page content?

**Log output:**
```
[getResolutionReportData] PERSPECTIVE 3: Extracting prompts from pages...
  - Page uuid-1 (Framework Intro): 5 blocks
    ✓ Prompt: spark_s_pattern -> "What pattern do you notice..."
    ✓ Prompt: spark_trigger -> "What triggers this behavior..."
  - Page uuid-1: Found 2 prompts
Total prompts found: 25
Prompt IDs: ['spark_s_pattern', 'spark_trigger', ...]
```

**If you see 0 prompts:**
- Pages exist but have no prompt blocks
- Check page content structure
- Prompt blocks might be different type

### PERSPECTIVE 4: Artifacts Query
**What it checks:** Are there Your Turn responses saved as artifacts?

**Log output:**
```
[getResolutionReportData] PERSPECTIVE 4: Fetching Your Turn from artifacts...
Artifacts query result:
  - Found 0 artifacts
  - Error: none
```

**Usually 0** - Most apps use `user_prompt_answers` table instead.

### PERSPECTIVE 5: user_prompt_answers Query
**What it checks:** Are there Your Turn responses in this table?

**Log output:**
```
[getResolutionReportData] PERSPECTIVE 5: Fetching from user_prompt_answers...
user_prompt_answers query result:
  - Found 12 answers
  - Error: none
```

**If you see 0 answers:**
- User hasn't completed any Your Turn prompts
- OR data is stored with different chapter_id
- OR RLS policy blocking access

### PERSPECTIVE 6: Matching Logic
**What it checks:** Can we match prompt_keys to questions and categorize them?

**Log output:**
```
[getResolutionReportData] PERSPECTIVE 6: Matching answers to questions...
  - Processing: ch1_framework_spark_s_pattern
    Extracted ID: spark_s_pattern
    Question text: What pattern do you notice...
    → Added to framework
  - Processing: ch1_technique_1_substitution
    Extracted ID: 1_substitution
    Question text: NOT FOUND
    → Added to techniques
  - SKIP (self_check): ch1_self_check_q1
```

**Common issues:**
- `Extracted ID: null` → Regex doesn't match prompt_key format
- `Question text: NOT FOUND` → prompt ID not in promptQuestionsMap
- `→ SKIPPED` → Doesn't match framework/technique/followthrough patterns

### PERSPECTIVE 7: Final Summary
**What it shows:** Total counts for verification

**Log output:**
```
[getResolutionReportData] ===== FINAL SUMMARY =====
  - Identity: FOUND
  - Proofs: 1
  - Your Turn Framework: 5
  - Your Turn Techniques: 7
  - Your Turn Follow-Through: 3
  - Total Your Turn: 15
```

**If Total is 0:**
```
⚠️ NO YOUR TURN DATA FOUND!
  Possible reasons:
  1. User hasn't completed Framework/Techniques/Follow-Through sections
  2. Data is stored with different chapter_id
  3. Prompt keys don't match expected patterns
  4. Database query errors (check logs above)
```

---

## How to Use This Debug System

### Step 1: Download a Report
Go to `/reports` and click "Download Complete Report"

### Step 2: Check Terminal Logs
Look for the 7 perspectives above. Find which one shows the problem.

### Step 3: Diagnose
| If this perspective shows 0/error | Then the issue is |
|-----------------------------------|-------------------|
| PERSPECTIVE 1: 0 steps | Chapter missing Framework/Techniques/Follow-Through steps in database |
| PERSPECTIVE 2: 0 pages | Steps exist but no pages created |
| PERSPECTIVE 3: 0 prompts | Pages exist but no prompt blocks in content |
| PERSPECTIVE 4: 0 artifacts | Normal - skip to perspective 5 |
| PERSPECTIVE 5: 0 answers | User hasn't completed Your Turn sections |
| PERSPECTIVE 6: All skipped | Prompt key format doesn't match regex |
| PERSPECTIVE 7: Total 0 | Combination of above issues |

### Step 4: Fix Based on Diagnosis

**If missing steps:**
```sql
-- Check steps table
SELECT id, step_type, title FROM steps WHERE chapter_id = 1;
```

**If missing pages:**
```sql
-- Check pages for a step
SELECT id, title FROM step_pages WHERE step_id = 'STEP_UUID';
```

**If missing answers:**
- User needs to actually complete the sections in the app
- OR check if data exists with different chapter_id:
```sql
SELECT chapter_id, COUNT(*) FROM user_prompt_answers 
WHERE user_id = 'USER_ID' 
GROUP BY chapter_id;
```

**If regex doesn't match:**
- Check actual prompt_key format in database
- Update regex in code to match format

---

## Expected Prompt Key Formats

### Framework:
- `ch1_framework_spark_s_pattern`
- `ch1_framework_spark_trigger`
- `ch1_framework_voice_1`

### Techniques:
- `ch1_technique_1_substitution`
- `ch1_technique_2_delay`
- `ch1_technique_3_redirect`

### Follow-Through:
- `ch1_followthrough_1_pick_one`
- `ch1_followthrough_2_when`
- `ch1_followthrough_3_commitment`

### Regex Pattern:
```typescript
/(?:framework|technique|followthrough)_(.+)$/
```

This extracts the part AFTER the section name (e.g., `spark_s_pattern`)

---

## Quick Test Script

Run this in Supabase SQL editor (replace USER_ID):

```sql
-- See what Your Turn data exists
SELECT 
  chapter_id,
  prompt_key,
  LEFT(CAST(answer AS TEXT), 50) as answer_preview
FROM user_prompt_answers
WHERE user_id = 'YOUR_USER_ID'
AND prompt_key NOT LIKE '%self_check%'
ORDER BY chapter_id, created_at;
```

This shows you exactly what data exists and what chapter it's associated with.

---

## Common Fixes

### Issue: "Found 12 answers" but "Total Your Turn: 0"
**Cause:** Prompt keys don't match categorization patterns

**Fix:** Check the "Processing:" logs in PERSPECTIVE 6 - look for "SKIPPED" entries and adjust regex or categorization logic.

### Issue: "Question text: NOT FOUND" for all prompts
**Cause:** Extracted prompt IDs don't match what's in pages

**Fix:** 
1. Check PERSPECTIVE 3 logs to see what prompt IDs were extracted from pages
2. Check PERSPECTIVE 6 to see what IDs are being looked up
3. Adjust regex if format doesn't match

### Issue: "Found 0 pages"
**Cause:** Pages not created for Framework/Techniques/Follow-Through steps

**Fix:** Create pages in admin panel or check if step IDs are correct

---

Now download a report and check the logs - they will tell you EXACTLY where the issue is! 🔍
