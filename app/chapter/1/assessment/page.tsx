'use client'

import SelfCheckAssessment, { type AssessmentQuestion, type ScoreBandExplanation } from '@/components/assessment/SelfCheckAssessment'

const CHAPTER_ID = 1
const questions: AssessmentQuestion[] = [
  { id: 1, question: 'How often I grab phone when working', low: 'Rarely', high: 'Constantly' },
  { id: 2, question: "Remember yesterday's scrolling", low: 'Yes', high: 'Barely' },
  { id: 3, question: 'Feel after phone session', low: 'Energized', high: 'Empty' },
  { id: 4, question: 'Time on passion this year', low: 'More', high: 'Abandoned' },
  { id: 5, question: 'Time before phone urge', low: '30+ min', high: 'Under 5' },
  { id: 6, question: 'Use phone to avoid feelings', low: 'Rarely', high: 'Always' },
  { id: 7, question: 'Phone vanished 24hrs', low: 'Relieved', high: 'Panicked' },
]
const MAX_SCORE = questions.length * 7 // 49

function getScoreBand(score: number): { band: string; color: string; message: string } {
  if (score <= 14) return {
    band: "You're Good",
    color: '#0073ba',
    message: "You have a healthy relationship with your phone. Keep it up!",
  }
  if (score <= 28) return {
    band: 'Danger Zone',
    color: '#ff6a38',
    message: "Start SPARK now. You're at risk of losing control over important things.",
  }
  if (score <= 42) return {
    band: "Tom's Starting Point",
    color: '#ff3d3d',
    message: 'Recovery is possible. Tom started here and made it back. So can you.',
  }
  return {
    band: 'Critical',
    color: '#8b0000',
    message: 'Talk to a school counselor or trusted adult. This is affecting your life significantly.',
  }
}

const scoreBandsExplained: ScoreBandExplanation[] = [
  { range: '7-14', description: "You're good. Keep doing what you're doing." },
  { range: '15-28', description: 'Danger zone—start SPARK now before it gets worse.' },
  { range: '29-42', description: "Tom's starting point—recovery is absolutely possible." },
  { range: '43-49', description: 'Talk to a school counselor or trusted adult.' },
]

export default function Chapter1AssessmentPage() {
  return (
    <SelfCheckAssessment
      chapterId={CHAPTER_ID}
      introTitle="YOUR SELF-CHECK"
      introSubtitle="Why This Baseline Matters"
      introBody={
        <>
          <p className="text-lg text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
            Before Tom could fix anything, he needed to know where he actually stood. Not where he thought he was. Where the data said he was.
          </p>
          <p className="text-lg text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
            This isn&apos;t a judgment. It&apos;s a snapshot. In 6 months, you&apos;ll take it again and see how far you&apos;ve come.
          </p>
          <p className="text-lg text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
            <strong>Be honest.</strong> Nobody sees this but you. The more accurate you are now, the better your recovery plan will be.
          </p>
          <div className="bg-[#f7b418]/10 dark:bg-[#f7b418]/20 p-6 rounded-lg border border-[#f7b418]/30">
            <p className="text-[var(--color-charcoal)] dark:text-white font-bold">
              You&apos;ll rate 7 statements from 1 to 7.
            </p>
            <p className="text-[var(--color-gray)] dark:text-gray-300 mt-2">
              Takes 2 minutes. Your score tells you which zone you&apos;re in.
            </p>
          </div>
        </>
      }
      questions={questions}
      getScoreBand={getScoreBand}
      maxScore={MAX_SCORE}
      nextStepUrl="/read/chapter-1/framework"
      nextStepLabel="Continue to Framework →"
      scoreBandsExplained={scoreBandsExplained}
      questionsStepTitle="Chapter 1 Self-Check"
      questionsStepSubtitle="Rate each statement from 1 to 7. Be honest—only you see this."
    />
  )
}
