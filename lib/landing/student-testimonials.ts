/**
 * Real student testimonials only — name + age as provided by the student/guardian.
 * Leave empty until you have permission to publish. When populated, WhatStudentsSaySection
 * will render cards automatically.
 */
export type StudentTestimonial = {
  quote: string
  /** e.g. "Maya" or "Maya K." — only what you're allowed to show */
  firstName: string
  age: number
}

export const STUDENT_TESTIMONIALS: StudentTestimonial[] = [
  {
    quote:
      'I used to overthink every message before sending it. TCP helped me slow down and say what I actually meant.',
    firstName: 'Maya',
    age: 15,
  },
  {
    quote:
      'Before TCP, I either said too much or just stayed quiet. Now I know how to explain myself better.',
    firstName: 'Adam',
    age: 14,
  },
  {
    quote: 'It feels different from normal advice because it gives steps I can actually use.',
    firstName: 'Lina',
    age: 16,
  },
]

/**
 * Verified metrics only. Leave empty until you have real numbers.
 * Example shape when ready: { label: 'students joined', value: '200+' }
 */
export type SocialStat = {
  value: string
  label: string
}

export const SOCIAL_STATS: SocialStat[] = []
