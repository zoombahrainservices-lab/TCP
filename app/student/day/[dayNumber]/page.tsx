'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  getStudentProgress, 
  getChapterContent, 
  startDay, 
  saveBeforeAnswers,
  uploadProof,
  saveAfterAnswersAndReflection,
  completeDay,
  getDailyRecord
} from '@/app/actions/student'
import { getSession } from '@/app/actions/auth'
import ChapterReader from '@/components/student/ChapterReader'
import SelfCheckScale from '@/components/student/SelfCheckScale'
import ReflectionInput from '@/components/student/ReflectionInput'
import UploadForm from '@/components/student/UploadForm'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type Step = 'overview' | 'reader' | 'before' | 'task' | 'upload' | 'after' | 'complete'

export default function DayPage() {
  const params = useParams()
  const router = useRouter()
  const dayNumber = parseInt(params.dayNumber as string)
  
  const [step, setStep] = useState<Step>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [userId, setUserId] = useState<string>('')
  const [chapter, setChapter] = useState<any>(null)
  const [recordId, setRecordId] = useState<number | null>(null)
  const [progress, setProgress] = useState<any>(null)
  
  const [beforeAnswers, setBeforeAnswers] = useState<Record<string, number>>({})
  const [afterAnswers, setAfterAnswers] = useState<Record<string, number>>({})
  const [reflection, setReflection] = useState('')
  const [uploaded, setUploaded] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const session = await getSession()
        if (!session) {
          router.push('/auth/login')
          return
        }
        
        setUserId(session.id)
        
        // Get progress to check if day is accessible
        const prog = await getStudentProgress(session.id)
        setProgress(prog)
        
        if (dayNumber > prog.currentDay) {
          setError(`Day ${dayNumber} is locked. Complete Day ${prog.currentDay} first.`)
          setTimeout(() => router.push('/student'), 3000)
          return
        }
        
        // Load chapter
        const chap = await getChapterContent(dayNumber)
        setChapter(chap)
        
        // Check if already started
        const existing = await getDailyRecord(session.id, dayNumber)
        if (existing) {
          setRecordId(existing.id)
          if (existing.completed) {
            // Already completed, show completion
            setStep('complete')
          } else if (existing.reflection_text) {
            setStep('complete')
          } else if (existing.uploads && existing.uploads.length > 0) {
            setUploaded(true)
            setStep('after')
          } else if (existing.before_answers && existing.before_answers.length > 0) {
            setStep('task')
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

  const handleBegin = async () => {
    try {
      if (!recordId) {
        const result = await startDay(userId, dayNumber)
        setRecordId(result.recordId)
      }
      setStep('reader')
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
      setStep('task')
      setError('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpload = async (type: 'audio' | 'image' | 'text', fileOrText: File | string) => {
    if (!recordId) return
    
    try {
      await uploadProof(recordId, userId, type, fileOrText)
      setUploaded(true)
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Day {dayNumber} of 30</span>
          <span className="text-sm text-gray-500">
            {step === 'overview' && 'Overview'}
            {step === 'reader' && 'Reading'}
            {step === 'before' && 'Before Self-Check'}
            {step === 'task' && 'Task Instructions'}
            {step === 'upload' && 'Upload Proof'}
            {step === 'after' && 'After Self-Check'}
            {step === 'complete' && 'Complete'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${
                step === 'overview' ? 0 :
                step === 'reader' ? 14 :
                step === 'before' ? 28 :
                step === 'task' ? 42 :
                step === 'upload' ? 57 :
                step === 'after' ? 85 :
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
        <ChapterReader
          content={chapter.content}
          onNext={() => setStep('before')}
          onBack={() => setStep('overview')}
        />
      )}

      {/* Step: Before Self-Check */}
      {step === 'before' && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Before We Begin</h2>
          <p className="text-gray-600 mb-6">Rate yourself on these questions (1 = Not at all, 5 = Extremely)</p>
          <div className="space-y-6 mb-8">
            {(chapter.before_questions as any[]).map((q) => (
              <SelfCheckScale
                key={q.id}
                questionId={q.id}
                question={q.question}
                value={beforeAnswers[q.id] || 0}
                onChange={(value) => setBeforeAnswers({ ...beforeAnswers, [q.id]: value })}
              />
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep('reader')}>← Back</Button>
            <Button onClick={handleSaveBeforeAnswers}>Continue →</Button>
          </div>
        </Card>
      )}

      {/* Step: Task Instructions */}
      {step === 'task' && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Task</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-gray-700 text-lg leading-relaxed">{chapter.task_description}</p>
          </div>
          <Button fullWidth onClick={() => setStep('upload')}>Continue to Upload →</Button>
        </Card>
      )}

      {/* Step: Upload Proof */}
      {step === 'upload' && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Proof</h2>
          <UploadForm onUpload={handleUpload} />
          <div className="mt-4">
            <Button variant="ghost" onClick={() => setStep('task')}>← Back to Task</Button>
          </div>
        </Card>
      )}

      {/* Step: After Self-Check + Reflection */}
      {step === 'after' && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">After Reflection</h2>
          <p className="text-gray-600 mb-6">Now rate yourself again on these questions:</p>
          <div className="space-y-6 mb-8">
            {(chapter.after_questions as any[]).map((q) => (
              <SelfCheckScale
                key={q.id}
                questionId={q.id}
                question={q.question}
                value={afterAnswers[q.id] || 0}
                onChange={(value) => setAfterAnswers({ ...afterAnswers, [q.id]: value })}
              />
            ))}
          </div>
          
          <div className="mb-8">
            <ReflectionInput
              value={reflection}
              onChange={setReflection}
            />
          </div>

          <Button fullWidth onClick={handleSaveAfterAndReflection}>
            Complete Day {dayNumber}
          </Button>
        </Card>
      )}

      {/* Step: Complete */}
      {step === 'complete' && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Day {dayNumber} Complete!</h2>
            <p className="text-xl text-gray-600 mb-8">
              Great work! You've completed another day of your communication journey.
            </p>
            {progress && dayNumber < 30 && dayNumber === progress.currentDay && (
              <div className="mb-4">
                <p className="text-gray-600 mb-4">Ready for the next challenge?</p>
                <Button size="lg" onClick={() => router.push(`/student/day/${dayNumber + 1}`)}>
                  Continue to Day {dayNumber + 1} →
                </Button>
              </div>
            )}
            <div className="mt-4">
              <Button variant="secondary" onClick={() => router.push('/student')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
