# Your Turn - Always Show All Sections

## User Requirement:
> "I need framework your turn present if there is ans or not"

All three Your Turn sections should ALWAYS appear in reports, whether they have answers or not.

## Solution:

### 1. Always Generate All 3 Sections
```typescript
// Before: Only showed sections with data
const hasAnyYourTurn = frameworkHtml || techniquesHtml || followThroughHtml
const yourTurnHtml = hasAnyYourTurn ? '...' : ''

// After: Always include all sections
const yourTurnHtml = `${frameworkHtml}${techniquesHtml}${followThroughHtml}`
```

### 2. Show Empty State for Sections Without Data
```typescript
function buildYourTurnHtml(category, items, categoryKey) {
  // If no items, show section with message
  if (!items?.length) {
    return `
      <h3>🎯 ${category}</h3>
      <div class="your-turn-item">
        <p style="color: #64748b; font-style: italic;">
          No responses recorded for this section yet.
        </p>
      </div>
    `
  }
  
  // Otherwise show responses
  return /* ... */
}
```

### 3. Added Section Icons
- 🎯 Framework Reflections
- ⚡ Technique Applications
- 🚀 Follow-Through Commitments

## Report Structure Now:

### All Chapters Show:
```
✅ Self-Check Assessment
   (questions + answers OR blank form)

📝 Your Turn Responses
   
   🎯 Framework Reflections
      - Responses OR "No responses recorded for this section yet."
   
   ⚡ Technique Applications
      - Responses OR "No responses recorded for this section yet."
   
   🚀 Follow-Through Commitments
      - Responses OR "No responses recorded for this section yet."

🎯 Identity Statement & Resolution
   (identity + proofs)
```

## Examples:

### Chapter 1 (Has All Responses):
```
📝 Your Turn Responses

🎯 Framework Reflections
1. What pattern do you notice...
   I tend to reach for my phone when anxious

2. What triggers this behavior...
   Feeling overwhelmed at work

⚡ Technique Applications
1. Which technique will you try first...
   Substitution technique

🚀 Follow-Through Commitments
1. When will you practice...
   Tomorrow morning at 9am
```

### Chapter 7 (No Responses Yet):
```
📝 Your Turn Responses

🎯 Framework Reflections
   No responses recorded for this section yet.

⚡ Technique Applications
   No responses recorded for this section yet.

🚀 Follow-Through Commitments
   No responses recorded for this section yet.
```

### Chapter 5 (Only Framework Responses):
```
📝 Your Turn Responses

🎯 Framework Reflections
1. Your Response:
   Answer 1...
   
2. Your Response:
   Answer 2...

⚡ Technique Applications
   No responses recorded for this section yet.

🚀 Follow-Through Commitments
   No responses recorded for this section yet.
```

## Benefits:

✅ **Consistent structure** - All reports have same sections
✅ **Clear expectations** - Users see what sections exist
✅ **Visual guidance** - Empty state shows what's missing
✅ **Professional** - No confusing blank spaces
✅ **Motivational** - Shows progress (2/3 sections done, 1 to go)

---

Every report now shows all three Your Turn sections, whether they have data or not! 🎯
