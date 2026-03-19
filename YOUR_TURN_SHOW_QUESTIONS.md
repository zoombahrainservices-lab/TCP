# Your Turn - Show Questions Even Without Answers

## User Requirement:
> "if there is no ans the question must be there in the report also if there is nothing like no question no ans no problem"

**Translation:**
1. If questions exist but NO answers → Show the questions (empty to fill)
2. If NO questions AND NO answers → Show "No questions or responses" message

## Solution Implemented:

### 1. Fetch Questions from Pages
```typescript
// Query step_pages directly by chapter_id
const { data: allPages } = await supabase
  .from('step_pages')
  .select('id, title, slug, content')
  .eq('chapter_id', chapterId)

// Extract prompts and categorize by page slug/title
for (const page of allPages) {
  for (const block of content) {
    if (block.type === 'prompt' && block.id && block.label) {
      // Categorize based on page slug
      if (slug.includes('framework')) frameworkQuestions.push(block)
      else if (slug.includes('technique')) techniquesQuestions.push(block)
      else if (slug.includes('follow')) followThroughQuestions.push(block)
    }
  }
}
```

### 2. Three Display States

#### State 1: Has Answers (Show Q&A)
```html
<h3>🎯 Framework Reflections</h3>

1. What pattern do you notice in your behavior?
   I tend to reach for my phone when anxious

2. What triggers this behavior?
   Feeling overwhelmed at work
```

#### State 2: Has Questions but NO Answers (Show Questions)
```html
<h3>🎯 Framework Reflections</h3>
<p style="italic">Questions available but not yet answered...</p>

1. What pattern do you notice in your behavior?
   [Not answered yet]

2. What triggers this behavior?
   [Not answered yet]
```

#### State 3: NO Questions AND NO Answers (Show Empty)
```html
<h3>🎯 Framework Reflections</h3>

No questions or responses recorded for this section yet.
```

### 3. Visual Differences

**With Answers:**
- ✅ Green border
- ✅ White background
- ✅ Full color text

**Questions Only (No Answers):**
- ⏳ Gray border
- ⏳ Light gray background
- ⏳ Muted colors
- ⏳ "Not answered yet" placeholder

**Empty:**
- ⚪ Light background
- ⚪ Italic gray text

## Examples:

### Chapter 1 (All Answered):
```
🎯 Framework Reflections
✅ 5 questions, 5 answers

⚡ Technique Applications
✅ 3 questions, 3 answers

🚀 Follow-Through Commitments
✅ 4 questions, 4 answers
```

### Chapter 5 (Questions But No Answers):
```
🎯 Framework Reflections
⏳ 8 questions, 0 answers
   [Shows all 8 questions with "Not answered yet"]

⚡ Technique Applications
⏳ 6 questions, 0 answers
   [Shows all 6 questions with "Not answered yet"]

🚀 Follow-Through Commitments
⏳ 4 questions, 0 answers
   [Shows all 4 questions with "Not answered yet"]
```

### Chapter Without Content:
```
🎯 Framework Reflections
⚪ No questions or responses recorded

⚡ Technique Applications
⚪ No questions or responses recorded

🚀 Follow-Through Commitments
⚪ No questions or responses recorded
```

## Data Structure:

```typescript
type ResolutionReportData = {
  yourTurnByCategory: {
    framework: YourTurnQandA[]      // Answered questions
    techniques: YourTurnQandA[]
    followThrough: YourTurnQandA[]
  }
  availableQuestions?: {
    framework: Array<{ id, label }>  // All questions from pages
    techniques: Array<{ id, label }>
    followThrough: Array<{ id, label }>
  }
}
```

## Benefits:

✅ **Transparency** - Users see what questions exist
✅ **Progress tracking** - See what's unanswered
✅ **Printable** - Can print and fill in manually
✅ **Motivation** - Clear what work remains
✅ **Flexibility** - Works with or without answers

---

Reports now show questions even without answers! 🎯
