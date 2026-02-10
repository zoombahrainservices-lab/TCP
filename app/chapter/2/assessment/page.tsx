'use client'

import SelfCheckAssessment, { type AssessmentQuestion, type ScoreBandExplanation } from '@/components/assessment/SelfCheckAssessment'

const CHAPTER_ID = 2
const questions: AssessmentQuestion[] = [
  { id: 1, question: 'I avoid speaking situations when possible', low: 'Rarely', high: 'Always' },
  { id: 2, question: 'My mind goes blank when speaking', low: 'Never', high: 'Every time' },
  { id: 3, question: 'Physical symptoms (shaking/racing heart) overwhelm me', low: 'Manageable', high: 'Paralyzing' },
  { id: 4, question: 'I catastrophize what could go wrong', low: 'Rarely', high: 'Constantly' },
]
const MAX_SCORE = questions.length * 7 // 28

function getScoreBand(score: number): { band: string; color: string; message: string } {
  if (score >= 12) return {
    band: "You're where Tony started",
    color: '#dc2626',
    message: 'VOICE framework will help the most here.',
  }
  if (score >= 8) return {
    band: 'Moderate anxiety',
    color: '#f7b418',
    message: 'Focus on Techniques #1 and #3.',
  }
  if (score >= 4) return {
    band: "You're managing it",
    color: '#16a34a',
    message: 'Keep building experience and reps.',
  }
  return {
    band: 'Low anxiety',
    color: '#0073ba',
    message: "You're doing well. Keep practicing to stay confident.",
  }
}

const scoreBandsExplained: ScoreBandExplanation[] = [
  { range: '12–28', description: "You're where Tony started. VOICE framework will help the most." },
  { range: '8–11', description: 'Moderate anxiety. Focus on Techniques #1 and #3.' },
  { range: '4–7', description: "You're managing it. Keep building experience." },
  { range: '1–3', description: 'Low anxiety. Keep practicing to stay confident.' },
]

export default function Chapter2AssessmentPage() {
  return (
    <SelfCheckAssessment
      chapterId={CHAPTER_ID}
      introTitle="YOUR SELF-CHECK"
      introSubtitle="How intense is your speaking anxiety right now?"
      introBody={
        <>
          <p className="text-lg text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
            Before Tony could use VOICE and the techniques, he needed an honest snapshot of where he stood. Not where he wished he was—where he actually was.
          </p>
          <p className="text-lg text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
            This isn&apos;t a judgment. It&apos;s a baseline. Be honest—only you see this. The more accurate you are now, the better your plan will be.
          </p>
          <div className="bg-[#f7b418]/10 dark:bg-[#f7b418]/20 p-6 rounded-lg border border-[#f7b418]/30">
            <p className="text-[var(--color-charcoal)] dark:text-white font-bold">
              You&apos;ll rate {questions.length} statements from 1 to 7.
            </p>
            <p className="text-[var(--color-gray)] dark:text-gray-300 mt-2">
              Takes about a minute. Your score shows which zone you&apos;re in and what to focus on.
            </p>
          </div>
        </>
      }
      questions={questions}
      getScoreBand={getScoreBand}
      maxScore={MAX_SCORE}
      nextStepUrl="/read/genius-who-couldnt-speak/framework"
      nextStepLabel="Continue to Framework →"
      scoreBandsExplained={scoreBandsExplained}
      questionsStepTitle="Chapter 2 Self-Check"
      questionsStepSubtitle="Rate each statement from 1 to 7. Be honest—only you see this."
    />
  )
}
