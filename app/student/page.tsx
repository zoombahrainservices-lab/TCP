import { requireAuth } from '@/lib/auth/guards'
import { getStudentProgress, getChapterContent } from '@/app/actions/student'
import { getMyFoundation } from '@/app/actions/baseline'
import ProgressBar30 from '@/components/student/ProgressBar30'
import DayCard from '@/components/student/DayCard'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export default async function StudentDashboard() {
  const user = await requireAuth('student')
  
  // Get Foundation status (optional, not blocking)
  const foundation = await getMyFoundation()
  
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
        {/* Foundation Status Card */}
        {!foundation ? (
          <Card className="mb-6 md:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <h3 className="text-lg font-bold text-gray-900 mb-2">🎯 Start with Your Foundation</h3>
                <p className="text-gray-700 text-sm">
                  Build your communication foundation with self-assessment, identity, and commitment.
                </p>
              </div>
              <Link href="/student/baseline">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Begin Foundation
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="mb-6 md:mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">Your Foundation</h3>
                  <Badge variant={
                    foundation.score_band === 'good' ? 'success' :
                    foundation.score_band === 'danger_zone' ? 'warning' :
                    'default'
                  }>
                    {foundation.score_band === 'good' ? 'Good Standing' :
                     foundation.score_band === 'danger_zone' ? 'Danger Zone' :
                     foundation.score_band === 'tom_start' ? 'Tom Start' :
                     'Counselor'}
                  </Badge>
                </div>
                {foundation.identity_statement && (
                  <p className="text-gray-700 text-sm italic truncate">
                    "{foundation.identity_statement}"
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/student/baseline">
                  <Button variant="secondary" size="sm">
                    View / Update
                  </Button>
                </Link>
                <a
                  href="/tcp-foundation-chapter1.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 text-center"
                >
                  📄 Download PDF
                </a>
              </div>
            </div>
          </Card>
        )}
        
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Welcome, {user.fullName.split(' ')[0]}!
              </h1>
              
              {/* Suggested Day CTA */}
              {progress.suggestedDay <= 30 && suggestedChapter ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Suggested Next:</p>
                  <Link href={`/student/day/${progress.suggestedDay}`}>
                    <Button size="lg" fullWidth className="text-base md:text-lg py-3 md:py-4">
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

          {/* Right Column - Suggested Chapter */}
          {progress.suggestedDay <= 30 && suggestedChapter && (
            <Card className="lg:sticky lg:top-6 h-fit">
              <div className="mb-4">
                <span className="text-sm text-gray-600">Suggested Next</span>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                  Day {progress.suggestedDay} / 30
                </h2>
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 mt-2">
                  Chapter {progress.suggestedDay}: {suggestedChapter.title}
                </h3>
              </div>
              
              <div className="space-y-3">
                <Link href={`/student/day/${progress.suggestedDay}`}>
                  <Button variant="secondary" fullWidth className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                    Read Chapter →
                  </Button>
                </Link>
                <Link href="/student/progress">
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
