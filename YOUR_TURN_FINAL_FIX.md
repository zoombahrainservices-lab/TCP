# Your Turn Fix - Final Solution

## Issues Found from Logs:

### 1. Table 'steps' Doesn't Exist ❌
```
Error: "Could not find the table 'public.steps' in the schema cache"
```
**Fix:** Removed steps/pages query completely. We don't need it because artifacts already store `promptText`.

### 2. Chapter 1 Works Perfectly ✅
```
- Found 12 artifacts
- Your Turn Framework: 5
- Your Turn Techniques: 3
- Your Turn Follow-Through: 4
```
**Why:** Uses traditional format `ch1_framework_s_surface`, etc.

### 3. Chapter 5 Has Different Prompt Key Format ❌
```
- Processing: prompt_1773053055251
  Extracted ID: null
  → SKIPPED (doesn't match any category)
```
**Problem:** New prompt format `prompt_{timestamp}` doesn't match regex.

**Fix:** Added support for BOTH formats:
- Traditional: `ch1_framework_spark_s_pattern`
- Generic: `prompt_1773053055251`

## Solution Implemented:

### Multi-Format Support:
```typescript
// Method 1: Traditional format
if (promptKey.match(/(?:framework|technique|followthrough)_(.+)$/)) {
  // Extract ID and categorize
}

// Method 2: Generic timestamp format  
else if (promptKey.startsWith('prompt_')) {
  // Add to framework by default
  framework.push(item)
}
```

### Show Only Sections With Data:
The HTML already does this! It only shows sections if they have items:
```typescript
function buildYourTurnHtml(category: string, items: any[]): string {
  if (!items?.length) return '' // ← Returns empty if no data
  // ... show section
}
```

So:
- ✅ If Framework has data → Shows "Framework Reflections" section
- ✅ If Techniques has data → Shows "Technique Applications" section  
- ✅ If Follow-Through has data → Shows "Follow-Through Commitments" section
- ✅ If ALL empty → Shows "Your Turn responses not found"

## What Changed:

### File: `app/actions/reports.ts`

**Removed:**
- Steps table query (doesn't exist)
- Pages query (not needed)
- Prompt extraction from pages (artifacts have promptText)

**Added:**
- Support for `prompt_{timestamp}` format
- Categorizes generic prompts as "framework" by default
- Better logging for both formats

## Expected Results Now:

### Chapter 1 (Traditional Format):
```
Your Turn Framework: 5 ✅
Your Turn Techniques: 3 ✅
Your Turn Follow-Through: 4 ✅
```

### Chapter 5 (Generic Format):
```
- Processing: prompt_1773053055251
  → Added to framework (generic prompt format) ✅
  
Your Turn Framework: 5 ✅
(All prompt_* answers grouped here)
```

### Chapters With No Data:
```
Your Turn responses not found message ✅
```

## Testing:

Download reports for:
1. **Chapter 1** - Should show all 3 sections (framework, techniques, follow-through)
2. **Chapter 5** - Should show framework section with 5 responses
3. **Chapter 7** - Should show "not found" message (user hasn't done Your Turn)

---

The system now handles BOTH prompt formats and only shows sections that have data! 🎉
