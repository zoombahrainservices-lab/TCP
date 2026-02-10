'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { submitAssessment, completeSectionBlock } from '@/app/actions/chapters'
import { showXPNotification } from '@/components/gamification/XPNotification'
import { writeQueue } from '@/lib/queue/WriteQueue'

export interface AssessmentQuestion {
  id: number
  question: string
  low: string
  high: string
}

export interface ScoreBandExplanation {
  range: string
  description: string
}

export interface SelfCheckAssessmentProps {
  chapterId: number
  /** e.g. "YOUR SELF-CHECK" */
  introTitle: string
  /** e.g. "Why This Baseline Matters" */
  introSubtitle: string
  /** Intro body: paragraphs and callout (same style as Chapter 1) */
  introBody: React.ReactNode
  questions: AssessmentQuestion[]
  getScoreBand: (score: number) => { band: string; color: string; message: string }
  maxScore: number
  /** e.g. "/read/chapter-1/framework" or "/read/genius-who-couldnt-speak/framework" */
  nextStepUrl: string
  /** e.g. "Continue to Framework →" */
  nextStepLabel: string
  /** "Score Bands Explained" section entries */
  scoreBandsExplained: ScoreBandExplanation[]
  /** e.g. "Chapter 1 Self-Check" or "Chapter 2 Self-Check" */
  questionsStepTitle: string
  questionsStepSubtitle: string
}

const QUESTIONS_PER_PAGE = 3

export default function SelfCheckAssessment({
  chapterId,
  introTitle,
  introSubtitle,
  introBody,
  questions,
  getScoreBand,
  maxScore,
  nextStepUrl,
  nextStepLabel,
  scoreBandsExplained,
  questionsStepTitle,
  questionsStepSubtitle,
}: SelfCheckAssessmentProps) {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'questions' | 'results'>('intro')
  const [questionPage, setQuestionPage] = useState(0)
  const [responses, setResponses] = useState<Record<number, number>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  // Prefetch next route for instant navigation
  useEffect(() => {
    if (step === 'results') {
      router.prefetch(nextStepUrl)
    }
  }, [step, router, nextStepUrl])

  const totalQuestionPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE)
  const currentQuestions = questions.slice(
    questionPage * QUESTIONS_PER_PAGE,
    questionPage * QUESTIONS_PER_PAGE + QUESTIONS_PER_PAGE
  )

  const handleSliderChange = (questionId: number, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
  }

  const allQuestionsAnswered = questions.every(q => responses[q.id] !== undefined)
  const totalScore = Object.values(responses).reduce((sum, val) => sum + val, 0)
  const scoreBand = getScoreBand(totalScore)

  const handleCompleteAssessment = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    
    // Navigate IMMEDIATELY - don't wait for DB operations
    router.push(nextStepUrl)
    
    // Complete all DB operations via write queue (with automatic retry)
    writeQueue.enqueue(() => submitAssessment(chapterId, 'baseline', responses, totalScore))
    
    writeQueue.enqueue(async () => {
      const sectionResult = await completeSectionBlock(chapterId, 'assessment')
      
      if (sectionResult && sectionResult.success) {
        const xp = (sectionResult as { xpResult?: { xpAwarded?: number }; reasonCode?: string }).xpResult?.xpAwarded ?? 0
        const reasonCode = (sectionResult as { reasonCode?: string }).reasonCode
        if (xp > 0) {
          showXPNotification(xp, 'Self-Check Complete!', { reasonCode: reasonCode as any })
        } else if (reasonCode === 'repeat_completion') {
          showXPNotification(0, '', { reasonCode: 'repeat_completion' })
        }
      }
    })
    
    setIsProcessing(false)
  }

  const cardsScrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (step !== 'questions') return
    cardsScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [questionPage, step])

  return (
    <div className={`bg-[var(--color-offwhite)] dark:bg-[#142A4A] flex ${step === 'questions' ? 'h-full min-h-0 overflow-hidden' : 'min-h-screen'}`}>
      <main className={`flex-1 max-w-4xl mx-auto w-full ${step === 'questions' ? 'h-full min-h-0 overflow-hidden flex flex-col py-4 px-6' : 'p-12'}`}>
        {/* Intro Step - same style as Chapter 1 */}
        {step === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-[var(--color-charcoal)] dark:text-white mb-4">
                {introTitle}
              </h1>
              <p className="text-xl text-[var(--color-gray)] dark:text-gray-400">
                {introSubtitle}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 space-y-6">
              {introBody}
            </div>

            <button
              onClick={() => {
                setStep('questions')
                setQuestionPage(0)
              }}
              className="w-full py-4 px-6 bg-[#f7b418] text-[var(--color-charcoal)] rounded-xl font-bold text-lg hover:bg-[#e5a616] transition shadow-md"
            >
              Start Self-Check →
            </button>
          </motion.div>
        )}

        {/* Questions Step - same style as Chapter 1 */}
        {step === 'questions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 flex-1 min-h-0 flex flex-col overflow-hidden"
          >
            <div className="flex-shrink-0">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-charcoal)] dark:text-white mb-1">
                {questionsStepTitle}
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-gray)] dark:text-gray-400">
                {questionsStepSubtitle}
              </p>
            </div>

            <div className="flex items-center justify-between flex-shrink-0">
              <p className="text-xs sm:text-sm text-[var(--color-gray)] dark:text-gray-400">
                Questions {questionPage * QUESTIONS_PER_PAGE + 1}–{Math.min(questionPage * QUESTIONS_PER_PAGE + QUESTIONS_PER_PAGE, questions.length)} of {questions.length}
              </p>
              <div className="flex gap-1">
                {Array.from({ length: totalQuestionPages }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === questionPage ? 'w-5 bg-[#f7b418]' : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div
              ref={cardsScrollRef}
              className="space-y-3.5 flex-1 min-h-0 overflow-hidden overflow-x-hidden"
            >
              {currentQuestions.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0"
                >
                  <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#f7b418] text-[var(--color-charcoal)] flex items-center justify-center font-black text-sm flex-shrink-0">
                      {q.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-[var(--color-charcoal)] dark:text-white leading-tight">
                        {q.question}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-[var(--color-gray)] dark:text-gray-400">
                        1 = {q.low} · 7 = {q.high}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="px-0.5">
                      <input
                        type="range"
                        min="1"
                        max="7"
                        value={responses[q.id] ?? 4}
                        onChange={(e) => handleSliderChange(q.id, parseInt(e.target.value))}
                        className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider slider-compact"
                        style={{
                          background: responses[q.id] !== undefined
                            ? `linear-gradient(to right, #f7b418 0%, #f7b418 ${((responses[q.id] - 1) / 6) * 100}%, #e5e7eb ${((responses[q.id] - 1) / 6) * 100}%, #e5e7eb 100%)`
                            : undefined
                        }}
                      />
                      <div className="flex justify-between mt-1.5 text-xs sm:text-sm font-bold">
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                          <span
                            key={num}
                            className={responses[q.id] === num ? 'text-[#f7b418]' : 'text-gray-400 dark:text-gray-500'}
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 flex-shrink-0">
              <button
                onClick={() => questionPage === 0 ? setStep('intro') : setQuestionPage(questionPage - 1)}
                className="py-3.5 px-6 bg-gray-200 dark:bg-gray-700 text-[var(--color-charcoal)] dark:text-white rounded-xl font-bold text-base hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                ← {questionPage === 0 ? 'Back' : 'Previous'}
              </button>
              {questionPage < totalQuestionPages - 1 ? (
                <button
                  onClick={() => setQuestionPage(questionPage + 1)}
                  className="flex-1 py-3.5 px-6 bg-[#f7b418] text-[var(--color-charcoal)] rounded-xl font-bold text-base hover:bg-[#e5a616] transition"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => setStep('results')}
                  disabled={!allQuestionsAnswered}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-base transition ${
                    allQuestionsAnswered
                      ? 'bg-[#f7b418] text-[var(--color-charcoal)] hover:bg-[#e5a616]'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  See My Results →
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Results Step - same style as Chapter 1 */}
        {step === 'results' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-5xl font-black text-[var(--color-charcoal)] dark:text-white mb-4">
                Your Baseline Score
              </h1>
              <p className="text-xl text-[var(--color-gray)] dark:text-gray-400">
                This is your starting point—not your ending point.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center border border-gray-200 dark:border-gray-700">
              <div className="mb-6">
                <div className="text-7xl font-black text-[var(--color-charcoal)] dark:text-white mb-2">
                  {totalScore}
                </div>
                <div className="text-sm text-[var(--color-gray)] dark:text-gray-400">
                  out of {maxScore}
                </div>
              </div>
              <div
                className="inline-block px-8 py-4 rounded-full text-white font-black text-2xl"
                style={{ backgroundColor: scoreBand.color }}
              >
                {scoreBand.band}
              </div>
              <p className="text-lg text-[var(--color-charcoal)] dark:text-gray-200 mt-6 leading-relaxed">
                {scoreBand.message}
              </p>
            </div>

            <div className="bg-[#f7b418]/10 dark:bg-[#f7b418]/20 p-8 rounded-xl space-y-4 border border-[#f7b418]/30">
              <h3 className="text-2xl font-black text-[var(--color-charcoal)] dark:text-white">
                Score Bands Explained
              </h3>
              <div className="space-y-3">
                {scoreBandsExplained.map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-20 text-sm font-bold text-[var(--color-charcoal)] dark:text-white">{row.range}</div>
                    <div className="flex-1 text-[var(--color-gray)] dark:text-gray-300">{row.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCompleteAssessment}
                disabled={isProcessing}
                className="py-4 px-8 bg-[#ff6a38] text-white rounded-xl font-bold text-lg hover:bg-[#ff5a28] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Saving...' : nextStepLabel}
              </button>
            </div>
          </motion.div>
        )}
      </main>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f7b418;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f7b418;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .slider-compact::-webkit-slider-thumb {
          width: 18px;
          height: 18px;
          border-width: 2px;
        }
        .slider-compact::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-width: 2px;
        }
      `}</style>
    </div>
  )
}
