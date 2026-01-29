'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface AssessmentQuestion {
  id: number
  question: string
  low: string
  high: string
}

const questions: AssessmentQuestion[] = [
  {
    id: 1,
    question: 'How often I grab phone when working',
    low: 'Rarely',
    high: 'Constantly'
  },
  {
    id: 2,
    question: 'Remember yesterday\'s scrolling',
    low: 'Yes, clearly',
    high: 'Barely remember'
  },
  {
    id: 3,
    question: 'Feel after phone session',
    low: 'Energized',
    high: 'Empty/drained'
  },
  {
    id: 4,
    question: 'Time on passion this year',
    low: 'More than before',
    high: 'Abandoned it'
  },
  {
    id: 5,
    question: 'Time before phone urge',
    low: '30+ minutes',
    high: 'Under 5 minutes'
  },
  {
    id: 6,
    question: 'Use phone to avoid feelings',
    low: 'Rarely',
    high: 'Always'
  },
  {
    id: 7,
    question: 'Phone vanished 24hrs',
    low: 'Relieved',
    high: 'Panicked'
  }
]

const milestones = [
  { id: 'reading', label: 'Reading', color: '#0073ba', status: 'completed' },
  { id: 'assessment', label: 'Self-Check', color: '#f7b418', status: 'current' },
  { id: 'framework', label: 'Framework', color: '#ff6a38', status: 'locked' },
  { id: 'techniques', label: 'Techniques', color: '#ff3d3d', status: 'locked' },
  { id: 'proof', label: 'Proof', color: '#673067', status: 'locked' },
  { id: 'follow-through', label: 'Follow-through', color: '#9ca3af', status: 'locked' }
]

export default function AssessmentPage() {
  const [step, setStep] = useState<'intro' | 'questions' | 'results'>('intro')
  const [responses, setResponses] = useState<Record<number, number>>({})
  
  const handleSliderChange = (questionId: number, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
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

  return (
    <div className="min-h-screen bg-[var(--color-offwhite)] flex">
      {/* Left Sidebar - Milestones */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex-shrink-0">
        <div className="mb-8">
          <Link href="/chapter/1" className="text-sm text-[var(--color-gray)] hover:text-[var(--color-charcoal)]">
            ← Back to Chapter 1
          </Link>
          <h2 className="text-xl font-black text-[var(--color-charcoal)] mt-4">
            Chapter 1
          </h2>
          <p className="text-sm text-[var(--color-gray)] mt-1">
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
                  milestone.status === 'locked' ? 'text-gray-400' : 'text-[var(--color-charcoal)]'
                }`}>
                  {milestone.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-[#f7b418]/10 rounded-lg">
          <div className="text-xs text-[var(--color-gray)] mb-2">Progress</div>
          <div className="text-2xl font-black text-[var(--color-charcoal)]">
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

      {/* Main Content */}
      <main className="flex-1 p-12 max-w-4xl mx-auto">
        {/* Intro Step */}
        {step === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-5xl font-black text-[var(--color-charcoal)] mb-4">
                YOUR SELF-CHECK
              </h1>
              <p className="text-xl text-[var(--color-gray)]">
                Why This Baseline Matters
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl space-y-6">
              <p className="text-lg text-[var(--color-charcoal)] leading-relaxed">
                Before Tom could fix anything, he needed to know where he actually stood. Not where he thought he was. Where the data said he was.
              </p>
              <p className="text-lg text-[var(--color-charcoal)] leading-relaxed">
                This isn't a judgment. It's a snapshot. In 6 months, you'll take it again and see how far you've come.
              </p>
              <p className="text-lg text-[var(--color-charcoal)] leading-relaxed">
                <strong>Be honest.</strong> Nobody sees this but you. The more accurate you are now, the better your recovery plan will be.
              </p>

              <div className="bg-[#f7b418]/10 p-6 rounded-lg">
                <p className="text-[var(--color-charcoal)] font-bold">
                  You'll rate 7 statements from 1 to 7.
                </p>
                <p className="text-[var(--color-gray)] mt-2">
                  Takes 2 minutes. Your score tells you which zone you're in.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('questions')}
              className="w-full py-4 px-6 bg-[#f7b418] text-white rounded-xl font-bold text-lg hover:bg-[#e5a616] transition"
            >
              Start Self-Check →
            </button>
          </motion.div>
        )}

        {/* Questions Step */}
        {step === 'questions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-5xl font-black text-[var(--color-charcoal)] mb-4">
                Rate Each Statement
              </h1>
              <p className="text-xl text-[var(--color-gray)]">
                1 = Left side • 7 = Right side
              </p>
            </div>

            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="bg-white p-6 rounded-xl">
                  <div className="mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f7b418] text-white flex items-center justify-center font-bold flex-shrink-0">
                        {q.id}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[var(--color-charcoal)] mb-3">
                          {q.question}
                        </h3>
                        <div className="flex justify-between text-sm text-[var(--color-gray)] mb-4">
                          <span>{q.low}</span>
                          <span>{q.high}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-2">
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={responses[q.id] || 4}
                      onChange={(e) => handleSliderChange(q.id, parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: responses[q.id] 
                          ? `linear-gradient(to right, #f7b418 0%, #f7b418 ${((responses[q.id] - 1) / 6) * 100}%, #e5e7eb ${((responses[q.id] - 1) / 6) * 100}%, #e5e7eb 100%)`
                          : '#e5e7eb'
                      }}
                    />
                    <div className="flex justify-between mt-2">
                      {[1, 2, 3, 4, 5, 6, 7].map(num => (
                        <span 
                          key={num} 
                          className={`text-sm font-bold ${
                            responses[q.id] === num ? 'text-[#f7b418]' : 'text-gray-400'
                          }`}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>

                  {responses[q.id] && (
                    <div className="mt-4 text-center">
                      <span className="text-2xl font-black text-[#f7b418]">
                        {responses[q.id]}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('intro')}
                className="py-4 px-6 bg-gray-200 text-[var(--color-charcoal)] rounded-xl font-bold text-lg hover:bg-gray-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('results')}
                disabled={!allQuestionsAnswered}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition ${
                  allQuestionsAnswered
                    ? 'bg-[#f7b418] text-white hover:bg-[#e5a616]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                See My Results →
              </button>
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
              >
                ← Retake
              </button>
              <Link
                href="/chapter/1/framework"
                className="flex-1 py-4 px-6 bg-[#ff6a38] text-white rounded-xl font-bold text-lg hover:bg-[#ff5a28] transition text-center"
              >
                Continue to Framework →
              </Link>
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
      `}</style>
    </div>
  )
}
