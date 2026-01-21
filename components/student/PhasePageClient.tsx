'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  startPhase,
  savePhaseResponses,
  acknowledgeTask,
  uploadPhaseProof,
  saveReflection,
  completePhase,
  getNextPhase,
  type PhaseType
} from '@/app/actions/phases'
import { getStudentXP } from '@/app/actions/xp'
import { XP_CONFIG } from '@/config/xp'
import PhaseIcon, { getPhaseLabel } from '@/components/student/PhaseIcon'
import SelfCheckScale from '@/components/student/SelfCheckScale'
import ChapterReader from '@/components/student/ChapterReader'
import ReflectionInput from '@/components/student/ReflectionInput'
import UploadForm from '@/components/student/UploadForm'
import LevelUpCelebration from '@/components/student/LevelUpCelebration'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

type Step = 'overview' | 'content' | 'action' | 'complete'

interface PhasePageClientProps {
  chapter: any
  phase: any
  progress: any | null
  userId: string
  chapterId: number
  phaseType: PhaseType
  initialStep: Step
  initialProgressId: number | null
}

export default function PhasePageClient({
  chapter,
  phase,
  progress: initialProgress,
  userId,
  chapterId,
  phaseType,
  initialStep,
  initialProgressId: initialProgressIdProp,
}: PhasePageClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(initialStep)
  const [error, setError] = useState('')
  const [progressId, setProgressId] = useState<number | null>(initialProgressIdProp)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [reflection, setReflection] = useState('')
  const [uploaded, setUploaded] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number; totalXP: number } | null>(null)
  const [xpEarned, setXpEarned] = useState<number>(0)
  const [xpBonuses, setXpBonuses] = useState<{ chapter?: number; zone?: number; perfect?: number } | null>(null)
  const [nextChallenge, setNextChallenge] = useState<{ chapterId: number; phaseType: PhaseType } | null>(null)
  const [xpData, setXpData] = useState<{ level: number; xp: number; nextLevelXp: number } | null>(null)
  
  // Load XP data on mount for overview display
  useEffect(() => {
    getStudentXP(userId).then(data => {
      setXpData({
        level: data.level,
        xp: data.xp,
        nextLevelXp: data.levelProgress.nextLevelXp
      })
    })
  }, [userId])

  const handleStartPhase = async () => {
    if (!phase) return

    try {
      const result = await startPhase(userId, phase.id)
      if (result.success && result.progressId) {
        setProgressId(result.progressId)
        setStep('content')
      } else {
        setError(result.error || 'Failed to start phase')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSaveResponses = async () => {
    if (!progressId || !phase) return

    const questions = phase.metadata?.questions || []
    const allAnswered = questions.every((q: any) => responses[q.id])

    if (!allAnswered) {
      setError('Please answer all questions')
      return
    }

    try {
      const answers = questions.map((q: any) => ({
        questionId: q.id,
        question: q.question,
        answer: responses[q.id]
      }))

      await savePhaseResponses(progressId, { answers })
      
      // For power-scan, complete the phase immediately after saving responses
      // Other phases may have additional steps (like field-mission uploads)
      if (phaseType === 'power-scan') {
        // Get current XP/level before completion
        const currentXP = await getStudentXP(userId)
        const oldLevel = currentXP.level

        const result = await completePhase(progressId)
        
        // Store XP earned - always set, even if 0 (means already awarded)
        if (result.xpResult) {
          // Use totalXP from result, or calculate from base + bonuses
          const totalXP = result.xpResult.totalXP || 
            (XP_CONFIG.XP_PER_PHASE + 
             (result.xpResult.bonuses?.chapter || 0) +
             (result.xpResult.bonuses?.zone || 0) +
             (result.xpResult.bonuses?.perfect || 0))
          setXpEarned(totalXP)
          setXpBonuses(result.xpResult.bonuses || null)
        } else {
          // Fallback: if no xpResult, assume base XP was earned
          setXpEarned(XP_CONFIG.XP_PER_PHASE)
        }
        
        // Check for level up
        if (result.xpResult?.leveledUp) {
          setLevelUpData({
            oldLevel: result.xpResult.oldLevel || oldLevel,
            newLevel: result.xpResult.newLevel,
            totalXP: result.xpResult.totalXP || XP_CONFIG.XP_PER_PHASE,
          })
          setShowLevelUp(true)
        }
        
        // Get next challenge
        const next = await getNextPhase(userId, phase.id)
        setNextChallenge(next)
        
        setStep('complete')
      } else {
        // For other phases, go to action step (e.g., field-mission uploads)
        setStep('action')
      }
      setError('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleAcknowledgeTask = async () => {
    if (!progressId || !phase) return

    try {
      const deadlineHours = phase.metadata?.task_deadline_hours || 24
      await acknowledgeTask(progressId, deadlineHours)
      setStep('action')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpload = async (type: 'audio' | 'image' | 'text', fileOrText: File | string) => {
    if (!progressId) return

    try {
      await uploadPhaseProof(progressId, userId, type, fileOrText)
      setUploaded(true)
      
      // Complete the phase after upload
      const currentXP = await getStudentXP(userId)
      const oldLevel = currentXP.level
      
      const result = await completePhase(progressId)
      
      // Store XP earned
      if (result.xpResult) {
        const totalXP = result.xpResult.totalXP > 0 
          ? result.xpResult.totalXP 
          : (XP_CONFIG.XP_PER_PHASE + 
             (result.xpResult.bonuses?.chapter || 0) +
             (result.xpResult.bonuses?.zone || 0) +
             (result.xpResult.bonuses?.perfect || 0))
        setXpEarned(totalXP)
        setXpBonuses(result.xpResult.bonuses || null)
      } else {
        setXpEarned(XP_CONFIG.XP_PER_PHASE)
      }
      
      // Check for level up
      if (result.xpResult?.leveledUp) {
        setLevelUpData({
          oldLevel: result.xpResult.oldLevel || oldLevel,
          newLevel: result.xpResult.newLevel,
          totalXP: result.xpResult.totalXP || XP_CONFIG.XP_PER_PHASE,
        })
        setShowLevelUp(true)
      }
      
      // Get next challenge
      const next = await getNextPhase(userId, phase.id)
      setNextChallenge(next)
      
      setStep('complete')
    } catch (err: any) {
      throw new Error('Upload failed')
    }
  }

  const handleSaveReflectionAndComplete = async () => {
    if (!progressId) return

    if (reflection.length < 50) {
      setError('Please write a reflection (at least 50 characters)')
      return
    }

    try {
      // Get current XP/level before completion
      const currentXP = await getStudentXP(userId)
      const oldLevel = currentXP.level

      await saveReflection(progressId, reflection)
      const result = await completePhase(progressId)
      
      // Store XP earned - use totalXP from result, or fallback to base XP
      if (result.xpResult) {
        // If totalXP is 0, it means XP was already awarded (idempotent), but we still show base XP
        const totalXP = result.xpResult.totalXP > 0 
          ? result.xpResult.totalXP 
          : (XP_CONFIG.XP_PER_PHASE + 
             (result.xpResult.bonuses?.chapter || 0) +
             (result.xpResult.bonuses?.zone || 0) +
             (result.xpResult.bonuses?.perfect || 0))
        setXpEarned(totalXP)
        setXpBonuses(result.xpResult.bonuses || null)
      } else {
        // Fallback: if no xpResult, assume base XP was earned
        setXpEarned(XP_CONFIG.XP_PER_PHASE)
      }
      
      // Check for level up
      if (result.xpResult?.leveledUp) {
        setLevelUpData({
          oldLevel: result.xpResult.oldLevel || oldLevel,
          newLevel: result.xpResult.newLevel,
          totalXP: result.xpResult.totalXP || XP_CONFIG.XP_PER_PHASE,
        })
        setShowLevelUp(true)
      }
      
      // Get next challenge
      const next = await getNextPhase(userId, phase.id)
      setNextChallenge(next)
      
      setStep('complete')
      setError('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCompletePhase = async () => {
    if (!progressId) return

    try {
      // Get current XP/level before completion
      const currentXP = await getStudentXP(userId)
      const oldLevel = currentXP.level

      const result = await completePhase(progressId)
      
      // Store XP earned - use totalXP from result, or fallback to base XP
      if (result.xpResult) {
        // If totalXP is 0, it means XP was already awarded (idempotent), but we still show base XP
        const totalXP = result.xpResult.totalXP > 0 
          ? result.xpResult.totalXP 
          : (XP_CONFIG.XP_PER_PHASE + 
             (result.xpResult.bonuses?.chapter || 0) +
             (result.xpResult.bonuses?.zone || 0) +
             (result.xpResult.bonuses?.perfect || 0))
        setXpEarned(totalXP)
        setXpBonuses(result.xpResult.bonuses || null)
      } else {
        // Fallback: if no xpResult, assume base XP was earned
        setXpEarned(XP_CONFIG.XP_PER_PHASE)
      }
      
      // Check for level up
      if (result.xpResult?.leveledUp) {
        setLevelUpData({
          oldLevel: result.xpResult.oldLevel || oldLevel,
          newLevel: result.xpResult.newLevel,
          totalXP: result.xpResult.totalXP || XP_CONFIG.XP_PER_PHASE,
        })
        setShowLevelUp(true)
      }
      
      // Get next challenge
      const next = await getNextPhase(userId, phase.id)
      setNextChallenge(next)
      
      setStep('complete')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <>
      {/* Level Up Celebration */}
      {showLevelUp && levelUpData && (
        <LevelUpCelebration
          open={showLevelUp}
          oldLevel={levelUpData.oldLevel}
          newLevel={levelUpData.newLevel}
          totalXP={levelUpData.totalXP}
          onClose={() => setShowLevelUp(false)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Zone {chapter.zone.zone_number} • Mission {chapter.chapter_number}
            </span>
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <PhaseIcon phase={phaseType} size="sm" />
              {getPhaseLabel(phaseType)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[var(--color-blue)] h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${
                  step === 'overview' ? 25 :
                  step === 'content' ? 50 :
                  step === 'action' ? 75 :
                  100
                }%` 
              }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step: Overview - Redesigned with gamified UI */}
        {step === 'overview' && (
          <div className="space-y-10">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500">
              Zone {chapter.zone.zone_number} • Mission {chapter.chapter_number}
            </div>

            {/* Title with Icon */}
            <div className="flex items-center gap-3">
              <PhaseIcon phase={phaseType} size="lg" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {phase.title || getPhaseLabel(phaseType)}
              </h1>
            </div>

            {/* XP / Level Indicator */}
            {xpData && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase text-gray-600 font-semibold mb-1">Agent Level</div>
                    <div className="text-2xl font-bold text-gray-900">Level {xpData.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase text-gray-600 font-semibold mb-1">XP Progress</div>
                    <div className="text-lg font-bold text-blue-600">{xpData.xp} / {xpData.nextLevelXp} XP</div>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((xpData.xp / xpData.nextLevelXp) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Mission Brief Card */}
            <Card className="bg-white">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">Mission Brief</h2>
                {phase.content ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {phase.content}
                  </p>
                ) : phaseType === 'power-scan' ? (
                  <p className="text-gray-700 leading-relaxed">
                    Ready to scan your current power levels for this mission?
                    Be honest — this is just data. No judgment.
                  </p>
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    Complete this challenge to progress in your mission.
                  </p>
                )}
              </div>
            </Card>

            {/* Power Meter (for power-scan) */}
            {phaseType === 'power-scan' && (() => {
              const powerMeter = phase.metadata?.powerMeter || {
                '1': '⚡ Glitching (struggling hard)',
                '2': '🔋 Low Battery (need serious help)',
                '3': '⚙️ Powering Up (working on it)',
                '4': '🔥 High Performance (pretty strong)',
                '5': '💎 Maximum Power (absolute mastery)'
              }

              return (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase text-gray-600">
                    Power Meter (1–5)
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {Object.entries(powerMeter).map(([value, label]) => (
                      <div 
                        key={value}
                        className="border-2 border-gray-200 rounded-lg p-3 text-center hover:bg-gray-50 hover:border-blue-300 transition-all cursor-pointer"
                      >
                        <div className="text-2xl mb-1">{String(label).split(' ')[0]}</div>
                        <div className="font-bold text-lg text-gray-900">{value}</div>
                        <div className="text-xs text-gray-600 mt-1">{String(label).substring(String(label).indexOf(' ') + 1)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Questions Preview (for power-scan) */}
            {phaseType === 'power-scan' && (() => {
              const questions = phase.metadata?.questions && phase.metadata.questions.length > 0
                ? phase.metadata.questions
                : []

              if (questions.length === 0) return null

              return (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase text-gray-600">
                    Mission Questions
                  </h3>
                  {questions.slice(0, 3).map((q: any, i: number) => (
                    <div key={q.id || i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <div className="flex gap-2">
                        <span className="text-blue-500 font-semibold">{i + 1}.</span>
                        <p className="text-gray-800">{q.question}</p>
                      </div>
                    </div>
                  ))}
                  {questions.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{questions.length - 3} more questions...
                    </p>
                  )}
                </div>
              )
            })()}

            {/* CTA Button */}
            <div className="pt-4">
              <Button 
                size="lg" 
                onClick={handleStartPhase}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold shadow-lg text-lg py-4"
              >
                Begin {getPhaseLabel(phaseType)}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Content */}
        {step === 'content' && (
          <>
            {/* Power Scan - Before Assessment */}
            {phaseType === 'power-scan' && (() => {
              // Default questions if metadata is missing
              const defaultQuestions = [
                { id: 'q1', question: 'How confident do you feel in your communication skills?', scale: '1=not confident, 5=very confident' },
                { id: 'q2', question: 'How often do you practice communication skills?', scale: '1=rarely, 5=daily' },
                { id: 'q3', question: 'How comfortable are you speaking in front of others?', scale: '1=very uncomfortable, 5=very comfortable' },
                { id: 'q4', question: 'How well do you listen to others?', scale: '1=poorly, 5=excellently' },
                { id: 'q5', question: 'How aware are you of your body language?', scale: '1=not aware, 5=very aware' },
              ]
              
              const questions = phase.metadata?.questions && phase.metadata.questions.length > 0
                ? phase.metadata.questions
                : defaultQuestions

              // Get power meter info from metadata
              const powerMeter = phase.metadata?.powerMeter || {
                '1': '⚡ Glitching (struggling hard)',
                '2': '🔋 Low Battery (need serious help)',
                '3': '⚙️ Powering Up (working on it)',
                '4': '🔥 High Performance (pretty strong)',
                '5': '💎 Maximum Power (absolute mastery)'
              }

              return (
                <Card>
                  <div className="flex items-center gap-3 mb-4">
                    <PhaseIcon phase="power-scan" size="lg" />
                    <h2 className="headline-lg text-[var(--color-charcoal)]">
                      {phase.title || getPhaseLabel('power-scan')}
                    </h2>
                  </div>
                  
                  {/* Show phase content if available */}
                  {phase.content && (
                    <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <div className="text-gray-700 whitespace-pre-wrap text-sm">
                        {phase.content}
                      </div>
                    </div>
                  )}

                  <p className="text-[var(--color-gray)] mb-6">
                    Rate yourself honestly using the Power Meter (1-5):
                  </p>
                  
                  {/* Power Meter Legend */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Power Meter:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                      {Object.entries(powerMeter).map(([value, label]) => (
                        <div key={value}>
                          <strong>{value}</strong> = {String(label)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {questions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No questions available for this phase yet.</p>
                      <Button variant="secondary" onClick={() => router.back()}>
                        ← Back
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-6 mb-8">
                        {questions.map((q: any) => (
                          <SelfCheckScale
                            key={q.id}
                            questionId={q.id}
                            question={q.question}
                            value={responses[q.id] || 0}
                            onChange={(value) => setResponses({ ...responses, [q.id]: value })}
                            maxValue={5}
                            scaleLabel={q.scale}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between">
                        <Button variant="secondary" onClick={() => router.back()}>
                          ← Back
                        </Button>
                        <Button onClick={handleSaveResponses}>Continue →</Button>
                      </div>
                    </>
                  )}
                </Card>
              )
            })()}

            {/* Secret Intel - Reading/Learning */}
            {phaseType === 'secret-intel' && (
              <ChapterReader
                content={chapter.content}
                chunks={phase.metadata?.chunks}
                dayNumber={chapter.legacy_day_number || chapter.chapter_number}
                title={chapter.title}
                onNext={() => handleCompletePhase()}
                onBack={() => router.back()}
              />
            )}

            {/* Visual Guide - Images/Videos */}
            {phaseType === 'visual-guide' && (
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <PhaseIcon phase="visual-guide" size="lg" />
                  <h2 className="headline-lg text-[var(--color-charcoal)]">
                    {getPhaseLabel('visual-guide')}
                  </h2>
                </div>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-gray-600 mb-6">
                    Visual content for this mission will be added soon.
                  </p>
                  <Button onClick={handleCompletePhase}>Continue →</Button>
                </div>
              </Card>
            )}

            {/* Field Mission - Task */}
            {phaseType === 'field-mission' && (
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <PhaseIcon phase="field-mission" size="lg" />
                  <h2 className="headline-lg text-[var(--color-charcoal)]">
                    {getPhaseLabel('field-mission')}
                  </h2>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {phase.content}
                  </div>
                </div>
                <Button fullWidth onClick={handleAcknowledgeTask}>
                  I Understand - Continue to Upload
                </Button>
              </Card>
            )}

            {/* Level Up - After Assessment + Reflection */}
            {phaseType === 'level-up' && (
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <PhaseIcon phase="level-up" size="lg" />
                  <h2 className="headline-lg text-[var(--color-charcoal)]">
                    {getPhaseLabel('level-up')}
                  </h2>
                </div>
                <p className="text-[var(--color-gray)] mb-6">
                  Rate yourself again and reflect on your mission experience
                </p>
                <div className="space-y-6 mb-8">
                  {(phase.metadata?.questions || []).map((q: any) => (
                    <SelfCheckScale
                      key={q.id}
                      questionId={q.id}
                      question={q.question}
                      value={responses[q.id] || 0}
                      onChange={(value) => setResponses({ ...responses, [q.id]: value })}
                    />
                  ))}
                </div>
                <div className="mb-8">
                  <ReflectionInput
                    value={reflection}
                    onChange={setReflection}
                  />
                </div>
                <Button fullWidth onClick={handleSaveReflectionAndComplete}>
                  Complete Challenge
                </Button>
              </Card>
            )}
          </>
        )}

        {/* Step: Action (mainly for field-mission uploads) */}
        {step === 'action' && phaseType === 'field-mission' && (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Proof</h2>
            <UploadForm onUpload={handleUpload} />
          </Card>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <Card>
            <div className="text-center py-12">
              <PhaseIcon phase={phaseType} size="lg" />
              <h2 className="headline-xl text-[var(--color-charcoal)] mt-4 mb-2">
                Challenge Complete!
              </h2>
              <p className="text-xl text-gray-600 mb-4">
                Great work on completing {getPhaseLabel(phaseType)}!
              </p>
              
              {/* XP Earned Display - Always show XP information */}
              <div className="inline-block bg-gradient-to-r from-green-500 to-cyan-500 text-white px-6 py-3 rounded-full mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span className="text-xl font-bold">
                    {xpEarned > 0 ? `+${xpEarned} XP Earned!` : `+${XP_CONFIG.XP_PER_PHASE} XP (already awarded)`}
                  </span>
                </div>
              </div>

              {/* Bonus breakdown */}
              {xpEarned > 0 && xpBonuses && (xpBonuses.chapter || xpBonuses.zone || xpBonuses.perfect) && (
                <div className="mx-auto max-w-md text-left bg-white/70 border border-gray-200 rounded-2xl p-4 mb-6">
                  <div className="text-sm font-semibold text-gray-800 mb-2">Bonuses</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {xpBonuses.chapter ? <li>+{xpBonuses.chapter} XP for completing mission</li> : null}
                    {xpBonuses.zone ? <li>+{xpBonuses.zone} XP for mastering zone</li> : null}
                    {xpBonuses.perfect ? <li>+{xpBonuses.perfect} XP for perfect score</li> : null}
                  </ul>
                </div>
              )}
              
              <div className="flex flex-col gap-3 items-center mt-8">
                {/* Next Challenge Button - Primary CTA */}
                {nextChallenge ? (
                  <Button
                    size="lg"
                    onClick={() => router.push(`/student/chapter/${nextChallenge.chapterId}/${nextChallenge.phaseType}`)}
                    className="w-full max-w-md bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold shadow-lg"
                  >
                    🚀 Go to Next Challenge →
                  </Button>
                ) : (
                  <div className="text-gray-500 text-sm mb-2">
                    All challenges completed! 🎉
                  </div>
                )}
                
                {/* Secondary Actions */}
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/student/chapter/${chapterId}`)}
                  >
                    Back to Mission
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/student')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
