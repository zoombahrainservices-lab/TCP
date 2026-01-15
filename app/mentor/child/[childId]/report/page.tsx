'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/app/actions/auth'
import { getChildReport } from '@/app/actions/parent'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function MentorChildReportPage() {
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
        <Link href="/mentor">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Link href={`/mentor/child/${childId}`} className="text-blue-600 hover:text-blue-700">
          ← Back to Progress
        </Link>
        <Button onClick={() => window.print()}>Print Report</Button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md print:shadow-none">
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
