'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  getStudentProgress, 
  getChapterContent, 
  startDay, 
  markContentFinished,
  acknowledgeTask,
  saveBeforeAnswers,
  uploadProof,
  saveAfterAnswersAndReflection,
  completeDay,
  getDailyRecord,
  getRecordWithTimestamps
} from '@/app/actions/student'
import { hasProgramBaseline } from '@/app/actions/baseline'
import { getSession } from '@/app/actions/auth'
import ChapterReader from '@/components/student/ChapterReader'
import SelfCheckScale from '@/components/student/SelfCheckScale'
import ReflectionInput from '@/components/student/ReflectionInput'
import UploadForm from '@/components/student/UploadForm'
import TaskDeadline from '@/components/student/TaskDeadline'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type Step = 'overview' | 'reader' | 'content-gate' | 'before' | 'task-ack' | 'task-info' | 'upload' | 'after' | 'complete'

export default function DayPageEnhanced() {
  const params = useParams()
  const router = useRouter()
  const dayNumber = parseInt(params.dayNumber as string)
  
  const [step, setStep] = useState<Step>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [userId, setUserId] = useState<string>('')
  const [chapter, setChapter] = useState<any>(null)
  const [recordId, setRecordId] = useState<number | null>(null)
  const [record, setRecord] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  
  const [beforeAnswers, setBeforeAnswers] = useState<Record<string, number>>({})
  const [afterAnswers, setAfterAnswers] = useState<Record<string, number>>({})
  const [reflection, setReflection] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const session = await getSession()
        if (!session) {
          return
        }
        
        setUserId(session.id)
        
        // Check if baseline is completed
        const hasBaseline = await hasProgramBaseline(session.id)
        if (!hasBaseline) {
          router.push('/student/baseline')
          return
        }
        
        // Get progress (no longer blocking access)
        const prog = await getStudentProgress(session.id)
        setProgress(prog)
        
        // Allow access to any day - no blocking
        
        // Get chapter content
        const chap = await getChapterContent(dayNumber)
        setChapter(chap)
        
        // Check if record exists
        const existing = await getDailyRecord(session.id, dayNumber)
        if (existing) {
          setRecordId(existing.id)
          setRecord(existing)
          
          // Determine step based on timestamps
          if (existing.completed) {
            setStep('complete')
          } else if (existing.proof_uploaded_at && existing.after_answers?.length > 0) {
            setStep('complete')
          } else if (existing.proof_uploaded_at) {
            setStep('after')
          } else if (existing.task_acknowledged_at) {
            setStep('upload')
          } else if (existing.before_answers?.length > 0) {
            setStep('task-ack')
          } else if (existing.content_finished_at) {
            setStep('before')
          } else {
            setStep('overview')
          }
        }
        
        setLoading(false)
      } catch (err: any) {
        setError(err.message || 'Failed to load day')
        setLoading(false)
      }
    }
    
    loadData()
  }, [dayNumber, router])

  const refreshRecord = async () => {
    if (recordId) {
      const updated = await getRecordWithTimestamps(recordId)
      setRecord(updated)
    }
  }

  const handleBegin = async () => {
    try {
      if (!recordId) {
        const result = await startDay(userId, dayNumber)
        setRecordId(result.recordId)
        await refreshRecord()
      }
      setStep('reader')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleContentFinished = async () => {
    if (!recordId) return
    
    try {
      await markContentFinished(recordId)
      await refreshRecord()
      setStep('before')
      setError('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSaveBeforeAnswers = async () => {
    if (!recordId) return
    
    const questions = chapter.before_questions as any[]
    const allAnswered = questions.every(q => beforeAnswers[q.id])
    
    if (!allAnswered) {
      setError('Please answer all questions')
      return
    }
    
    try {
      const answers = questions.map(q => ({
        questionId: q.id,
        question: q.question,
        answer: beforeAnswers[q.id]
      }))
      await saveBeforeAnswers(recordId, answers)
      await refreshRecord()
      setStep('task-ack')
      setError('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleAcknowledgeTask = async () => {
    if (!recordId || !chapter) return
    
    try {
      await acknowledgeTask(recordId, chapter.id)
      await refreshRecord()
      setStep('task-info')
      setError('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpload = async (type: 'audio' | 'image' | 'text', fileOrText: File | string) => {
    if (!recordId) return
    
    try {
      await uploadProof(recordId, userId, type, fileOrText)
      await refreshRecord()
      setStep('after')
    } catch (err: any) {
      throw new Error('Upload failed')
    }
  }

  const handleSaveAfterAndReflection = async () => {
    if (!recordId) return
    
    const questions = chapter.after_questions as any[]
    const allAnswered = questions.every(q => afterAnswers[q.id])
    
    if (!allAnswered) {
      setError('Please answer all questions')
      return
    }
    
    if (reflection.length < 50) {
      setError('Please write a reflection (at least 50 characters)')
      return
    }
    
    try {
      const answers = questions.map(q => ({
        questionId: q.id,
        question: q.question,
        answer: afterAnswers[q.id]
      }))
      await saveAfterAnswersAndReflection(recordId, answers, reflection)
      await completeDay(recordId)
      await refreshRecord()
      setStep('complete')
      setError('')
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

  if (error && !chapter) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-red-600 text-lg mb-4">{error}</div>
        <Button onClick={() => router.push('/student')}>Back to Dashboard</Button>
      </div>
    )
  }

  if (!chapter) return null

  const stepProgress = {
    'overview': 0,
    'reader': 10,
    'content-gate': 20,
    'before': 35,
    'task-ack': 50,
    'task-info': 60,
    'upload': 70,
    'after': 85,
    'complete': 100
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Day {dayNumber} of 30</span>
          <span className="text-sm text-gray-500">
            {step === 'overview' && 'Overview'}
            {step === 'reader' && 'Reading Content'}
            {step === 'content-gate' && 'Content Review'}
            {step === 'before' && 'Before Self-Check'}
            {step === 'task-ack' && 'Task Acknowledgment'}
            {step === 'task-info' && 'Task Information'}
            {step === 'upload' && 'Upload Proof'}
            {step === 'after' && 'After Self-Check & Reflection'}
            {step === 'complete' && 'Complete'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stepProgress[step]}%` }}
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
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                Day {dayNumber}
              </span>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{chapter.title}</h1>
              {chapter.subtitle && (
                <p className="text-xl text-gray-600">{chapter.subtitle}</p>
              )}
            </div>
            <Button size="lg" onClick={handleBegin}>Begin Day {dayNumber}</Button>
          </div>
        </Card>
      )}

      {/* Step: Reader */}
      {step === 'reader' && (
        <>
          <ChapterReader
            content={chapter.content}
            dayNumber={dayNumber}
            title={chapter.title}
            onNext={() => setStep('content-gate')}
            onBack={() => setStep('overview')}
          />
        </>
      )}

      {/* Step: Content Gate - "I've finished reading" */}
      {step === 'content-gate' && (
        <Card>
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📖</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Continue?</h2>
            <p className="text-gray-600 mb-6">
              Have you finished reading the chapter content?
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="ghost" onClick={() => setStep('reader')}>
                Go Back to Reading
              </Button>
              <Button size="lg" onClick={handleContentFinished}>
                Yes, I've Finished Reading
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step: Before Self-Check - Only shown if content_finished_at is set */}
      {step === 'before' && record?.content_finished_at && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Before We Begin</h2>
          <p className="text-gray-600 mb-6">Rate yourself on these questions (1 = Not at all, 5 = Extremely)</p>
          <div className="space-y-6 mb-8">
            {(chapter.before_questions as any[]).map((q) => (
              <div key={q.id}>
                <p className="text-gray-700 mb-3 font-medium">{q.question}</p>
                <SelfCheckScale
                  value={beforeAnswers[q.id]}
                  onChange={(value) => setBeforeAnswers(prev => ({ ...prev, [q.id]: value }))}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setStep('content-gate')}>Back</Button>
            <Button onClick={handleSaveBeforeAnswers}>Continue to Task</Button>
          </div>
        </Card>
      )}

      {/* Step: Task Acknowledgment - Only shown if before_answers saved */}
      {step === 'task-ack' && record?.before_answers?.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Task</h2>
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{chapter.task_description}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-900 font-medium">
              📋 You'll have {chapter.task_deadline_hours || 24} hours to complete this task after you acknowledge it.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setStep('before')}>Back</Button>
            <Button size="lg" onClick={handleAcknowledgeTask}>
              Got it, I'll do this task
            </Button>
          </div>
        </Card>
      )}

      {/* Step: Task Info with Deadline - Only shown if task_acknowledged_at is set */}
      {step === 'task-info' && record?.task_acknowledged_at && (
        <div className="space-y-6">
          {record.task_due_at && (
            <TaskDeadline taskDueAt={record.task_due_at} />
          )}
          
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Task</h2>
            <p className="text-gray-600 mb-6">
              Go ahead and complete the task offline. When you're done, come back here to upload your proof.
            </p>
            <Button onClick={() => setStep('upload')}>I'm Ready to Upload Proof</Button>
          </Card>
        </div>
      )}

      {/* Step: Upload - Only shown if task_acknowledged_at is set */}
      {step === 'upload' && record?.task_acknowledged_at && (
        <div className="space-y-6">
          {record.task_due_at && (
            <TaskDeadline taskDueAt={record.task_due_at} />
          )}
          
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Proof</h2>
            <UploadForm onUpload={handleUpload} />
          </Card>
        </div>
      )}

      {/* Step: After Self-Check - Only shown if proof_uploaded_at is set */}
      {step === 'after' && record?.proof_uploaded_at && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">After Self-Check</h2>
          <p className="text-gray-600 mb-6">Now that you've completed the task, rate yourself again:</p>
          <div className="space-y-6 mb-8">
            {(chapter.after_questions as any[]).map((q) => (
              <div key={q.id}>
                <p className="text-gray-700 mb-3 font-medium">{q.question}</p>
                <SelfCheckScale
                  value={afterAnswers[q.id]}
                  onChange={(value) => setAfterAnswers(prev => ({ ...prev, [q.id]: value }))}
                />
              </div>
            ))}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Reflection</h3>
          <p className="text-gray-600 mb-4">
            What did you learn today? How will you apply this in your life?
          </p>
          <ReflectionInput
            value={reflection}
            onChange={setReflection}
            minLength={50}
          />

          <div className="mt-6 flex gap-4">
            <Button variant="ghost" onClick={() => setStep('upload')}>Back</Button>
            <Button onClick={handleSaveAfterAndReflection}>Complete Day {dayNumber}</Button>
          </div>
        </Card>
      )}

      {/* Step: Complete */}
      {step === 'complete' && (
        <Card>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Day {dayNumber} Complete!</h2>
            <p className="text-gray-600 mb-6">
              Great work! You've completed another day of your communication journey.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="ghost" onClick={() => router.push('/student')}>
                Back to Dashboard
              </Button>
              {dayNumber < 30 && (
                <Button onClick={() => router.push(`/student/day/${dayNumber + 1}`)}>
                  Continue to Day {dayNumber + 1}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
