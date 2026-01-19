import { requireAuth } from '@/lib/auth/guards'
import { getStudentProgress } from '@/app/actions/progress'
import { getStudentXP } from '@/app/actions/xp'
import { getChapter } from '@/app/actions/chapters'
import { StudentDashboard } from './StudentDashboard'

// Zone color mapping
const ZONE_COLORS: Record<number, string> = {
  1: '#ff5a5a', // Red
  2: '#ffb84b', // Orange
  3: '#ffe75a', // Yellow
  4: '#6cff8f', // Green
  5: '#60c0ff', // Blue
}

export default async function StudentPage() {
  const user = await requireAuth('student')

  const progress = await getStudentProgress(user.id)
  const xpData = await getStudentXP(user.id)

  // Calculate day ranges for each zone (assuming ~6 chapters per zone, 5 phases per chapter)
  // Zone 1: Days 1-7, Zone 2: Days 8-14, Zone 3: Days 15-21, Zone 4: Days 22-28, Zone 5: Days 29-30
  const DAY_RANGES: Record<number, string> = {
    1: '(DAYS 1-7)',
    2: '(DAYS 8-14)',
    3: '(DAYS 15-21)',
    4: '(DAYS 22-28)',
    5: '(DAYS 29-30)',
  }

  // Map zones to the new component format
  const zones = progress.zones.map((zoneProgress) => {
    const { zone, isUnlocked, completionPercentage } = zoneProgress
    const isCurrent = zone.id === progress.suggestedZoneId
    
    // Determine subtitle based on status - use day range format
    let subtitle = DAY_RANGES[zone.zone_number] || ''
    if (!isUnlocked && zone.zone_number > 1) {
      subtitle = `Complete Zone ${zone.zone_number - 1}`
    }

    // Determine status
    let status: 'locked' | 'current' | 'upcoming' = 'upcoming'
    if (!isUnlocked) {
      status = 'locked'
    } else if (isCurrent) {
      status = 'current'
    }

    return {
      id: zone.id,
      zoneNumber: zone.zone_number,
      title: zone.name,
      subtitle,
      color: zone.color || ZONE_COLORS[zone.zone_number] || '#6b7280',
      status,
      completionPercentage: isUnlocked ? completionPercentage : 0, // Add progress percentage
    }
  })

  // Calculate next mission URL
  const nextMissionUrl = progress.suggestedChapterId
    ? `/student/chapter/${progress.suggestedChapterId}`
    : '/student'

  // Get next mission number from suggested chapter
  let nextMissionNumber: number | undefined = undefined
  if (progress.suggestedChapterId) {
    const suggestedChapter = await getChapter(progress.suggestedChapterId)
    if (suggestedChapter) {
      nextMissionNumber = suggestedChapter.chapter_number
    }
  }

  return (
    <StudentDashboard
      zones={zones}
      levelInfo={{
        level: xpData.level,
        xp: xpData.xp,
        nextLevelXp: xpData.levelProgress.nextLevelXp,
      }}
      xpBreakdown={xpData.breakdown}
      systemStatus={{
        completedMissions: progress.completedChapters,
        totalMissions: progress.totalChapters,
      }}
      nextMissionUrl={nextMissionUrl}
      nextMissionNumber={nextMissionNumber}
    />
  )
}
