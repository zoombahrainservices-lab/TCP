'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitProgramBaseline } from '@/app/actions/baseline'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import SelfCheckScale from '@/components/student/SelfCheckScale'

interface BaselineFormProps {
  studentId: string
}

const baselineQuestions = [
  {
    id: 'communication_confidence',
    question: 'How confident do you feel in your communication skills?',
    type: 'scale'
  },
  {
    id: 'listening_skills',
    question: 'How well do you think you listen to others?',
    type: 'scale'
  },
  {
    id: 'expressing_thoughts',
    question: 'How comfortable are you expressing your thoughts and feelings?',
    type: 'scale'
  },
  {
    id: 'conflict_resolution',
    question: 'How confident are you in resolving conflicts?',
    type: 'scale'
  },
  {
    id: 'public_speaking',
    question: 'How comfortable are you speaking in front of groups?',
    type: 'scale'
  },
  {
    id: 'empathy',
    question: 'How well do you understand others\' perspectives?',
    type: 'scale'
  },
  {
    id: 'assertiveness',
    question: 'How comfortable are you standing up for yourself?',
    type: 'scale'
  },
  {
    id: 'nonverbal_communication',
    question: 'How aware are you of body language and nonverbal cues?',
    type: 'scale'
  }
]

export default function BaselineForm({ studentId }: BaselineFormProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate all questions answered
    const allAnswered = baselineQuestions.every(q => answers[q.id] !== undefined)
    if (!allAnswered) {
      setError('Please answer all questions before submitting')
      return
    }

    setSubmitting(true)

    try {
      // Map answers to the expected q1-q7 format
      const responses = {
        responses: {
          q1: answers[baselineQuestions[0].id] || 0,
          q2: answers[baselineQuestions[1].id] || 0,
          q3: answers[baselineQuestions[2].id] || 0,
          q4: answers[baselineQuestions[3].id] || 0,
          q5: answers[baselineQuestions[4].id] || 0,
          q6: answers[baselineQuestions[5].id] || 0,
          q7: answers[baselineQuestions[6].id] || 0,
        }
      }

      const result = await submitProgramBaseline(studentId, responses)

      if (result.success) {
        router.push('/student')
        router.refresh()
      } else {
        setError(result.error || 'Failed to submit baseline')
        setSubmitting(false)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setSubmitting(false)
    }
  }

  const progress = Object.keys(answers).length
  const total = baselineQuestions.length
  const progressPercent = Math.round((progress / total) * 100)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress indicator */}
      <Card>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{progress} of {total} questions</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      {/* Questions */}
      {baselineQuestions.map((question, index) => (
        <Card key={question.id}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Question {index + 1}
            </h3>
            <p className="text-gray-700">{question.question}</p>
          </div>

          <SelfCheckScale
            value={answers[question.id]}
            onChange={(value) => handleAnswerChange(question.id, value)}
            labels={['Very Low', 'Low', 'Moderate', 'High', 'Very High']}
          />
        </Card>
      ))}

      {/* Error message */}
      {error && (
        <Card>
          <div className="text-red-600 text-center">{error}</div>
        </Card>
      )}

      {/* Submit button */}
      <Card>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Your responses will help track your progress throughout the program.
          </p>
          <Button 
            type="submit" 
            disabled={submitting || progress < total}
            size="lg"
          >
            {submitting ? 'Submitting...' : 'Begin My Journey'}
          </Button>
        </div>
      </Card>
    </form>
  )
}
