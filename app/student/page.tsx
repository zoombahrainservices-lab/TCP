import { requireAuth } from '@/lib/auth/guards'
import { getStudentProgress, getChapterContent } from '@/app/actions/student'
import ProgressBar30 from '@/components/student/ProgressBar30'
import DayCard from '@/components/student/DayCard'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default async function StudentDashboard() {
  const user = await requireAuth('student')
  const progress = await getStudentProgress(user.id)

  // Get current chapter info
  let currentChapter = null
  if (progress.currentDay <= 30) {
    try {
      currentChapter = await getChapterContent(progress.currentDay)
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
            <div className="text-sm md:text-base text-gray-600 mb-3">Day {progress.currentDay} / 30</div>
            <ProgressBar30 completedDays={progress.completedDays} currentDay={progress.currentDay} />
          </div>
        </Card>

        {/* Two Column Layout - Stacks on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column - Welcome & Action */}
          <div className="space-y-6">
            {/* Welcome Section */}
            <Card>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Welcome, {user.fullName.split(' ')[0]}!
              </h1>
              
              {/* Current Day CTA */}
              {progress.currentDay <= 30 && currentChapter ? (
                <Link href={`/student/day/${progress.currentDay}`}>
                  <Button size="lg" fullWidth className="text-base md:text-lg py-3 md:py-4">
                    Start Day {progress.currentDay}
                  </Button>
                </Link>
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
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Previous Days</h2>
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

          {/* Right Column - Active Chapter */}
          {progress.currentDay <= 30 && currentChapter && (
            <Card className="lg:sticky lg:top-6 h-fit">
              <div className="mb-4">
                <span className="text-sm text-gray-600">Active Chapter</span>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                  Day {progress.currentDay} / 30
                </h2>
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 mt-2">
                  {currentChapter.title}
                </h3>
              </div>
              
              <div className="space-y-3">
                <Link href={`/student/day/${progress.currentDay}`}>
                  <Button variant="secondary" fullWidth className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                    Read Chapter →
                  </Button>
                </Link>
                <Link href={`/student/day/${progress.currentDay}`}>
                  <Button fullWidth>
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
