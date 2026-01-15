import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface DaySubmissionDetailProps {
  submission: any
}

export default function DaySubmissionDetail({ submission }: DaySubmissionDetailProps) {
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
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{submission.chapterTitle}</h3>
            {submission.chapterSubtitle && (
              <p className="text-gray-600">{submission.chapterSubtitle}</p>
            )}
          </div>
          {submission.completed && <Badge variant="success">Completed</Badge>}
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
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">📝 Text Submission</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{upload.text_content}</p>
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
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{submission.reflection}</p>
        </Card>
      )}
    </div>
  )
}
