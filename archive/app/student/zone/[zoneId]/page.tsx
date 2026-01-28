import { requireAuth } from '@/lib/auth/guards'
import { getZone, getZoneProgress, isZoneUnlocked } from '@/app/actions/zones'
import { getAllChapterProgressForZone } from '@/app/actions/chapters'
import { getStudentXP } from '@/app/actions/xp'
import MissionCard from '@/components/student/MissionCard'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { redirect } from 'next/navigation'

interface ZonePageProps {
  params: Promise<{
    zoneId: string
  }>
}

export default async function ZonePage({ params }: ZonePageProps) {
  const user = await requireAuth('student')
  const { zoneId: zoneIdParam } = await params
  const zoneId = parseInt(zoneIdParam)

  // Get zone info
  const zone = await getZone(zoneId)
  if (!zone) {
    redirect('/student')
  }

  // Check if zone is unlocked
  const unlocked = await isZoneUnlocked(user.id, zoneId)
  if (!unlocked) {
    redirect('/student')
  }

  // Get zone progress
  const zoneProgress = await getZoneProgress(user.id, zoneId)
  if (!zoneProgress) {
    redirect('/student')
  }

  // Get all chapter progress for this zone
  const chapterProgress = await getAllChapterProgressForZone(user.id, zoneId)

  const { totalChapters, completedChapters, totalPhases, completedPhases, completionPercentage } = zoneProgress

  // Find current mission (first incomplete chapter)
  const currentChapter = chapterProgress.find(cp => !cp.isUnlocked || (cp.completedPhases < cp.totalPhases && cp.isUnlocked))

  // Get student XP for the XP counter
  const xpData = await getStudentXP(user.id)

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Link href="/student">
            <Button variant="secondary" size="sm">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-[#1A1A1A] mb-10">
          ZONE {zone.zone_number}: {zone.name.toUpperCase()}
        </h1>

        {/* Mission Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {chapterProgress.map((cp) => {
            const isCompleted = cp.completedPhases === cp.totalPhases
            const isCurrent = currentChapter?.chapter.id === cp.chapter.id && !isCompleted && cp.isUnlocked

            return (
              <MissionCard
                key={cp.chapter.id}
                chapterId={cp.chapter.id}
                chapterNumber={cp.chapter.chapter_number}
                title={cp.chapter.title}
                isUnlocked={cp.isUnlocked}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
              />
            )
          })}
        </div>

        {/* Progress Section */}
        <div className="border-t border-[#E0E0E0] pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Progress Bar */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#4A4A4A] text-center md:text-left mb-3">
                {completedChapters}/{totalChapters} MISSIONS COMPLETE
              </p>
              <div className="flex gap-1">
                {Array.from({ length: totalChapters }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-3 flex-1 ${
                      index < completedChapters ? 'bg-[#E05A4E]' : 'bg-[#E0E0E0]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* XP Counter */}
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium">
                XP Towards
              </p>
              <p className="text-xs uppercase tracking-wider text-[#6B6B6B] font-semibold">
                Ultimate Communicator
              </p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className="w-5 h-5 bg-[#22C55E] rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">●</span>
                </span>
                <span className="text-lg font-bold text-[#1A1A1A]">{xpData.xp} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
