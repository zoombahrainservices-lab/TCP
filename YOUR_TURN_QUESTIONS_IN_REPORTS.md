# Your Turn Questions in Reports - Complete Solution

## Problem
Reports were showing Your Turn **answers** but NOT the **questions**, making it hard to understand the context of responses.

## Root Cause
The `user_prompt_answers` table only stores:
- `prompt_key` (e.g., "ch1_framework_spark_s_pattern")
- `answer` (the user's response)
- **NOT** the actual question text

The question text lives in the page content as `PromptBlock` objects with a `label` field.

## Solution Implemented

### 1. Fetch Prompt Questions from Page Content
```typescript
// Fetch Framework, Techniques, Follow-Through steps
const { data: steps } = await supabase
  .from('steps')
  .select('id, step_type')
  .eq('chapter_id', chapterId)
  .in('step_type', ['framework', 'techniques', 'follow_through'])

// Fetch all pages for these steps
const { data: pages } = await supabase
  .from('step_pages')
  .select('content')
  .in('step_id', stepIds)

// Extract prompt blocks from page content
for (const page of pages ?? []) {
  for (const block of content) {
    if (block.type === 'prompt' && block.id && block.label) {
      // Store: block.id -> block.label
      promptQuestionsMap.set(block.id, block.label)
    }
  }
}
```

### 2. Match Prompt Keys to Questions
```typescript
// Extract prompt ID from key
// "ch1_framework_spark_s_pattern" -> "spark_s_pattern"
const promptIdMatch = promptKey.match(/(?:framework|technique|followthrough)_(.+)$/)
const promptId = promptIdMatch ? promptIdMatch[1] : null
const questionText = promptId ? promptQuestionsMap.get(promptId) : null

const item: YourTurnQandA = {
  promptText: questionText || null, // ✅ Now has the question!
  responseText: answerText,
  createdAt: row.created_at ?? '',
}
```

### 3. Enhanced HTML Display
```html
<div class="your-turn-item">
  <!-- Question (numbered and styled) -->
  <div class="your-turn-prompt">
    <span style="font-weight: 700; color: #10b981;">1.</span>
    What pattern do you notice in your behavior?
  </div>
  
  <!-- Answer (styled differently) -->
  <div class="your-turn-response">
    I tend to reach for my phone when I feel anxious...
  </div>
</div>
```

## Visual Improvements

### Before:
```
Your Turn Responses

Framework Reflections
- I tend to reach for my phone when anxious
- Social media fills the void
- I use it to avoid uncomfortable feelings
```
(No questions shown - just answers)

### After:
```
📝 Your Turn Responses

Framework Reflections

1. What pattern do you notice in your behavior?
   I tend to reach for my phone when anxious

2. What emotional need does this fulfill?
   Social media fills the void

3. What are you avoiding by using your phone?
   I use it to avoid uncomfortable feelings
```
(Questions + answers with clear formatting)

## Files Changed

### 1. `app/actions/reports.ts`
**Added:**
- Fetch chapter steps (Framework, Techniques, Follow-Through)
- Fetch step pages and extract prompt blocks
- Build `promptQuestionsMap` (prompt ID → question text)
- Match answers to questions using regex extraction
- Enhanced logging

### 2. `app/api/reports/chapter/[chapterId]/route.ts`
**Updated:**
- Enhanced `buildYourTurnHtml()` to show numbered questions
- Better visual separation between question and answer
- Fallback text if question not found ("Your Response:")
- Green numbered bullets for questions

## Technical Details

### Prompt Key Format
```
ch{chapter_id}_{section}_{prompt_id}

Examples:
- ch1_framework_spark_s_pattern
- ch1_technique_1_substitution
- ch1_followthrough_1_pick_one
```

### Extraction Logic
```typescript
const promptIdMatch = promptKey.match(/(?:framework|technique|followthrough)_(.+)$/)
```

This extracts the `{prompt_id}` part which matches the `block.id` in page content.

### Matching Process
1. Prompt in page: `{ type: 'prompt', id: 'spark_s_pattern', label: 'What pattern...?' }`
2. Answer in DB: `{ prompt_key: 'ch1_framework_spark_s_pattern', answer: 'I tend to...' }`
3. Extract ID: `'spark_s_pattern'` from key
4. Look up: `promptQuestionsMap.get('spark_s_pattern')` → `'What pattern...?'`
5. Combine: Question + Answer in report

## Testing

### 1. Download Report
Go to `/reports` and download a complete report

### 2. Check Terminal Logs
You should see:
```
[getResolutionReportData] Found X prompt questions from pages
[getResolutionReportData] Chapter 1 summary:
  - Your Turn Framework: X
  - Your Turn Techniques: X
  - Your Turn Follow-Through: X
```

### 3. Open PDF
Each Your Turn response should now show:
- ✅ Numbered question (in green)
- ✅ User's answer (in green box)
- ✅ Clear visual separation

## Edge Cases Handled

### If Question Not Found:
Shows fallback: "Your Response:" instead of the question
(This can happen if prompt_key format doesn't match or page content changed)

### If No Answers:
Shows helpful message: "Your Turn responses not found..."

### Mixed Sources:
- Handles both `artifacts` (with `promptText` already stored)
- And `user_prompt_answers` (extracts question from pages)

## Benefits

✅ **Context** - Users can see what question they answered
✅ **Clarity** - Numbered questions make report easier to read
✅ **Completeness** - Full Q&A pairs, not just answers
✅ **Visual** - Green theme matches "Your Turn" branding
✅ **Robust** - Works even if some questions not found (shows fallback)

---

Your reports now show **BOTH questions AND answers** for all Your Turn responses! 🎉
