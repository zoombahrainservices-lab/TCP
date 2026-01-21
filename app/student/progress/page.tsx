import { requireAuth } from '@/lib/auth/guards'
import { getChapterByLegacyDay, getChapterProgress } from '@/app/actions/chapters'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export default async function StudentProgressPage() {
  const user = await requireAuth('student')
  
  // Fetch all chapters by legacy day number (1-30)
  const daysData = await Promise.all(
    Array.from({ length: 30 }, (_, i) => i + 1).map(async (dayNumber) => {
      const chapter = await getChapterByLegacyDay(dayNumber)
      
      if (!chapter) {
        return {
          dayNumber,
          chapterId: null,
          title: `Day ${dayNumber}`,
          subtitle: '',
          status: 'not-started' as const,
          completed: false,
        }
      }

      // Get chapter progress to determine status
      const chapterProgress = await getChapterProgress(user.id, chapter.id)
      const isCompleted = chapterProgress ? chapterProgress.completedPhases === chapterProgress.totalPhases : false
      const isInProgress = chapterProgress ? chapterProgress.completedPhases > 0 && !isCompleted : false
      
      const status = isCompleted ? 'completed' : isInProgress ? 'in-progress' : 'not-started'
      
      return {
        dayNumber,
        chapterId: chapter.id,
        title: chapter.title,
        subtitle: chapter.subtitle || '',
        status,
        completed: isCompleted,
      }
    })
  )
  
  // Calculate summary stats
  const completedDays = daysData.filter(d => d.status === 'completed').length
  const inProgressDays = daysData.filter(d => d.status === 'in-progress').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/student" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-gray-600">
            Track your journey through the 30-day program
          </p>
        </div>

        {/* Program Downloads Section */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Program Downloads</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 90-Day Challenge Card */}
            <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">90-Day Challenge</h3>
              <p className="text-sm text-gray-600 mb-4">
                Continue your journey beyond the 30-day program
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

        {/* Progress Summary */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Progress Summary</h2>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {completedDays} / 30
              </div>
              <div className="text-sm text-gray-600">Days Completed</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {completedDays}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">
                {inProgressDays}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">
                {30 - completedDays - inProgressDays}
              </div>
              <div className="text-sm text-gray-600">Not Started</div>
            </div>
          </div>
        </Card>

        {/* Days 1-30 List */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">30-Day Program</h2>
          {daysData.map((day) => (
            <Card
              key={day.dayNumber}
              className={`border-l-4 ${
                day.status === 'completed' ? 'border-green-500' :
                day.status === 'in-progress' ? 'border-yellow-500' :
                'border-gray-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    {day.chapterId ? (
                      <Link
                        href={`/student/chapter/${day.chapterId}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                      >
                        Day {day.dayNumber}: {day.title}
                      </Link>
                    ) : (
                      <span className="text-lg font-semibold text-gray-900">
                        Day {day.dayNumber}: {day.title}
                      </span>
                    )}
                    <Badge variant={
                      day.status === 'completed' ? 'success' :
                      day.status === 'in-progress' ? 'warning' :
                      'default'
                    }>
                      {day.status === 'completed' ? 'Completed' :
                       day.status === 'in-progress' ? 'In Progress' :
                       'Not Started'}
                    </Badge>
                  </div>
                  {day.subtitle && (
                    <p className="text-sm text-gray-600">{day.subtitle}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {day.chapterId ? (
                    <a
                      href={`/api/chapters/${day.chapterId}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="secondary">
                        📖 Day {day.dayNumber} PDF
                      </Button>
                    </a>
                  ) : (
                    <Button size="sm" variant="secondary" disabled>
                      <span className="text-gray-400">PDF unavailable</span>
                    </Button>
                  )}
                  {day.completed ? (
                    <Button size="sm" variant="secondary" disabled>
                      <span className="text-gray-400">Results available in mission</span>
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" disabled>
                      <span className="text-gray-400">No results yet</span>
                    </Button>
                  )}
                  {day.chapterId ? (
                    <Link href={`/student/chapter/${day.chapterId}`}>
                      <Button size="sm">
                        {day.status === 'completed' ? 'Review' :
                         day.status === 'in-progress' ? 'Continue' :
                         'Start'}
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" disabled>
                      Not Available
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
