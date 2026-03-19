// Shared assessment question configuration for chapter self-checks

export type AssessmentQuestionConfig = {
  id: number
  question: string
  low: string
  high: string
}

export type AssessmentConfig = {
  chapterTitle: string
  maxScore: number
  questions: AssessmentQuestionConfig[]
}

const ASSESSMENT_CONFIG: Record<number, AssessmentConfig> = {
  1: {
    chapterTitle: 'Chapter 1: From Stage Star to Silent Struggles',
    maxScore: 49,
    questions: [
      { id: 1, question: 'How often I grab phone when working', low: 'Rarely', high: 'Constantly' },
      { id: 2, question: "Remember yesterday's scrolling", low: 'Yes', high: 'Barely' },
      { id: 3, question: 'Feel after phone session', low: 'Energized', high: 'Empty' },
      { id: 4, question: 'Time on passion this year', low: 'More', high: 'Abandoned' },
      { id: 5, question: 'Time before phone urge', low: '30+ min', high: 'Under 5' },
      { id: 6, question: 'Use phone to avoid feelings', low: 'Rarely', high: 'Always' },
      { id: 7, question: 'Phone vanished 24hrs', low: 'Relieved', high: 'Panicked' },
    ],
  },
  2: {
    chapterTitle: "Chapter 2: The Genius Who Couldn't Speak",
    maxScore: 28,
    questions: [
      { id: 1, question: 'I avoid speaking situations when possible', low: 'Rarely', high: 'Always' },
      { id: 2, question: 'My mind goes blank when speaking', low: 'Never', high: 'Every time' },
      { id: 3, question: 'Physical symptoms (shaking/racing heart) overwhelm me', low: 'Manageable', high: 'Paralyzing' },
      { id: 4, question: 'I catastrophize what could go wrong', low: 'Rarely', high: 'Constantly' },
    ],
  },
  3: {
    chapterTitle: 'Chapter 3',
    maxScore: 28,
    questions: [
      { id: 1, question: 'Self-check question 1', low: 'Not at all', high: 'Completely' },
      { id: 2, question: 'Self-check question 2', low: 'Never', high: 'Always' },
      { id: 3, question: 'Self-check question 3', low: 'Rarely', high: 'Often' },
      { id: 4, question: 'Self-check question 4', low: 'Not at all', high: 'Completely' },
    ],
  },
  4: {
    chapterTitle: 'Chapter 4',
    maxScore: 28,
    questions: [
      { id: 1, question: 'Self-check question 1', low: 'Not at all', high: 'Completely' },
      { id: 2, question: 'Self-check question 2', low: 'Never', high: 'Always' },
      { id: 3, question: 'Self-check question 3', low: 'Rarely', high: 'Often' },
      { id: 4, question: 'Self-check question 4', low: 'Not at all', high: 'Completely' },
    ],
  },
  5: {
    chapterTitle: 'Chapter 5',
    maxScore: 28,
    questions: [
      { id: 1, question: 'Self-check question 1', low: 'Not at all', high: 'Completely' },
      { id: 2, question: 'Self-check question 2', low: 'Never', high: 'Always' },
      { id: 3, question: 'Self-check question 3', low: 'Rarely', high: 'Often' },
      { id: 4, question: 'Self-check question 4', low: 'Not at all', high: 'Completely' },
    ],
  },
  6: {
    chapterTitle: 'Chapter 6',
    maxScore: 28,
    questions: [
      { id: 1, question: 'Self-check question 1', low: 'Not at all', high: 'Completely' },
      { id: 2, question: 'Self-check question 2', low: 'Never', high: 'Always' },
      { id: 3, question: 'Self-check question 3', low: 'Rarely', high: 'Often' },
      { id: 4, question: 'Self-check question 4', low: 'Not at all', high: 'Completely' },
    ],
  },
  7: {
    chapterTitle: 'Chapter 7',
    maxScore: 28,
    questions: [
      { id: 1, question: 'Self-check question 1', low: 'Not at all', high: 'Completely' },
      { id: 2, question: 'Self-check question 2', low: 'Never', high: 'Always' },
      { id: 3, question: 'Self-check question 3', low: 'Rarely', high: 'Often' },
      { id: 4, question: 'Self-check question 4', low: 'Not at all', high: 'Completely' },
    ],
  },
  8: {
    chapterTitle: 'Chapter 8',
    maxScore: 28,
    questions: [
      { id: 1, question: 'Self-check question 1', low: 'Not at all', high: 'Completely' },
      { id: 2, question: 'Self-check question 2', low: 'Never', high: 'Always' },
      { id: 3, question: 'Self-check question 3', low: 'Rarely', high: 'Often' },
      { id: 4, question: 'Self-check question 4', low: 'Not at all', high: 'Completely' },
    ],
  },
}

export function getAssessmentConfig(chapterId: number, fallbackTitle: string): AssessmentConfig {
  const config = ASSESSMENT_CONFIG[chapterId]
  if (config) return config

  return {
    chapterTitle: fallbackTitle,
    maxScore: 0,
    questions: [],
  }
}

