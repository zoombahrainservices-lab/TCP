'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { submitAssessment, completeSectionBlock } from '@/app/actions/chapters'
import { showXPNotification } from '@/components/gamification/XPNotification'

interface AssessmentQuestion {
  id: number
  question: string
  low: string
  high: string
}

const questions: AssessmentQuestion[] = [
  { id: 1, question: 'How often I grab phone when working', low: 'Rarely', high: 'Constantly' },
  { id: 2, question: "Remember yesterday's scrolling", low: 'Yes', high: 'Barely' },
  { id: 3, question: 'Feel after phone session', low: 'Energized', high: 'Empty' },
  { id: 4, question: 'Time on passion this year', low: 'More', high: 'Abandoned' },
  { id: 5, question: 'Time before phone urge', low: '30+ min', high: 'Under 5' },
  { id: 6, question: 'Use phone to avoid feelings', low: 'Rarely', high: 'Always' },
  { id: 7, question: 'Phone vanished 24hrs', low: 'Relieved', high: 'Panicked' }
]

const milestones = [
  { id: 'reading', label: 'Reading', color: '#0073ba', status: 'completed' },
  { id: 'assessment', label: 'Self-Check', color: '#f7b418', status: 'current' },
  { id: 'framework', label: 'Framework', color: '#ff6a38', status: 'locked' },
  { id: 'techniques', label: 'Techniques', color: '#ff3d3d', status: 'locked' },
  { id: 'proof', label: 'Proof', color: '#673067', status: 'locked' },
  { id: 'follow-through', label: 'Follow-through', color: '#9ca3af', status: 'locked' }
]

const QUESTIONS_PER_PAGE = 3
const SHOW_CHAPTER_SIDEBAR = false // Hide Chapter 1 sidebar (Back, milestones, Progress) for now

export default function AssessmentPage() {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'questions' | 'results'>('intro')
  const [questionPage, setQuestionPage] = useState(0)
  const [responses, setResponses] = useState<Record<number, number>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const totalQuestionPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE)
  const currentQuestions = questions.slice(
    questionPage * QUESTIONS_PER_PAGE,
    questionPage * QUESTIONS_PER_PAGE + QUESTIONS_PER_PAGE
  )
  
  const handleSliderChange = (questionId: number, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
  }

  const handleCompleteAssessment = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    try {
      // Submit assessment to database
      const assessmentResult = await submitAssessment(
        1, // chapterId
        'baseline', // assessmentType
        responses,
        totalScore
      )
      
      console.log('[XP] Assessment submission result:', assessmentResult)
      
      // Complete assessment section
      const sectionResult = await completeSectionBlock(1, 'assessment')
      
      console.log('[XP] Assessment section completion result:', sectionResult)
      
      // Show XP notification (including "Already completed" feedback)
      if (sectionResult.success) {
        const xp = sectionResult.xpResult?.xpAwarded ?? 0
        if (xp > 0) {
          showXPNotification(xp, 'Self-Check Complete!', { reasonCode: sectionResult.reasonCode })
        } else if (sectionResult.reasonCode === 'repeat_completion') {
          showXPNotification(0, '', { reasonCode: 'repeat_completion' })
        }
      }
      
      // Navigate to framework
      router.push('/read/chapter-1/framework')
    } catch (error) {
      console.error('[XP] Error completing assessment:', error)
      // Still navigate even if XP fails
      router.push('/read/chapter-1/framework')
    } finally {
      setIsProcessing(false)
    }
  }

  const allQuestionsAnswered = questions.every(q => responses[q.id] !== undefined)
  const totalScore = Object.values(responses).reduce((sum, val) => sum + val, 0)

  const getScoreBand = (score: number) => {
    if (score <= 14) return {
      band: 'You\'re Good',
      color: '#0073ba',
      message: 'You have a healthy relationship with your phone. Keep it up!'
    }
    if (score <= 28) return {
      band: 'Danger Zone',
      color: '#ff6a38',
      message: 'Start SPARK now. You\'re at risk of losing control over important things.'
    }
    if (score <= 42) return {
      band: 'Tom\'s Starting Point',
      color: '#ff3d3d',
      message: 'Recovery is possible. Tom started here and made it back. So can you.'
    }
    return {
      band: 'Critical',
      color: '#8b0000',
      message: 'Talk to a school counselor or trusted adult. This is affecting your life significantly.'
    }
  }

  const scoreBand = getScoreBand(totalScore)
  const cardsScrollRef = useRef<HTMLDivElement>(null)

  // Reset scroll position when changing question page so scrollbar doesn't flash
  useEffect(() => {
    if (step !== 'questions') return
    cardsScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [questionPage, step])

  return (
    <div className={`bg-[var(--color-offwhite)] dark:bg-[#142A4A] flex ${step === 'questions' ? 'h-full min-h-0 overflow-hidden' : 'min-h-screen'}`}>
      {SHOW_CHAPTER_SIDEBAR && (
        <aside className="w-64 bg-white dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
          <div className="mb-8">
            <Link href="/chapter/1/reading" className="text-sm text-[var(--color-gray)] dark:text-gray-400 hover:text-[var(--color-charcoal)] dark:hover:text-white">
              ← Back to Chapter 1
            </Link>
            <h2 className="text-xl font-black text-[var(--color-charcoal)] dark:text-white mt-4">
              Chapter 1
            </h2>
            <p className="text-sm text-[var(--color-gray)] dark:text-gray-400 mt-1">
              From Stage Star to Silent Struggles
            </p>
          </div>

          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`p-3 rounded-lg border-l-4 transition ${
                  milestone.status === 'current'
                    ? 'bg-[#f7b418]/10 border-[#f7b418]'
                    : milestone.status === 'completed'
                    ? 'bg-[#0073ba]/10 border-[#0073ba]'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {milestone.status === 'completed' && (
                    <svg className="w-5 h-5 text-[#0073ba]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {milestone.status === 'current' && (
                    <div className="w-5 h-5 rounded-full border-2 border-[#f7b418] bg-[#f7b418]/20" />
                  )}
                  {milestone.status === 'locked' && (
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={`text-sm font-bold ${
                    milestone.status === 'locked' ? 'text-gray-400 dark:text-gray-500' : 'text-[var(--color-charcoal)] dark:text-white'
                  }`}>
                    {milestone.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-[#f7b418]/10 dark:bg-[#f7b418]/20 rounded-lg">
            <div className="text-xs text-[var(--color-gray)] dark:text-gray-400 mb-2">Progress</div>
            <div className="text-2xl font-black text-[var(--color-charcoal)] dark:text-white">
              Step 2 / 35
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#0073ba] transition-all"
                style={{ width: '5.7%' }}
              />
            </div>
          </div>
        </aside>
      )}

      {/* Main Content - when questions step: fill viewport, no scroll */}
      <main className={`flex-1 max-w-4xl mx-auto w-full ${step === 'questions' ? 'h-full min-h-0 overflow-hidden flex flex-col py-4 px-6' : 'p-12'}`}>
        {/* Intro Step */}
        {step === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-[var(--color-charcoal)] dark:text-white mb-4">
                YOUR SELF-CHECK
              </h1>
              <p className="text-xl text-[var(--color-gray)] dark:text-gray-400">
                Why This Baseline Matters
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 space-y-6">
              <p className="text-lg text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
                Before Tom could fix anything, he needed to know where he actually stood. Not where he thought he was. Where the data said he was.
              </p>
              <p className="text-lg text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
                This isn't a judgment. It's a snapshot. In 6 months, you'll take it again and see how far you've come.
              </p>
              <p className="text-lg text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
                <strong>Be honest.</strong> Nobody sees this but you. The more accurate you are now, the better your recovery plan will be.
              </p>

              <div className="bg-[#f7b418]/10 dark:bg-[#f7b418]/20 p-6 rounded-lg border border-[#f7b418]/30">
                <p className="text-[var(--color-charcoal)] dark:text-white font-bold">
                  You'll rate 7 statements from 1 to 7.
                </p>
                <p className="text-[var(--color-gray)] dark:text-gray-300 mt-2">
                  Takes 2 minutes. Your score tells you which zone you're in.
                </p>
              </div>
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

        {/* Questions Step - 3 cards + button fit on one screen (compact) */}
        {step === 'questions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 flex-1 min-h-0 flex flex-col overflow-hidden"
          >
            <div className="flex-shrink-0">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-charcoal)] dark:text-white mb-1">
                Chapter 1 Self-Check
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-gray)] dark:text-gray-400">
                Rate each statement from 1 to 7. Be honest—only you see this.
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

        {/* Results Step */}
        {step === 'results' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-5xl font-black text-[var(--color-charcoal)] mb-4">
                Your Baseline Score
              </h1>
              <p className="text-xl text-[var(--color-gray)]">
                This is your starting point—not your ending point.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl text-center">
              <div className="mb-6">
                <div className="text-7xl font-black text-[var(--color-charcoal)] mb-2">
                  {totalScore}
                </div>
                <div className="text-sm text-[var(--color-gray)]">
                  out of 49
                </div>
              </div>

              <div 
                className="inline-block px-8 py-4 rounded-full text-white font-black text-2xl"
                style={{ backgroundColor: scoreBand.color }}
              >
                {scoreBand.band}
              </div>

              <p className="text-lg text-[var(--color-charcoal)] mt-6 leading-relaxed">
                {scoreBand.message}
              </p>
            </div>

            <div className="bg-[#f7b418]/10 p-8 rounded-xl space-y-4">
              <h3 className="text-2xl font-black text-[var(--color-charcoal)]">
                Score Bands Explained
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 text-sm font-bold text-[var(--color-charcoal)]">7-14</div>
                  <div className="flex-1 text-[var(--color-gray)]">You're good. Keep doing what you're doing.</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 text-sm font-bold text-[var(--color-charcoal)]">15-28</div>
                  <div className="flex-1 text-[var(--color-gray)]">Danger zone—start SPARK now before it gets worse.</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 text-sm font-bold text-[var(--color-charcoal)]">29-42</div>
                  <div className="flex-1 text-[var(--color-gray)]">Tom's starting point—recovery is absolutely possible.</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 text-sm font-bold text-[var(--color-charcoal)]">43-49</div>
                  <div className="flex-1 text-[var(--color-gray)]">Talk to a school counselor or trusted adult.</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('questions')}
                className="py-4 px-6 bg-gray-200 text-[var(--color-charcoal)] rounded-xl font-bold text-lg hover:bg-gray-300 transition"
                disabled={isProcessing}
              >
                ← Retake
              </button>
              <button
                onClick={handleCompleteAssessment}
                disabled={isProcessing}
                className="flex-1 py-4 px-6 bg-[#ff6a38] text-white rounded-xl font-bold text-lg hover:bg-[#ff5a28] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Saving...' : 'Continue to Framework →'}
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
