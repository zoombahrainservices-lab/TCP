import { requireAuth } from '@/lib/auth/guards'
import { getChapter, getChapterProgress, isChapterUnlocked } from '@/app/actions/chapters'
import { getPhasesByChapter, isPhaseUnlocked } from '@/app/actions/phases'
import { PhaseCardWrapper } from '@/components/student/PhaseCardWrapper'
import { PowerScan } from '@/components/phases/power-scan'
import { SecretIntel } from '@/components/phases/secret-intel'
import { VisualGuide } from '@/components/phases/visual-guide'
import { FieldMission } from '@/components/phases/field-mission'
import { LevelUp } from '@/components/phases/level-up'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { redirect } from 'next/navigation'

interface ChapterPageProps {
  params: Promise<{
    chapterId: string
  }>
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const user = await requireAuth('student')
  const { chapterId: chapterIdParam } = await params
  const chapterId = parseInt(chapterIdParam)

  // Get chapter info
  const chapter = await getChapter(chapterId)
  if (!chapter) {
    redirect('/student')
  }

  // Check if chapter is unlocked
  const unlocked = await isChapterUnlocked(user.id, chapterId)
  if (!unlocked) {
    redirect(`/student/zone/${chapter.zone_id}`)
  }

  // Get chapter progress
  const chapterProgress = await getChapterProgress(user.id, chapterId)
  if (!chapterProgress) {
    redirect(`/student/zone/${chapter.zone_id}`)
  }

  // Get all phases
  const phases = await getPhasesByChapter(chapterId)

  // Check unlock status for each phase
  const phasesWithStatus = await Promise.all(
    phases.map(async (phase) => {
      const unlocked = await isPhaseUnlocked(user.id, phase.id)
      return { ...phase, unlocked }
    })
  )

  const { totalPhases, completedPhases, currentPhase, completionPercentage } = chapterProgress

  // Phase configuration with neon colors and components
  const phaseConfig = {
    'power-scan': { 
      color: 'red' as const,
      component: PowerScan
    },
    'secret-intel': { 
      color: 'orange' as const,
      component: SecretIntel
    },
    'visual-guide': { 
      color: 'yellow' as const,
      component: VisualGuide
    },
    'field-mission': { 
      color: 'green' as const,
      component: FieldMission
    },
    'level-up': { 
      color: 'blue' as const,
      component: LevelUp
    },
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="container max-w-5xl mx-auto px-4 py-6 md:py-8">
        {/* Back Button */}
        <div className="mb-4">
          <Link href={`/student/zone/${chapter.zone_id}`}>
            <Button variant="secondary" size="sm">
              ← Back to {chapter.zone.name}
            </Button>
          </Link>
        </div>

        {/* Mission Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 uppercase">
            MISSION #{chapter.chapter_number}: {chapter.title.toUpperCase()}
          </h1>
          {chapter.subtitle && (
            <p className="text-lg text-slate-600 mb-2">{chapter.subtitle}</p>
          )}
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <span className="text-2xl">🏃</span>
            <span className="text-sm font-medium">Brave Framework</span>
          </div>
        </div>

        {/* All 5 Phases */}
        <div className="space-y-6">
          {phasesWithStatus.map((phase, index) => {
            const phaseNumber = index + 1
            const isCompleted = completedPhases >= phaseNumber
            const isCurrent = currentPhase === phaseNumber
            const config = phaseConfig[phase.phase_type] || {
              color: 'red' as const,
              component: PowerScan
            }
            const PhaseComponent = config.component

            return (
              <PhaseCardWrapper
                key={phase.id}
                href={`/student/chapter/${chapterId}/${phase.phase_type}`}
                isLocked={!phase.unlocked}
                color={config.color}
              >
                <PhaseComponent />
              </PhaseCardWrapper>
            )
          })}
        </div>

        {/* Complete Mission Button */}
        {completedPhases === totalPhases && (
          <div className="mt-8 text-center">
            <div className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg">
              CLAIM XP & FINISH DAY
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
