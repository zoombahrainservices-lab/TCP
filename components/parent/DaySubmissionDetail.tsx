'use client'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface DaySubmissionDetailProps {
  submission: any
}

export default function DaySubmissionDetail({ submission }: DaySubmissionDetailProps) {
  const handleDownloadPDF = () => {
    // Create printable content and trigger print dialog for PDF
    const printContent = document.getElementById('submission-content')
    if (!printContent) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Day ${submission.dayNumber} - ${submission.chapterTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; }
            .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
            .question { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .score { font-weight: bold; color: #059669; }
            .reflection { white-space: pre-wrap; line-height: 1.6; word-wrap: break-word; overflow-wrap: break-word; }
            .average { margin-top: 15px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Day ${submission.dayNumber}: ${submission.chapterTitle}</h1>
          ${submission.chapterSubtitle ? `<p>${submission.chapterSubtitle}</p>` : ''}
          
          <h2>Before Self-Check</h2>
          <div class="section">
            ${submission.beforeAnswers?.map((a: any) => `
              <div class="question">
                <span>${a.question}</span>
                <span class="score">${a.answer}/5</span>
              </div>
            `).join('') || 'No answers'}
            <div class="average">Average: ${submission.beforeAnswers?.length > 0 
              ? (submission.beforeAnswers.reduce((sum: number, a: any) => sum + (a.answer || 0), 0) / submission.beforeAnswers.length).toFixed(1) 
              : 'N/A'}/5</div>
          </div>
          
          <h2>After Self-Check</h2>
          <div class="section">
            ${submission.afterAnswers?.map((a: any) => `
              <div class="question">
                <span>${a.question}</span>
                <span class="score">${a.answer}/5</span>
              </div>
            `).join('') || 'No answers'}
            <div class="average">Average: ${submission.afterAnswers?.length > 0 
              ? (submission.afterAnswers.reduce((sum: number, a: any) => sum + (a.answer || 0), 0) / submission.afterAnswers.length).toFixed(1) 
              : 'N/A'}/5</div>
          </div>
          
          ${submission.reflection ? `
            <h2>Reflection</h2>
            <div class="section">
              <p class="reflection">${submission.reflection}</p>
            </div>
          ` : ''}
          
          <p style="margin-top: 40px; color: #6b7280; font-size: 12px;">
            Generated on ${new Date().toLocaleDateString()}
          </p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
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
    </div>
  )
}
