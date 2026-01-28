import { getStudentResponses } from '@/app/actions/admin'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

export default async function AdminStudentResponsesPage({ 
  params 
}: { 
  params: Promise<{ studentId: string }> 
}) {
  const { studentId } = await params
  const { studentName, responses } = await getStudentResponses(studentId)

  const calculateAverage = (answers: any[]) => {
    if (!answers || answers.length === 0) return 'N/A'
    const sum = answers.reduce((acc: number, a: any) => acc + (a.answer || 0), 0)
    return (sum / answers.length).toFixed(1)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/students" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Students
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{studentName}'s Responses</h1>
        <p className="text-gray-600">View all completed daily submissions</p>
      </div>

      {responses.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No responses yet</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {responses.map((response) => (
            <Card key={response.id}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Day {response.day_number}: {response.chapterTitle}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Completed: {new Date(response.updated_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant="success">Completed</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Before Self-Check */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Before Self-Check</h4>
                  <div className="space-y-2">
                    {response.before_answers?.map((answer: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700 flex-1 mr-2">{answer.question}</span>
                        <Badge variant={answer.answer >= 4 ? 'success' : 'warning'} size="sm">
                          {answer.answer}/5
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Average: </span>
                    <span className="text-sm font-bold text-gray-900">
                      {calculateAverage(response.before_answers)}/5
                    </span>
                  </div>
                </div>

                {/* After Self-Check */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">After Self-Check</h4>
                  <div className="space-y-2">
                    {response.after_answers?.map((answer: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700 flex-1 mr-2">{answer.question}</span>
                        <Badge variant={answer.answer >= 4 ? 'success' : 'warning'} size="sm">
                          {answer.answer}/5
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Average: </span>
                    <span className="text-sm font-bold text-gray-900">
                      {calculateAverage(response.after_answers)}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Reflection */}
              {response.reflection_text && (
                <div className="mt-4 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Reflection</h4>
                  <p className="text-gray-700 whitespace-pre-wrap break-words text-sm">
                    {response.reflection_text}
                  </p>
                </div>
              )}

              {/* Uploads */}
              {response.uploads && response.uploads.length > 0 && (
                <div className="mt-4 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Submitted Work</h4>
                  <div className="space-y-3">
                    {response.uploads.map((upload: any) => (
                      <div key={upload.id}>
                        {upload.type === 'text' && (
                          <div className="bg-gray-50 rounded p-3">
                            <span className="text-xs font-medium text-gray-600 block mb-1">📝 Text</span>
                            <p className="text-sm text-gray-700 break-words">{upload.text_content}</p>
                          </div>
                        )}
                        {upload.type === 'audio' && (
                          <div className="bg-gray-50 rounded p-3">
                            <span className="text-xs font-medium text-gray-600 block mb-2">🎤 Audio</span>
                            <audio controls className="w-full" src={upload.url}></audio>
                          </div>
                        )}
                        {upload.type === 'image' && (
                          <div className="bg-gray-50 rounded p-3">
                            <span className="text-xs font-medium text-gray-600 block mb-2">📷 Image</span>
                            <img src={upload.url} alt="Submission" className="max-w-full h-auto rounded" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
