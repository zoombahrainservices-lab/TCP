'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getChildDaySubmission } from '@/app/actions/parent'
import ProgressBar30 from '@/components/student/ProgressBar30'
import DaySubmissionDetail from '@/components/parent/DaySubmissionDetail'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ChildProfileClientProps {
  childId: string
  parentId: string
  progress: any
}

export default function ChildProfileClient({ childId, parentId, progress }: ChildProfileClientProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [submissionLoading, setSubmissionLoading] = useState(false)

  const handleViewDay = async (dayNumber: number) => {
    if (selectedDay === dayNumber) {
      setSelectedDay(null)
      setSubmission(null)
      return
    }

    setSelectedDay(dayNumber)
    setSubmissionLoading(true)
    
    try {
      const sub = await getChildDaySubmission(parentId, childId, dayNumber)
      setSubmission(sub)
    } catch (error) {
      console.error('Failed to load submission:', error)
      setSubmission(null)
    } finally {
      setSubmissionLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/parent" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{progress.childName}</h1>
            <p className="text-gray-600">
              Progress: {progress.completedDays.length} of 30 days ({progress.completionPercentage}%)
            </p>
          </div>
          <Link href={`/parent/child/${childId}/report`}>
            <Button variant="secondary">View Report</Button>
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">30-Day Progress</h2>
        <ProgressBar30 completedDays={progress.completedDays} currentDay={progress.currentDay} />
      </Card>

      {/* Program Downloads Section */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Program Downloads</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Foundation Card */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Foundation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Self-assessment, identity statement, and commitment
            </p>
            <a
              href="/tcp-foundation-chapter1.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="sm" fullWidth>
                📄 Download Foundation PDF
              </Button>
            </a>
          </div>

          {/* 90-Day Challenge Card */}
          <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">90-Day Challenge</h3>
            <p className="text-sm text-gray-600 mb-4">
              Continue the journey beyond the 30-day program
            </p>
            <a
              href="/tcp-90day-challenge.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="sm" fullWidth>
                📄 Download 90-Day Challenge PDF
              </Button>
            </a>
          </div>
        </div>
      </Card>

      {/* Days List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Days Overview</h2>
          <div className="space-y-2">
            {progress.days.map((day: any) => (
              <Card
                key={day.dayNumber}
                padding="sm"
                className={`transition-all ${
                  selectedDay === day.dayNumber ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                } ${!day.completed ? 'opacity-50' : ''}`}
              >
                <div className="space-y-2">
                  <button
                    onClick={() => day.completed && handleViewDay(day.dayNumber)}
                    disabled={!day.completed}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm font-medium text-gray-500 min-w-[60px]">
                          Day {day.dayNumber}
                        </span>
                        <span className="text-sm text-gray-900 flex-1">{day.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {day.completed ? (
                          <Badge variant="success" size="sm">✓</Badge>
                        ) : day.inProgress ? (
                          <Badge variant="warning" size="sm">In Progress</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Pending</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {/* Download buttons */}
                  <div className="flex gap-2 pt-1">
                    <a
                      href={`/api/chapters/${day.dayNumber}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="secondary" size="sm">
                        📖 Chapter
                      </Button>
                    </a>
                    {day.recordId ? (
                      <a
                        href={`/api/daily-records/${day.recordId}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="secondary" size="sm">
                          📊 Results
                        </Button>
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center px-2">
                        No results yet
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Submission Detail */}
        <div>
          {selectedDay && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Day {selectedDay} Submission
              </h2>
              {submissionLoading ? (
                <Card>
                  <LoadingSpinner />
                </Card>
              ) : (
                <DaySubmissionDetail 
                  submission={submission} 
                  parentId={parentId}
                  onReviewSubmitted={() => handleViewDay(selectedDay)}
                />
              )}
            </>
          )}
          {!selectedDay && (
            <Card>
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p>Select a completed day to view submission details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
