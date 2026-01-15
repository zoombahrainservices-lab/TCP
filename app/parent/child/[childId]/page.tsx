'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/app/actions/auth'
import { getChildProgress, getChildDaySubmission } from '@/app/actions/parent'
import ProgressBar30 from '@/components/student/ProgressBar30'
import DaySubmissionDetail from '@/components/parent/DaySubmissionDetail'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ChildProfilePage() {
  const params = useParams()
  const router = useRouter()
  const childId = params.childId as string

  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<any>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [submissionLoading, setSubmissionLoading] = useState(false)
  const [parentId, setParentId] = useState<string>('')

  useEffect(() => {
    async function loadData() {
      try {
        const session = await getSession()
        if (!session) {
          router.push('/auth/login')
          return
        }
        
        setParentId(session.id)
        const prog = await getChildProgress(session.id, childId)
        setProgress(prog)
      } catch (error) {
        console.error('Failed to load progress:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [childId, router])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!progress) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 text-lg mb-4">Failed to load child progress</p>
        <Button onClick={() => router.push('/parent')}>Back to Dashboard</Button>
      </div>
    )
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

      {/* Days List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Days Overview</h2>
          <div className="space-y-2">
            {progress.days.map((day: any) => (
              <Card
                key={day.dayNumber}
                padding="sm"
                className={`cursor-pointer transition-all ${
                  selectedDay === day.dayNumber ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                } ${!day.completed ? 'opacity-50' : ''}`}
              >
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
                      ) : (
                        <Badge variant="default" size="sm">Pending</Badge>
                      )}
                    </div>
                  </div>
                </button>
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
                <DaySubmissionDetail submission={submission} />
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
