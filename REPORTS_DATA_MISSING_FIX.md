# Reports Data Missing - Root Cause Analysis & Fix

## Problem Statement
User downloads chapter report but sees:
- ✅ Self-Check Assessment (working)
- ❌ Your Turn Responses (empty heading, no data)
- ❌ Identity Statement & Resolution (showing "No identity statement", minimal proofs)

## Root Cause Analysis (6 Perspectives)

### 1️⃣ Data Fetching Failures (CRITICAL BUG FOUND)
**Issue:** `getResolutionReportData()` was returning `{ success: false }` if ANY query failed.

**Location:** `app/actions/reports.ts` line 465
```typescript
if (proofsError) {
  console.error('Error fetching proofs:', proofsError)
  return { success: false, error: 'Failed to fetch proof data' }  // ❌ STOPS EVERYTHING
}
```

**Impact:** If proofs query fails (RLS, permissions, missing data, etc.), the ENTIRE function returns failure, which means:
- `resolutionData = null` in the PDF generator
- No Your Turn data displayed
- No Resolution data displayed
- Report shows empty sections

**Fix:** Made ALL queries non-fatal - log errors but continue processing other data.

---

### 2️⃣ HTML Generation Logic (SECONDARY BUG)
**Issue:** Empty arrays were treated as "no data available"

**Location:** `app/api/reports/chapter/[chapterId]/route.ts` lines 144-150

**Original Code:**
```typescript
const yourTurnHtml = resolutionData?.yourTurnByCategory
  ? `
  ${buildYourTurnHtml('Framework', resolutionData.yourTurnByCategory.framework)}
  ${buildYourTurnHtml('Techniques', resolutionData.yourTurnByCategory.techniques)}
  ${buildYourTurnHtml('Follow-Through', resolutionData.yourTurnByCategory.followThrough)}
  `
  : ''
```

**Problem:** If all 3 categories return `''` (empty), then:
- `yourTurnHtml = '' + '' + '' = ''` (empty string)
- Line 299: `yourTurnHtml ? ... : ...` evaluates to false
- Falls through to "not found" message

**Fix:** Pre-calculate each section, check if ANY have content, then combine.

---

### 3️⃣ Silent Query Failures
**Issue:** Database queries could fail without proper logging

**Examples:**
- RLS policies blocking artifacts table
- Missing permissions on user_prompt_answers
- Network timeouts
- Invalid user ID

**Fix:** Added comprehensive error logging with `[getResolutionReportData]` prefix for all queries.

---

### 4️⃣ Data Mapping Issues
**Issue:** Identity statement stored in multiple places, not all checked

**Locations:**
- `artifacts` table with `type='identity_resolution'` and `data.identity`
- `artifacts` table with `type='proof'` and `data.identity` (embedded)
- `artifacts` table with `type='proof'` and `data.notes`

**Fix:** Already implemented in previous fix - checks all 3 locations.

---

### 5️⃣ Your Turn Data Sources
**Issue:** Your Turn responses could be in 2 different tables

**Data Sources:**
1. `artifacts` table with `type='your_turn_response'`
2. `user_prompt_answers` table (fallback for older data)

**Categorization Logic:**
- Framework: keys include `spark_`, `framework_`, or `voice_`
- Techniques: keys include `technique_`
- Follow-Through: keys include `followthrough_`

**Fix:** Both sources now queried with non-fatal error handling.

---

### 6️⃣ Report Structure Ordering
**Issue:** Report sections must ALWAYS appear in order, even if empty

**Required Order:**
1. ✅ Self-Check Assessment
2. 📝 Your Turn Responses
3. 🎯 Identity Statement & Resolution

**Fix:** HTML now shows all sections with helpful messages when data is missing.

---

## Changes Made

### File 1: `app/actions/reports.ts`

#### Change 1: Non-fatal proof fetching
```typescript
// OLD: Fatal error
if (proofsError) {
  return { success: false, error: 'Failed to fetch proof data' }
}

// NEW: Log and continue
if (proofsError) {
  console.error('[getResolutionReportData] Error fetching proofs (non-fatal):', proofsError)
}
```

#### Change 2: Non-fatal Your Turn fetching
```typescript
const { data: yourTurnArtifacts, error: yourTurnError } = await supabase...
if (yourTurnError) {
  console.error('[getResolutionReportData] Error fetching Your Turn artifacts (non-fatal):', yourTurnError)
}

const { data: promptAnswers, error: promptAnswersError } = await supabase...
if (promptAnswersError) {
  console.error('[getResolutionReportData] Error fetching prompt answers (non-fatal):', promptAnswersError)
}
```

#### Change 3: Debug logging
```typescript
console.log(`[getResolutionReportData] Chapter ${chapterId} summary:`)
console.log(`  - Identity: ${identityStatement ? 'FOUND' : 'NOT FOUND'}`)
console.log(`  - Proofs: ${proofs.length}`)
console.log(`  - Your Turn Framework: ${framework.length}`)
console.log(`  - Your Turn Techniques: ${techniques.length}`)
console.log(`  - Your Turn Follow-Through: ${followThrough.length}`)
```

### File 2: `app/api/reports/chapter/[chapterId]/route.ts`

#### Change 1: Pre-calculate Your Turn HTML
```typescript
// OLD: Single check
const yourTurnHtml = resolutionData?.yourTurnByCategory ? `...` : ''

// NEW: Check each category separately
const frameworkHtml = buildYourTurnHtml('Framework', resolutionData?.yourTurnByCategory?.framework ?? [])
const techniquesHtml = buildYourTurnHtml('Techniques', resolutionData?.yourTurnByCategory?.techniques ?? [])
const followThroughHtml = buildYourTurnHtml('Follow-Through', resolutionData?.yourTurnByCategory?.followThrough ?? [])

const hasAnyYourTurn = frameworkHtml || techniquesHtml || followThroughHtml
const yourTurnHtml = hasAnyYourTurn ? `${frameworkHtml}${techniquesHtml}${followThroughHtml}` : ''
```

#### Change 2: Debug logging in GET handler
```typescript
console.log(`[Report API] Chapter ${chapterId} - Building report:`)
console.log(`  - Assessment: ${assessmentData ? 'YES' : 'NO'}`)
console.log(`  - Resolution: ${resolutionData ? 'YES' : 'NO'}`)
if (resolutionData) {
  console.log(`  - Your Turn total: ${...}`)
  console.log(`  - Identity: ${resolutionData.identityResolution ? 'YES' : 'NO'}`)
  console.log(`  - Proofs: ${resolutionData.proofs?.length ?? 0}`)
}
```

---

## Testing Steps

### 1. Check Terminal Logs
When you download a report, the terminal should now show:
```
[getResolutionReportData] Chapter 1 summary:
  - Identity: FOUND
  - Proofs: 1
  - Your Turn Framework: 3
  - Your Turn Techniques: 5
  - Your Turn Follow-Through: 2

[Report API] Chapter 1 - Building report:
  - Assessment: YES
  - Resolution: YES
  - Your Turn total: 10
  - Identity: YES
  - Proofs: 1
```

### 2. Download Report
1. Go to `/reports`
2. Click "Download Complete Report" for Chapter 1
3. Open the PDF

### 3. Expected Result
PDF should have ALL THREE sections:
- ✅ **Self-Check Assessment** with your responses
- ✅ **Your Turn Responses** with Framework/Techniques/Follow-Through entries
- ✅ **Identity Statement & Resolution** with identity statement and proofs

### 4. If Still Empty
Check terminal logs to see which data is missing:
- If "Your Turn Framework: 0" → No Framework responses in database
- If "Identity: NOT FOUND" → No identity statement in database
- If "Proofs: 0" → No proof submissions in database

---

## Database Verification

If sections are still empty, verify data exists:

```sql
-- Check Your Turn data (artifacts)
SELECT COUNT(*) FROM artifacts 
WHERE user_id = 'YOUR_USER_ID' 
AND chapter_id = 1 
AND type = 'your_turn_response';

-- Check Your Turn data (user_prompt_answers)
SELECT COUNT(*) FROM user_prompt_answers 
WHERE user_id = 'YOUR_USER_ID' 
AND chapter_id = 1 
AND prompt_key NOT LIKE '%self_check%';

-- Check Resolution data
SELECT * FROM artifacts 
WHERE user_id = 'YOUR_USER_ID' 
AND chapter_id = 1 
AND type IN ('identity_resolution', 'proof');
```

---

## Summary of Fixes

✅ **Made data fetching resilient** - No single query failure stops the entire report
✅ **Added comprehensive logging** - Can now debug exactly what data is found/missing
✅ **Fixed HTML generation logic** - Properly detects when ANY Your Turn data exists
✅ **Improved error handling** - All errors logged but non-fatal

The report will now show ALL available data, even if some sections are incomplete!
