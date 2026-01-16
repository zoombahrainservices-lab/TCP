'use client'

import { useState } from 'react'
import { submitProgramBaseline, type FoundationData, type BaselineInput } from '@/app/actions/baseline'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface FoundationScreenProps {
  initialFoundation: FoundationData | null
  studentId: string
}

const SELF_CHECK_QUESTIONS = [
  { id: 'q1', text: 'How often do you feel confident in social situations?' },
  { id: 'q2', text: 'How comfortable are you starting conversations with new people?' },
  { id: 'q3', text: 'How well do you handle disagreements or conflicts?' },
  { id: 'q4', text: 'How often do you express your thoughts and feelings clearly?' },
  { id: 'q5', text: 'How comfortable are you speaking in front of groups?' },
  { id: 'q6', text: 'How well do you listen and understand others\' perspectives?' },
  { id: 'q7', text: 'How confident are you in your communication skills overall?' },
]

const SCORE_BAND_INFO = {
  good: {
    title: 'Good Standing',
    description: 'You have a solid foundation! The program will help you refine and strengthen your skills.',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  danger_zone: {
    title: 'Danger Zone',
    description: 'This is a critical area for growth. The program will provide tools to build confidence.',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  },
  tom_start: {
    title: 'Tom Start',
    description: 'You\'re ready to make significant improvements. Let\'s build your communication foundation together.',
    color: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  counselor: {
    title: 'Counselor Recommended',
    description: 'Consider speaking with a counselor for additional support alongside this program.',
    color: 'bg-red-100 text-red-800 border-red-300'
  }
}

export default function FoundationScreen({ initialFoundation, studentId }: FoundationScreenProps) {
  const [responses, setResponses] = useState<Record<string, number>>(
    initialFoundation?.responses || {}
  )
  const [identityStatement, setIdentityStatement] = useState(initialFoundation?.identity_statement || '')
  const [chosenAction, setChosenAction] = useState<'identity' | 'accountability_text' | 'delete_app' | ''>(
    initialFoundation?.chosen_action || ''
  )
  const [accountabilityPerson, setAccountabilityPerson] = useState(initialFoundation?.accountability_person || '')
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ scoreBand?: string; score?: number } | null>(
    initialFoundation ? {
      scoreBand: initialFoundation.score_band,
      score: initialFoundation.self_check_score
    } : null
  )

  const handleRatingChange = (questionId: string, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
  }

  const allQuestionsAnswered = SELF_CHECK_QUESTIONS.every(q => responses[q.id] >= 1 && responses[q.id] <= 7)

  const handleSubmit = async () => {
    if (!allQuestionsAnswered) {
      setError('Please answer all 7 questions')
      return
    }

    setSubmitting(true)
    setError('')

    const input: BaselineInput = {
      responses: {
        q1: responses.q1,
        q2: responses.q2,
        q3: responses.q3,
        q4: responses.q4,
        q5: responses.q5,
        q6: responses.q6,
        q7: responses.q7,
      },
      identityStatement: identityStatement || undefined,
      chosenAction: chosenAction || undefined,
      accountabilityPerson: accountabilityPerson || undefined,
    }

    const response = await submitProgramBaseline(studentId, input)

    if (response.success) {
      setResult({ scoreBand: response.scoreBand, score: response.score })
    } else {
      setError(response.error || 'Failed to save Foundation')
    }

    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Card>
        <div className="prose max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Foundation</h2>
          <p className="text-gray-700 mb-4">
            The Foundation is your starting point—a moment of <strong>awareness</strong>, <strong>self-assessment</strong>, 
            and <strong>commitment</strong> to growth.
          </p>
          <p className="text-gray-700 mb-4">
            It includes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li><strong>Self-Check:</strong> 7 questions to understand where you are today</li>
            <li><strong>Identity Statement:</strong> Define who you are and who you're becoming</li>
            <li><strong>One Action:</strong> Choose a commitment to anchor your journey</li>
          </ul>
          <div className="mt-6">
            <a 
              href="/tcp-foundation-chapter1.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="secondary">
                📄 Download Foundation PDF
              </Button>
            </a>
          </div>
        </div>
      </Card>

      {/* Result Display */}
      {result && (
        <Card>
          <div className={`p-4 rounded-lg border-2 ${SCORE_BAND_INFO[result.scoreBand as keyof typeof SCORE_BAND_INFO]?.color || 'bg-gray-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">
                {SCORE_BAND_INFO[result.scoreBand as keyof typeof SCORE_BAND_INFO]?.title || 'Result'}
              </h3>
              <Badge variant="default">Score: {result.score}/49</Badge>
            </div>
            <p className="text-sm">
              {SCORE_BAND_INFO[result.scoreBand as keyof typeof SCORE_BAND_INFO]?.description}
            </p>
          </div>
        </Card>
      )}

      {/* Self-Check Questions */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Self-Check Assessment</h3>
        <p className="text-gray-600 mb-6 text-sm">
          Rate yourself honestly on a scale of 1-7 (1 = Never/Not at all, 7 = Always/Extremely)
        </p>
        
        <div className="space-y-6">
          {SELF_CHECK_QUESTIONS.map((question, index) => (
            <div key={question.id} className="border-b border-gray-200 pb-4">
              <label className="block text-gray-700 font-medium mb-3">
                {index + 1}. {question.text}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-12">Never</span>
                <div className="flex gap-2 flex-1 justify-center">
                  {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRatingChange(question.id, value)}
                      className={`w-10 h-10 rounded-full border-2 font-bold text-sm transition-all ${
                        responses[question.id] === value
                          ? 'bg-blue-600 text-white border-blue-600 scale-110'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">Always</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Identity Statement */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Identity Statement (Optional)</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Complete this statement: <strong>"I am a ___ who ___"</strong>
        </p>
        <p className="text-gray-500 mb-4 text-xs italic">
          Example: "I am a student who values authentic connections and seeks to understand others deeply."
        </p>
        <textarea
          value={identityStatement}
          onChange={(e) => setIdentityStatement(e.target.value)}
          placeholder="I am a..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
        />
      </Card>

      {/* Chosen Action */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Choose One Action (Optional)</h3>
        <p className="text-gray-600 mb-6 text-sm">
          Select a commitment to anchor your Foundation:
        </p>
        
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
            <input
              type="radio"
              name="action"
              value="identity"
              checked={chosenAction === 'identity'}
              onChange={(e) => setChosenAction(e.target.value as 'identity')}
              className="mt-1"
            />
            <div>
              <div className="font-semibold text-gray-900">Share my Identity Statement</div>
              <div className="text-sm text-gray-600">Commit to sharing your identity with someone you trust</div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
            <input
              type="radio"
              name="action"
              value="accountability_text"
              checked={chosenAction === 'accountability_text'}
              onChange={(e) => setChosenAction(e.target.value as 'accountability_text')}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Accountability Partner</div>
              <div className="text-sm text-gray-600 mb-2">Text someone to be your accountability partner</div>
              {chosenAction === 'accountability_text' && (
                <input
                  type="text"
                  value={accountabilityPerson}
                  onChange={(e) => setAccountabilityPerson(e.target.value)}
                  placeholder="Enter their name or contact"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
            <input
              type="radio"
              name="action"
              value="delete_app"
              checked={chosenAction === 'delete_app'}
              onChange={(e) => setChosenAction(e.target.value as 'delete_app')}
              className="mt-1"
            />
            <div>
              <div className="font-semibold text-gray-900">Delete a Distracting App</div>
              <div className="text-sm text-gray-600">Commit to removing one app that hinders meaningful communication</div>
            </div>
          </label>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSubmit}
          disabled={submitting || !allQuestionsAnswered}
          size="lg"
        >
          {submitting ? 'Saving...' : initialFoundation ? 'Update Foundation' : 'Complete Foundation'}
        </Button>
      </div>
    </div>
  )
}
