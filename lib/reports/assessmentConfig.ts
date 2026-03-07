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

