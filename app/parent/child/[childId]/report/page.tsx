'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/app/actions/auth'
import { getChildReport } from '@/app/actions/parent'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ChildReportPage() {
  const params = useParams()
  const childId = params.childId as string
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReport() {
      const session = await getSession()
      if (!session) return
      const data = await getChildReport(session.id, childId)
      setReport(data)
      setLoading(false)
    }
    loadReport()
  }, [childId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 text-lg mb-4">Failed to load report</p>
        <Link href="/parent">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Link href={`/parent/child/${childId}`} className="text-blue-600 hover:text-blue-700">
          ← Back to Progress
        </Link>
        <Button onClick={() => window.print()}>Print Report</Button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md print:shadow-none">
        {/* Foundation Section */}
        {report.foundation && (
          <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Foundation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Assessment Score:</span>
                <div className="text-2xl font-bold text-gray-900">{report.foundation.self_check_score} / 49</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Status:</span>
                <div className="text-lg font-semibold text-gray-900">
                  {report.foundation.score_band === 'good' ? 'Good Standing' :
                   report.foundation.score_band === 'danger_zone' ? 'Danger Zone' :
                   report.foundation.score_band === 'tom_start' ? 'Tom Start' :
                   'Counselor Recommended'}
                </div>
              </div>
            </div>
            {report.foundation.identity_statement && (
              <div className="mt-4">
                <span className="text-sm text-gray-600">Identity Statement:</span>
                <p className="text-gray-900 italic mt-1">"{report.foundation.identity_statement}"</p>
              </div>
            )}
            <div className="mt-4 flex gap-4">
              <a 
                href="/tcp-foundation-chapter1.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline text-sm"
              >
                📄 Download Foundation PDF
              </a>
              <a 
                href="/tcp-90day-challenge.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 underline text-sm"
              >
                📄 Download 90-Day Challenge PDF
              </a>
            </div>
          </div>
        )}
        
        {!report.foundation && (
          <div className="border-2 border-gray-200 bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-gray-600 text-sm mb-3">Foundation assessment not yet completed.</p>
            <a 
              href="/tcp-90day-challenge.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 underline text-sm"
            >
              📄 Download 90-Day Challenge PDF
            </a>
          </div>
        )}
        
        <div className="border-b-2 border-gray-200 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Report</h1>
          <h2 className="text-2xl text-gray-700 mb-4">{report.childName}</h2>
          <div className="flex gap-8">
            <div>
              <span className="text-sm text-gray-600">Completion:</span>
              <span className="ml-2 text-lg font-semibold text-gray-900">
                {report.completedDays} / 30 days ({report.completionPercentage}%)
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Report Generated:</span>
              <span className="ml-2 text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Progress Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Day</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Chapter</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Before Score</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">After Score</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Improvement</th>
                  <th className="border border-gray-300 px-4 py-2 text-center print:hidden">Downloads</th>
                </tr>
              </thead>
              <tbody>
                {report.reportData.map((day: any) => {
                  const beforeNum = parseFloat(day.beforeScore)
                  const afterNum = parseFloat(day.afterScore)
                  const improvement = !isNaN(beforeNum) && !isNaN(afterNum) 
                    ? (afterNum - beforeNum).toFixed(1) 
                    : 'N/A'
                  
                  return (
                    <tr key={day.dayNumber} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{day.dayNumber}</td>
                      <td className="border border-gray-300 px-4 py-2">{day.title}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{day.beforeScore}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{day.afterScore}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span className={
                          improvement !== 'N/A' && parseFloat(improvement) > 0 
                            ? 'text-green-600 font-semibold' 
                            : improvement !== 'N/A' && parseFloat(improvement) < 0
                            ? 'text-red-600 font-semibold'
                            : 'text-gray-600'
                        }>
                          {improvement !== 'N/A' && parseFloat(improvement) > 0 && '+'}
                          {improvement}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center print:hidden">
                        <div className="flex flex-col gap-1">
                          <a
                            href={`/api/chapters/${day.dayNumber}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 underline"
                          >
                            📖 Chapter
                          </a>
                          {day.recordId ? (
                            <a
                              href={`/api/daily-records/${day.recordId}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 underline"
                            >
                              📊 Results
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">No results</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {report.reportData.filter((d: any) => d.reflection).length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Selected Reflections</h3>
            <div className="space-y-6">
              {report.reportData
                .filter((d: any) => d.reflection)
                .slice(0, 5)
                .map((day: any) => (
                  <div key={day.dayNumber} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Day {day.dayNumber}: {day.title}
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{day.reflection}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-600">
          <p>This report was generated by The Communication Protocol platform.</p>
          <p>For questions or support, please contact your program administrator.</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          @page { margin: 1in; }
        }
      `}</style>
    </div>
  )
}
