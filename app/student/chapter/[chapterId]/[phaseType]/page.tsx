import { requireAuth } from '@/lib/auth/guards'
import { getChapter } from '@/app/actions/chapters'
import { getPhaseByType, getPhaseProgress, isPhaseUnlocked, type PhaseType } from '@/app/actions/phases'
import { redirect } from 'next/navigation'
import PhasePageClient from '@/components/student/PhasePageClient'
import Button from '@/components/ui/Button'

interface PhasePageProps {
  params: Promise<{
    chapterId: string
    phaseType: string
  }>
}

type Step = 'overview' | 'content' | 'action' | 'complete'

export default async function PhasePage({ params }: PhasePageProps) {
  const user = await requireAuth('student')
  const { chapterId, phaseType } = await params
  const chapterIdNum = parseInt(chapterId)

  // Parallel fetch chapter and phase
  const [chapter, phase] = await Promise.all([
    getChapter(chapterIdNum),
    getPhaseByType(chapterIdNum, phaseType as PhaseType),
  ])

  if (!chapter || !phase) {
    redirect(`/student/chapter/${chapterIdNum}`)
  }

  // Check unlock status
  const unlocked = await isPhaseUnlocked(user.id, phase.id)
  if (!unlocked) {
    redirect(`/student/chapter/${chapterIdNum}`)
  }

  // Get progress
  const progress = await getPhaseProgress(user.id, phase.id)

  // Determine initial step based on progress
  let initialStep: Step = 'overview'
  let initialProgressId: number | null = null

  if (progress) {
    initialProgressId = progress.id

    if (progress.completed_at) {
      initialStep = 'complete'
    } else if (phaseType === 'field-mission' && progress.task_acknowledged_at) {
      initialStep = 'action'
    } else if (phaseType === 'level-up' && progress.reflection_text) {
      initialStep = 'complete'
    } else if (Object.keys(progress.responses || {}).length > 0) {
      initialStep = 'action'
    } else {
      // Progress exists but no responses yet - user has started, show content
      initialStep = 'content'
    }
  }

  return (
    <PhasePageClient
      chapter={chapter}
      phase={phase}
      progress={progress}
      userId={user.id}
      chapterId={chapterIdNum}
      phaseType={phaseType as PhaseType}
      initialStep={initialStep}
      initialProgressId={initialProgressId}
    />
  )
}
