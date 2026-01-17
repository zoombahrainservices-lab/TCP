import { requireAuth } from '@/lib/auth/guards'
import { getStudentProgress, getChapterContent } from '@/app/actions/student'
import ProgressBar30 from '@/components/student/ProgressBar30'
import DayCard from '@/components/student/DayCard'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export default async function StudentDashboard() {
  const user = await requireAuth('student')
  
  const progress = await getStudentProgress(user.id)

  // Get suggested chapter info
  let suggestedChapter = null
  if (progress.suggestedDay <= 30) {
    try {
      suggestedChapter = await getChapterContent(progress.suggestedDay)
    } catch (error) {
      // Chapter not found
    }
  }

  // Get completed chapters for history
  const completedChapters = await Promise.all(
    progress.completedDays.slice(-5).map(async (day) => {
      try {
        const chapter = await getChapterContent(day)
        return { day, title: chapter.title }
      } catch {
        return { day, title: 'Unknown' }
      }
    })
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Progress Bar Section - Full Width on Mobile */}
        <Card className="mb-6 md:mb-8">
          <div className="text-center mb-4">
            <div className="text-sm md:text-base text-gray-600 mb-3">
              {progress.completedDays.length} / 30 Days Completed
              {progress.inProgressDays.length > 0 && (
                <span className="ml-2 text-yellow-600">({progress.inProgressDays.length} in progress)</span>
              )}
            </div>
            <ProgressBar30 
              completedDays={progress.completedDays} 
              inProgressDays={progress.inProgressDays}
              suggestedDay={progress.suggestedDay}
              dayStatuses={progress.dayStatuses}
            />
          </div>
        </Card>

        {/* Two Column Layout - Stacks on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column - Welcome & Action */}
          <div className="space-y-6">
            {/* Welcome Section */}
            <Card>
              <h1 className="headline-lg text-[var(--color-charcoal)] mb-4">
                Welcome, {user.fullName.split(' ')[0]}!
              </h1>
              
              {/* Suggested Day CTA */}
              {progress.suggestedDay <= 30 && suggestedChapter ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Suggested Next:</p>
                  <Link href={`/student/day/${progress.suggestedDay}`}>
                    <Button variant="success" size="lg" fullWidth className="text-base md:text-lg py-3 md:py-4">
                      {progress.dayStatuses[progress.suggestedDay] === 'in-progress' ? 'Continue' : 'Start'} Day {progress.suggestedDay}
                    </Button>
                  </Link>
                </div>
              ) : progress.completedDays.length === 30 ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">All Complete!</h3>
                  <p className="text-gray-600 text-sm">You've finished the 30-day challenge</p>
                </div>
              ) : null}
            </Card>

            {/* Previous Days */}
            <Card>
              <h2 className="headline-md text-[var(--color-charcoal)] mb-4">Previous Days</h2>
              <div className="space-y-2">
                {completedChapters.reverse().slice(0, 3).map((chapter) => (
                  <DayCard
                    key={chapter.day}
                    dayNumber={chapter.day}
                    title={chapter.title}
                    status="completed"
                  />
                ))}
                {completedChapters.length === 0 && (
                  <p className="text-gray-500 text-sm py-4 text-center">
                    No completed days yet. Start your journey today!
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Suggested Chapter */}
          {progress.suggestedDay <= 30 && suggestedChapter && (
            <Card className="lg:sticky lg:top-6 h-fit">
              <div className="mb-4">
                <span className="text-sm text-[var(--color-gray)]">Suggested Next</span>
                <h2 className="headline-lg text-[var(--color-charcoal)] mt-1">
                  Day {progress.suggestedDay} / 30
                </h2>
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 mt-2">
                  Chapter {progress.suggestedDay}: {suggestedChapter.title}
                </h3>
              </div>
              
              <div>
                <Link href={`/student/day/${progress.suggestedDay}`} className="block mb-5">
                  <Button variant="warning" fullWidth>
                    Read Chapter →
                  </Button>
                </Link>
                <Link href="/student/progress" className="block">
                  <Button variant="danger" fullWidth>
                    View Progress →
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
