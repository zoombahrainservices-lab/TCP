# Multiple Choice Questions (MCQ) Assessment Type

## Overview

The MCQ assessment type allows admins to create both graded knowledge-check quizzes and non-graded reflection/survey questions. This provides flexibility for different assessment scenarios within the TCP platform.

## Features

### Two MCQ Modes

1. **Graded MCQ (Knowledge Check)**
   - Admin marks one option as the correct answer
   - Users receive instant feedback after completion
   - Score bands can be configured for different performance levels
   - Visual feedback shows correct/incorrect answers with green/red indicators

2. **Non-Graded MCQ (Reflection/Survey)**
   - No correct answer is marked
   - Used for opinion-based or reflection questions
   - Simple confirmation shown after completion
   - No scoring or right/wrong feedback

## Block Structure

### TypeScript Interface

```typescript
export interface MCQBlock {
  type: 'mcq';
  id: string; // Unique identifier for the block (e.g., "ch1_quiz_q1")
  title?: string; // Optional title displayed at the top
  description?: string; // Optional description/instructions
  questions: Array<{
    id: string; // Unique question identifier
    text: string; // Question text
    options: Array<{
      id: string; // Option identifier (e.g., 'a', 'b', 'c', 'd')
      text: string; // Option text
    }>;
    correctOptionId?: string; // Optional - if provided, this is a graded question
  }>;
  scoring?: {
    showResults?: boolean; // Whether to show correct/incorrect feedback
    bands?: Array<{
      range: [number, number]; // [min score, max score]
      label: string; // Band label (e.g., "Excellent", "Good Progress")
      description?: string; // Band description
      color?: string; // Color for the band display
    }>;
  };
}
```

### Example: Graded MCQ

```json
{
  "type": "mcq",
  "id": "ch1_active_listening_quiz",
  "title": "Knowledge Check: Active Listening",
  "description": "Test your understanding of active listening techniques.",
  "questions": [
    {
      "id": "q1",
      "text": "What is active listening?",
      "options": [
        { "id": "a", "text": "Waiting for your turn to speak" },
        { "id": "b", "text": "Fully concentrating on what is being said" },
        { "id": "c", "text": "Interrupting to show you understand" },
        { "id": "d", "text": "Thinking about your response while they talk" }
      ],
      "correctOptionId": "b"
    },
    {
      "id": "q2",
      "text": "Which technique helps de-escalate conflict?",
      "options": [
        { "id": "a", "text": "Speaking louder to assert dominance" },
        { "id": "b", "text": "Acknowledging the other person's emotions" },
        { "id": "c", "text": "Ignoring their concerns" },
        { "id": "d", "text": "Insisting you are right" }
      ],
      "correctOptionId": "b"
    }
  ],
  "scoring": {
    "showResults": true,
    "bands": [
      {
        "range": [0, 0],
        "label": "Review Needed",
        "description": "Consider reviewing the chapter content.",
        "color": "#EF4444"
      },
      {
        "range": [1, 1],
        "label": "Good Progress",
        "description": "You're on the right track!",
        "color": "#F59E0B"
      },
      {
        "range": [2, 2],
        "label": "Excellent!",
        "description": "You've mastered the concepts!",
        "color": "#10B981"
      }
    ]
  }
}
```

### Example: Non-Graded MCQ (Reflection)

```json
{
  "type": "mcq",
  "id": "ch1_reflection",
  "title": "Self-Reflection",
  "description": "There are no right or wrong answers. Choose the response that best reflects your perspective.",
  "questions": [
    {
      "id": "q1",
      "text": "How do you typically handle conflict?",
      "options": [
        { "id": "a", "text": "I avoid it whenever possible" },
        { "id": "b", "text": "I address it directly and immediately" },
        { "id": "c", "text": "I wait for the right moment to discuss it" },
        { "id": "d", "text": "I seek help from a third party" }
      ]
    },
    {
      "id": "q2",
      "text": "What motivates you most in difficult conversations?",
      "options": [
        { "id": "a", "text": "Finding a solution" },
        { "id": "b", "text": "Being understood" },
        { "id": "c", "text": "Maintaining the relationship" },
        { "id": "d", "text": "Standing up for my values" }
      ]
    }
  ]
}
```

## Admin Interface

### Creating MCQ Blocks

1. **Add MCQ Block**
   - In the content editor, click "Multiple Choice (MCQ)" from the block palette
   - A default MCQ block with one question and four options is created

2. **Configure Block Properties**
   - **Block ID**: Unique identifier for storing responses (e.g., `quiz_ch1`)
   - **Title**: Optional heading for the assessment (e.g., "Knowledge Check")
   - **Description**: Optional instructions for users

3. **Add/Edit Questions**
   - Click "Add question" to add new questions
   - Each question includes:
     - Question text field
     - Question ID (for data storage)
     - Multiple options (add/remove as needed)
     - Radio button to mark correct answer (optional)

4. **Configure Options**
   - Each option has:
     - Option text field
     - Option ID (e.g., 'a', 'b', 'c', 'd')
     - Delete button to remove the option
   - Click "Add option" to add more choices
   - Click the radio button next to an option to mark it as correct

5. **Graded vs Non-Graded**
   - **For Graded MCQ**: Select the radio button next to the correct option for each question, and enable "Show results after completion"
   - **For Non-Graded MCQ**: Leave all radio buttons unselected (no correct answer)

6. **Scoring Options**
   - Enable "Show results after completion" for graded quizzes
   - This shows users their score and correct/incorrect feedback

### Best Practices

1. **Question IDs**: Use descriptive IDs like `q1`, `q2`, etc. within each block
2. **Option IDs**: Use consistent IDs like `a`, `b`, `c`, `d` for clarity
3. **Block IDs**: Use unique, descriptive IDs like `ch1_active_listening_quiz`
4. **Descriptions**: Provide clear instructions, especially for reflection questions
5. **Option Count**: Typically 2-5 options per question for best UX

## User Experience

### Answering Questions

1. User reads the question and available options
2. Click on an option to select it
3. Selected option is highlighted with blue styling
4. All questions must be answered before results are shown

### Graded MCQ Results

After answering all questions (if `showResults: true`):
- A "Show Results" button appears
- Clicking it reveals:
  - Correct answers highlighted in green
  - Incorrect selections highlighted in red
  - Total score display
  - Performance band feedback (if configured)
  - Options are locked after showing results

### Non-Graded MCQ Confirmation

After answering all questions (if no correct answers are set):
- A simple "Responses recorded" confirmation appears
- No feedback on correctness
- User can review their selections

## Templates

Two pre-built templates are available in the content editor:

1. **Multiple Choice Quiz (Graded)**
   - Pre-configured with sample knowledge-check questions
   - Includes scoring bands
   - `showResults` enabled

2. **Multiple Choice (Reflection)**
   - Pre-configured with sample reflection questions
   - No correct answers set
   - Suitable for surveys and self-assessment

## Data Storage

### Response Format

User responses are stored in the format:
```json
{
  "questionId": "selectedOptionId"
}
```

Example:
```json
{
  "q1": "b",
  "q2": "a"
}
```

### Database Storage

- Responses are saved via the `savePromptAnswer` server action
- Block ID (`id` field) is used as the prompt key
- Responses are associated with the user's chapter progress

## Technical Implementation

### Files Created/Modified

1. **Type Definitions**
   - `tcp-platform/lib/blocks/types.ts`: Added `MCQBlock` interface

2. **Validation**
   - `tcp-platform/lib/blocks/validator.ts`: Added `MCQBlockSchema` for validation

3. **Frontend Component**
   - `tcp-platform/components/content/blocks/MCQBlock.tsx`: MCQ rendering component

4. **Block Renderer**
   - `tcp-platform/components/content/BlockRenderer.tsx`: Registered MCQ block type

5. **Admin Editors**
   - `tcp-platform/components/admin/ContentEditor.tsx`: Added MCQ editing UI
   - `tcp-platform/components/admin/PageContentEditor.tsx`: Added MCQ to default blocks

6. **Templates**
   - `tcp-platform/lib/content/templates.ts`: Added graded and non-graded MCQ templates

### Component Props

```typescript
interface MCQBlockProps extends MCQBlock {
  responses?: Record<string, string>; // questionId -> selectedOptionId
  onChange?: (responses: Record<string, string>) => void;
}
```

## Future Enhancements

Potential improvements for future versions:

1. **Multi-Select Questions**: Allow selecting multiple correct answers
2. **Weighted Scoring**: Different points for different questions
3. **Explanation Text**: Show explanations for correct/incorrect answers
4. **Randomize Options**: Shuffle option order for each user
5. **Time Limits**: Add optional time constraints per question
6. **Question Bank**: Create reusable question libraries
7. **Analytics**: Track question difficulty and common wrong answers

## Migration Guide

For existing scale_questions or yes_no_check assessments:

MCQs complement existing assessment types:
- Use **scale_questions** for rating scales (1-5, strongly disagree to strongly agree)
- Use **yes_no_check** for binary true/false assessments
- Use **MCQ** for multiple-choice knowledge checks or categorical selections

All three types can coexist in the same content and follow similar patterns for data storage and user interaction.
