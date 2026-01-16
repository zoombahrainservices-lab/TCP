'use client'

import { useState } from 'react'
import { submitReview } from '@/app/actions/review'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface DaySubmissionDetailProps {
  submission: any
  parentId?: string
  onReviewSubmitted?: () => void
}

export default function DaySubmissionDetail({ submission, parentId, onReviewSubmitted }: DaySubmissionDetailProps) {
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')

  const handleDownloadPDF = () => {
    // Use the new PDF API endpoint if record ID is available
    if (submission.id) {
      window.open(`/api/daily-records/${submission.id}/pdf`, '_blank')
    }
  }

  const handleSubmitReview = async () => {
    if (!parentId || !reviewFeedback.trim()) {
      setReviewError('Please enter feedback before submitting')
      return
    }

    setSubmittingReview(true)
    setReviewError('')

    try {
      const result = await submitReview(submission.id, parentId, reviewFeedback)
      
      if (result.success) {
        setReviewFeedback('')
        if (onReviewSubmitted) {
          onReviewSubmitted()
        }
      } else {
        setReviewError(result.error || 'Failed to submit review')
      }
    } catch (error: any) {
      setReviewError(error.message || 'An error occurred')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (!submission) {
    return (
      <Card>
        <p className="text-gray-600">No submission yet for this day.</p>
      </Card>
    )
  }

  const calculateAverage = (answers: any[]) => {
    if (!answers || answers.length === 0) return 'N/A'
    const sum = answers.reduce((acc, a) => acc + (a.answer || 0), 0)
    return (sum / answers.length).toFixed(1)
  }

  return (
    <div className="space-y-6" id="submission-content">
      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-gray-900 break-words">{submission.chapterTitle}</h3>
            {submission.chapterSubtitle && (
              <p className="text-gray-600 break-words">{submission.chapterSubtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {submission.completed && <Badge variant="success">Completed</Badge>}
            <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
              📄 Download PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Before Self-Check */}
      <Card>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Before Self-Check</h4>
        <div className="space-y-3">
          {submission.beforeAnswers?.map((answer: any, idx: number) => (
            <div key={idx} className="flex justify-between items-start border-b border-gray-200 pb-2">
              <span className="text-gray-700 flex-1">{answer.question}</span>
              <Badge variant={answer.answer >= 4 ? 'success' : answer.answer >= 3 ? 'warning' : 'default'}>
                {answer.answer}/5
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-600">Average Score: </span>
          <span className="text-lg font-bold text-gray-900">
            {calculateAverage(submission.beforeAnswers)}/5
          </span>
        </div>
      </Card>

      {/* Uploads */}
      {submission.uploads && submission.uploads.length > 0 && (
        <Card>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Submitted Work</h4>
          <div className="space-y-4">
            {submission.uploads.map((upload: any) => (
              <div key={upload.id}>
                {upload.type === 'text' && (
                  <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">📝 Text Submission</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap break-words">{upload.text_content}</p>
                  </div>
                )}
                {upload.type === 'audio' && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">🎤 Audio Submission</span>
                    </div>
                    <audio controls className="w-full" src={upload.url}>
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
                {upload.type === 'image' && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">📷 Image Submission</span>
                    </div>
                    <img src={upload.url} alt="Submission" className="max-w-full h-auto rounded-lg" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* After Self-Check */}
      <Card>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">After Self-Check</h4>
        <div className="space-y-3">
          {submission.afterAnswers?.map((answer: any, idx: number) => (
            <div key={idx} className="flex justify-between items-start border-b border-gray-200 pb-2">
              <span className="text-gray-700 flex-1">{answer.question}</span>
              <Badge variant={answer.answer >= 4 ? 'success' : answer.answer >= 3 ? 'warning' : 'default'}>
                {answer.answer}/5
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-600">Average Score: </span>
          <span className="text-lg font-bold text-gray-900">
            {calculateAverage(submission.afterAnswers)}/5
          </span>
        </div>
      </Card>

      {/* Reflection */}
      {submission.reflection && (
        <Card>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Reflection</h4>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed break-words overflow-hidden">{submission.reflection}</p>
        </Card>
      )}

      {/* Review Section */}
      {submission.completed && parentId && (
        <Card>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Parent/Mentor Review</h4>
          
          {submission.reviewed_at ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-800 font-medium">✓ Reviewed</span>
                  <span className="text-sm text-green-600">
                    {new Date(submission.reviewed_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{submission.review_feedback}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Provide feedback on your child's work. This will be visible to them.
              </p>
              
              <textarea
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder="Write your feedback here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                disabled={submittingReview}
              />

              {reviewError && (
                <div className="text-red-600 text-sm">{reviewError}</div>
              )}

              <Button 
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewFeedback.trim()}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
