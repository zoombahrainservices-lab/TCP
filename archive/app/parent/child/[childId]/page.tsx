import { requireAuth } from '@/lib/auth/guards'
import { getChildProgress } from '@/app/actions/parent'
import { getStudentProgress } from '@/app/actions/progress'
import ProgressDisplay from '@/components/student/ProgressDisplay'
import ZoneNavigator from '@/components/student/ZoneNavigator'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import Button from '@/components/ui/Button'

interface ChildProfilePageProps {
  params: Promise<{
    childId: string
  }>
}

export default async function ChildProfilePage({ params }: ChildProfilePageProps) {
  const user = await requireAuth('parent')
  const { childId } = await params

  // Get child progress using new structure
  const progress = await getStudentProgress(childId)

  // Get child profile
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: childProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', childId)
    .single()

  const childName = childProfile?.full_name || 'Student'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Back Button */}
        <div className="mb-4">
          <Link href="/parent">
            <Button variant="secondary" size="sm">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="headline-xl text-[var(--color-charcoal)] mb-2">
            {childName}'s Progress
          </h1>
          <p className="text-[var(--color-gray)]">Track your child's learning journey</p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-6 md:mb-8">
          <ProgressDisplay progress={progress} variant="full" />
        </Card>

        {/* Zone Progress */}
        <Card className="mb-6 md:mb-8">
          <h2 className="headline-md text-[var(--color-charcoal)] mb-4">
            Zone Progress
          </h2>
          <ZoneNavigator zones={progress.zones} />
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-[var(--color-charcoal)] mb-1">
                {progress.completedZones}/{progress.totalZones}
              </div>
              <div className="text-sm text-gray-600">Zones Completed</div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-3xl mb-2">📚</div>
              <div className="text-2xl font-bold text-[var(--color-charcoal)] mb-1">
                {progress.completedChapters}/{progress.totalChapters}
              </div>
              <div className="text-sm text-gray-600">Chapters Completed</div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-[var(--color-charcoal)] mb-1">
                {progress.completedPhases}/{progress.totalPhases}
              </div>
              <div className="text-sm text-gray-600">Phases Completed</div>
            </div>
          </Card>
        </div>

        {/* Current Position */}
        {progress.currentZone && progress.currentChapter && (
          <Card className="mt-6">
            <h3 className="text-lg font-semibold text-[var(--color-charcoal)] mb-2">
              Current Position
            </h3>
            <p className="text-gray-700">
              {childName} is currently working on Zone {progress.currentZone}, 
              Chapter {progress.currentChapter}, Phase {progress.currentPhase}
            </p>
          </Card>
        )}

        {/* Report Link */}
        <div className="mt-6 text-center">
          <Link href={`/parent/child/${childId}/report`}>
            <Button variant="secondary">
              View Detailed Report
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
