'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  getPhaseByType,
  getPhaseProgress,
  isPhaseUnlocked,
  startPhase,
  savePhaseResponses,
  acknowledgeTask,
  uploadPhaseProof,
  saveReflection,
  completePhase,
  type PhaseType
} from '@/app/actions/phases'
import { getChapter } from '@/app/actions/chapters'
import { getSession } from '@/app/actions/auth'
import { getStudentXP } from '@/app/actions/xp'
import PhaseIcon, { getPhaseLabel } from '@/components/student/PhaseIcon'
import SelfCheckScale from '@/components/student/SelfCheckScale'
import ChapterReader from '@/components/student/ChapterReader'
import ReflectionInput from '@/components/student/ReflectionInput'
import UploadForm from '@/components/student/UploadForm'
import LevelUpCelebration from '@/components/student/LevelUpCelebration'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type Step = 'overview' | 'content' | 'action' | 'complete'

export default function PhasePage() {
  const params = useParams()
  const router = useRouter()
  const chapterId = parseInt(params.chapterId as string)
  const phaseType = params.phaseType as PhaseType

  const [step, setStep] = useState<Step>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [userId, setUserId] = useState<string>('')
  const [chapter, setChapter] = useState<any>(null)
  const [phase, setPhase] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [progressId, setProgressId] = useState<number | null>(null)

  const [responses, setResponses] = useState<Record<string, number>>({})
  const [reflection, setReflection] = useState('')
  const [uploaded, setUploaded] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number; totalXP: number } | null>(null)
  const [xpEarned, setXpEarned] = useState<number>(0)
  const [xpBonuses, setXpBonuses] = useState<{ chapter?: number; zone?: number; perfect?: number } | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const session = await getSession()
        if (!session) {
          setError('Not authenticated')
          setLoading(false)
          return
        }

        setUserId(session.id)

        // Load chapter
        const chap = await getChapter(chapterId)
        if (!chap) {
          console.error('Chapter not found for chapterId:', chapterId)
          setError(`Chapter not found (ID: ${chapterId})`)
          setLoading(false)
          return
        }
        setChapter(chap)

        // Load phase
        console.log('Loading phase for chapterId:', chapterId, 'phaseType:', phaseType)
        const phaseData = await getPhaseByType(chapterId, phaseType)
        if (!phaseData) {
          console.error('Phase not found for chapterId:', chapterId, 'phaseType:', phaseType)
          setError(`Phase not found (Chapter: ${chapterId}, Type: ${phaseType})`)
          setLoading(false)
          return
        }
        console.log('Phase loaded:', phaseData)
        setPhase(phaseData)

        // Check if phase is unlocked
        const unlocked = await isPhaseUnlocked(session.id, phaseData.id)
        if (!unlocked) {
          setError('Phase is locked. Complete previous phases first.')
          setLoading(false)
          router.push(`/student/chapter/${chapterId}`)
          return
        }

        // Check existing progress
        const existingProgress = await getPhaseProgress(session.id, phaseData.id)
        if (existingProgress) {
          setProgress(existingProgress)
          setProgressId(existingProgress.id)

          // Determine step based on progress
          if (existingProgress.completed_at) {
            setStep('complete')
          } else if (phaseType === 'field-mission' && existingProgress.task_acknowledged_at && !uploaded) {
            setStep('action')
          } else if (phaseType === 'level-up' && existingProgress.reflection_text) {
            setStep('complete')
          } else if (Object.keys(existingProgress.responses || {}).length > 0) {
            setStep('action')
          }
        }

        setLoading(false)
      } catch (err: any) {
        setError(err.message || 'Failed to load phase')
        setLoading(false)
      }
    }

    loadData()
  }, [chapterId, phaseType, router])

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
      setStep('action')
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
      
      // Store XP earned
      if (result.xpResult) {
        setXpEarned(result.xpResult.totalXP)
        setXpBonuses(result.xpResult.bonuses || null)
      }
      
      // Check for level up
      if (result.xpResult?.leveledUp) {
        setLevelUpData({
          oldLevel: result.xpResult.oldLevel || oldLevel,
          newLevel: result.xpResult.newLevel,
          totalXP: result.xpResult.totalXP,
        })
        setShowLevelUp(true)
      }
      
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
      
      // Store XP earned
      if (result.xpResult) {
        setXpEarned(result.xpResult.totalXP)
        setXpBonuses(result.xpResult.bonuses || null)
      }
      
      // Check for level up
      if (result.xpResult?.leveledUp) {
        setLevelUpData({
          oldLevel: result.xpResult.oldLevel || oldLevel,
          newLevel: result.xpResult.newLevel,
          totalXP: result.xpResult.totalXP,
        })
        setShowLevelUp(true)
      }
      
      setStep('complete')
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error && !phase) {
    return (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-red-600 text-lg mb-4">{error}</div>
        <Button onClick={() => router.push(`/student/chapter/${chapterId}`)}>
          Back to Mission
        </Button>
      </div>
    )
  }

  if (!phase || !chapter) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-red-600 text-lg mb-4">
          {!phase ? 'Phase not found' : 'Chapter not found'}
        </div>
        <Button onClick={() => router.push(`/student/chapter/${chapterId}`)}>
          Back to Mission
        </Button>
      </div>
    )
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

      {/* Step: Overview */}
      {step === 'overview' && (
        <Card>
          <div className="text-center py-8">
            <PhaseIcon phase={phaseType} size="xl" />
            <h1 className="headline-xl mb-2 text-[var(--color-charcoal)] mt-4">
              {phase.title || getPhaseLabel(phaseType)}
            </h1>
            {phase.content && (
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                {phase.content}
              </p>
            )}
            {!phase.content && phaseType === 'power-scan' && (
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Before you begin this mission, let's assess your current communication skills. 
                You'll read the mission story and then answer a few questions about yourself.
              </p>
            )}
            <Button size="lg" onClick={handleStartPhase}>
              Begin {getPhaseLabel(phaseType)}
            </Button>
          </div>
        </Card>
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
                        <strong>{value}</strong> = {label}
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
            <PhaseIcon phase={phaseType} size="xl" completed />
            <h2 className="headline-xl text-[var(--color-charcoal)] mt-4 mb-2">
              Challenge Complete!
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              Great work on completing {getPhaseLabel(phaseType)}!
            </p>
            
            {/* XP Earned Display */}
            {xpEarned > 0 && (
              <div className="inline-block bg-gradient-to-r from-green-500 to-cyan-500 text-white px-6 py-3 rounded-full mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span className="text-xl font-bold">+{xpEarned} XP Earned!</span>
                </div>
              </div>
            )}

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
            
            <div className="flex gap-4 justify-center mt-8">
              <Button
                variant="secondary"
                onClick={() => router.push(`/student/chapter/${chapterId}`)}
              >
                Back to Mission
              </Button>
              <Button
                onClick={() => router.push('/student')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      )}
      </div>
    </>
  )
}
